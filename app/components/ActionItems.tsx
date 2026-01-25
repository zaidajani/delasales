export default function ActionItems() {
  return (
    <section className="space-y-4">
      <h2 className="text-base font-semibold">Your Action Items</h2>

      <div className="bg-white border rounded-xl">
        <Task title="Finalize the Q3 budget spreadsheet" />
        <Task title="Update slide deck with new user metrics" />
        <Task title="Send invite to creative team" completed />
      </div>
    </section>
  )
}

function Task({ title, completed }: any) {
  return (
    <div className="flex items-center gap-4 p-4 border-b last:border-b-0">
      <input type="checkbox" defaultChecked={completed} />
      <span
        className={`text-sm ${
          completed ? 'line-through text-gray-400' : 'text-gray-900'
        }`}
      >
        {title}
      </span>
    </div>
  )
}
