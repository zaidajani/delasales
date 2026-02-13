"use client";

import { useEffect, useState } from "react";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";

export default function ConnectGmailCard() {
  const [gmailConnected, setGmailConnected] = useState<boolean | null>(null);
  const [outlookConnected, setOutlookConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch("/api/email/gmail-status");
        const data = await res.json();

        setGmailConnected(data.gmailConnected);
        setOutlookConnected(data.outlookConnected);
      } catch {
        setGmailConnected(false);
      }
    }

    checkStatus();
  }, []);

  async function handleDisconnect() {
    setLoading(true);

    await fetch("/api/email/disconnect-gmail", {
      method: "POST",
    });

    setGmailConnected(false);
    setLoading(false);
  }

  const blockedByOutlook = outlookConnected && !gmailConnected;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex items-center justify-between">
      {/* Left */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-red-50">
          <Mail className="text-red-600" size={22} />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900">Gmail</h3>

          <div className="flex items-center gap-2 mt-1 text-xs">
            {gmailConnected === null && (
              <span className="text-gray-400">Checking connection…</span>
            )}

            {gmailConnected === true && (
              <>
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span className="text-emerald-700">Connected</span>
              </>
            )}

            {blockedByOutlook && (
              <>
                <AlertCircle size={14} className="text-amber-500" />
                <span className="text-amber-600">
                  Disconnect Outlook first
                </span>
              </>
            )}

            {gmailConnected === false && !blockedByOutlook && (
              <>
                <AlertCircle size={14} className="text-gray-400" />
                <span className="text-gray-500">Not connected</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right */}
      <div>
        {gmailConnected ? (
          <button
            onClick={handleDisconnect}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800 disabled:opacity-50"
          >
            Disconnect
          </button>
        ) : (
          <a
            href={blockedByOutlook ? "#" : "/api/auth/gmail"}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${
              blockedByOutlook
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Connect Gmail
          </a>
        )}
      </div>
    </div>
  );
}