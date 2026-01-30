"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AnalyseAction({
  clerkUserId,
  recordingId,
}: {
  clerkUserId: string;
  recordingId: string;
}) {
  const router = useRouter();
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAnalyse() {
    try {
      setLoading(true);

      const res = await fetch("/api/recordings/analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clerkUserId,
          recordingId,
          instruction,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("ANALYSIS API ERROR:", errText);
        throw new Error(errText || "Analysis failed");
      }

      // 🔁 Re-fetch server component data
      router.refresh();
    } catch (err) {
      console.error("ANALYSE ERROR:", err);
      alert("Failed to analyse transcription");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 bg-amber-50 text-amber-900 px-4 py-3 rounded-lg border border-amber-100/50 w-fit">
        <span className="text-sm font-medium">
          Transcription is not analysed
        </span>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Analysis instruction
        </label>

        <textarea
          rows={4}
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white p-4 text-base text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 shadow-sm resize-none"
          placeholder="e.g. Identify the customer's main objections and the agreed next steps..."
        />

        <p className="text-sm text-gray-500">
          Provide clear instructions on how the AI should classify action items,
          with emphasis on accurately identifying the client from the call.
        </p>
      </div>

      <button
        onClick={handleAnalyse}
        disabled={loading}
        className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white text-base font-medium px-5 py-2.5 rounded-lg shadow-sm"
      >
        {loading ? "Analysing…" : "Analyse transcription"}
      </button>
    </section>
  );
}
