"use client";

import { useEffect, useState } from "react";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";

export default function ConnectOutlookCard() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [gmailConnected, setGmailConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  /* ---------------------------------
     Check connection status on load
  --------------------------------- */
  useEffect(() => {
    async function checkStatus() {
      try {
        const [outlookRes, gmailRes] = await Promise.all([
          fetch("/api/email/outlook-status"),
          fetch("/api/email/gmail-status"),
        ]);

        const outlookData = await outlookRes.json();
        const gmailData = await gmailRes.json();

        setConnected(outlookData.connected);
        setGmailConnected(gmailData.connected);
      } catch {
        setConnected(false);
        setGmailConnected(false);
      }
    }

    checkStatus();
  }, []);

  /* ---------------------------------
     Disconnect Outlook
  --------------------------------- */
  async function handleDisconnect() {
    setLoading(true);

    await fetch("/api/email/disconnect-outlook", {
      method: "POST",
    });

    setConnected(false);
    setLoading(false);
  }

  /* ---------------------------------
     Prevent dual provider connection
  --------------------------------- */
  const blockedByGmail = gmailConnected && !connected;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex items-center justify-between">
      {/* Left */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-blue-50">
          <Mail className="text-blue-600" size={22} />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Outlook
          </h3>

          <div className="flex items-center gap-2 mt-1 text-xs">
            {connected === null && (
              <span className="text-gray-400">Checking connection…</span>
            )}

            {connected === true && (
              <>
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span className="text-emerald-700">Connected</span>
              </>
            )}

            {connected === false && (
              <>
                <AlertCircle size={14} className="text-gray-400" />
                <span className="text-gray-500">Not connected</span>
              </>
            )}
          </div>

          {/* Provider conflict message */}
          {blockedByGmail && (
            <p className="text-xs text-orange-600 mt-1">
              Disconnect Gmail to use Outlook.
            </p>
          )}
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
            href={blockedByGmail ? "#" : "/api/auth/outlook"}
            onClick={(e) => blockedByGmail && e.preventDefault()}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${
              blockedByGmail
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Connect Outlook
          </a>
        )}
      </div>
    </div>
  );
}