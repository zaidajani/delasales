export default function ActionItems() {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">
          Your Action Items
        </h2>

        <span className="text-xs font-medium text-gray-500">
          3 Pending
        </span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y">
        <Task
          title="Finalize the Q3 budget spreadsheet"
          meta="Fri, 5 PM"
          tag={{ label: "Hard Deadline", color: "orange" }}
        />

        <Task
          title="Update slide deck with new user metrics"
          meta="Next Mon"
          tag={{ label: "Soft Commitment", color: "blue" }}
        />

        <Task
          title="Send invite to creative team"
          completed
        />
      </div>
    </section>
  );
}

function Task({
  title,
  meta,
  tag,
  completed,
}: any) {
  return (
    <div className="flex items-start gap-4 px-4 py-4">
      <input
        type="checkbox"
        defaultChecked={completed}
        className="mt-1 h-4 w-4 rounded border-gray-300"
      />

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${
            completed
              ? "line-through text-gray-400"
              : "text-gray-900"
          }`}
        >
          {title}
        </p>

        {(tag || meta) && (
          <div className="mt-1 flex items-center gap-2 text-xs">
            {tag && (
              <span
                className={`px-2 py-0.5 rounded-full font-medium ${
                  tag.color === "orange"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {tag.label}
              </span>
            )}

            {meta && (
              <span className="text-gray-500 flex items-center gap-1">
                📅 {meta}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
