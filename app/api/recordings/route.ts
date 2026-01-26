import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "../../../lib/db";
import User from "../models/user";

export async function GET() {
  try {
    /* ---------------------------------
       1. Get authenticated user
    --------------------------------- */
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    /* ---------------------------------
       2. Connect DB
    --------------------------------- */
    await connectToDatabase();

    /* ---------------------------------
       3. Fetch recordings metadata only
    --------------------------------- */
    const user = await User.findOne(
      { clerkUserId: userId },
      {
        recordings: {
          _id: 1,
          title: 1,
          dateTime: 1,
          status: 1,
        },
      }
    ).lean();

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    /* ---------------------------------
       4. Sort recordings (newest first)
    --------------------------------- */
    const recordings =
      user.recordings?.sort(
        (a: any, b: any) =>
          new Date(b.dateTime).getTime() -
          new Date(a.dateTime).getTime()
      ) ?? [];

    return NextResponse.json(
      { recordings },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET RECORDINGS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch recordings" },
      { status: 500 }
    );
  }
}
