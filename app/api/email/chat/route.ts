import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/app/api/models/user";

export async function POST(req: Request) {
  try {
    const { clerkUserId, recordingId, actionItemId } = await req.json();

    if (!clerkUserId || !recordingId || !actionItemId) {
      return NextResponse.json({ chat: [], body: null });
    }

    await connectToDatabase();

    const user = await User.findOne({ clerkUserId });
    if (!user) return NextResponse.json({ chat: [], body: null });

    const recording = user.recordings.id(recordingId);
    if (!recording) return NextResponse.json({ chat: [], body: null });

    const email = recording.emails?.find(
      (e: any) => e.actionItemId?.toString() === actionItemId
    );

    return NextResponse.json({
      chat: email?.chat || [],
      body: email?.body || null, // 🔥 critical fix
    });
  } catch (err) {
    console.error("CHAT LOAD ERROR:", err);
    return NextResponse.json({ chat: [], body: null });
  }
}