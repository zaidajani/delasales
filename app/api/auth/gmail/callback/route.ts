import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import connectToDatabase from "@/lib/db";
import User from "@/app/api/models/user";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.redirect(
        new URL("/settings?error=not_authenticated", req.url)
      );
    }

    const code = req.nextUrl.searchParams.get("code");

    if (!code) {
      return NextResponse.redirect(
        new URL("/settings?error=no_code", req.url)
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/gmail/callback`
    );

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      return NextResponse.redirect(
        new URL("/settings?error=no_token", req.url)
      );
    }

    await connectToDatabase();

    await User.findOneAndUpdate(
      { clerkUserId: userId },
      {
        gmail: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token, // VERY IMPORTANT
          expiryDate: tokens.expiry_date,
        },
      },
      { upsert: true }
    );

    return NextResponse.redirect(
      new URL("/dashboard/settings", req.url)
    );
  } catch (error) {
    console.error("GMAIL CALLBACK ERROR:", error);
    return NextResponse.redirect(
      new URL("/settings?error=callback_failed", req.url)
    );
  }
}