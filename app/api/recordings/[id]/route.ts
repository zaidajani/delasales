import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "../../../../lib/db";
import User from "../../models/user";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // 🔑 REQUIRED

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid recording ID" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const recordingId = new mongoose.Types.ObjectId(id);

    const user = await User.findOne(
      { "recordings._id": recordingId },
      { "recordings.$": 1 }
    );

    if (!user || !user.recordings?.length) {
      return NextResponse.json(
        { error: "Recording not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user.recordings[0], { status: 200 });
  } catch (error) {
    console.error("GET RECORDING ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch recording" },
      { status: 500 }
    );
  }
}
