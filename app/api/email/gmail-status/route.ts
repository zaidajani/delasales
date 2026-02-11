import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/app/api/models/user";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth(); // ✅ MUST await

  if (!userId) {
    return NextResponse.json({ connected: false });
  }

  await connectToDatabase();

  const user = await User.findOne({ clerkUserId: userId });

  return NextResponse.json({
    connected: Boolean(user?.gmail?.accessToken),
  });
}
