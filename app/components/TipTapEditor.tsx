"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
} from "lucide-react";
import VariableDropdown from "@/app/components/VariableDropdown";

/* ---------------- Types ---------------- */

type TipTapEditorProps = {
  content: string;
  onChange: (html: string) => void;
  variant?: "default" | "flat";
};

/* ---------------- Component ---------------- */

export default function TipTapEditor({
  content,
  onChange,
  variant = "default",
}: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder: "Start editing…",
      }),
    ],
    content: content || "<p></p>",
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  /* ======================================================
     🔥 CRITICAL FIX: Sync editor when template changes
     ====================================================== */
  useEffect(() => {
    if (!editor) return;

    const current = editor.getHTML();
    if (content !== current) {
      editor.commands.setContent(content || "<p></p>");
    }
  }, [content, editor]);

  if (!editor) return null;

  const isFlat = variant === "flat";

  return (
    <div
      className={
        isFlat
          ? "flex h-full flex-col bg-white"
          : "flex h-full flex-col rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
      }
    >
      {/* 🔥 Sticky Toolbar */}
      <div
        className={`sticky top-0 z-20 flex flex-wrap items-center gap-1 px-3 py-2 border-b
        ${isFlat ? "bg-white" : "bg-gray-50"}
        backdrop-blur supports-[backdrop-filter]:bg-white/80`}
      >
        {/* Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
        >
          <Bold size={14} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
        >
          <Italic size={14} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
        >
          <UnderlineIcon size={14} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          active={editor.isActive("highlight")}
        >
          <Highlighter size={14} />
        </ToolbarButton>

        {/* Variable dropdown */}
        <VariableDropdown
          onInsert={(value) =>
            editor.chain().focus().insertContent(value).run()
          }
        />

        <Divider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={14} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={14} />
        </ToolbarButton>

        <Divider />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft size={14} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter size={14} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight size={14} />
        </ToolbarButton>
      </div>

      {/* ✨ Scrollable Editor */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent
          editor={editor}
          className="min-h-full px-4 py-3 focus:outline-none"
        />
      </div>
    </div>
  );
}

/* ---------------- Toolbar UI ---------------- */

function ToolbarButton({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md p-2 transition ${
        active
          ? "bg-blue-100 text-blue-700"
          : "text-gray-600 hover:bg-gray-200"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-gray-300" />;
}