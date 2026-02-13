import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/app/api/models/user";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL("/dashboard?error=auth", req.url));
    }

    const code = req.nextUrl.searchParams.get("code");
    if (!code) {
      return NextResponse.redirect(new URL("/dashboard?error=no_code", req.url));
    }

    /* ================================
       Exchange code for tokens
    ================================= */
    const tokenRes = await fetch(
      `https://login.microsoftonline.com/${process.env.OUTLOOK_TENANT_ID}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.OUTLOOK_CLIENT_ID!,
          client_secret: process.env.OUTLOOK_CLIENT_SECRET!,
          code,
          redirect_uri: process.env.OUTLOOK_REDIRECT_URI!,
          grant_type: "authorization_code",
        }),
      }
    );

    const tokens = await tokenRes.json();

    if (!tokens.access_token) {
      console.error("Outlook token error:", tokens);
      return NextResponse.redirect(
        new URL("/dashboard?error=token_failed", req.url)
      );
    }

    /* ================================
       Get user profile
    ================================= */
    const profileRes = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const profile = await profileRes.json();

    /* ================================
       Save to DB
    ================================= */
    await connectToDatabase();

    await User.findOneAndUpdate(
      { clerkUserId: userId },
      {
        emailProvider: "outlook",
        outlook: {
          email: profile.mail || profile.userPrincipalName,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiryDate: Date.now() + tokens.expires_in * 1000,
        },
        gmail: undefined, // enforce single provider
      }
    );

    return NextResponse.redirect(
      new URL("/dashboard/settings?outlook=connected", req.url)
    );
  } catch (err) {
    console.error("Outlook callback error:", err);
    return NextResponse.redirect(
      new URL("/dashboard?error=outlook_failed", req.url)
    );
  }
}