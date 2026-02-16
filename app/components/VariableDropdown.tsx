"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { TEMPLATE_VARIABLES } from "@/lib/templateVariables";

export default function VariableDropdown({
  onInsert,
}: {
  onInsert: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
      >
        Variables
        <ChevronDown size={14} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-9 left-0 z-50 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
          {TEMPLATE_VARIABLES.map((v) => (
            <button
              key={v.value}
              onClick={() => {
                onInsert(v.value);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
            >
              <div className="font-medium text-gray-800">{v.label}</div>
              <div className="text-xs text-gray-400">{v.value}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}