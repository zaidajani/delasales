"use client";

import { LayoutGrid, Users, Layers } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function Sidebar({ activeItem }: { activeItem?: string }) {
  return (
    <aside className="w-[280px] bg-white border-r border-gray-100 flex flex-col shrink-0 h-full">
      {/* Logo */}
      <div className="p-5 pb-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 bg-gray-900 text-white rounded-xl flex items-center justify-center">
            <Layers size={18} strokeWidth={2.2} />
          </div>

          <span className="font-semibold text-lg text-gray-900">
            De La Sales
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        <Section title="General">
          <NavItem
            label="Dashboard"
            icon={<LayoutGrid size={18} />}
            active={activeItem === "dashboard"}
          />
          <NavItem
            label="Clients"
            icon={<Users size={18} />}
            active={activeItem === "clients"}
          />
        </Section>

        <Section title="Today">
          <TimelineItem
            label="Product Sync"
            time="10:00 AM"
            status="active"
            active={activeItem === "product-sync"}
          />
          <TimelineItem
            label="Q3 Roadmap Review"
            status="inactive"
            active={activeItem === "q3-roadmap"}
          />
          <TimelineItem
            label="Design Huddle"
            status="active"
            active={activeItem === "design-huddle"}
          />
        </Section>

        <Section title="Yesterday">
          <TimelineItem
            label="Weekly All Hands"
            status="active"
            active={activeItem === "weekly-all-hands"}
          />
          <TimelineItem
            label="Client: Sisyphus"
            status="inactive"
            active={activeItem === "client-sisyphus"}
          />
        </Section>

        <Section title="Jan 12">
          <TimelineItem
            label="Marketing Sync"
            status="active"
            active={activeItem === "marketing-sync"}
          />
        </Section>
      </div>

      {/* User */}
      <SidebarUser />
    </aside>
  );
}

/* ---------------- Helpers ---------------- */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="px-2 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {title}
      </h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function NavItem({
  label,
  icon,
  active,
}: {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
        active
          ? "bg-gray-100 text-gray-900"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      <span className="text-gray-500">{icon}</span>
      {label}
    </div>
  );
}

function TimelineItem({
  label,
  time,
  status,
  active,
}: {
  label: string;
  time?: string;
  status: "active" | "inactive";
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
        active
          ? "bg-gray-100 text-gray-900"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <StatusDot status={status} />
        <span className="truncate">{label}</span>
      </div>

      {time && (
        <span className="text-xs text-gray-400 font-normal shrink-0">
          {time}
        </span>
      )}
    </div>
  );
}

function StatusDot({ status }: { status: "active" | "inactive" }) {
  return (
    <span
      className={`w-2 h-2 rounded-full shrink-0 ${
        status === "active"
          ? "bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.15)]"
          : "bg-gray-300"
      }`}
    />
  );
}

function SidebarUser() {
  const { user } = useUser();
  if (!user) return null;

  const name = user.fullName || user.firstName || "User";
  const email = user.primaryEmailAddress?.emailAddress;

  return (
    <div className="p-4 border-t border-gray-100">
      <div className="flex items-center gap-3 cursor-pointer">
        {user.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={name}
            className="w-10 h-10 rounded-full object-cover border border-gray-200"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 font-semibold">
            {name.charAt(0)}
          </div>
        )}

        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
          {email && <p className="text-xs text-gray-500 truncate">{email}</p>}
        </div>
      </div>
    </div>
  );
}
