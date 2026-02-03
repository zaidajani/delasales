"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Pencil, ChevronDown, Mail, Trash2 } from "lucide-react";

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

  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(title);
  const [saving, setSaving] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  /* ---------------------------------
     Close menu on outside click
  --------------------------------- */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------------------------------
     API helpers
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
    setMenuOpen(false);
    router.refresh();
  }

  async function deleteTask() {
    if (!confirm("Delete this task?")) return;

    setSaving(true);

    await fetch("/api/recordings/action-items", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clerkUserId,
        recordingId,
        actionItemId,
      }),
    });

    setSaving(false);
    setMenuOpen(false);
    router.refresh();
  }

  function toggleCompleted() {
    updateTask({ completed: !completed });
  }

  function saveEdit() {
    if (!value.trim()) return;
    updateTask({ text: value });
  }

  function cancelEdit() {
    setValue(title);
    setIsEditing(false);
  }

  /* ---------------------------------
     Render
  --------------------------------- */
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

      {/* Content */}
      <div className="flex-1">
        {isEditing ? (
          <>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />

            <div className="mt-2 flex gap-3 text-xs">
              <button
                onClick={saveEdit}
                className="text-blue-600 hover:underline"
              >
                Save
              </button>
              <button
                onClick={cancelEdit}
                className="text-gray-400 hover:underline"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <p
              className={`text-sm ${
                completed ? "line-through text-gray-400" : "font-medium"
              }`}
            >
              {title}
            </p>

            {/* Actions */}
            <div ref={menuRef} className="relative flex items-center gap-1">
              {/* Edit */}
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer"
                aria-label="Edit task"
              >
                <Pencil size={14} />
              </button>

              {/* Dropdown trigger */}
              <button
                ref={triggerRef}
                onClick={() => {
                  if (!triggerRef.current) return;

                  const rect = triggerRef.current.getBoundingClientRect();
                  const spaceBelow = window.innerHeight - rect.bottom;
                  const spaceAbove = rect.top;

                  // 160px ≈ dropdown height
                  setOpenUp(spaceBelow < 160 && spaceAbove > spaceBelow);
                  setMenuOpen((v) => !v);
                }}
                className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer"
                aria-label="More options"
              >
                <ChevronDown size={14} />
              </button>

              {/* Dropdown menu */}
              {menuOpen && (
                <div
                  ref={menuRef}
                  className={`
      absolute right-0 z-50 w-56 rounded-xl
      border border-gray-200 bg-white shadow-xl
      ${openUp ? "bottom-full mb-2" : "top-full mt-2"}
    `}
                >
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      // TODO: generate follow-up email
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-800 hover:bg-gray-50 cursor-pointer"
                  >
                    <Mail size={16} />
                    <span>Generate follow-up email</span>
                  </button>

                  <button
                    onClick={deleteTask}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 size={16} />
                    <span>Delete task</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
