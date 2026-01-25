export default function Risks() {
  return (
    <section className="space-y-4">
      <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        Risks & Loops
      </h2>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-4">
        <Risk
          title="Budget constraints unclear"
          description='Client mentioned "tight budget" but didn’t specify a cap.'
        />

        <Risk
          title="Legal review timeline"
          description="No owner assigned yet."
        />
      </div>
    </section>
  );
}

function Risk({ title, description }: any) {
  return (
    <div className="flex gap-3">
      <span className="text-amber-600 mt-1">⚠️</span>

      <div>
        <p className="text-sm font-medium text-gray-900">
          {title}
        </p>
        <p className="text-xs text-gray-600 mt-0.5">
          {description}
        </p>
      </div>
    </div>
  );
}
