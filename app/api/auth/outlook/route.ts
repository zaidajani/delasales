import { NextResponse } from "next/server";

export async function GET() {
  const params = new URLSearchParams({
    client_id: process.env.OUTLOOK_CLIENT_ID!,
    response_type: "code",
    redirect_uri: process.env.OUTLOOK_REDIRECT_URI!,
    response_mode: "query",
    scope: ["offline_access", "User.Read", "Mail.Send", "Mail.ReadWrite"].join(
      " ",
    ),
  });

  const authUrl =
    "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?" +
    new URLSearchParams({
      client_id: process.env.OUTLOOK_CLIENT_ID!,
      response_type: "code",
      redirect_uri: process.env.OUTLOOK_REDIRECT_URI!,
      response_mode: "query",
      scope: "offline_access User.Read Mail.Send",
    });
  return NextResponse.redirect(authUrl);
}
