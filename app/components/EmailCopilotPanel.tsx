"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Send } from "lucide-react";

/* ===============================
   Types
=============================== */
type ChatMessage = {
  id: string;
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
  disabled?: boolean;
};

/* ===============================
   Typing Indicator
=============================== */
function TypingDots() {
  return (
    <div className="flex gap-1 px-3 py-2 bg-gray-100 rounded-2xl w-fit">
      <span className="dot" />
      <span className="dot" />
      <span className="dot" />
      <style jsx>{`
        .dot {
          width: 6px;
          height: 6px;
          background: #9ca3af;
          border-radius: 9999px;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        .dot:nth-child(1) {
          animation-delay: -0.32s;
        }
        .dot:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

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
  disabled = false,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const latestEmailRef = useRef(emailHtml);

  /* 🔥 Always keep latest email */
  useEffect(() => {
    latestEmailRef.current = emailHtml;
  }, [emailHtml]);

  /* ===============================
     Auto scroll
  =============================== */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  /* ===============================
     Load chat
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

        setMessages(
          (data.chat || []).map((m: any) => ({
            id: crypto.randomUUID(),
            role: m.role,
            content: m.content,
          })),
        );
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
    if (!instruction || isTyping) return;

    setInput("");

    /* Optimistic message */
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: instruction,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const res = await fetch("/api/email/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkUserId,
          recordingId,
          actionItemId,
          instruction,
          emailHtml: latestEmailRef.current, // 🔥 always latest
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const assistantReply =
        data.chat?.at(-1)?.content || "Email updated based on your request.";

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: assistantReply,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data.body) onApply(data.body);
    } catch (err) {
      console.error("Refine error:", err);

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsTyping(false);
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

        {messages.map((m) => (
          <div
            key={m.id}
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

        {isTyping && (
          <div className="flex pr-8">
            <TypingDots />
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* INPUT */}
      <div className="p-4 pt-0">
        <div
          className={`relative bg-gray-100 rounded-full ${
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "focus-within:ring-1 focus-within:ring-gray-300"
          }`}
        >
          {" "}
          <input
            disabled={disabled}
            placeholder={disabled ? "Email already sent" : "Refine the email…"}
            className="w-full bg-transparent px-4 py-3 pr-12 text-sm outline-none disabled:cursor-not-allowed"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            disabled={disabled}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow disabled:cursor-not-allowed"
            onClick={handleSend}
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
