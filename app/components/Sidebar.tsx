"use client";

import {
  LayoutGrid,
  Users,
  Layers,
  LogOut,
  User,
  Settings,
  FileText,
} from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";

/* ---------------- Types ---------------- */

type Recording = {
  _id: string;
  title: string;
  dateTime: string;
  status: "completed" | "processing" | "failed";
};

/* ---------------- Sidebar ---------------- */

export default function Sidebar() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  /* -------- Fetch recordings (reusable) -------- */

  async function fetchRecordings(clerkUserId: string) {
    try {
      const res = await fetch(`/api/recordings?clerkUserId=${clerkUserId}`);

      if (!res.ok) throw new Error("Failed to fetch recordings");

      const data = await res.json();
      setRecordings(data.recordings || []);
    } catch (err) {
      console.error("Sidebar recordings fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }

  /* -------- Initial load + refresh listener -------- */

  useEffect(() => {
    if (!isLoaded || !user) return;

    const clerkUserId = user.id;

    // Initial fetch
    fetchRecordings(clerkUserId);

    // 🔔 Listen for recording updates
    function handleRefresh() {
      fetchRecordings(clerkUserId);
    }

    window.addEventListener("recordings-updated", handleRefresh);

    return () => {
      window.removeEventListener("recordings-updated", handleRefresh);
    };
  }, [isLoaded, user]);

  /* -------- Close profile menu on outside click -------- */

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* -------- Active state from URL -------- */

  const isDashboardActive = pathname === "/dashboard";
  const isClientsActive = pathname.startsWith("/dashboard/clients");
  const isTemplatesActive = pathname.startsWith("/dashboard/templates");

  const activeRecordingId =
    typeof params?.id === "string" ? params.id : undefined;

  const grouped = groupRecordingsByDate(recordings);

  return (
    <aside className="w-[280px] bg-white border-r border-gray-100 flex flex-col h-full shrink-0">
      {/* Logo */}
      <div
        className="p-5 pb-3 cursor-pointer hover:opacity-90 transition"
        onClick={() => router.push("/dashboard")}
      >
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 bg-gray-900 text-white rounded-xl flex items-center justify-center">
            <Layers size={18} strokeWidth={2.2} />
          </div>
          <span className="font-semibold text-lg text-gray-900">
            De la sales
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        <Section title="General">
          <NavItem
            label="Dashboard"
            icon={<LayoutGrid size={18} />}
            active={isDashboardActive}
            onClick={() => router.push("/dashboard")}
          />
          <NavItem
            label="Calendar"
            icon={<Users size={18} />}
            active={isClientsActive}
            onClick={() => router.push("/dashboard/calendar")}
          />
          <NavItem
            label="Templates"
            icon={<FileText size={18} />}
            active={isTemplatesActive}
            onClick={() => router.push("/dashboard/templates")}
          />
        </Section>

        {loading && (
          <p className="px-2 text-sm text-gray-400">Loading activity…</p>
        )}

        {!loading &&
          Object.entries(grouped).map(([section, items]) => (
            <Section key={section} title={section}>
              {items.map((r) => (
                <TimelineItem
                  key={r._id}
                  label={r.title}
                  time={formatTime(r.dateTime)}
                  status={mapStatus(r.status)}
                  active={activeRecordingId === r._id}
                  onClick={() => router.push(`/dashboard/recordings/${r._id}`)}
                />
              ))}
            </Section>
          ))}

        {!loading && recordings.length === 0 && (
          <p className="px-2 text-sm text-gray-400">No recordings yet</p>
        )}
      </div>

      {/* User + Menu */}
      <div ref={profileRef} className="relative">
        <SidebarUser onClick={() => setProfileOpen((v) => !v)} />

        {profileOpen && (
          <div className="absolute bottom-14 left-4 w-[240px] bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-50">
            <MenuItem icon={<User size={16} />} label="Profile" />
            <MenuItem icon={<Settings size={16} />} label="Settings" />
            <div className="h-px bg-gray-100 my-1" />
            <MenuItem
              icon={<LogOut size={16} />}
              label="Log out"
              danger
              onClick={() => signOut({ redirectUrl: "/" })}
            />
          </div>
        )}
      </div>
    </aside>
  );
}

/* ---------------- Helpers ---------------- */

function groupRecordingsByDate(recordings: Recording[]) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sections: Record<string, Recording[]> = {};

  recordings.forEach((r) => {
    const date = new Date(r.dateTime);
    let key: string;

    if (isSameDay(date, today)) key = "Today";
    else if (isSameDay(date, yesterday)) key = "Yesterday";
    else
      key = date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });

    sections[key] ||= [];
    sections[key].push(r);
  });

  return sections;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapStatus(status: Recording["status"]) {
  return status === "processing" ? "active" : "inactive";
}

/* ---------------- UI Components ---------------- */

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
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
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
  onClick,
}: {
  label: string;
  time?: string;
  status: "active" | "inactive";
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
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

function SidebarUser({ onClick }: { onClick: () => void }) {
  const { user, isLoaded } = useUser();
  if (!isLoaded || !user) return null;

  const name = user.fullName || user.firstName || "User";
  const email = user.primaryEmailAddress?.emailAddress;

  return (
    <div
      onClick={onClick}
      className="p-4 border-t border-gray-100 cursor-pointer hover:bg-gray-50"
    >
      <div className="flex items-center gap-3">
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

function MenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer ${
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {icon}
      {label}
    </div>
  );
}
