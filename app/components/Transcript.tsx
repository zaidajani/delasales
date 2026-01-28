interface TranscriptLine {
  speaker: string;
  text: string;
}

interface TranscriptProps {
  title?: string;
  lines?: TranscriptLine[];
}

export default function Transcript({
  title = "Transcript Reference",
  lines = [
    {
      speaker: "Sarah",
      text: "We really need to get the Q3 budget finalized.",
    },
    {
      speaker: "You",
      text: "I'll take care of that by Friday.",
    },
  ],
}: TranscriptProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-base font-semibold text-gray-900">
        {title}
      </h2>

      <div className="bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-700 space-y-3">
        {lines.map((line, index) => (
          <p key={index}>
            <strong>{line.speaker}:</strong> {line.text}
          </p>
        ))}
      </div>
    </section>
  );
}
