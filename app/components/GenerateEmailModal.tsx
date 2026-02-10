"use client";

import { useEffect, useState } from "react";
import { X, Sparkles } from "lucide-react";
import Portal from "@/app/components/Portal";

export default function GenerateEmailModal({
  open,
  onClose,
  onGenerate,
}: {
  open: boolean;
  onClose: () => void;
  onGenerate: (context: string) => Promise<void> | void;
}) {
  const [context, setContext] = useState("");
  const [generating, setGenerating] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setContext("");
      setGenerating(false);
    }
  }, [open]);

  if (!open) return null;

  async function handleGenerate() {
    if (generating) return;

    try {
      setGenerating(true);
      await onGenerate(context);
    } finally {
      // ❗ Do NOT close modal here
      // Parent decides when to close after success
      setGenerating(false);
    }
  }

  return (
    <Portal>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md" />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="w-full max-w-xl rounded-2xl bg-white border border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.08)] overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Generate follow-up email
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                AI will draft a professional email you can edit
              </p>
            </div>

            <button
              onClick={onClose}
              disabled={generating}
              className="cursor-pointer rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Optional instructions
              </label>

              <div className="rounded-xl border border-gray-200 bg-gray-100/60 p-3 focus-within:border-gray-400 focus-within:bg-white transition">
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={4}
                  placeholder="e.g. Keep the tone friendly, mention pricing follow-up, short & crisp"
                  disabled={generating}
                  className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-gray-400 disabled:opacity-60"
                />
              </div>

              <p className="mt-2 text-xs text-gray-500">
                This helps the AI tailor the email better.
              </p>
            </div>

            {/* Hint */}
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
              <Sparkles size={14} />
              Uses the default follow-up template.
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 bg-gray-100/60">
            <button
              onClick={onClose}
              disabled={generating}
              className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className={`inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium text-white transition
                ${generating
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gray-900 hover:bg-black cursor-pointer"
                }`}
            >
              <Sparkles size={16} />
              {generating ? "Generating…" : "Generate Email"}
            </button>
          </div>

        </div>
      </div>
    </Portal>
  );
}
