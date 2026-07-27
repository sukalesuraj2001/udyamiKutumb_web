import React from "react";
import { Users, Phone, CheckCircle2, XCircle, IndianRupee, Clock, Pause, Play, Pencil, Eye, MoreVertical } from "lucide-react";

const STATUS_CLASS = {
  Draft: "bg-hairline/60 text-muted",
  Scheduled: "bg-steel/10 text-steel",
  Running: "bg-forest/10 text-forest",
  Completed: "bg-ink/5 text-ink",
  Paused: "bg-amber-tint text-amber",
};

export default function IvrCampaignCard({
  campaign,
  onView
}) {
  const {
    name,
    purposeTag,
    languageTag,
    status,
    contacts = 0,
    called = 0,
    connected = 0,
    failed = 0,
    budget = 0,
    scheduledAt,
    progressPct = 0,
  } = campaign;

  return (
    <div className="rounded-2xl border border-hairline bg-white p-5">
      <div className="flex items-start justify-between mb-3">
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_CLASS[status] || STATUS_CLASS.Draft}`}>
          {status}
        </span>
        <button className="text-muted hover:text-ink">
          <MoreVertical size={16} />
        </button>
      </div>

      <h3 className="text-[16px] font-semibold text-ink mb-2">{name}</h3>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {purposeTag && (
          <span className="text-[11px] font-medium border border-hairline text-ink px-2 py-0.5 rounded-full">{purposeTag}</span>
        )}
        {languageTag && (
          <span className="text-[11px] font-medium border border-hairline text-ink px-2 py-0.5 rounded-full">{languageTag}</span>
        )}
      </div>

      <div className="border-t border-hairline pt-3 mb-3">
        <p className="flex items-center gap-1.5 text-[12.5px] text-muted mb-2">
          <Users size={13} /> {contacts} contact{contacts !== 1 ? "s" : ""}
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[12.5px]">
          <p className="flex items-center gap-1.5 text-muted">
            <Phone size={13} /> Called: <span className="text-ink font-medium">{called}</span>
          </p>
          <p className="flex items-center gap-1.5 text-forest">
            <CheckCircle2 size={13} /> Connected: <span className="font-medium">{connected}</span>
          </p>
          <p className="flex items-center gap-1.5 text-brick">
            <XCircle size={13} /> Failed: <span className="font-medium">{failed}</span>
          </p>
          <p className="flex items-center gap-1.5 text-amber">
            <IndianRupee size={13} /> Budget: <span className="font-medium">₹{budget}</span>
          </p>
        </div>
        {scheduledAt && (
          <p className="flex items-center gap-1.5 text-[12px] text-muted mt-2">
            <Clock size={12} /> {scheduledAt}
          </p>
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-[11.5px] text-muted mb-1">
          <span>Progress</span>
          <span>{progressPct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-hairline/60 overflow-hidden">
          <div className="h-full rounded-full bg-steel transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 flex items-center justify-center gap-1.5 border border-hairline text-[12.5px] font-medium text-ink py-2 rounded-lg hover:bg-ink/5 transition-colors">
          <Pause size={14} /> Pause
        </button>
        <button className="flex-1 flex items-center justify-center gap-1.5 border border-hairline text-[12.5px] font-medium text-ink py-2 rounded-lg hover:bg-ink/5 transition-colors">
          <Pencil size={14} /> Edit
        </button>
        <button
          onClick={() => onView(campaign)}
          className="..."
        >
          <Eye size={14} />
          View
        </button>
      </div>
    </div>
  );
}