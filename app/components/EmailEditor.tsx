"use client";

import { useEffect, useState } from "react";
import { Copy, Send, Save, X, Mail } from "lucide-react";
import TipTapMail from "@/app/components/TipTapMail";
import EmailCopilotPanel from "./EmailCopilotPanel";
import { useMail } from "@/app/context/MailContext";

/* ---------------------------------
   HTML → Plain text
--------------------------------- */
function htmlToPlainText(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

type Props = {
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
};

export default function EmailEditor({
  clerkUserId,
  recordingId,
  actionItemId,
  onClose,
  onSaved,
}: Props) {
  /* ✅ GLOBAL MAIL STATE */
  const { subject, body, to, status, updateMail } = useMail();

  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  /* ================= COPY ================= */
  async function copyToClipboard() {
    try {
      const plainText = htmlToPlainText(body);

      const clipboardItem = new ClipboardItem({
        "text/html": new Blob([body], { type: "text/html" }),
        "text/plain": new Blob([plainText], { type: "text/plain" }),
      });

      await navigator.clipboard.write([clipboardItem]);
    } catch {
      alert("Copy failed — use Ctrl+C");
    }
  }

  /* ================= SAVE ================= */
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

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      onSaved({ subject, body, to, status });
      alert("Email saved");
    } catch (err) {
      console.error(err);
      alert("Failed to save email");
    } finally {
      setSaving(false);
    }
  }

  /* ================= SEND ================= */
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
          type: actionItemId ? "action" : "summary",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      updateMail({ status: "sent" });
      onSaved({ subject, body, to, status: "sent" });

      alert("Email sent 🎉");
    } catch (err) {
      console.error(err);
      alert("Failed to send email");
    } finally {
      setSending(false);
    }
  }

  /* ================= ESC CLOSE ================= */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!actionItemId) return null;

  /* ================= UI ================= */
  return (
    <div className="relative w-full h-full rounded-3xl bg-white shadow-xl border border-gray-100 flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="px-6 pt-5 pb-4 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Generate Follow-up
            </h3>
            <span className="text-xs text-gray-400">New Email</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 bg-white hover:bg-gray-50"
            >
              <Copy size={16} />
              <span className="text-xs">Copy</span>
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B3E5FC] text-blue-900"
            >
              <Save size={16} />
              <span className="text-xs">{saving ? "Saving…" : "Save"}</span>
            </button>

            <button
              onClick={handleSend}
              disabled={sending || status === "sent"}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B7E4C7] text-green-900"
            >
              <Send size={16} />
              <span className="text-xs">
                {status === "sent" ? "Sent ✓" : sending ? "Sending…" : "Send"}
              </span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="mt-4 h-px bg-gray-100 w-full" />
      </div>

      {/* RECIPIENT + SUBJECT */}
      <div className="px-6 pb-2">
        <div className="grid grid-cols-2 gap-4">
          {/* Recipient */}
          <div>
            <label className="text-[11px] text-gray-500 ml-1">RECIPIENT</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-2.5 text-gray-400" size={14} />
              <input
                value={to}
                onChange={(e) => updateMail({ to: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px]"
                placeholder="name@example.com"
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="text-[11px] text-gray-500 ml-1">SUBJECT</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-2.5 text-gray-400" size={14} />
              <input
                value={subject}
                onChange={(e) => updateMail({ subject: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px]"
                placeholder="Enter email subject"
              />
            </div>
          </div>
        </div>
      </div>

      {/* EDITOR + COPILOT */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <div className="flex-[7] bg-[#F3F4F6] px-6 pb-6 overflow-auto mt-5">
          <div className="mx-auto max-w-[760px] pt-6">
            <TipTapMail
              content={body}
              onChange={(html) => {
                updateMail({ body: html });
                onSaved({ subject, body: html, to, status });
              }}
            />
          </div>
        </div>

        {/* Copilot */}
        <div className="flex-[3] min-w-[360px] max-w-[420px]">
          <EmailCopilotPanel
            clerkUserId={clerkUserId}
            recordingId={recordingId}
            actionItemId={actionItemId}
            emailHtml={body}
            onApply={(newHtml) => {
              updateMail({ body: newHtml });
              onSaved({ subject, body: newHtml, to, status });
            }}
            isOpen={true}
          />
        </div>
      </div>
    </div>
  );
}