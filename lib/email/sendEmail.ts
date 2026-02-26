import { google } from "googleapis";
import User from "@/app/api/models/user";

type SendEmailParams = {
  user: any;
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ user, to, subject, html }: SendEmailParams) {
  let provider: "gmail" | "outlook" | null = null;

  if (user.gmail?.refreshToken) provider = "gmail";
  if (user.outlook?.refreshToken) provider = "outlook";

  if (!provider) throw new Error("No email provider connected");

  let messageId: string | undefined;
  let threadId: string | undefined;
  let conversationId: string | undefined;

  /* ================= GMAIL ================= */
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

    const encodedSubject = `=?UTF-8?B?${Buffer.from(subject).toString(
      "base64",
    )}?=`;

    const message = [
      `To: ${to}`,
      `Subject: ${encodedSubject}`,
      "MIME-Version: 1.0",
      "Content-Type: text/html; charset=UTF-8",
      "",
      html,
    ].join("\r\n");

    const encodedMessage = Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: encodedMessage },
    });

    messageId = res.data.id || undefined;
    threadId = res.data.threadId || undefined;
  }

  /* ================= OUTLOOK ================= */
  if (provider === "outlook") {
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
    const accessToken = tokenData.access_token;

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
            body: { contentType: "HTML", content: html },
            toRecipients: [{ emailAddress: { address: to } }],
          },
          saveToSentItems: true,
        }),
      },
    );

    if (!graphRes.ok) throw new Error("Outlook send failed");
  }

  return { provider, messageId, threadId, conversationId };
}