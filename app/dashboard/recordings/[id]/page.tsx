import Sidebar from "@/app/components/Sidebar";

async function getRecording(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/recordings/${id}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    console.error("API STATUS:", res.status);
    throw new Error("Failed to fetch recording");
  }

  return res.json();
}


export default async function ProductSyncPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const recording = await getRecording(id);

  return (
    <div className="h-screen flex bg-[#f7f8fa] text-gray-900">
      <Sidebar activeItem="product-sync" />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="px-12 pt-6 pb-5 bg-[#f7f8fa] border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Product Sync
              </h1>

              <div className="mt-2 flex items-center gap-5 text-sm text-gray-500">
                <span>3 Tasks</span>
                <span>2 Email Opportunities</span>
                <span className="text-gray-400">Sarah, Mike, Alex</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="px-3 py-1.5 rounded-md text-sm border border-gray-200 bg-white hover:bg-gray-50">
                Share
              </button>
              <button className="px-3 py-1.5 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700">
                + Add Task
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-12 pb-24">
          <div className="max-w-6xl mx-auto space-y-14">
            {/* Action Items */}
            <section className="space-y-5">
              <div className="flex items-center justify-between mt-10">
                <h2 className="text-lg font-semibold">Your Action Items</h2>
                <span className="text-sm text-gray-500">3 Pending</span>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <TaskRow
                  title="Finalize the Q3 budget spreadsheet"
                  badge="Hard Deadline"
                  badgeColor="orange"
                  meta="Fri, 5 PM"
                />
                <TaskRow
                  title="Update slide deck with new user metrics"
                  badge="Soft Commitment"
                  badgeColor="blue"
                  meta="Next Mon"
                />
                <TaskRow title="Send invite to creative team" completed />
              </div>
            </section>

            {/* Two Column */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Left */}
              <div className="lg:col-span-2 space-y-14">
                {/* Client Steps */}
                <section className="space-y-5">
                  <h2 className="text-lg font-semibold">Client Steps</h2>

                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
                    <ClientStep
                      title="Approve wireframes"
                      meta="Sarah (Client)"
                      tag="Dependency"
                    />
                    <ClientStep
                      title="Access to analytics"
                      meta="Needed by Friday"
                    />
                  </div>
                </section>

                {/* Transcript */}
                <section className="space-y-5">
                  <h2 className="text-lg font-semibold">
                    Transcript Reference
                  </h2>

                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4 text-sm">
                    <p className="text-gray-700">
                      <strong>Sarah:</strong> We really need to get the Q3
                      budget finalized.
                    </p>
                    <p className="pl-4 border-l-4 border-blue-500 text-gray-900">
                      <strong>You:</strong> I’ll take care of that by Friday.
                    </p>
                  </div>
                </section>
              </div>

              {/* Right */}
              <div>
                <section className="space-y-5">
                  <h2 className="text-lg font-semibold">Risks & Loops</h2>

                  <div className="bg-[#fff7ed] border border-orange-200 rounded-2xl p-6 space-y-5 shadow-sm">
                    <Risk
                      title="Budget constraints unclear"
                      description='Client mentioned "tight budget" but no cap.'
                    />
                    <Risk
                      title="Legal review timeline"
                      description="No owner assigned yet."
                    />
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="fixed bottom-0 left-[280px] right-0 bg-white border-t border-gray-200 px-12 py-4 flex items-center justify-between">
          <span className="text-sm text-gray-400">Autosaved 2m ago</span>

          <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 rounded-lg">
            Generate Follow-up
          </button>
        </div>
      </main>
    </div>
  );
}

/* ---------- INLINE HELPERS ---------- */

function TaskRow({ title, meta, badge, badgeColor, completed }: any) {
  return (
    <div className="flex gap-4 px-6 py-5 border-b last:border-b-0 border-gray-100">
      <input type="checkbox" defaultChecked={completed} />

      <div className="flex-1">
        <p
          className={`text-sm ${completed ? "line-through text-gray-400" : "font-medium"}`}
        >
          {title}
        </p>

        {(badge || meta) && (
          <div className="mt-2 flex items-center gap-3 text-xs">
            {badge && (
              <span
                className={`px-2 py-1 rounded-md ${
                  badgeColor === "orange"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {badge}
              </span>
            )}
            {meta && <span className="text-gray-500">{meta}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function ClientStep({ title, meta, tag }: any) {
  return (
    <div className="flex gap-4">
      <div className="w-2 h-2 mt-2 rounded-full bg-gray-300" />
      <div>
        <p className="text-sm font-medium">{title}</p>
        <div className="mt-1 flex gap-3 text-xs text-gray-500">
          <span>{meta}</span>
          {tag && (
            <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-md">
              {tag}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Risk({ title, description }: any) {
  return (
    <div>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-gray-600 mt-1">{description}</p>
    </div>
  );
}
