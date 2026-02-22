"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { Bold, Italic, Underline as UnderlineIcon } from "lucide-react";
import { useEffect } from "react";

export default function TipTapMail({
  content,
  onChange,
}: {
  content: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-gray max-w-none focus:outline-none text-[15px] leading-7",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // ✅ Sync editor when parent content changes (AI updates, etc.)
  useEffect(() => {
    if (!editor) return;

    const currentHTML = editor.getHTML();
    if (currentHTML !== content) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2 text-gray-500">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-md hover:bg-gray-100 ${
            editor.isActive("bold") ? "text-gray-900" : ""
          }`}
        >
          <Bold size={16} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-md hover:bg-gray-100 ${
            editor.isActive("italic") ? "text-gray-900" : ""
          }`}
        >
          <Italic size={16} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded-md hover:bg-gray-100 ${
            editor.isActive("underline") ? "text-gray-900" : ""
          }`}
        >
          <UnderlineIcon size={16} />
        </button>
      </div>

      {/* Word-style page */}
      <div className="bg-white border border-gray-200 rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.08)] px-10 py-12 min-h-[700px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}