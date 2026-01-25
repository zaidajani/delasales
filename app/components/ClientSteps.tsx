export default function ClientSteps() {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold">Client Steps</h2>
      <div className="bg-white border rounded-xl p-4 space-y-3">
        <Step title="Approve wireframes" meta="Sarah (Client)" />
        <Step title="Access to analytics" meta="Needed by Friday" />
      </div>
    </section>
  )
}

function Step({ title, meta }: any) {
  return (
    <div>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-gray-500">{meta}</p>
    </div>
  )
}
