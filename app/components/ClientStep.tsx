"use client";

import { Mail } from "lucide-react";

export default function ClientStep({
  title,
  meta,
  clerkUserId,
  recordingId,
  actionItemId,
}: {
  title: string;
  meta?: string;
  clerkUserId: string;
  recordingId: string;
  actionItemId: string;
}) {
  function handleSend() {
    // later: open email composer modal
    console.log("Send email for client task:", actionItemId);
  }

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Left */}
      <div className="flex gap-4">
        <div className="w-2 h-2 mt-2 rounded-full bg-gray-300" />
        <div>
          <p className="text-sm font-medium">{title}</p>
          {meta && <div className="mt-1 text-xs text-gray-500">{meta}</div>}
        </div>
      </div>

      {/* Right */}
      <button
        onClick={handleSend}
        className="inline-flex items-center gap-2 whitespace-nowrap rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
      >
        <Mail size={14} className="shrink-0" />
        Generate Email
      </button>
    </div>
  );
}
