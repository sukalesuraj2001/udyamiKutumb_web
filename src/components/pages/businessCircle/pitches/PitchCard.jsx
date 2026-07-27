import React from "react";
import { Clock, Trash2 } from "lucide-react";

export default function PitchCard({ pitch, onDelete }) {
  return (
    <div className="rounded-2xl border border-hairline bg-white p-5">
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="text-[14.5px] font-semibold text-ink">{pitch.name}</p>
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex items-center gap-1 text-[11.5px] text-muted">
            <Clock size={12} /> {pitch.date}
          </span>
          <button
            onClick={() => onDelete(pitch)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-brick hover:bg-brick/5 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <p className="text-[13.5px] text-ink leading-relaxed mb-2.5">{pitch.pitch}</p>

      <p className="text-[13px] text-steel">
        <span className="font-medium">Asking for:</span> {pitch.askingFor}
      </p>
    </div>
  );
}