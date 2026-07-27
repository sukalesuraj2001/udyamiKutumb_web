import React from "react";
import { MapPin, Phone, Video, Clock, Trash2 } from "lucide-react";

const STATUS_CLASS = {
  Confirmed: "bg-forest/10 text-forest",
  Pending: "bg-amber-tint text-amber",
};

const MODE_ICON = { "In-person": MapPin, "Phone call": Phone, "Video call": Video };

export default function F2FLogItem({ log, onDelete }) {
  const ModeIcon = MODE_ICON[log.mode] || MapPin;

  return (
    <div className="rounded-2xl border border-hairline bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-ink truncate">
            {log.memberA} ↔ {log.memberB}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-[12.5px] text-muted mt-1">
            <span>{log.date}</span>
            <span className="flex items-center gap-1"><ModeIcon size={12} /> {log.mode}</span>
            <span className="flex items-center gap-1"><Clock size={12} /> {log.duration}m</span>
          </div>
          {log.notes && <p className="text-[12.5px] text-muted mt-1.5">{log.notes}</p>}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_CLASS[log.status] || STATUS_CLASS.Pending}`}>
            {log.status}
          </span>
          <button onClick={() => onDelete(log)} className="w-7 h-7 rounded-lg flex items-center justify-center text-brick hover:bg-brick/5 transition-colors">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}