"use client";

import { useState } from "react";

export default function TranscriptPreview({
  transcript,
}: {
  transcript: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div className="relative bg-gray-50/50 rounded-xl border border-gray-100 p-6">
        <div
          className={`space-y-4 text-base leading-relaxed text-gray-600 transition-all duration-300 ${
            expanded ? "max-h-none" : "max-h-[240px] overflow-hidden"
          }`}
        >
          {transcript.split("\n").map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>

        {!expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 via-gray-50/90 to-transparent rounded-b-xl pointer-events-none" />
        )}
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 bg-white border border-gray-200 rounded-md px-4 py-2 shadow-sm"
      >
        {expanded ? "Show less" : "Show full transcription"}
      </button>
    </>
  );
}
