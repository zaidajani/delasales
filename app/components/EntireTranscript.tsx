"use client";

import { useState } from "react";

type TranscriptViewerProps = {
  transcript: string;
  previewLines?: number; // optional, default = 4
};

export default function TranscriptViewer({
  transcript,
  previewLines = 4,
}: TranscriptViewerProps) {
  const [expanded, setExpanded] = useState(false);

  const lines = transcript
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const visibleLines = expanded ? lines : lines.slice(0, previewLines);

  return (
    <section className="space-y-3">
      <div className="bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-700 space-y-2">
        {visibleLines.map((line, index) => {
          const [speaker, ...rest] = line.split(":");
          return (
            <p key={index}>
              <strong className="text-gray-900">
                {speaker.replace("_", " ")}:
              </strong>{" "}
              {rest.join(":").trim()}
            </p>
          );
        })}

        {lines.length > previewLines && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-medium text-blue-600 hover:underline pt-2"
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>
    </section>
  );
}
