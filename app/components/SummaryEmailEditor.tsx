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

export default function SummaryEmailEditor({
  subject: initialSubject,
  body: initialBody,
  status: initialStatus = "draft",
  to: initialTo = "",
  clerkUserId,
  recordingId,
  onClose,
  onSaved,
}: {
  subject: string;
  body: string;
  status?: "draft" | "sent";
  to?: string;
  clerkUserId: string;
  recordingId: string;
  onClose: () => void;
  onSaved: (data: {
    subject: string;
    body: string;
    to: string;
    status: "draft" | "sent";
  }) => void;
}) {
  const [to, setTo] = useState(initialTo);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [status, setStatus] = useState<"draft" | "sent">(initialStatus);

  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  /* ---------------------------------
     Copy
  --------------------------------- */
  async function copyToClipboard() {
    try {
      const plainText = htmlToPlainText(body);

      const clipboardItem = new ClipboardItem({
        "text/html": new Blob([body], { type: "text/html" }),
        "text/plain": new Blob([plainText], { type: "text/plain" }),
      });

      await navigator.clipboard.write([clipboardItem]);
    } catch (err) {
      alert("Failed to copy email");
    }
  }

  /* ---------------------------------
     Save summary email
  --------------------------------- */
  async function handleSave() {
    if (!subject || !body) {
      alert("Subject and body are required");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch("/api/recordings/save-summary-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkUserId,
          recordingId,
          subject,
          body,
          to,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save follow-up");
      }

      onSaved({
        subject,
        body,
        to,
        status: "draft",
      });

      alert("Follow-up saved");
    } catch (err) {
      alert("Failed to save follow-up");
    } finally {
      setSaving(false);
    }
  }

  /* ---------------------------------
     Send Gmail
  --------------------------------- */
  async function handleSend() {
    if (!to || !subject || !body) {
      alert("To, Subject and Body are required");
      return;
    }

    if (sending || status === "sent") return;

    try {
      setSending(true);

      const res = await fetch("/api/email/send-gmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordingId,
          to,
          subject,
          html: body,
          type: "summary",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data?.error === "Gmail not connected") {
          alert("Please connect Gmail from Settings first.");
        } else {
          alert(data?.error || "Failed to send email");
        }
        return;
      }

      setStatus("sent");

      onSaved({
        subject,
        body,
        to,
        status: "sent",
      });

      alert("Email sent successfully 🎉");
    } catch (err) {
      alert("Something went wrong while sending email");
    } finally {
      setSending(false);
    }
  }

  /* ---------------------------------
     ESC close
  --------------------------------- */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="relative w-full max-w-4xl h-[85vh] rounded-2xl border border-gray-200 bg-white shadow-xl flex flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <h3 className="text-base font-semibold">Meeting Follow-up</h3>

        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200"
          >
            <Copy size={16} />
            Copy
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
          >
            <Save size={16} />
            {saving ? "Saving…" : "Save"}
          </button>

          <button
            onClick={handleSend}
            disabled={sending || status === "sent"}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-white transition
              ${
                status === "sent"
                  ? "bg-emerald-500 cursor-not-allowed"
                  : sending
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }
            `}
          >
            <Send size={16} />
            {status === "sent"
              ? "Sent ✓"
              : sending
              ? "Sending…"
              : "Send"}
          </button>

          <button
            onClick={onClose}
            className="ml-1 rounded-full p-2 text-gray-400 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* To */}
      <div className="px-4 pt-2">
        <input
          type="email"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="Recipient email"
          className="w-full rounded-xl mb-4 border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Subject */}
      <div className="px-4">
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Email subject"
          className="w-full rounded-xl mb-5 border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden px-4 pb-4">
        <TipTapEditor content={body} onChange={setBody} />
      </div>
    </div>
  );
}