"use client";

import { useEffect, useState } from "react";
import SummaryEmailEditor from "@/app/components/SummaryEmailEditor";
import Portal from "@/app/components/Portal";

export default function GenerateFollowUpBar({
  clerkUserId,
  recordingId,
  existingEmail,
}: {
  clerkUserId: string;
  recordingId: string;
  existingEmail?: {
    subject: string;
    body: string;
    to?: string;
    status?: "draft" | "sent";
  };
}) {
  /* ---------------------------------
     Local UI State
  --------------------------------- */
  const [loading, setLoading] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);

  // 🔑 Source of truth for UI
  const [subject, setSubject] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [status, setStatus] = useState<"draft" | "sent">("draft");

  /* ---------------------------------
     Sync when server data changes
     (IMPORTANT for refresh case)
  --------------------------------- */
  useEffect(() => {
    if (existingEmail) {
      setSubject(existingEmail.subject || "");
      setBody(existingEmail.body || "");
      setTo(existingEmail.to || "");
      setStatus(existingEmail.status || "draft");
    }
  }, [existingEmail]);

  const hasEmail = Boolean(subject && body);

  /* ---------------------------------
     Generate summary follow-up email
  --------------------------------- */
  async function handleGenerate() {
    if (loading) return;

    try {
      setLoading(true);

      const res = await fetch("/api/recordings/generate-summary-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkUserId,
          recordingId,
          extraContext:
            "Generate a professional follow-up summarizing the call",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to generate follow-up");
      }

      // 🔥 instantly update UI
      setSubject(data.subject);
      setBody(data.body);
      setStatus("draft");

      setEditorOpen(true);
    } catch (err) {
      console.error("SUMMARY GENERATE ERROR:", err);
      alert("Failed to generate follow-up");
    } finally {
      setLoading(false);
    }
  }

  /* ---------------------------------
     Button Text Logic
  --------------------------------- */
  const buttonText = loading
    ? "Generating…"
    : hasEmail
    ? "Show Follow-up"
    : "Generate Follow-up";

  /* ---------------------------------
     Render
  --------------------------------- */
  return (
    <>
      {/* ===============================
          Bottom Bar
      =============================== */}
      <div className="fixed bottom-0 left-[280px] right-0 bg-white border-t border-gray-200 px-12 py-4 flex items-center justify-between z-40">
        
        <span className="text-sm text-gray-400">
          {status === "sent"
            ? "Follow-up sent"
            : hasEmail
            ? "Follow-up saved"
            : "No follow-up yet"}
        </span>

        <button
          onClick={() =>
            hasEmail ? setEditorOpen(true) : handleGenerate()
          }
          disabled={loading}
          className="
            bg-blue-600 hover:bg-blue-700
            text-white text-sm px-5 py-2 rounded-lg
            disabled:opacity-60
            whitespace-nowrap
          "
        >
          {buttonText}
        </button>
      </div>

      {/* ===============================
          Email Editor Modal
      =============================== */}
      {editorOpen && (
        <Portal>
          {/* Overlay */}
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <SummaryEmailEditor
              subject={subject}
              body={body}
              to={to}
              status={status}
              clerkUserId={clerkUserId}
              recordingId={recordingId}
              onClose={() => setEditorOpen(false)}
              onSaved={({ subject, body, to, status }) => {
                // 🔥 Instant UI Sync
                setSubject(subject);
                setBody(body);
                setTo(to);
                setStatus(status);
              }}
            />
          </div>
        </Portal>
      )}
    </>
  );
}