"use client";

import { useEffect, useState } from "react";
import { Copy, Send, Save, X } from "lucide-react";
import TipTapEditor from "@/app/components/TipTapEditor";

/* ---------------------------------
   Plain text → proper HTML
--------------------------------- */
export function textToHtml(text: string) {
  if (!text) return "";

  return text
    .trim()
    .split(/\n\s*\n+/) // paragraph breaks
    .map((p) => `<p>${p.replace(/\n/g, "<br />").trim()}</p>`)
    .join("");
}

export default function EmailEditor({
  email,
  onClose,
}: {
  email: string;
  onClose: () => void;
}) {
  const htmlContent = email ? textToHtml(email) : "";
  const [value, setValue] = useState(htmlContent);

  /* ---------------------------------
     Actions
  --------------------------------- */
  function copyToClipboard() {
    navigator.clipboard.writeText(value);
  }

  function handleSave() {
    console.log("Save email draft:", value);
    // 🔜 persist to MongoDB
  }

  /* ---------------------------------
     Close on ESC
  --------------------------------- */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="relative w-full max-w-4xl h-[80vh] rounded-2xl border border-gray-200 bg-white shadow-xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <h3 className="text-base font-semibold">Follow-up Email</h3>

        <div className="flex items-center gap-2">
          {/* Copy */}
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200 cursor-pointer"
          >
            <Copy size={16} />
            Copy
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer"
          >
            <Save size={16} />
            Save
          </button>

          {/* Send (disabled for now) */}
          <button
            disabled
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white opacity-50 cursor-not-allowed"
          >
            <Send size={16} />
            Send
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="ml-1 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden px-4 pb-4">
        <TipTapEditor content={value} onChange={setValue} />
      </div>
    </div>
  );
}
