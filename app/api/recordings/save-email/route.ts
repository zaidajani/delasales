import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/db";
import User from "../../models/user";

export async function POST(request: Request) {
  try {
    const {
      clerkUserId,
      recordingId,
      actionItemId,
      to,
      subject,
      body,
    } = await request.json();

    /* ---------------------------------
       Validation
    --------------------------------- */
    if (!clerkUserId || !recordingId || !actionItemId || !to || !subject || !body) {
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

    /* ---------------------------------
       Find Existing Email
    --------------------------------- */
    let email = recording.emails.find(
      (e: any) => e.actionItemId.toString() === actionItemId
    );

    if (!email) {
      recording.emails.push({
        actionItemId,
        to,               // ✅ NEW
        subject,
        body,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      email.to = to;     // ✅ NEW
      email.subject = subject;
      email.body = body;
      email.updatedAt = new Date();
    }

    await user.save();

    return NextResponse.json(
      {
        success: true,
        email: {
          actionItemId,
          to,
          subject,
          body,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("SAVE EMAIL ERROR:", error);
    return NextResponse.json(
      { error: "Failed to save email" },
      { status: 500 }
    );
  }
}