import Sidebar from "@/app/components/Sidebar";
import { startDevScheduler } from "@/lib/devScheduler";

startDevScheduler();

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-[#fafafa]">
        {children}
      </main>
    </div>
  );
}
