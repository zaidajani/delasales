"use client";

import { useEffect, useState } from "react";
import { Send, Sparkles } from "lucide-react";

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
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

        if (!res.ok) throw new Error(data.error || "Failed to load chat");

        setMessages(data.chat || []);

        // ✅ Only apply body if editor is empty
        if (!emailHtml && data.body) {
          onApply(data.body);
        }
      } catch (err) {
        console.error("Chat load failed", err);
      } finally {
        setLoadingChat(false);
      }
    }

    loadChat();
  }, [isOpen, clerkUserId, recordingId, actionItemId, emailHtml, onApply]);

  /* ===============================
     Send refinement
  =============================== */
  async function handleSend() {
    const instruction = input.trim();
    if (!instruction) return;

    if (!clerkUserId || !recordingId || !actionItemId) {
      alert("Missing identifiers");
      return;
    }

    if (!emailHtml) {
      alert("Email not ready");
      return;
    }

    setLoading(true);
    setError(null);
    setInput("");

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

      if (!res.ok) throw new Error(data.error || "Refinement failed");

      // ✅ Trust server as source of truth
      setMessages(data.chat || []);
      onApply(data.body);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  /* ===============================
     UI
  =============================== */
  return (
    <div className="flex h-full flex-col border-l border-gray-200 bg-gray-50">
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-white">
        <Sparkles size={16} className="text-blue-600" />
        <span className="text-sm font-medium">AI Copilot</span>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loadingChat ? (
          <div className="text-xs text-gray-400">Loading conversation…</div>
        ) : error ? (
          <div className="text-xs text-red-500">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-xs text-gray-400">
            Ask AI to refine your email.
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`text-sm px-3 py-2 rounded-lg max-w-[85%] whitespace-pre-wrap ${
                m.role === "user"
                  ? "ml-auto bg-blue-600 text-white"
                  : "bg-white border"
              }`}
            >
              {m.content}
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t bg-white">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading || loadingChat}
            placeholder="Refine the email…"
            className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />

          <button
            onClick={handleSend}
            disabled={loading || loadingChat}
            className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}