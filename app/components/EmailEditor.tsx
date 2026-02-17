"use client";

import { useEffect, useState } from "react";
import { Copy, Send, Save, X } from "lucide-react";
import TipTapEditor from "@/app/components/TipTapEditor";
import EmailCopilotPanel from "./EmailCopilotPanel";

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
  status: initialStatus,
  to: initialTo,
  clerkUserId,
  recordingId,
  actionItemId,
  onClose,
  onSaved,
}: {
  subject: string;
  body: string;
  status: string;
  to?: string;
  clerkUserId: string;
  recordingId: string;
  actionItemId?: string;
  onClose: () => void;
  onSaved: (data: {
    subject: string;
    body: string;
    to: string;
    status?: "draft" | "sent";
  }) => void;
}) {
  const [to, setTo] = useState(initialTo || "");
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [status, setStatus] = useState(initialStatus || "draft");
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  /* ---------------------------------
     Copy
  --------------------------------- */
  async function copyToClipboard() {
    const plainText = htmlToPlainText(body);
    const clipboardItem = new ClipboardItem({
      "text/html": new Blob([body], { type: "text/html" }),
      "text/plain": new Blob([plainText], { type: "text/plain" }),
    });
    await navigator.clipboard.write([clipboardItem]);
  }

  /* ---------------------------------
     Save email
  --------------------------------- */
  async function handleSave() {
    if (!to || !subject || !body) {
      alert("To, Subject and Body are required");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch("/api/recordings/save-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkUserId,
          recordingId,
          actionItemId,
          to,
          subject,
          body,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      onSaved({ subject, body, to, status });
      alert("Email saved");
    } catch (err) {
      console.error(err);
      alert("Failed to save email");
    } finally {
      setSaving(false);
    }
  }

  /* ---------------------------------
     Send email
  --------------------------------- */
  async function handleSend() {
    if (!to || !subject || !body) {
      alert("Please fill To, Subject and Body");
      return;
    }

    try {
      setSending(true);

      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordingId,
          actionItemId,
          to,
          subject,
          html: body,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatus("sent");
      alert("Email sent 🎉");
    } catch (err) {
      console.error(err);
      alert("Failed to send");
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
    <div className="relative w-full max-w-5xl h-[85vh] rounded-2xl border border-gray-200 bg-white shadow-xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <h3 className="text-base font-semibold">Compose Email</h3>

        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-sm"
          >
            <Copy size={16} />
            Copy
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm text-white"
          >
            <Save size={16} />
            {saving ? "Saving…" : "Save"}
          </button>

          <button
            onClick={handleSend}
            disabled={sending || status === "sent"}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm text-white"
          >
            <Send size={16} />
            {status === "sent" ? "Sent ✓" : sending ? "Sending…" : "Send"}
          </button>

          <button onClick={onClose} className="ml-1 p-2 text-gray-400">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* To */}
      <div className="px-4">
        <input
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="Recipient email"
          className="w-full rounded-xl mb-3 border px-4 py-3 text-sm"
        />
      </div>

      {/* Subject */}
      <div className="px-4">
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Email subject"
          className="w-full rounded-xl mb-4 border px-4 py-3 text-sm"
        />
      </div>

      {/* Editor + Copilot */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <div className="flex-1 px-4 pb-4 overflow-hidden">
          <TipTapEditor content={body} onChange={setBody} />
        </div>

        {/* Copilot */}
        <div className="w-80">
          <EmailCopilotPanel
            clerkUserId={clerkUserId}
            recordingId={recordingId}
            actionItemId={actionItemId!}
            emailHtml={body}
            onApply={setBody}
            isOpen={true} // modal is open
          />
        </div>
      </div>
    </div>
  );
}