// lib/devScheduler.ts

export function startDevScheduler() {
  if (process.env.NODE_ENV !== "development") return;

  console.log("🛠 Dev scheduler started");

  setInterval(async () => {
    try {
      console.log("⏰ Running dev scheduler check...");

      await fetch("http://localhost:3000/api/email/run-scheduler");
    } catch (err) {
      console.error("Dev scheduler error:", err);
    }
  }, 60 * 1000); // every minute
}