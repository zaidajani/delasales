"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

export default function AddClientTask({
  clerkUserId,
  recordingId,
}: {
  clerkUserId: string;
  recordingId: string;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!text.trim()) return;

    try {
      setLoading(true);

      const res = await fetch("/api/recordings/add-action-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkUserId,
          recordingId,
          text,
          category: "client",
        }),
      });

      if (!res.ok) throw new Error("Failed");

      setText("");
      setOpen(false);

      // 🔄 simplest approach for now
      window.location.reload();
    } catch (err) {
      alert("Failed to add task");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <Plus size={16} />
        Add client action item
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleAdd();
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="Describe client task…"
        className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
      />

      <button
        onClick={handleAdd}
        disabled={loading}
        className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
      >
        Add
      </button>
    </div>
  );
}
