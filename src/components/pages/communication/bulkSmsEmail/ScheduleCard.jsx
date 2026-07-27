import React from "react";
import { Send, AlertTriangle } from "lucide-react";

const MODES = [
  { key: "now",       label: "Send Now"  },
  { key: "schedule",  label: "Schedule"  },
  { key: "recurring", label: "Recurring" },
];

const FREQUENCIES  = ["Daily", "Weekly", "Monthly"];
const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Shared input / select class
const inputCls =
  "w-full min-w-0 border border-gray-200 rounded-xl px-3.5 py-2.5 " +
  "text-[13px] text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200";

export default function ScheduleCard({
  mode, setMode,
  scheduleDate, setScheduleDate,
  scheduleTime, setScheduleTime,
  frequency, setFrequency,
  dayOfWeek, setDayOfWeek,
  recurringTime, setRecurringTime,
  onSend,
  disabled,
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6">

      {/* Header */}
      <h2 className="text-[17px] font-bold text-gray-800 mb-4">Schedule</h2>

      {/* Mode radio buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={`flex items-center gap-2.5 border rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-colors ${
              mode === m.key
                ? "border-blue-200 bg-blue-50 text-blue-600"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {/* Custom radio dot */}
            <span
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                mode === m.key ? "border-blue-500" : "border-gray-300"
              }`}
            >
              {mode === m.key && (
                <span className="w-2 h-2 rounded-full bg-blue-500" />
              )}
            </span>
            {m.label}
          </button>
        ))}
      </div>

      {/* Schedule: date + time */}
      {mode === "schedule" && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <input
            type="date"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            className={inputCls}
          />
          <input
            type="time"
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
            className={inputCls}
          />
        </div>
      )}

      {/* Recurring: frequency + day + time */}
      {mode === "recurring" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-[12.5px] font-semibold text-gray-600 mb-1.5 block">
              Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className={inputCls}
            >
              {FREQUENCIES.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {frequency === "Weekly" && (
            <div>
              <label className="text-[12.5px] font-semibold text-gray-600 mb-1.5 block">
                Day of Week
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                className={inputCls}
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-[12.5px] font-semibold text-gray-600 mb-1.5 block">
              Time
            </label>
            <input
              type="time"
              value={recurringTime}
              onChange={(e) => setRecurringTime(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
      )}

      {/* Quiet hours warning */}
      <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-5">
        <AlertTriangle size={15} className="text-amber-500 shrink-0" />
        <p className="text-[12.5px] text-gray-700">
          Messages are blocked between 9:00 PM – 8:00 AM (IST quiet hours)
        </p>
      </div>

      {/* Send button */}
      <button
        onClick={onSend}
        disabled={disabled}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white
                   text-[13.5px] font-semibold py-3 rounded-xl
                   hover:bg-blue-700 active:scale-[0.98]
                   disabled:opacity-40 disabled:cursor-not-allowed
                   transition-all shadow-sm shadow-blue-200"
      >
        <Send size={15} />
        Send Campaign
      </button>

    </div>
  );
}