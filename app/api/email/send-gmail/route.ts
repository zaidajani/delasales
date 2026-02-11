import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
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
      to,
      subject,
      html,
      recordingId,
      actionItemId, // optional
      type, // "summary" | "action"
    } = await req.json();

    if (!to || !subject || !html || !recordingId || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ clerkUserId: userId });

    if (!user?.gmail?.refreshToken) {
      return NextResponse.json(
        { error: "Gmail not connected" },
        { status: 400 },
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/gmail/callback`,
    );

    oauth2Client.setCredentials({
      refresh_token: user.gmail.refreshToken,
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const message = [
      `To: ${to}`,
      "Content-Type: text/html; charset=utf-8",
      "MIME-Version: 1.0",
      `Subject: ${subject}`,
      "",
      html,
    ].join("\n");

    const encodedMessage = Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: encodedMessage },
    });

    /* -----------------------------------------
       🔥 UPDATE MONGODB STATUS
    ----------------------------------------- */

    const recording = user.recordings.id(recordingId);

    if (!recording) {
      return NextResponse.json(
        { error: "Recording not found" },
        { status: 404 },
      );
    }

    if (type === "action" && actionItemId) {
      const email = recording.emails.find(
        (e: any) =>
          e.actionItemId &&
          e.actionItemId.toString() === actionItemId.toString(),
      );

      if (email) {
        email.status = "sent";
        email.sentAt = new Date();
      }
    }

    if (type === "summary") {
      if (recording.summaryEmail) {
        recording.summaryEmail.status = "sent";
        recording.summaryEmail.sentAt = new Date();
      }
    }

    await user.save();

    return NextResponse.json({
      success: true,
      status: "sent",
      sentAt: new Date(),
    });
  } catch (error) {
    console.error("SEND GMAIL ERROR:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }
}
