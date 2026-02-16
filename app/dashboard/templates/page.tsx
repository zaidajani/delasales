"use client";

import { useEffect, useState } from "react";
import TipTapEditor from "@/app/components/TipTapEditor";
import { Save } from "lucide-react";

/* ===============================
   Types
=============================== */
type Template = {
  _id: string;
  name: string;
  subject: string;
  body: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [active, setActive] = useState<Template | null>(null);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);

  /* ===============================
     Helpers
  =============================== */

  function sortTemplates(list: Template[]) {
    return [...list].sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt || 0).getTime() -
        new Date(a.updatedAt || a.createdAt || 0).getTime()
    );
  }

  /* ===============================
     Load templates
  =============================== */
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/templates");

        if (!res.ok) {
          console.error("Failed to load templates");
          return;
        }

        const data = await res.json();
        const sorted = sortTemplates(data.templates || []);

        setTemplates(sorted);
        setActive(sorted[0] || null);
      } catch (err) {
        console.error("Load templates error:", err);
      }
    }

    load();
  }, []);

  /* ===============================
     Create template
  =============================== */
  async function handleCreateTemplate() {
    try {
      setCreating(true);

      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "New Template" }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Create template error:", text);
        alert("Failed to create template");
        return;
      }

      const data = await res.json();
      const newTemplate: Template = data.template;

      const updated = sortTemplates([newTemplate, ...templates]);

      setTemplates(updated);
      setActive(newTemplate);
    } catch (err) {
      console.error("Create template failed:", err);
    } finally {
      setCreating(false);
    }
  }

  /* ===============================
     Update active template fields
  =============================== */
  function updateActive(field: keyof Template, value: string) {
    if (!active) return;
    setActive({ ...active, [field]: value });
  }

  /* ===============================
     Save template
  =============================== */
  async function handleSave() {
    if (!active) return;

    try {
      setSaving(true);

      const res = await fetch(`/api/templates/${active._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(active),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Save template error:", text);
        alert("Failed to save template");
        return;
      }

      const data = await res.json();
      const updatedTemplate: Template = data.template;

      const updatedList = sortTemplates(
        templates.map((t) =>
          t._id === updatedTemplate._id ? updatedTemplate : t
        )
      );

      setTemplates(updatedList);
      setActive(updatedTemplate);
    } catch (err) {
      console.error("Save template failed:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-full bg-white">
      {/* =================================
          LEFT — Template List
      ================================= */}
      <div className="w-80 flex-none flex flex-col bg-white border-r border-gray-200">
        {/* Header */}
        <div className="px-6 pt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Email Templates
          </h2>

          {/* New Template Button */}
          <button
            onClick={handleCreateTemplate}
            disabled={creating}
            className="w-full p-4 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50/40 transition flex items-center gap-3 text-left disabled:opacity-60"
          >
            <span className="text-emerald-600 text-lg leading-none">+</span>
            <div>
              <div className="text-sm font-medium text-gray-900">
                {creating ? "Creating…" : "New template"}
              </div>
              <div className="text-xs text-gray-500">
                Create a reusable email template
              </div>
            </div>
          </button>
        </div>

        {/* Spacer */}
        <div className="h-10" />

        {/* Template List */}
        <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-3">
          {templates.map((t) => (
            <div
              key={t._id}
              onClick={() => setActive(t)}
              className={`p-4 rounded-xl cursor-pointer transition border ${
                active?._id === t._id
                  ? "border-blue-200 shadow-sm bg-blue-50/40"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="text-sm font-medium text-gray-900">
                {t.name || "Untitled"}
              </div>
              <div className="text-xs text-gray-500 mt-1 truncate">
                {t.subject || "No subject"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =================================
          RIGHT — Template Editor
      ================================= */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {active ? (
          <>
            {/* Breadcrumb */}
            <div className="px-10 pt-8 pb-3 border-b border-gray-100">
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <span>Email Templates</span>
                <span>›</span>
                <span className="text-gray-800">{active.name}</span>
              </div>
            </div>

            {/* Formatting Bar */}
            <div className="flex items-center justify-between px-10 py-3 bg-white/90 backdrop-blur sticky top-0 z-20 border-b border-gray-100">
              <div className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                Formatting
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition disabled:opacity-60"
              >
                <Save size={16} />
                {saving ? "Saving…" : "Save"}
              </button>
            </div>

            {/* Title + Subject */}
            <div className="px-10 pt-6 pb-4">
              <input
                value={active.name}
                onChange={(e) => updateActive("name", e.target.value)}
                className="text-3xl font-semibold text-gray-900 outline-none w-full"
                placeholder="Template name"
              />

              <input
                value={active.subject}
                onChange={(e) => updateActive("subject", e.target.value)}
                className="mt-2 text-sm text-gray-500 outline-none w-full"
                placeholder="Email subject"
              />
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-y-auto px-10 pb-12">
              <div className="max-w-3xl">
                <TipTapEditor
                  content={active.body}
                  onChange={(val) => updateActive("body", val)}
                  variant="flat"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a template
          </div>
        )}
      </div>
    </div>
  );
}