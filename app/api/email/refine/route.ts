import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/app/api/models/user";

/* =========================================================
   Helper: Safe OpenAI call (robust parsing)
========================================================= */
async function callOpenAI(prompt: string) {
  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-5-mini",
      input: prompt,
    }),
  });

  const data = await res.json();

  const texts: string[] = [];

  for (const item of data.output || []) {
    if (item.type === "message") {
      for (const c of item.content || []) {
        if (c.type === "output_text") {
          texts.push(c.text);
        }
      }
    }
  }

  return texts.join("\n").trim();
}

/* =========================================================
   POST — Refine / Summarize / Suggest / Acknowledge
========================================================= */
export async function POST(req: Request) {
  try {
    const { clerkUserId, recordingId, actionItemId, instruction, emailHtml } =
      await req.json();

    /* ---------------- Validate ---------------- */
    if (!clerkUserId || !recordingId || !actionItemId || !instruction) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ clerkUserId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const recording = user.recordings.id(recordingId);
    if (!recording) {
      return NextResponse.json(
        { error: "Recording not found" },
        { status: 404 }
      );
    }

    const email = recording.emails.find(
      (e: any) => String(e.actionItemId) === String(actionItemId)
    );

    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    /* =====================================================
       1. INTENT DETECTION
    ===================================================== */
    const intentPrompt = `
Classify the user's intent.

Instruction:
"${instruction}"

Return one word only:
modify → rewrite or change the email
summarize → summarize the email
question → answer a question about the email
suggest → suggest improvements or critique the email
acknowledge → user is expressing approval or gratitude
`;

    const intentRaw = await callOpenAI(intentPrompt);
    const lowerInstruction = instruction.toLowerCase().trim();

    // 🔥 Heuristic override for praise / gratitude
    const praisePatterns = [
      /nice/,
      /looks good/,
      /good job/,
      /great/,
      /perfect/,
      /thanks?/,
      /thank you/,
      /awesome/,
    ];

    const isPraise = praisePatterns.some((p) => p.test(lowerInstruction));

    const finalIntent =
      intentRaw.includes("summarize")
        ? "summarize"
        : intentRaw.includes("question")
        ? "question"
        : intentRaw.includes("suggest")
        ? "suggest"
        : intentRaw.includes("acknowledge") || isPraise
        ? "acknowledge"
        : "modify";

    /* =====================================================
       2. ACKNOWLEDGE → NO EMAIL CHANGE
    ===================================================== */
    if (finalIntent === "acknowledge") {
      const reply =
        "Glad it helps! Let me know if you'd like to refine it further.";

      email.chat = email.chat || [];
      email.chat.push({ role: "user", content: instruction });
      email.chat.push({ role: "assistant", content: reply });

      await user.save();

      return NextResponse.json({
        body: emailHtml,
        chat: email.chat,
      });
    }

    /* =====================================================
       3. SUMMARIZE / QUESTION → NO EMAIL CHANGE
    ===================================================== */
    if (finalIntent === "summarize" || finalIntent === "question") {
      const chatPrompt = `
User instruction:
"${instruction}"

Email:
"""
${emailHtml}
"""

If instruction asks for summary → summarize.
If instruction asks a question → answer clearly.

Return plain text only.
`;

      const reply = await callOpenAI(chatPrompt);

      email.chat = email.chat || [];
      email.chat.push({ role: "user", content: instruction });
      email.chat.push({ role: "assistant", content: reply });

      await user.save();

      return NextResponse.json({
        body: emailHtml,
        chat: email.chat,
      });
    }

    /* =====================================================
       4. SUGGEST IMPROVEMENTS → NO EMAIL CHANGE
    ===================================================== */
    if (finalIntent === "suggest") {
      const suggestPrompt = `
You are an expert sales email coach.

User instruction:
"${instruction}"

Email:
"""
${emailHtml}
"""

Provide clear, actionable improvements.

Focus on:
• clarity
• tone
• persuasion
• structure
• call-to-action

Return bullet points only.
`;

      const reply = await callOpenAI(suggestPrompt);

      email.chat = email.chat || [];
      email.chat.push({ role: "user", content: instruction });
      email.chat.push({ role: "assistant", content: reply });

      await user.save();

      return NextResponse.json({
        body: emailHtml,
        chat: email.chat,
      });
    }

    /* =====================================================
       5. MODIFY EMAIL
    ===================================================== */
    const modifyPrompt = `
You are an expert email editor.

Rewrite the email according to the instruction.

Instruction:
"${instruction}"

Email:
"""
${emailHtml}
"""

Rules:
• Preserve intent and meaning
• Do NOT remove critical information
• Keep professional tone unless instructed otherwise
• Return clean HTML only
`;

    const newHtml = await callOpenAI(modifyPrompt);

    if (!newHtml) {
      return NextResponse.json(
        { error: "AI returned empty email" },
        { status: 500 }
      );
    }

    /* ---------------- Persist changes ---------------- */
    email.body = newHtml;
    email.chat = email.chat || [];
    email.chat.push({ role: "user", content: instruction });
    email.chat.push({
      role: "assistant",
      content: "Email updated based on your request.",
    });

    await user.save();

    return NextResponse.json({
      body: newHtml,
      chat: email.chat,
    });
  } catch (err) {
    console.error("REFINE ERROR:", err);
    return NextResponse.json(
      { error: "Refinement failed" },
      { status: 500 }
    );
  }
}