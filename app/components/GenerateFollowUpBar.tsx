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
  };
}) {
  const [loading, setLoading] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);

  // 🔑 Source of truth for UI
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  /* ---------------------------------
     Sync when server data changes
  --------------------------------- */
  useEffect(() => {
    if (existingEmail) {
      setSubject(existingEmail.subject || "");
      setBody(existingEmail.body || "");
    }
  }, [existingEmail]);

  const hasEmail = Boolean(subject && body);

  /* ---------------------------------
     Generate summary follow-up email
  --------------------------------- */
  async function handleGenerate() {
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

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate follow-up");
      }

      const data = await res.json();

      setSubject(data.subject);
      setBody(data.body);
      setEditorOpen(true);
    } catch (err) {
      console.error(err);
      alert("Failed to generate follow-up");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* ===============================
          Bottom Bar
      =============================== */}
      <div className="fixed bottom-0 left-[280px] right-0 bg-white border-t border-gray-200 px-12 py-4 flex items-center justify-between z-40">
        <span className="text-sm text-gray-400">
          {hasEmail ? "Follow-up saved" : "No follow-up yet"}
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
          {loading
            ? "Generating…"
            : hasEmail
            ? "Show Follow-up"
            : "Generate Follow-up"}
        </button>
      </div>

      {/* ===============================
          Email Editor Modal
      =============================== */}
      {editorOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />

          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <SummaryEmailEditor
              subject={subject}
              body={body}
              clerkUserId={clerkUserId}
              recordingId={recordingId}
              onClose={() => setEditorOpen(false)}
              onSaved={({ subject, body }) => {
                // 🔥 instant UI update (NO refresh)
                setSubject(subject);
                setBody(body);
                setEditorOpen(false);
              }}
            />
          </div>
        </Portal>
      )}
    </>
  );
}
