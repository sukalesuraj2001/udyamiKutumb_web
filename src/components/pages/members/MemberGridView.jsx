import React from "react";
import { MapPin, Phone, Mail, Pencil, Trash2 } from "lucide-react";

const STAGE_CLASS = {
  Idea: "bg-steel/10 text-steel",
  Registered: "bg-forest/10 text-forest",
  Growing: "bg-amber-tint text-amber",
};

export default function MemberGridView({ members, onView, onEdit, onDelete }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {members.map((m) => (
        <button
          key={m.id}
          onClick={() => onView(m)}
          className="text-left rounded-2xl border border-hairline bg-white p-4 hover:border-amber/40 transition-colors"
        >
          <div className="flex items-start justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-9 h-9 rounded-full bg-ink text-white text-[12px] font-semibold flex items-center justify-center shrink-0">
                {m.initials}
              </span>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-ink truncate">{m.name}</p>
                <span className="text-[10.5px] font-mono text-muted">{m.udyamiId}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span
                role="button"
                onClick={(e) => { e.stopPropagation(); onEdit(m); }}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-ink hover:bg-ink/5 transition-colors"
              >
                <Pencil size={13} />
              </span>
              <span
                role="button"
                onClick={(e) => { e.stopPropagation(); onDelete(m); }}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-brick hover:bg-brick/5 transition-colors"
              >
                <Trash2 size={13} />
              </span>
            </div>
          </div>

          <span className={`inline-block text-[10.5px] font-semibold px-2 py-0.5 rounded-full mb-2 ${STAGE_CLASS[m.stage] || "bg-hairline/60 text-muted"}`}>
            {m.stage}
          </span>

          <div className="space-y-1 text-[12.5px] text-muted">
            <p className="flex items-center gap-1.5"><MapPin size={12} className="shrink-0" /> {m.ward}, {m.state}</p>
            <p className="flex items-center gap-1.5"><Phone size={12} className="shrink-0" /> {m.phone}</p>
            <p className="flex items-center gap-1.5 truncate"><Mail size={12} className="shrink-0" /> {m.email}</p>
          </div>

          {m.tag && (
            <span className="inline-block mt-2.5 text-[10.5px] font-medium bg-steel/10 text-steel px-2 py-0.5 rounded-full">
              {m.tag}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}