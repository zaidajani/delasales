"use client";

import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import GenerateEmailModal from "@/app/components/GenerateEmailModal";
import EmailEditor from "@/app/components/EmailEditor";
import Portal from "@/app/components/Portal";

export default function ClientStep({
  title,
  meta,
  clerkUserId,
  recordingId,
  actionItemId,
  existingEmail,
}: {
  title: string;
  meta?: string;
  clerkUserId: string;
  recordingId: string;
  actionItemId: string;
  existingEmail?: {
    subject: string;
    body: string;
    to?: string;
    status?: "draft" | "sent";
  };
}) {
  /* ---------------------------------
     State
  --------------------------------- */
  const [generateOpen, setGenerateOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);

  const [subject, setSubject] = useState<string>("");
  const [email, setEmail] = useState<string | null>(null);
  const [to, setTo] = useState<string>("");

  const [status, setStatus] = useState<"draft" | "sent">(
    existingEmail?.status ?? "draft"
  );

  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);

  /* ---------------------------------
     Load templates
  --------------------------------- */
  useEffect(() => {
    async function loadTemplates() {
      try {
        const res = await fetch("/api/templates");
        const data = await res.json();
        setTemplates(data.templates || []);
      } catch (err) {
        console.error("Failed to load templates", err);
      }
    }
    loadTemplates();
  }, []);

  /* ---------------------------------
     Sync from DB (on refresh)
  --------------------------------- */
  useEffect(() => {
    if (existingEmail) {
      setSubject(existingEmail.subject || "");
      setEmail(existingEmail.body || null);
      setTo(existingEmail.to || "");
      setStatus(existingEmail.status ?? "draft");
    }
  }, [existingEmail]);

  const hasEmail = Boolean(subject && email);

  /* ---------------------------------
     Generate Email (AI)
  --------------------------------- */
  async function handleGenerate({
    context,
    templateId,
  }: {
    context: string;
    templateId?: string;
  }) {
    if (loading) return;

    try {
      setLoading(true);

      const res = await fetch("/api/recordings/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkUserId,
          recordingId,
          actionItemId,
          extraContext: context,
          templateId, // ✅ NEW
        }),
      });

      if (!res.ok) {
        throw new Error("Email generation failed");
      }

      const data = await res.json();

      setSubject(data.subject);
      setEmail(data.body);
      setStatus("draft");

      setGenerateOpen(false);
      setEditorOpen(true);
    } catch (err) {
      console.error("GENERATE ERROR:", err);
      alert("Failed to generate email");
    } finally {
      setLoading(false);
    }
  }

  /* ---------------------------------
     Button Label Logic
  --------------------------------- */
  const buttonLabel = loading
    ? "Generating…"
    : hasEmail
    ? "Show Email"
    : "Generate Email";

  /* ---------------------------------
     Render
  --------------------------------- */
  return (
    <>
      {/* ===============================
          Row
      =============================== */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-4">
          <div className="w-2 h-2 mt-2 rounded-full bg-gray-300" />
          <div>
            <p className="text-sm font-medium">{title}</p>
            {meta && (
              <div className="mt-1 text-xs text-gray-500">{meta}</div>
            )}
          </div>
        </div>

        <button
          disabled={loading}
          onClick={() =>
            hasEmail ? setEditorOpen(true) : setGenerateOpen(true)
          }
          className="inline-flex items-center gap-2 whitespace-nowrap shrink-0 rounded-md border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          <Mail size={14} />
          {buttonLabel}
        </button>
      </div>

      {/* ===============================
          Generate Modal
      =============================== */}
      <GenerateEmailModal
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        onGenerate={handleGenerate}
        templates={templates} // ✅ NEW
      />

      {/* ===============================
          Email Editor Modal
      =============================== */}
      {editorOpen && email && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />

          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="w-full max-w-3xl">
              <EmailEditor
                subject={subject}
                body={email}
                to={to}
                status={status}
                clerkUserId={clerkUserId}
                recordingId={recordingId}
                actionItemId={actionItemId}
                onClose={() => setEditorOpen(false)}
                onSaved={({ subject, body, to, status }) => {
                  setSubject(subject);
                  setEmail(body);
                  setTo(to);
                  setStatus(status);
                }}
              />
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}