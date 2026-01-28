interface DashboardHeaderProps {
  title?: string;
  datetime?: string;
  duration?: string;
  attendees?: string;
}

export default function DashboardHeader({
  title = "Product Sync",
  datetime = "Today, 10:00 AM",
  duration = "45 mins",
  attendees = "Sarah, Mike, Alex",
}: DashboardHeaderProps) {
  return (
    <header className="px-8 pt-6 pb-5 border-b border-gray-200 bg-white">
      <h1 className="text-3xl font-semibold text-gray-900">
        {title}
      </h1>

      <p className="mt-2 text-sm text-gray-500 flex items-center gap-3">
        <span>{datetime}</span>
        <span>•</span>
        <span>{duration}</span>
        <span>•</span>
        <span>{attendees}</span>
      </p>
    </header>
  );
}
