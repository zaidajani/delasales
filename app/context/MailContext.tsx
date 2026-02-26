"use client";

import { createContext, useContext, useEffect, useState } from "react";

/* ======================================================
   Types
====================================================== */

export type MailState = {
  subject: string;
  body: string;
  to: string;
  status: "draft" | "sent";
  scheduledAt: string | null; // 🔥 always normalized
};

type MailContextType = MailState & {
  updateMail: (data: Partial<MailState>) => void;
  resetMail: () => void;
};

/* ======================================================
   Context
====================================================== */

const MailContext = createContext<MailContextType | null>(null);

/* ======================================================
   Provider
====================================================== */

export function MailProvider({
  children,
  initialState,
}: {
  children: React.ReactNode;
  initialState: Partial<MailState>; // 🔥 allow partial
}) {
  /* -----------------------------
     Normalize initial state
  ----------------------------- */
  function normalize(state: Partial<MailState>): MailState {
    return {
      subject: state.subject ?? "",
      body: state.body ?? "",
      to: state.to ?? "",
      status: state.status ?? "draft",
      scheduledAt: state.scheduledAt
        ? new Date(state.scheduledAt).toISOString()
        : null,
    };
  }

  const [mail, setMail] = useState<MailState>(normalize(initialState));

  /* 🔥 Sync if initialState changes (important) */
  useEffect(() => {
    setMail(normalize(initialState));
  }, [initialState]);

  /* -----------------------------
     Update mail (partial)
  ----------------------------- */
  function updateMail(data: Partial<MailState>) {
    setMail((prev) => ({
      ...prev,
      ...data,
      scheduledAt:
        data.scheduledAt !== undefined
          ? data.scheduledAt
            ? new Date(data.scheduledAt).toISOString()
            : null
          : prev.scheduledAt,
    }));
  }

  /* -----------------------------
     Reset mail
  ----------------------------- */
  function resetMail() {
    setMail({
      subject: "",
      body: "",
      to: "",
      status: "draft",
      scheduledAt: null,
    });
  }

  return (
    <MailContext.Provider value={{ ...mail, updateMail, resetMail }}>
      {children}
    </MailContext.Provider>
  );
}

/* ======================================================
   Hook
====================================================== */

export function useMail() {
  const ctx = useContext(MailContext);
  if (!ctx) throw new Error("useMail must be used inside <MailProvider />");
  return ctx;
}