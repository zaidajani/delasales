import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/db";
import User from "@/app/api/models/user";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ connected: false });
  }

  await connectToDatabase();

  const user = await User.findOne({ clerkUserId: userId });

  if (!user) {
    return NextResponse.json({ connected: false });
  }

  return NextResponse.json({
    gmailConnected: user.emailProvider === "gmail",
    outlookConnected: user.emailProvider === "outlook",
    provider: user.emailProvider, // 👈 key
  });
}