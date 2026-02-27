import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/app/api/models/user";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ emails: [] }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findOne({ clerkUserId: userId });

    if (!user) return NextResponse.json({ emails: [] });

    const scheduled: any[] = [];

    for (const recording of user.recordings) {
      for (const email of recording.emails) {
        if (email.scheduledAt && email.status === "draft") {
          scheduled.push({
            id: email._id,
            subject: email.subject,
            to: email.to,
            scheduledAt: email.scheduledAt,
            recordingTitle: recording.title,
            recordingId: recording._id,
            actionItemId: email.actionItemId,
          });
        }
      }
    }

    // sort by soonest
    scheduled.sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() -
        new Date(b.scheduledAt).getTime()
    );

    return NextResponse.json({ emails: scheduled });
  } catch (err) {
    console.error("Scheduled fetch error:", err);
    return NextResponse.json({ emails: [] });
  }
}