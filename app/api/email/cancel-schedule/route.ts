import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/app/api/models/user";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { recordingId, actionItemId } = await req.json();

    await connectToDatabase();

    const user = await User.findOne({ clerkUserId: userId });
    const recording = user.recordings.id(recordingId);

    if (!recording)
      return NextResponse.json({ error: "Recording not found" }, { status: 404 });

    const email = recording.emails.find(
      (e: any) => e.actionItemId.toString() === actionItemId
    );

    if (!email)
      return NextResponse.json({ error: "Email not found" }, { status: 404 });

    email.scheduledAt = null;

    await user.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Cancel schedule error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}