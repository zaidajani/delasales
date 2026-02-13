import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import connectToDatabase from "@/lib/db";
import User from "@/app/api/models/user";
import { auth } from "@clerk/nextjs/server";

/* =========================================================
   POST /api/email/send
========================================================= */
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
      actionItemId,
      type, // "action" | "summary"
    } = await req.json();

    if (!to || !subject || !html || !recordingId || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ clerkUserId: userId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    /* =====================================================
       🔍 AUTO-DETECT EMAIL PROVIDER
    ===================================================== */
    let provider: "gmail" | "outlook" | null = null;

    if (user.gmail?.refreshToken) provider = "gmail";
    if (user.outlook?.refreshToken) provider = "outlook";

    if (!provider) {
      return NextResponse.json(
        { error: "No email provider connected" },
        { status: 400 },
      );
    }

    /* =====================================================
       Variables to store provider metadata
    ===================================================== */
    let messageId: string | undefined;
    let threadId: string | undefined;
    let conversationId: string | undefined;

    /* =====================================================
       📩 SEND VIA GMAIL
    ===================================================== */
    if (provider === "gmail") {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/gmail/callback`,
      );

      oauth2Client.setCredentials({
        refresh_token: user.gmail.refreshToken,
      });

      const gmail = google.gmail({ version: "v1", auth: oauth2Client });

      // UTF-8 safe subject
      const encodedSubject = `=?UTF-8?B?${Buffer.from(subject).toString(
        "base64",
      )}?=`;

      const message = [
        `To: ${to}`,
        `Subject: ${encodedSubject}`,
        "MIME-Version: 1.0",
        "Content-Type: text/html; charset=UTF-8",
        "Content-Transfer-Encoding: 7bit",
        "",
        html,
      ].join("\r\n");

      const encodedMessage = Buffer.from(message)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      const gmailRes = await gmail.users.messages.send({
        userId: "me",
        requestBody: { raw: encodedMessage },
      });

      messageId = gmailRes.data.id || undefined;
      threadId = gmailRes.data.threadId || undefined;
    }

    /* =====================================================
       📩 SEND VIA OUTLOOK (Microsoft Graph)
    ===================================================== */
    if (provider === "outlook") {
      if (!user.outlook?.refreshToken) {
        return NextResponse.json(
          { error: "Outlook not connected" },
          { status: 400 },
        );
      }

      // 🔹 Exchange refresh token → access token
      const tokenRes = await fetch(
        `https://login.microsoftonline.com/${process.env.OUTLOOK_TENANT_ID}/oauth2/v2.0/token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: process.env.OUTLOOK_CLIENT_ID!,
            client_secret: process.env.OUTLOOK_CLIENT_SECRET!,
            refresh_token: user.outlook.refreshToken,
            grant_type: "refresh_token",
            scope: "https://graph.microsoft.com/.default",
          }),
        },
      );

      const tokenData = await tokenRes.json();

      if (!tokenData.access_token) {
        console.error("Outlook token error:", tokenData);
        return NextResponse.json(
          { error: "Failed to obtain Outlook access token" },
          { status: 500 },
        );
      }

      const accessToken = tokenData.access_token;

      // 🔹 Send mail via Microsoft Graph
      const graphRes = await fetch(
        "https://graph.microsoft.com/v1.0/me/sendMail",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: {
              subject,
              body: {
                contentType: "HTML",
                content: html,
              },
              toRecipients: [
                {
                  emailAddress: { address: to },
                },
              ],
            },
            saveToSentItems: true,
          }),
        },
      );

      if (!graphRes.ok) {
        const err = await graphRes.text();
        console.error("Graph send error:", err);
        return NextResponse.json(
          { error: "Failed to send via Outlook" },
          { status: 500 },
        );
      }

      // ⚠️ Graph sendMail doesn't return messageId directly
      // You need /messages endpoint for that (advanced)
      conversationId = undefined;
      messageId = undefined;
    }

    /* =====================================================
       🗄 UPDATE MONGODB STATUS + METADATA
    ===================================================== */
    const recording = user.recordings.id(recordingId);

    if (!recording) {
      return NextResponse.json(
        { error: "Recording not found" },
        { status: 404 },
      );
    }

    const now = new Date();

    // 🔹 Action email
    if (type === "action" && actionItemId) {
      const email = recording.emails.find(
        (e: any) =>
          e.actionItemId &&
          e.actionItemId.toString() === actionItemId.toString(),
      );

      if (email) {
        email.status = "sent";
        email.sentAt = now;
        email.provider = provider;
        email.messageId = messageId;
        email.threadId = threadId;
        email.conversationId = conversationId;
      }
    }

    // 🔹 Summary email
    if (type === "summary") {
      if (!recording.summaryEmail) recording.summaryEmail = {};

      recording.summaryEmail.status = "sent";
      recording.summaryEmail.sentAt = now;
      recording.summaryEmail.provider = provider;
      recording.summaryEmail.messageId = messageId;
      recording.summaryEmail.threadId = threadId;
      recording.summaryEmail.conversationId = conversationId;
    }

    await user.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("UNIFIED SEND ERROR:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }
}
