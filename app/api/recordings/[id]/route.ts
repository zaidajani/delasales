import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "../../../../lib/db";
import User from "../../models/user";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid recording ID" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const recordingId = new mongoose.Types.ObjectId(id);

    // 🔍 Find the user who owns this recording
    const user = await User.findOne(
      { "recordings._id": recordingId },
      {
        clerkUserId: 1,      // 👈 INCLUDE OWNER
        recordings: { $elemMatch: { _id: recordingId } },
      }
    );

    if (!user || !user.recordings?.length) {
      return NextResponse.json(
        { error: "Recording not found" },
        { status: 404 }
      );
    }

    const recording = user.recordings[0];

    // ✅ Re-attach ownership info explicitly
    return NextResponse.json(
      {
        ...recording.toObject(),
        clerkUserId: user.clerkUserId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET RECORDING ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch recording" },
      { status: 500 }
    );
  }
}
