import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/app/api/models/user";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      recordingId,
      actionItemId,
      to,
      subject,
      html,
      scheduledAt,
    } = await req.json();

    if (!recordingId || !actionItemId || !scheduledAt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ clerkUserId: userId });
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

    /* 🔥 find email */
    let email = recording.emails.find(
      (e: any) =>
        e.actionItemId &&
        e.actionItemId.toString() === actionItemId.toString()
    );

    /* 🔥 create if missing */
    if (!email) {
      email = {
        actionItemId,
        to,
        subject,
        body: html,
        status: "draft",
        scheduledAt: new Date(scheduledAt),
        createdAt: new Date(),
      };
      recording.emails.push(email);
    } else {
      email.to = to;
      email.subject = subject;
      email.body = html;
      email.scheduledAt = new Date(scheduledAt);
    }

    await user.save();

    console.log("✅ Email scheduled:", email.scheduledAt);

    return NextResponse.json({ success: true, scheduledAt });
  } catch (err) {
    console.error("SCHEDULE ERROR:", err);
    return NextResponse.json(
      { error: "Failed to schedule email" },
      { status: 500 }
    );
  }
}