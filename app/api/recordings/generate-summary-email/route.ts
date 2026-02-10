import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/db";
import User from "../../models/user";

export async function POST(request: Request) {
  try {
    const { clerkUserId, recordingId, extraContext } = await request.json();

    /* ---------------------------------
       1. Validate input
    --------------------------------- */
    if (!clerkUserId || !recordingId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    /* ---------------------------------
       2. Fetch user + recording
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
       3. Ensure summary exists
       (generate once if missing)
    --------------------------------- */
    if (!recording.summary) {
      const summaryPrompt = `
Summarize the following meeting in 300–400 characters.
Focus on:
- Who the client is
- What was discussed
- Key outcome or intent

Return plain text only.

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
        return NextResponse.json(
          { error: "Failed to generate summary" },
          { status: 500 },
        );
      }

      const summaryData = await summaryRes.json();

      const summaryText = summaryData.output
        ?.find((o: any) => o.type === "message")
        ?.content?.find((c: any) => c.type === "output_text")?.text;

      if (!summaryText) {
        return NextResponse.json(
          { error: "Invalid summary output" },
          { status: 500 },
        );
      }

      recording.summary = summaryText.trim();
    }

    /* ---------------------------------
       4. Build SUMMARY EMAIL prompt
    --------------------------------- */
    const emailPrompt = `
You are a professional sales follow-up assistant.

Meeting summary:
"""
${recording.summary}
"""

Optional user context:
"""
${extraContext || "None"}
"""

Write a follow-up email that:
- Summarizes the meeting
- Is professional and friendly
- Mentions next steps if applicable
- Is under 180 words

Return STRICT JSON ONLY:
{
  "subject": string,
  "body": string
}

Rules:
- body must be valid HTML (<p>, <br>)
- no markdown
- no explanations
`;

    const aiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-5-nano",
        input: emailPrompt,
      }),
    });

    if (!aiRes.ok) {
      return NextResponse.json(
        { error: "Email generation failed" },
        { status: 500 },
      );
    }

    const aiData = await aiRes.json();

    const outputText = aiData.output
      ?.find((o: any) => o.type === "message")
      ?.content?.find((c: any) => c.type === "output_text")?.text;

    if (!outputText) {
      return NextResponse.json({ error: "Invalid AI output" }, { status: 500 });
    }

    const parsed = JSON.parse(outputText);

    /* ---------------------------------
       5. Save summary email (persistent)
    --------------------------------- */
    recording.summaryEmail = {
      subject: parsed.subject,
      body: parsed.body,
      updatedAt: new Date(),
    };

    await user.save();

    /* ---------------------------------
       6. Respond
    --------------------------------- */
    return NextResponse.json(
      {
        subject: parsed.subject,
        body: parsed.body,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("SUMMARY EMAIL ERROR:", error);
    return NextResponse.json(
      { error: "Failed to generate summary email" },
      { status: 500 },
    );
  }
}
