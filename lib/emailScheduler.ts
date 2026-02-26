import cron from "node-cron";
import User from "@/app/api/models/user";
import { sendEmail } from "@/lib/email/sendEmail"; // your existing send logic

export function startEmailScheduler() {
  // runs every minute
  cron.schedule("* * * * *", async () => {
    console.log("⏰ Checking scheduled emails...");

    const now = new Date();

    const users = await User.find({
      "recordings.emails.scheduledAt": { $lte: now },
      "recordings.emails.status": "draft",
    });

    for (const user of users) {
      for (const recording of user.recordings) {
        for (const email of recording.emails) {
          if (
            email.scheduledAt &&
            email.status === "draft" &&
            email.scheduledAt <= now
          ) {
            try {
              console.log("📨 Sending scheduled email:", email.to);

              await sendEmail({
                to: email.to,
                subject: email.subject,
                html: email.body,
                provider: user.emailProvider,
                user,
              });

              email.status = "sent";
              email.sentAt = new Date();
              email.scheduledAt = undefined;
            } catch (err) {
              console.error("❌ Failed scheduled send:", err);
            }
          }
        }
      }

      await user.save();
    }
  });
}