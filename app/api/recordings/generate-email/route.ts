import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/db";
import User from "../../models/user";

export async function POST(request: Request) {
  try {
    const { clerkUserId, recordingId, actionItemId, extraContext } =
      await request.json();

    /* ---------------------------------
       0. Validate input
    --------------------------------- */
    if (!clerkUserId || !recordingId || !actionItemId) {
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

    if (!recording.transcript) {
      return NextResponse.json(
        { error: "Transcript missing" },
        { status: 400 },
      );
    }

    /* ---------------------------------
       2. Generate summary ONCE (lazy)
    --------------------------------- */
    if (!recording.summary) {
      const summaryPrompt = `
Summarize the following meeting transcript in 300–400 characters.

Focus on:
- Who the client is
- What was discussed
- Key intent or outcome

Do NOT add formatting.
Do NOT add quotes.

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
      await user.save(); // 🔑 persist summary
    }

    /* ---------------------------------
       3. Fetch action item
    --------------------------------- */
    const actionItem = recording.actionItems.id(actionItemId);
    if (!actionItem) {
      return NextResponse.json(
        { error: "Action item not found" },
        { status: 404 },
      );
    }

    /* ---------------------------------
       4. Build email prompt (CHEAP)
    --------------------------------- */
    const prompt = `
You are a sales follow-up email assistant.

Meeting summary:
"""
${recording.summary}
"""

Client action item:
"${actionItem.text}"

Optional user instructions:
"${extraContext || "None"}"

Your task:
Write a professional follow-up email.

Requirements:
• Tone: polite, clear, confident, human
• Length: under 150 words
• Purpose: summarize the meeting and guide next steps
• Personalize naturally if possible

Formatting rules:
• Return the email body in clean HTML
• Use <p> for paragraphs
• Use <strong> for emphasis if needed
• Use <ul><li> for bullet points if helpful
• Do NOT use markdown
• Do NOT return plain text

Template structure to follow:

<p>Hi {{client_name}},</p>

<p>[[Introduction]]</p>

<p>[[Summary of meeting + objectives]]</p>

<p>[[Next steps or call to action]]</p>

<p>{{closing}},<br/>{{signature}}</p>

Output format:
Return STRICT JSON only. No extra text.

{
  "subject": string,
  "body": string
}
`;

    /* ---------------------------------
       5. Call OpenAI
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

    if (!aiRes.ok) {
      console.error("EMAIL GENERATION FAILED");
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
      return NextResponse.json(
        { error: "No usable AI output" },
        { status: 500 },
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(outputText);
    } catch {
      console.error("INVALID EMAIL JSON:", outputText);
      return NextResponse.json(
        { error: "Invalid email JSON" },
        { status: 500 },
      );
    }

    /* ---------------------------------
       6. Persist generated email
    --------------------------------- */
    recording.emails = recording.emails || [];
    recording.emails.push({
      actionItemId,
      subject: parsed.subject,
      body: parsed.body,
      createdAt: new Date(),
    });

    await user.save();

    /* ---------------------------------
       7. Respond
    --------------------------------- */
    return NextResponse.json(
      {
        subject: parsed.subject,
        body: parsed.body,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GENERATE EMAIL ERROR:", error);
    return NextResponse.json(
      { error: "Failed to generate email" },
      { status: 500 },
    );
  }
}
