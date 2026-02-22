"use client";

import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import GenerateEmailModal from "@/app/components/GenerateEmailModal";
import EmailEditor from "@/app/components/EmailEditor";
import Portal from "@/app/components/Portal";
import { MailProvider } from "@/app/context/MailContext";

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
  /* ---------------- State ---------------- */
  const [generateOpen, setGenerateOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);

  const [subject, setSubject] = useState(existingEmail?.subject ?? "");
  const [email, setEmail] = useState<string | null>(
    existingEmail?.body ?? null,
  );
  const [to, setTo] = useState(existingEmail?.to ?? "");
  const [status, setStatus] = useState<"draft" | "sent">(
    existingEmail?.status ?? "draft",
  );

  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);

  /* ---------------- Load templates ---------------- */
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

  const hasEmail = Boolean(subject && email);

  /* ---------------- Generate Email ---------------- */
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
          templateId,
        }),
      });

      if (!res.ok) throw new Error("Email generation failed");

      const data = await res.json();

      setSubject(data.subject);
      setEmail(data.body);
      setStatus("draft");

      setGenerateOpen(false);
      setEditorOpen(true);
    } catch (err) {
      console.error(err);
      alert("Failed to generate email");
    } finally {
      setLoading(false);
    }
  }

  const buttonLabel = loading
    ? "Generating…"
    : hasEmail
      ? "Show Email"
      : "Generate Email";

  /* ---------------- Render ---------------- */
  return (
    <>
      {/* Row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-4">
          <div className="w-2 h-2 mt-2 rounded-full bg-gray-300" />
          <div>
            <p className="text-sm font-medium">{title}</p>
            {meta && <div className="mt-1 text-xs text-gray-500">{meta}</div>}
          </div>
        </div>

        <div className="w-[140px] flex justify-end">
          <button
            disabled={loading}
            onClick={() =>
              hasEmail ? setEditorOpen(true) : setGenerateOpen(true)
            }
            className={`
      inline-flex items-center gap-2
      px-3 py-1.5
      text-sm font-medium
      rounded-md
      transition
      whitespace-nowrap
      ${
        hasEmail
          ? "text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      }
    `}
          >
            <Mail
              size={16}
              className={hasEmail ? "text-emerald-600" : "text-gray-400"}
            />
            {hasEmail ? "Show" : "Generate"}
          </button>
        </div>
      </div>

      {/* Generate Modal */}
      <GenerateEmailModal
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        onGenerate={handleGenerate}
        templates={templates}
      />

      {/* Editor Modal */}
      {editorOpen && email && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />

          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="w-[94vw] max-w-[1400px] h-[92vh]">
              <MailProvider
                initialState={{
                  subject,
                  body: email,
                  to,
                  status,
                }}
              >
                <EmailEditor
                  clerkUserId={clerkUserId}
                  recordingId={recordingId}
                  actionItemId={actionItemId}
                  onClose={() => setEditorOpen(false)}
                  onSaved={(updated) => {
                    setSubject(updated.subject);
                    setEmail(updated.body);
                    setTo(updated.to);
                    setStatus(updated.status ?? "draft");
                  }}
                />
              </MailProvider>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
