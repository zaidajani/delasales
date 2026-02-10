import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/db";
import User from "../../models/user";

export async function POST(request: Request) {
  try {
    const { clerkUserId, recordingId, subject, body } = await request.json();

    if (!clerkUserId || !recordingId || !subject || !body) {
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

    recording.summaryEmail = {
      subject,
      body,
      updatedAt: new Date(),
    };

    await user.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("SAVE SUMMARY EMAIL ERROR:", err);
    return NextResponse.json(
      { error: "Failed to save summary email" },
      { status: 500 }
    );
  }
}
