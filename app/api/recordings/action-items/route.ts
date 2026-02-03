import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/db";
import User from "../../models/user";

export async function PUT(request: Request) {
  try {
    const {
      clerkUserId,
      recordingId,
      actionItemId,
      completed,
      text,
    } = await request.json();

    /* ---------------------------------
       0. Validate input
    --------------------------------- */
    if (!clerkUserId || !recordingId || !actionItemId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (
      completed !== undefined &&
      typeof completed !== "boolean"
    ) {
      return NextResponse.json(
        { error: "Invalid completed value" },
        { status: 400 },
      );
    }

    if (
      text !== undefined &&
      (typeof text !== "string" || !text.trim())
    ) {
      return NextResponse.json(
        { error: "Invalid text value" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    /* ---------------------------------
       1. Fetch user
    --------------------------------- */
    const user = await User.findOne({ clerkUserId });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }

    /* ---------------------------------
       2. Fetch recording
    --------------------------------- */
    const recording = user.recordings.id(recordingId);

    if (!recording) {
      return NextResponse.json(
        { error: "Recording not found" },
        { status: 404 },
      );
    }

    /* ---------------------------------
       3. Fetch action item
    --------------------------------- */
    const actionItem = recording.actionItems.id(actionItemId);

    if (!actionItem) {
      return NextResponse.json(
        { error: "Action item not found" },
        { status: 404 },
      );
    }

    /* ---------------------------------
       4. Apply updates (toggle / edit)
    --------------------------------- */
    if (typeof completed === "boolean") {
      actionItem.completed = completed;
    }

    if (typeof text === "string" && text.trim()) {
      actionItem.text = text.trim();
    }

    await user.save();

    /* ---------------------------------
       5. Respond
    --------------------------------- */
    return NextResponse.json(
      {
        message: "Action item updated successfully",
        actionItem,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("UPDATE ACTION ITEM ERROR:", error);
    return NextResponse.json(
      { error: "Failed to update action item" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { clerkUserId, recordingId, actionItemId } = await request.json();

    if (!clerkUserId || !recordingId || !actionItemId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ clerkUserId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const recording = user.recordings.id(recordingId);
    if (!recording) {
      return NextResponse.json(
        { error: "Recording not found" },
        { status: 404 },
      );
    }

    const actionItem = recording.actionItems.id(actionItemId);
    if (!actionItem) {
      return NextResponse.json(
        { error: "Action item not found" },
        { status: 404 },
      );
    }

    // 🗑️ REMOVE ACTION ITEM
    actionItem.deleteOne();

    await user.save();

    return NextResponse.json(
      { message: "Action item deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE ACTION ITEM ERROR:", error);
    return NextResponse.json(
      { error: "Failed to delete action item" },
      { status: 500 },
    );
  }
}