"use client";

import { useEffect, useState } from "react";
import { Copy, Send, Save, X } from "lucide-react";
import TipTapEditor from "@/app/components/TipTapEditor";

/* ---------------------------------
   HTML → Plain text (clipboard fallback)
--------------------------------- */
function htmlToPlainText(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function EmailEditor({
  subject: initialSubject,
  body: initialBody,
  clerkUserId,
  recordingId,
  actionItemId,
  onClose,
  onSaved, // ✅ ADD THIS
}: {
  subject: string;
  body: string;
  clerkUserId: string;
  recordingId: string;
  actionItemId: string;
  onClose: () => void;
  onSaved: (data: { subject: string; body: string }) => void;
}) {
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [saving, setSaving] = useState(false);

  /* ---------------------------------
     Copy (Gmail + Outlook safe)
  --------------------------------- */
  async function copyToClipboard() {
    try {
      const html = body;
      const plainText = htmlToPlainText(html);

      const clipboardItem = new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([plainText], { type: "text/plain" }),
      });

      await navigator.clipboard.write([clipboardItem]);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
      alert("Failed to copy email");
    }
  }

  /* ---------------------------------
     Save email (MongoDB + UI sync)
  --------------------------------- */
  async function handleSave() {
    try {
      setSaving(true);

      const res = await fetch("/api/recordings/save-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkUserId,
          recordingId,
          actionItemId,
          subject,
          body,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save email");
      }

      // 🔥 CRITICAL: update parent state
      onSaved({ subject, body });

      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save email");
    } finally {
      setSaving(false);
    }
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
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200"
          >
            <Copy size={16} />
            Copy
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            <Save size={16} />
            {saving ? "Saving…" : "Save"}
          </button>

          <button
            disabled
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white opacity-50"
          >
            <Send size={16} />
            Send
          </button>

          <button
            onClick={onClose}
            className="ml-1 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Subject */}
      <div className="px-4 pt-2">
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Email subject"
          className="w-full rounded-xl mb-5 border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden px-4 pb-4">
        <TipTapEditor content={body} onChange={setBody} />
      </div>
    </div>
  );
}
