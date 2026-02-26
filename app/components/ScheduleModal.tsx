"use client";

import { useState } from "react";

export default function ScheduleModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (date: string) => void;
}) {
  const [dateTime, setDateTime] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-[360px] p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          Schedule Email
        </h3>

        <input
          type="datetime-local"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
        />

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              if (!dateTime) return;
              onConfirm(dateTime);
            }}
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white"
          >
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
}