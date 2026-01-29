import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/db";
import User from "../../models/user";

export async function POST(request: Request) {
  try {
    const { clerkUserId, recordingId } = await request.json();

    if (!clerkUserId || !recordingId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOneAndUpdate(
      {
        clerkUserId,
        "recordings._id": recordingId,
      },
      {
        $set: {
          "recordings.$.isAnalyzed": true,
        },
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: "User or recording not found" },
        { status: 404 }
      );
    }

    const updatedRecording = user.recordings.find(
      (r: any) => r._id.toString() === recordingId
    );

    return NextResponse.json(
      {
        message: "Recording marked as analyzed",
        recording: updatedRecording,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("SET ANALYSIS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to update analysis status" },
      { status: 500 }
    );
  }
}
