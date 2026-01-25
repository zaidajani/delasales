export default function Risks() {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold">Risks & Loops</h2>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
        <Risk
          title="Budget constraints unclear"
          description="Client mentioned tight budget but no cap."
        />
        <Risk
          title="Legal review timeline"
          description="No owner assigned yet."
        />
      </div>
    </section>
  )
}

function Risk({ title, description }: any) {
  return (
    <div>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
  )
}
