import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "../../models/user";

export async function PATCH(request: Request) {
  try {
    const { recordingId, taskId, completed } = await request.json();

    if (!recordingId || !taskId) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    await User.updateOne(
      { "recordings._id": recordingId },
      {
        $set: {
          "recordings.$[].actionItems.$[task].completed": completed,
        },
      },
      {
        arrayFilters: [{ "task._id": taskId }],
      }
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("UPDATE TASK ERROR:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}
