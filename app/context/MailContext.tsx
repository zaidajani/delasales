"use client";

import { createContext, useContext, useState } from "react";

type MailState = {
  subject: string;
  body: string;
  to: string;
  status: "draft" | "sent";
};

type MailContextType = MailState & {
  updateMail: (data: Partial<MailState>) => void;
};

const MailContext = createContext<MailContextType | null>(null);

export function MailProvider({
  children,
  initialState,
}: {
  children: React.ReactNode;
  initialState: MailState;
}) {
  const [mail, setMail] = useState<MailState>(initialState);

  function updateMail(data: Partial<MailState>) {
    setMail((prev) => ({ ...prev, ...data }));
  }

  return (
    <MailContext.Provider value={{ ...mail, updateMail }}>
      {children}
    </MailContext.Provider>
  );
}

export function useMail() {
  const ctx = useContext(MailContext);
  if (!ctx) throw new Error("useMail must be used inside MailProvider");
  return ctx;
}