"use client";

import { useState } from "react";
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
  existingEmail, // 👈 comes from page.tsx
}: {
  title: string;
  meta?: string;
  clerkUserId: string;
  recordingId: string;
  actionItemId: string;
  existingEmail?: {
    subject: string;
    body: string;
  };
}) {
  const [generateOpen, setGenerateOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);

  // Local state (used immediately after generation)
  const [email, setEmail] = useState<string | null>(
    existingEmail?.body || null,
  );

  const [loading, setLoading] = useState(false);

  /* ---------------------------------
     Generate email (AI)
  --------------------------------- */
  async function handleGenerate(context: string) {
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
        }),
      });

      if (!res.ok) {
        throw new Error("Email generation failed");
      }

      const data = await res.json();

      // 🔑 IMPORTANT: backend returns { subject, body }
      setEmail(data.body);
      setGenerateOpen(false);
      setEditorOpen(true);
    } catch (err) {
      console.error("GENERATE EMAIL ERROR:", err);
      alert("Failed to generate email");
    } finally {
      setLoading(false);
    }
  }

  const hasEmail = Boolean(email);

  return (
    <>
      {/* ===============================
          Row
      =============================== */}
      <div className="flex items-center justify-between gap-4">
        {/* Left */}
        <div className="flex gap-4">
          <div className="w-2 h-2 mt-2 rounded-full bg-gray-300" />
          <div>
            <p className="text-sm font-medium">{title}</p>
            {meta && <div className="mt-1 text-xs text-gray-500">{meta}</div>}
          </div>
        </div>

        {/* Right */}
        <button
          onClick={() =>
            hasEmail ? setEditorOpen(true) : setGenerateOpen(true)
          }
          className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
        >
          <Mail size={14} />
          {hasEmail ? "Show Email" : "Generate Email"}
        </button>
      </div>

      {/* ===============================
          Generate Modal
      =============================== */}
      <GenerateEmailModal
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        onGenerate={handleGenerate}
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
                subject={existingEmail?.subject || ""}
                body={email}
                clerkUserId={clerkUserId}
                recordingId={recordingId}
                actionItemId={actionItemId}
                onClose={() => setEditorOpen(false)}
              />
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
