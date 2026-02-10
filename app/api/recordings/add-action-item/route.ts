import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/app/api/models/user";

export async function POST(req: Request) {
  try {
    const {
      clerkUserId,
      recordingId,
      text,
      category = "client", // default to client
    } = await req.json();

    if (!clerkUserId || !recordingId || !text?.trim()) {
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

    recording.actionItems.push({
      text: text.trim(),
      category,
      completed: false,
    });

    await user.save();

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (err) {
    console.error("ADD ACTION ITEM ERROR:", err);
    return NextResponse.json(
      { error: "Failed to add action item" },
      { status: 500 }
    );
  }
}
