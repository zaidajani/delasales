"use client";

import { useEffect, useState } from "react";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";

export default function ConnectGmailCard() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔎 Check connection status on load
  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch("/api/email/gmail-status");
        const data = await res.json();
        setConnected(data.connected);
      } catch {
        setConnected(false);
      }
    }

    checkStatus();
  }, []);

  async function handleDisconnect() {
    setLoading(true);

    await fetch("/api/email/disconnect-gmail", {
      method: "POST",
    });

    setConnected(false);
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex items-center justify-between">
      {/* Left */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-red-50">
          <Mail className="text-red-600" size={22} />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Gmail
          </h3>

          <div className="flex items-center gap-2 mt-1 text-xs">
            {connected === null && (
              <span className="text-gray-400">Checking connection…</span>
            )}

            {connected === true && (
              <>
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span className="text-emerald-700">
                  Connected
                </span>
              </>
            )}

            {connected === false && (
              <>
                <AlertCircle size={14} className="text-gray-400" />
                <span className="text-gray-500">
                  Not connected
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right */}
      <div>
        {connected ? (
          <button
            onClick={handleDisconnect}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800 disabled:opacity-50"
          >
            Disconnect
          </button>
        ) : (
          <a
            href="/api/auth/gmail"
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
          >
            Connect Gmail
          </a>
        )}
      </div>
    </div>
  );
}
