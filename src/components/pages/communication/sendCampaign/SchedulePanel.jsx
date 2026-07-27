import React from "react";
import { Clock, Send, CalendarDays, RefreshCw, AlertTriangle, Info } from "lucide-react";

const MODES = [
  { key: "now",       label: "Send Now",  icon: Send        },
  { key: "scheduled", label: "Schedule",  icon: CalendarDays },
  { key: "recurring", label: "Recurring", icon: RefreshCw   },
];

const REPEAT_OPTIONS = [
  { value: "daily",   label: "Daily"   },
  { value: "weekly",  label: "Weekly"  },
  { value: "monthly", label: "Monthly" },
];

const inputCls =
  "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13.5px] " +
  "text-gray-800 placeholder:text-gray-400 bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-blue-200";

// DND hours: 9 PM – 9 AM (demo)
const DND_START = 21; // 9 PM
const DND_END   = 9;  // 9 AM

function isDndHour(hourStr) {
  if (!hourStr) return false;
  const h = parseInt(hourStr.split(":")[0], 10);
  return h >= DND_START || h < DND_END;
}

export default function SchedulePanel({ schedule, onChange }) {
  const { mode, date, time, repeatFrequency, repeatUntil } = schedule;

  const showDndWarning = (mode === "scheduled" || mode === "recurring") && isDndHour(time);

  // Next safe send window (demo calculation)
  const nextSafeTime =
    showDndWarning ? "Tomorrow, 9:00 AM" : null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <Clock size={16} className="text-blue-600" />
        <h2 className="text-[15px] font-bold text-gray-800">Schedule</h2>
      </div>

      {/* Mode selector */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => onChange("mode", m.key)}
            className={`flex items-center justify-center gap-2 text-[13px] font-semibold
                        py-2.5 rounded-xl border transition-colors ${
              mode === m.key
                ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <m.icon size={13} />
            {m.label}
          </button>
        ))}
      </div>

      {/* Send Now info */}
      {/* {mode === "now" && (
        <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          <Info size={15} className="text-blue-500 mt-0.5 shrink-0" />
          <p className="text-[13px] text-blue-700 leading-relaxed">
            Campaign will be queued immediately and begin delivery within the next few minutes.
            Ensure your audience is resolved and message is finalised before sending.
          </p>
        </div>
      )} */}

      {/* Scheduled */}
      {mode === "scheduled" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12.5px] font-semibold text-gray-600 mb-1 block">Date</label>
              <input
                type="date"
                value={date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => onChange("date", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-[12.5px] font-semibold text-gray-600 mb-1 block">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => onChange("time", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
          {showDndWarning && <DndWarning nextSafeTime={nextSafeTime} />}
        </div>
      )}

      {/* Recurring */}
      {mode === "recurring" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12.5px] font-semibold text-gray-600 mb-1 block">Start Date</label>
              <input
                type="date"
                value={date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => onChange("date", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-[12.5px] font-semibold text-gray-600 mb-1 block">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => onChange("time", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12.5px] font-semibold text-gray-600 mb-1 block">Repeat</label>
              <select
                value={repeatFrequency}
                onChange={(e) => onChange("repeatFrequency", e.target.value)}
                className={inputCls}
              >
                {REPEAT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[12.5px] font-semibold text-gray-600 mb-1 block">Repeat Until</label>
              <input
                type="date"
                value={repeatUntil}
                min={date || new Date().toISOString().split("T")[0]}
                onChange={(e) => onChange("repeatUntil", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {showDndWarning && <DndWarning nextSafeTime={nextSafeTime} />}

          <div className="flex items-start gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <Info size={14} className="text-gray-400 mt-0.5 shrink-0" />
            <p className="text-[12.5px] text-gray-500 leading-relaxed">
              Each recurring run uses a fresh audience snapshot. Members who opt out between runs
              will be automatically excluded.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function DndWarning({ nextSafeTime }) {
  return (
    <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
      <AlertTriangle size={15} className="text-amber-500 mt-0.5 shrink-0" />
      <div>
        <p className="text-[13px] font-semibold text-amber-700">DND Hours Warning</p>
        <p className="text-[12.5px] text-amber-600 mt-0.5">
          Selected time falls within DND hours (9 PM – 9 AM).
          Members registered under DND will not receive messages during this window.
          {nextSafeTime && (
            <> Next available safe time: <span className="font-semibold">{nextSafeTime}</span>.</>
          )}
        </p>
      </div>
    </div>
  );
}
