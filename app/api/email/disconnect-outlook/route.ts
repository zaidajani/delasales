import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/app/api/models/user";
import { auth } from "@clerk/nextjs/server";

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ success: false });
  }

  await connectToDatabase();

  await User.updateOne(
    { clerkUserId: userId },
    {
      $unset: {
        outlook: "",
      },
      emailProvider: null,
    }
  );

  return NextResponse.json({ success: true });
}