import ConnectGmailCard from "@/app/components/ConnectGmailCard";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#f7f8fa] px-12 py-10">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage integrations and account preferences
          </p>
        </div>

        {/* Integrations */}
        <section className="space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Integrations
          </h2>

          <ConnectGmailCard />
        </section>
      </div>
    </div>
  );
}
