"use client";

import { useEffect, useState } from "react";
import { Sparkles, Send } from "lucide-react";

/* ===============================
   Types
=============================== */
type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type Props = {
  clerkUserId: string;
  recordingId: string;
  actionItemId: string;
  emailHtml: string;
  onApply: (html: string) => void;
  isOpen: boolean;
};

/* ===============================
   Component
=============================== */
export default function EmailCopilotPanel({
  clerkUserId,
  recordingId,
  actionItemId,
  emailHtml,
  onApply,
  isOpen,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ===============================
     Load chat when modal opens
  =============================== */
  useEffect(() => {
    if (!isOpen) return;

    async function loadChat() {
      try {
        setLoadingChat(true);

        const res = await fetch("/api/email/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clerkUserId,
            recordingId,
            actionItemId,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setMessages(data.chat || []);
      } catch (err) {
        console.error("Chat load failed", err);
      } finally {
        setLoadingChat(false);
      }
    }

    loadChat();
  }, [isOpen, clerkUserId, recordingId, actionItemId]);

  /* ===============================
     Send instruction
  =============================== */
  async function handleSend() {
    const instruction = input.trim();
    if (!instruction) return;

    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/email/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkUserId,
          recordingId,
          actionItemId,
          instruction,
          emailHtml,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessages(data.chat || []);
      onApply(data.body);
    } catch (err) {
      console.error("Refine error:", err);
    } finally {
      setLoading(false);
    }
  }

  /* ===============================
     UI
  =============================== */
  return (
    <div className="flex h-full flex-col bg-white">
      {/* HEADER */}
      <div className="h-14 px-4 border-b border-gray-100 flex items-center">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-indigo-500" />
          <span className="text-sm font-semibold text-gray-900">
            AI Copilot
          </span>
        </div>
      </div>

      {/* CHAT */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Empty state */}
        {messages.length === 0 && !loadingChat && (
          <div className="flex flex-col items-center justify-center pt-10 opacity-60">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white mb-3 shadow-sm">
              <Sparkles size={18} />
            </div>
            <h3 className="text-sm font-medium text-gray-900">
              AI Assistant Active
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Ask me to refine or improve your email.
            </p>
          </div>
        )}

        {/* Messages */}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.role === "user" ? "justify-end pl-8" : "pr-8"
            }`}
          >
            <div
              className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                m.role === "user"
                  ? "bg-blue-600 text-white rounded-tr-sm"
                  : "bg-gray-100 text-gray-800 rounded-tl-sm"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div className="p-4 pt-0">
        <div className="relative bg-gray-100 rounded-full focus-within:ring-1 focus-within:ring-gray-300">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Refine the email…"
            className="w-full bg-transparent px-4 py-3 pr-12 text-sm outline-none"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
          />

          <button
            onClick={handleSend}
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow hover:bg-gray-50"
          >
            <Send size={16} className="text-gray-600" />
          </button>
        </div>

        <p className="text-[10px] text-gray-400 text-center mt-2">
          AI can make mistakes. Verify important details.
        </p>
      </div>
    </div>
  );
}