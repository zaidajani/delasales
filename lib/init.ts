import { startEmailScheduler } from "./emailScheduler";

let started = false;

export function initServer() {
  if (!started) {
    startEmailScheduler();
    started = true;
    console.log("🚀 Email scheduler started");
  }
}