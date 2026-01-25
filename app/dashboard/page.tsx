"use client";

import { useState } from "react";
// @ts-ignore
import { supabase } from "../../lib/supabaseClient";
import Sidebar from "../components/Sidebar";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Plus } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
);

export default function DashboardPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="h-screen flex bg-gray-50">
      <Sidebar activeItem="dashboard" />

      <main className="flex-1 overflow-y-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Overview of sales activity and productivity
            </p>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="cursor-pointer flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            <Plus size={16} />
            Add new sales call
          </button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <Metric title="Sales calls today" value="12" />
          <Metric title="Total sales calls" value="1,284" />
          <Metric title="Transcribed time" value="312h" />
          <Metric title="Tasks generated" value="428" />
          <Metric title="Emails generated" value="965" />
          <Metric title="Emails today" value="24" />
        </div>

        {/* Chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Sales calls vs Emails generated
          </h2>
          <SalesCallsChart />
        </div>

        {/* Tasks */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-gray-900">
              Current tasks
            </h2>
            <span className="text-xs text-gray-500">Updated just now</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TaskColumn
              title="My tasks"
              tasks={[
                {
                  title: "Follow up with Stark Corp",
                  meta: "Due today",
                  status: "in-progress",
                },
                {
                  title: "Review sales call summary",
                  meta: "Tomorrow",
                  status: "pending",
                },
                {
                  title: "Send proposal email",
                  meta: "Completed",
                  status: "done",
                },
              ]}
            />

            <TaskColumn
              title="Client tasks"
              tasks={[
                {
                  title: "Approve pricing structure",
                  meta: "Client: Sisyphus",
                  status: "pending",
                },
                {
                  title: "Provide onboarding details",
                  meta: "Client: Stark Corp",
                  status: "in-progress",
                },
              ]}
            />
          </div>
        </div>
      </main>

      {open && <AddSalesCallModal onClose={() => setOpen(false)} />}
    </div>
  );
}

/* ---------------- Metric ---------------- */

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-xs font-medium text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

/* ---------------- Chart ---------------- */

function SalesCallsChart() {
  const data = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Sales Calls",
        data: [12, 19, 14, 22, 18, 9, 16],
        borderColor: "#111827",
        backgroundColor: "rgba(17,24,39,0.08)",
        tension: 0.4,
        pointRadius: 3,
      },
      {
        label: "Emails Generated",
        data: [20, 28, 25, 35, 30, 18, 26],
        borderColor: "#10b981",
        backgroundColor: "rgba(16,185,129,0.08)",
        tension: 0.4,
        pointRadius: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    onHover: (_: any, elements: any[]) => {
      document.body.style.cursor = elements.length ? "pointer" : "default";
    },
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          color: "#374151",
        },
        onHover: () => {
          document.body.style.cursor = "pointer";
        },
        onLeave: () => {
          document.body.style.cursor = "default";
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#6b7280" },
      },
      y: {
        grid: { color: "#f3f4f6" },
        ticks: { color: "#6b7280" },
      },
    },
  };

  return (
    <div className="h-[300px] cursor-pointer">
      <Line data={data} options={options} />
    </div>
  );
}

/* ---------------- Tasks ---------------- */

function TaskColumn({
  title,
  tasks,
}: {
  title: string;
  tasks: {
    title: string;
    meta: string;
    status: "pending" | "in-progress" | "done";
  }[];
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
        {title}
      </h3>

      <div className="space-y-2">
        {tasks.map((task, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition cursor-pointer"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">{task.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{task.meta}</p>
            </div>

            <TaskStatus status={task.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

function TaskStatus({
  status,
}: {
  status: "pending" | "in-progress" | "done";
}) {
  const styles = {
    pending: "bg-gray-100 text-gray-600",
    "in-progress": "bg-blue-50 text-blue-600",
    done: "bg-emerald-50 text-emerald-600",
  };

  const labels = {
    pending: "Pending",
    "in-progress": "In progress",
    done: "Done",
  };

  return (
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-full ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

/* ---------------- Modal ---------------- */

function AddSalesCallModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!audioFile || !user) return;

    setLoading(true);

    try {
      // 1. Upload to Supabase
      const fileExt = audioFile.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `recordings/${fileName}`;

      const { error } = await supabase.storage
        .from("delasales_audio")
        .upload(filePath, audioFile);

      if (error) throw error;

      const audioUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/delasales_audio/${filePath}`;

      const res = await fetch("/api/recordings/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkUserId: user.id,
          title,
          audioUrl,
          dateTime: new Date().toISOString(),
          durationMinutes: null,
          participants: [],
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create recording");
      }

      const data = await res.json();

      if (!data?.recording?._id) {
        throw new Error("Recording ID missing");
      }

      router.push(`/dashboard/recordings/${data.recording._id}`);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Add new sales call
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Meeting title"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            required
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Meeting description"
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none"
          />

          <FileUpload file={audioFile} onChange={setAudioFile} />

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-gray-600"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!audioFile || loading}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Create sales call"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FileUpload({
  file,
  onChange,
}: {
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const MAX_SIZE_MB = 40;

  function handleFileSelect(selectedFile: File | null) {
    if (!selectedFile) {
      onChange(null);
      return;
    }

    const sizeInMB = selectedFile.size / (1024 * 1024);

    if (sizeInMB > MAX_SIZE_MB) {
      alert("File size must be under 40 MB");
      return;
    }

    onChange(selectedFile);
  }

  return (
    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 transition bg-gray-50">
      <div className="flex flex-col items-center justify-center text-center px-4">
        <p className="text-sm font-medium text-gray-900">
          {file ? file.name : "Upload audio recording"}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {file
            ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
            : "MP3, M4A, WAV • up to 40MB"}
        </p>
      </div>

      <input
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
      />
    </label>
  );
}
