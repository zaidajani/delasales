import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/db";
import User from "../../models/user";

export async function POST(request: Request) {
  try {
    const {
      clerkUserId,
      title,
      audioUrl,
      dateTime,
      durationMinutes,
      participants,
    } = await request.json();

    if (!clerkUserId || !title || !audioUrl || !dateTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const recording = {
      title,
      audioUrl,
      dateTime,
      durationMinutes,
      participants,
      status: "processing",
    };

    const user = await User.findOneAndUpdate(
      { clerkUserId },
      { $push: { recordings: recording } },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Recording added", recording },
      { status: 201 }
    );
  } catch (error) {
    console.error("ADD RECORDING ERROR:", error);
    return NextResponse.json(
      { error: "Failed to add recording" },
      { status: 500 }
    );
  }
}
