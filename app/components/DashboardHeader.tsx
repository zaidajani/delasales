export default function DashboardHeader() {
  return (
    <header className="px-8 pt-6 pb-5 border-b border-gray-200 bg-white">
      <h1 className="text-3xl font-semibold text-gray-900">
        Product Sync
      </h1>

      <p className="mt-2 text-sm text-gray-500 flex items-center gap-3">
        <span>Today, 10:00 AM</span>
        <span>•</span>
        <span>45 mins</span>
        <span>•</span>
        <span>Sarah, Mike, Alex</span>
      </p>
    </header>
  );
}
