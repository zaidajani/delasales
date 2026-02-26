import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/app/api/models/user";

/* =========================================================
   GET /api/email/run-scheduler
   🔥 Sends due scheduled emails
========================================================= */
export async function GET() {
  try {
    await connectToDatabase();

    const now = new Date();
    let sentCount = 0;

    // console.log("⏰ Running scheduler at:", now.toISOString());

    /* =====================================================
       🔍 Find users with scheduled emails due
       (safe nested query)
    ===================================================== */
    const users = await User.find({
      "recordings.emails": {
        $elemMatch: {
          scheduledAt: { $lte: now },
          status: "draft",
        },
      },
    });

    for (const user of users) {
      for (const recording of user.recordings) {
        for (const email of recording.emails) {
          const isDue =
            email.scheduledAt &&
            email.status === "draft" &&
            email.scheduledAt <= now;

          if (!isDue) continue;

          // console.log("📨 Sending scheduled email:", email.subject);

          /* =====================================================
             🔐 Call internal send route securely
          ===================================================== */
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL}/api/email/send`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-internal-secret": process.env.INTERNAL_API_SECRET!, // 🔐 REQUIRED
              },
              body: JSON.stringify({
                clerkUserId: user.clerkUserId, // 🔥 REQUIRED
                to: email.to,
                subject: email.subject,
                html: email.body,
                recordingId: recording._id,
                actionItemId: email.actionItemId,
                type: "action",
              }),
            },
          );

          const data = await res.json();

          if (!res.ok) {
            console.error("❌ Failed to send scheduled email:", data);
            continue; // don't clear schedule if failed
          }

          /* =====================================================
             ✅ Mark as sent
          ===================================================== */
          email.status = "sent";
          email.sentAt = new Date();
          email.scheduledAt = null;

          sentCount++;
        }
      }

      await user.save();
    }

    // console.log(`✅ Scheduler finished — sent ${sentCount} emails`);

    return NextResponse.json({ success: true, sentCount });
  } catch (err) {
    console.error("❌ Scheduler error:", err);
    return NextResponse.json(
      { error: "Scheduler failed" },
      { status: 500 },
    );
  }
}