"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pencil, ChevronDown, Mail, Trash2 } from "lucide-react";
import Portal from "@/app/components/Portal";

export default function TaskRowClient({
  title,
  completed,
  clerkUserId,
  recordingId,
  actionItemId,
}: {
  title: string;
  completed: boolean;
  clerkUserId: string;
  recordingId: string;
  actionItemId: string;
}) {
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(title);
  const [saving, setSaving] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);

  /* ---------------------------------
     Close menu on outside click
  --------------------------------- */

  async function updateTask(payload: any) {
    setSaving(true);

    await fetch("/api/recordings/action-items", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clerkUserId,
        recordingId,
        actionItemId,
        ...payload,
      }),
    });

    setSaving(false);
    setIsEditing(false);
    router.refresh();
  }

  async function deleteTask() {
    await fetch("/api/recordings/action-items", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clerkUserId,
        recordingId,
        actionItemId,
      }),
    });

    router.refresh();
  }

  function toggleCompleted() {
    updateTask({ completed: !completed });
  }

  function saveEdit() {
    if (!value.trim()) return;
    updateTask({ text: value });
  }

  return (
    <div className="flex items-start gap-4 px-6 py-5 border-b last:border-b-0 border-gray-100">
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={completed}
        onChange={toggleCompleted}
        disabled={saving}
        className="mt-1"
      />

      {/* Text */}
      <div className="flex-1">
        {isEditing ? (
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={saveEdit}
            autoFocus
            className="w-full rounded-md border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
        ) : (
          <p
            className={`text-sm ${
              completed ? "line-through text-gray-400" : "font-medium"
            }`}
          >
            {title}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Edit */}
        <button
          onClick={() => setIsEditing(true)}
          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer"
        >
          <Pencil size={14} />
        </button>

        {/* Menu trigger */}
        <button
          ref={buttonRef}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setMenuPos({
              top: rect.bottom + 8,
              left: Math.min(rect.left, window.innerWidth - 260),
            });
            setMenuOpen(true);
          }}
          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer"
        >
          <ChevronDown size={14} />
        </button>
      </div>

      {/* Dropdown (PORTAL) */}
      {menuOpen && (
        <Portal>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setMenuOpen(false)}
          />

          {/* Menu */}
          <div
            className="fixed z-[9999] w-64 rounded-xl border border-gray-200 bg-white shadow-xl"
            style={{ top: menuPos.top, left: menuPos.left }}
            onClick={(e) => e.stopPropagation()} // 🔑 IMPORTANT
          >
            <div className="h-px bg-gray-100" />

            <button
              onClick={() => {
                deleteTask();
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-3 px-5 py-3 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
            >
              <Trash2 size={18} />
              Delete task
            </button>
          </div>
        </Portal>
      )}
    </div>
  );
}
