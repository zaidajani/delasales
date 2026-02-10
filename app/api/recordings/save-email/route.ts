import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/db";
import User from "../../models/user";

export async function POST(request: Request) {
  try {
    const {
      clerkUserId,
      recordingId,
      actionItemId,
      body,
      subject,
    } = await request.json();

    if (!clerkUserId || !recordingId || !actionItemId || !body) {
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

    const existing = recording.emails.find(
      (e: any) => e.actionItemId.toString() === actionItemId
    );

    if (existing) {
      existing.body = body;
      if (subject) existing.subject = subject;
    } else {
      recording.emails.push({
        actionItemId,
        subject: subject || "Follow-up",
        body,
      });
    }

    await user.save();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("SAVE EMAIL ERROR:", error);
    return NextResponse.json(
      { error: "Failed to save email" },
      { status: 500 }
    );
  }
}
