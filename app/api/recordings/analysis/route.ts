import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/db";
import User from "../../models/user";

export async function POST(request: Request) {
  try {
    const { clerkUserId, recordingId, instruction } = await request.json();

    /* ---------------------------------
       0. Validate input
    --------------------------------- */
    if (!clerkUserId || !recordingId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    /* ---------------------------------
       1. Fetch user + recording
    --------------------------------- */
    const user = await User.findOne({ clerkUserId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const recording = user.recordings.id(recordingId);

    if (!recording) {
      return NextResponse.json(
        { error: "Recording not found" },
        { status: 404 },
      );
    }

    /* ---------------------------------
       2. Exit if already analysed
    --------------------------------- */
    if (recording.isAnalyzed) {
      return NextResponse.json(
        { message: "Recording already analysed" },
        { status: 200 },
      );
    }

    if (!recording.transcript) {
      return NextResponse.json(
        { error: "Transcript missing" },
        { status: 400 },
      );
    }

   /* ---------------------------------
   2.5 Generate transcript summary (once)
--------------------------------- */
if (!recording.summary) {
  const summaryPrompt = `
Summarize the following meeting transcript in 300–400 characters.
Focus on:
- Who the client is
- What was discussed
- Key intent or outcome

Do NOT add formatting or quotes.

Transcript:
"""
${recording.transcript}
"""
`;

  const summaryRes = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-5-nano",
      input: summaryPrompt,
    }),
  });

  if (!summaryRes.ok) {
    console.error("SUMMARY GENERATION FAILED");
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 },
    );
  }

  const summaryData = await summaryRes.json();

  const summaryMessage = summaryData.output.find(
    (item: any) => item.type === "message",
  );

  const summaryText = summaryMessage?.content?.find(
    (c: any) => c.type === "output_text",
  )?.text;

  if (!summaryText) {
    return NextResponse.json(
      { error: "Invalid summary output" },
      { status: 500 },
    );
  }

  recording.summary = summaryText.trim();
}

    /* ---------------------------------
       3. Build OpenAI prompt (TASKS)
    --------------------------------- */
    let prompt = `
You are the intelligence engine for a professional post-meeting execution tool.

Your job is to read raw meeting transcripts and extract structured tasks in strict JSON.

IMPORTANT:
- Output MUST be valid JSON
- Do NOT include markdown
- Do NOT include comments
- Do NOT include explanations
- Do NOT include trailing commas

Use these four categories:
1) seller_action_items
2) client_action_items
3) process_milestones
4) risks_and_open_loops

Rules:
- Every action item MUST belong to exactly one category
- Risks MUST ONLY appear in risks_and_open_loops
- Include descriptions
- Include explicit deadlines if mentioned, otherwise null
- Assign confidence ("hard" | "soft")
- Do NOT invent or guess information

Each item must follow:
{
  "description": string,
  "deadline": string | null,
  "confidence": "hard" | "soft"
}

Transcript:
"""
${recording.transcript}
"""
`;

    if (instruction && instruction.trim()) {
      prompt += `

Additional analysis instructions:
"""
${instruction}
"""
`;
    }

    /* ---------------------------------
       4. Call OpenAI Responses API
    --------------------------------- */
    const aiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-5-nano",
        input: prompt,
      }),
    });

    const aiData = await aiRes.json();

    const messageBlock = aiData.output.find(
      (item: any) => item.type === "message",
    );

    const outputText = messageBlock?.content?.find(
      (c: any) => c.type === "output_text",
    )?.text;

    if (!outputText || typeof outputText !== "string") {
      return NextResponse.json(
        { error: "No usable output returned from OpenAI" },
        { status: 500 },
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(outputText);
    } catch {
      return NextResponse.json(
        { error: "OpenAI returned invalid JSON" },
        { status: 500 },
      );
    }

    /* ---------------------------------
       5. Map AI output → schema
    --------------------------------- */
    recording.actionItems = [
      ...(parsed.seller_action_items || []).map((item: any) => ({
        text: item.description,
        category: "seller",
        completed: false,
      })),
      ...(parsed.client_action_items || []).map((item: any) => ({
        text: item.description,
        category: "client",
        completed: false,
      })),
    ];

    recording.risks = (parsed.risks_and_open_loops || []).map((risk: any) => ({
      title: risk.title || "Risk",
      description: risk.description,
    }));

    recording.isAnalyzed = true;
    recording.status = "completed";

    /* ---------------------------------
       🔥 BACKFILL LEGACY DATA
    --------------------------------- */
    user.recordings.forEach((rec: any) => {
      rec.actionItems?.forEach((item: any) => {
        if (!item.category) {
          item.category = "seller";
        }
      });
    });

    await user.save();

    return NextResponse.json(
      {
        message: "Recording analysed successfully",
        recording,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("ANALYSIS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to analyse recording" },
      { status: 500 },
    );
  }
}
