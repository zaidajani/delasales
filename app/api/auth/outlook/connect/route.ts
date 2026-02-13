import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.redirect("/sign-in");
  }

  const params = new URLSearchParams({
    client_id: process.env.OUTLOOK_CLIENT_ID!,
    response_type: "code",
    redirect_uri: process.env.OUTLOOK_REDIRECT_URI!,
    response_mode: "query",
    scope:
      "offline_access https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/User.Read",
    state: userId, // 👈 pass userId securely
  });

  const url = `https://login.microsoftonline.com/${process.env.OUTLOOK_TENANT_ID}/oauth2/v2.0/authorize?${params}`;

  return NextResponse.redirect(url);
}