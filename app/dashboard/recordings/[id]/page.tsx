import TranscriptViewer from "@/app/components/EntireTranscript";
import TranscriptPreview from "@/app/components/TranscriptPreview";
import AnalyseAction from "@/app/components/AnalyzeAction";
import TaskRowClient from "@/app/components/TaskRowClient";
import ClientStep from "@/app/components/ClientStep";
import AddActionItem from "@/app/components/AddActionItem";

async function getRecording(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/recordings/${id}`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    const err = await res.json();
    console.error("RECORDING FETCH ERROR:", err);
    throw new Error(err.error || "Failed to fetch recording");
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

  /* ======================================================
     🔶 STATE 1 — NOT ANALYSED
  ====================================================== */
  if (!recording.isAnalyzed) {
    return (
      <main className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-4xl mx-auto px-10 py-12">
          {/* Header */}
          <header className="mb-10">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <span>Yesterday</span>
              <span>&bull;</span>
              <span>19:10</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
              {recording.title}
            </h1>
          </header>

          <div className="grid grid-cols-1 gap-12">
            {/* Transcription */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  Transcription
                </h2>
                <span className="text-sm text-gray-400">
                  {recording.durationMinutes
                    ? `${recording.durationMinutes} min`
                    : ""}
                </span>
              </div>

              <TranscriptPreview transcript={recording.transcript} />
            </section>

            <hr className="border-gray-100" />

            {/* Analysis Section */}
            {/* Analysis Section */}
            <AnalyseAction
              clerkUserId={recording.clerkUserId}
              recordingId={recording._id}
            />
          </div>
        </div>
      </main>
    );
  }

  /* ======================================================
     🟢 STATE 2 — ANALYSED (ORIGINAL DASHBOARD)
  ====================================================== */
  return (
    <div className="h-screen flex bg-[#f7f8fa] text-gray-900">
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="px-12 pt-6 pb-5 bg-[#f7f8fa] border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {recording.title}
              </h1>

              <div className="mt-2 flex items-center gap-5 text-sm text-gray-500">
                {/* ✅ Seller tasks (pending) */}
                <span>
                  {
                    recording.actionItems.filter(
                      (item: any) =>
                        item.category === "seller" && !item.completed,
                    ).length
                  }{" "}
                  Tasks
                </span>

                {/* ✅ Email opportunities = client steps + 1 */}
                <span>
                  {recording.actionItems.filter(
                    (item: any) => item.category === "client",
                  ).length + 1}{" "}
                  Email Opportunities
                </span>

                {/* ✅ Participants from DB */}
                {recording.participants?.length > 0 && (
                  <span className="text-gray-400">
                    {recording.participants.join(", ")}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <AddActionItem
                clerkUserId={recording.clerkUserId}
                recordingId={recording._id}
              />
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
                <span className="text-sm text-gray-500">
                  {
                    recording.actionItems.filter(
                      (item: any) =>
                        item.category === "seller" && !item.completed,
                    ).length
                  }{" "}
                  Pending
                </span>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {recording.actionItems
                  .filter((item: any) => item.category === "seller")
                  .map((item: any) => (
                    <TaskRowClient
                      key={item._id} // ✅ FIX
                      title={item.text}
                      completed={item.completed}
                      clerkUserId={recording.clerkUserId}
                      recordingId={recording._id}
                      actionItemId={item._id}
                    />
                  ))}

                {recording.actionItems.filter(
                  (item: any) => item.category === "seller",
                ).length === 0 && (
                  <p className="px-6 py-5 text-sm text-gray-400">
                    No seller action items identified.
                  </p>
                )}
              </div>
            </section>

            {/* Two Column */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-14">
                {/* Client Steps */}
                {/* Client Steps */}
                <section className="space-y-5">
                  <h2 className="text-lg font-semibold">Client Steps</h2>

                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
                    {recording.actionItems
                      .filter((item: any) => item.category === "client")
                      .map((item: any) => {
                        // 🔑 Find existing email for this action item (if any)
                        const existingEmail = recording.emails?.find(
                          (email: any) => email.actionItemId === item._id,
                        );

                        return (
                          <ClientStep
                            key={item._id}
                            title={item.text}
                            meta="Client"
                            clerkUserId={recording.clerkUserId}
                            recordingId={recording._id}
                            actionItemId={item._id}
                            existingEmail={existingEmail}
                          />
                        );
                      })}

                    {recording.actionItems.filter(
                      (item: any) => item.category === "client",
                    ).length === 0 && (
                      <p className="text-sm text-gray-400">
                        No client steps identified.
                      </p>
                    )}
                  </div>
                </section>

                {/* Transcript */}
                <section className="space-y-5">
                  <h2 className="text-lg font-semibold">Full Transcript</h2>
                  <TranscriptViewer transcript={recording.transcript} />
                </section>
              </div>

              {/* Right */}
              <div>
                {/* Risks & Loops */}
                <section className="space-y-5">
                  <h2 className="text-lg font-semibold">Risks & Loops</h2>

                  <div className="bg-[#fff7ed] border border-orange-200 rounded-2xl p-6 space-y-5 shadow-sm">
                    {recording.risks.map((risk: any, idx: number) => (
                      <Risk key={idx} description={risk.description} />
                    ))}

                    {recording.risks.length === 0 && (
                      <p className="text-sm text-orange-800/70">
                        No risks identified.
                      </p>
                    )}
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

function Risk({ title, description }: any) {
  return (
    <div>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-gray-600 mt-1">{description}</p>
    </div>
  );
}
