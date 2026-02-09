"use client";

import { useState } from "react";
import { Copy, Send } from "lucide-react";

export default function EmailEditor({
  email,
}: {
  email: string;
}) {
  const [value, setValue] = useState(email);

  function copyToClipboard() {
    navigator.clipboard.writeText(value);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="text-sm font-semibold">Follow-up Email</h3>

        <div className="flex gap-2">
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs hover:bg-gray-50 cursor-pointer"
          >
            <Copy size={14} />
            Copy
          </button>

          <button
            disabled
            className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white opacity-50 cursor-not-allowed"
          >
            <Send size={14} />
            Send
          </button>
        </div>
      </div>

      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={12}
        className="w-full resize-none p-4 text-sm outline-none"
      />
    </div>
  );
}
