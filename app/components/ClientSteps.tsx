interface StepItem {
  title: string;
  meta?: string;
  tag?: string;
}

interface ClientStepsProps {
  title?: string;
  steps?: StepItem[];
}

export default function ClientSteps({
  title = "Client Steps",
  steps = [
    {
      title: "Approve wireframes",
      meta: "Sarah (Client)",
      tag: "Dependency",
    },
    {
      title: "Access to analytics",
      meta: "Needed by Friday",
    },
  ],
}: ClientStepsProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-purple-500" />
        {title}
      </h2>

      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        {steps.map((step, index) => (
          <Step key={index} {...step} />
        ))}
      </div>
    </section>
  );
}

function Step({ title, meta, tag }: any) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-4 h-4 rounded-full border border-gray-300 mt-1" />

      <div>
        <p className="text-sm font-medium text-gray-900">
          {title}
        </p>

        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-gray-500">{meta}</p>

          {tag && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">
              {tag}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
