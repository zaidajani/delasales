"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Mail, Clock, Mic, CalendarCheck, MoreVertical } from "lucide-react";

type ScheduledEmail = {
  subject: string;
  to: string;
  scheduledAt: string;
  recordingTitle: string;
  recordingId: string;
  actionItemId: string;
};

const pillColors = [
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-purple-100 text-purple-700",
  "bg-yellow-100 text-yellow-800",
  "bg-pink-100 text-pink-700",
];

export default function CalendarPage() {
  const [emails, setEmails] = useState<ScheduledEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<ScheduledEmail | null>(
    null,
  );
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const today = dayjs();

  /* ================= FETCH ================= */
  useEffect(() => {
    async function load() {
      const res = await fetch("/api/email/scheduled");
      const data = await res.json();
      setEmails(data.emails || []);
    }
    load();
  }, []);

  /* ================= CANCEL ================= */
  async function cancelSchedule(email: ScheduledEmail) {
    await fetch("/api/email/cancel-schedule", {
      method: "POST",
      body: JSON.stringify({
        recordingId: email.recordingId,
        actionItemId: email.actionItemId,
      }),
    });

    setEmails((prev) =>
      prev.filter(
        (e) =>
          !(
            e.recordingId === email.recordingId &&
            e.actionItemId === email.actionItemId
          ),
      ),
    );

    setSelectedEmail(null);
  }

  /* ================= CALENDAR ================= */
  const startOfMonth = selectedDate.startOf("month");
  const startDay = startOfMonth.day();
  const daysInMonth = selectedDate.daysInMonth();

  const days = Array.from({ length: startDay + daysInMonth }, (_, i) =>
    i < startDay ? null : startOfMonth.add(i - startDay, "day"),
  );

  function emailsForDate(date: dayjs.Dayjs | null) {
    if (!date) return [];
    return emails.filter((e) => dayjs(e.scheduledAt).isSame(date, "day"));
  }

  /* ================= UI ================= */
  return (
    <div className="p-8">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-2xl font-semibold tracking-tight">
          {selectedDate.format("MMMM YYYY")}
        </h2>

        <div className="flex gap-2 items-center">
          {/* prev */}
          <button
            onClick={() => setSelectedDate(selectedDate.subtract(1, "month"))}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition text-sm"
          >
            ‹
          </button>

          {/* today */}
          <button
            onClick={() => setSelectedDate(today)}
            className="px-3 h-8 rounded-lg bg-green-100 text-green-700 text-sm font-medium hover:bg-green-200 transition"
          >
            Today
          </button>

          {/* next */}
          <button
            onClick={() => setSelectedDate(selectedDate.add(1, "month"))}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition text-sm"
          >
            ›
          </button>
        </div>
      </div>

      {/* WEEK LABELS */}
      <div className="grid grid-cols-7 text-xs text-gray-400 mb-3 px-1">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="text-center font-medium">
            {d}
          </div>
        ))}
      </div>

      {/* CALENDAR WRAPPER — PERFECT RADIUS */}
      <div className="rounded-3xl overflow-hidden bg-white shadow-sm border border-gray-200">
        <div className="grid grid-cols-7 divide-x divide-y divide-gray-200">
          {days.map((day, idx) => {
            const dayEmails = emailsForDate(day);
            const isToday = day && day.isSame(today, "day");
            const isSelected = day && day.isSame(selectedDate, "day");

            return (
              <div
                key={idx}
                onClick={() => day && setSelectedDate(day)}
                className={`min-h-[120px] p-3 cursor-pointer
                  ${isSelected ? "bg-indigo-50" : "bg-white"}
                  hover:bg-gray-50 transition`}
              >
                {/* DAY NUMBER */}
                {day && (
                  <div
                    className={`text-sm font-medium mb-2 w-8 h-8 flex items-center justify-center rounded-full
                      ${
                        isToday
                          ? "bg-indigo-600 text-white shadow"
                          : "text-gray-700"
                      }`}
                  >
                    {day.date()}
                  </div>
                )}

                {/* EVENTS */}
                <div className="space-y-1">
                  {dayEmails.slice(0, 4).map((email, i) => (
                    <div
                      key={email.actionItemId}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEmail(email);
                      }}
                      className={`text-[11px] px-2 py-1 rounded-md truncate cursor-pointer
                        ${pillColors[i % pillColors.length]}
                        hover:opacity-80`}
                    >
                      {email.subject}
                    </div>
                  ))}

                  {dayEmails.length > 4 && (
                    <div className="text-[10px] text-gray-400">
                      +{dayEmails.length - 4} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL */}
      {/* ================= MODAL ================= */}
      {selectedEmail && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            {/* ===== Header ===== */}
            <div className="bg-gradient-to-br from-blue-50 to-teal-50 p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="bg-teal-100 p-2 rounded-xl text-teal-600">
                  <CalendarCheck size={20} />
                </div>

                <button
                  onClick={() => setSelectedEmail(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <MoreVertical size={18} />
                </button>
              </div>

              <h2 className="text-lg font-semibold leading-snug text-gray-900">
                {selectedEmail.subject}
              </h2>
            </div>

            {/* ===== Content ===== */}
            <div className="p-6 space-y-5">
              {/* Recipient */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    Recipient
                  </p>
                  <p className="text-gray-800 text-sm font-medium">
                    {selectedEmail.to}
                  </p>
                </div>
              </div>

              {/* Scheduled */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    Scheduled for
                  </p>
                  <span className="inline-block mt-1 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                    {dayjs(selectedEmail.scheduledAt).format(
                      "DD MMM YYYY, HH:mm",
                    )}
                  </span>
                </div>
              </div>

              {/* Recording */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                  <Mic size={16} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    Recording
                  </p>

                  <a
                    href={`/dashboard/recordings/${selectedEmail.recordingId}`}
                    className="inline-flex items-center gap-2 mt-1 bg-teal-100 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full hover:bg-teal-200 transition"
                  >
                    {selectedEmail.recordingTitle}
                  </a>
                </div>
              </div>
            </div>

            {/* ===== Actions ===== */}
            <div className="px-6 pb-6 flex items-center gap-3">
              <button
                onClick={() => cancelSchedule(selectedEmail)}
                className="flex-1 px-4 py-2 border border-rose-200 text-rose-600 text-sm font-semibold rounded-xl hover:bg-rose-50 transition"
              >
                Cancel
              </button>

              <button
                onClick={() => setSelectedEmail(null)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-xl hover:bg-blue-600 transition shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
