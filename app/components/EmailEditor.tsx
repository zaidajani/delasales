"use client";

import { useEffect, useState } from "react";
import { Copy, Send, Save, X, Mail } from "lucide-react";
import TipTapMail from "@/app/components/TipTapMail";
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
    <div className="relative w-full h-full rounded-3xl bg-white shadow-xl border border-gray-100 flex flex-col overflow-hidden">
      {/* ================= Header ================= */}
      <div className="px-6 pt-5 pb-4 bg-white">
        <div className="flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-3">
            {/* <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 flex items-center justify-center">
              <Mail size={18} />
            </div> */}
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold text-gray-900 tracking-tight">
                Generate Follow-up
              </h3>
              <span className="text-xs text-gray-400 font-medium">
                New Email
              </span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 hover:border-gray-300 transition"
            >
              <Copy size={16} className="text-gray-400" />
              <span className="text-xs font-medium">Copy</span>
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B3E5FC] text-blue-900 hover:bg-[#a1dffc] transition"
            >
              <Save size={16} className="text-blue-800" />
              <span className="text-xs font-medium">
                {saving ? "Saving…" : "Save"}
              </span>
            </button>

            <button
              onClick={handleSend}
              disabled={sending || status === "sent"}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B7E4C7] text-green-900 hover:bg-[#a2dec0] transition"
            >
              <Send size={16} className="text-green-800" />
              <span className="text-xs font-medium">
                {status === "sent" ? "Sent ✓" : sending ? "Sending…" : "Send"}
              </span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Separator */}
        <div className="mt-4 h-px bg-gray-100 w-full" />
      </div>

      {/* ================= Form Fields ================= */}
      {/* Recipient + Subject (side by side) */}
      <div className="px-6 pb-2">
        <div className="grid grid-cols-2 gap-4">
          {/* Recipient */}
          <div className="group">
            <label className="block text-[11px] font-medium text-gray-500 mb-1 ml-1 tracking-wide">
              RECIPIENT
            </label>

            <div className="relative flex items-center">
              <div className="absolute left-3 text-gray-400 group-focus-within:text-blue-500 transition">
                <Mail size={14} />
              </div>

              <input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition shadow-sm"
              />
            </div>
          </div>

          {/* Subject */}
          <div className="group">
            <label className="block text-[11px] font-medium text-gray-500 mb-1 ml-1 tracking-wide">
              SUBJECT
            </label>

            <div className="relative flex items-center">
              <div className="absolute left-3 text-gray-400 group-focus-within:text-purple-500 transition">
                <Mail size={14} />
              </div>

              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject"
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-50 transition shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= Editor + Copilot ================= */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <div className="flex-[7] bg-[#F3F4F6] px-6 pb-6 overflow-auto mt-5">
          <div className="mx-auto max-w-[760px]">
            {/* Word-style page */}
            <div className="mx-auto max-w-[760px] pt-6">
              <TipTapMail content={body} onChange={setBody} />
            </div>
          </div>
        </div>

        {/* Copilot */}
        <div className="flex-[3] min-w-[360px] max-w-[420px]">
          <EmailCopilotPanel
            clerkUserId={clerkUserId}
            recordingId={recordingId}
            actionItemId={actionItemId!}
            emailHtml={body}
            onApply={setBody}
            isOpen={true}
          />
        </div>
      </div>
    </div>
  );
}
