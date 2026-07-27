import React from "react";
import { Eye, Pencil, Trash2, Ban } from "lucide-react";

const STAGE_CLASS = {
  Idea: "bg-steel/10 text-steel",
  Registered: "bg-forest/10 text-forest",
  Growing: "bg-amber-tint text-amber",
};

export default function MemberListView({ members, onView, onEdit, onDelete, onSuspend }) {
  return (
    <div className="rounded-2xl border border-hairline bg-white overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-hairline">
            {["Member", "Udyami ID", "Business", "Member Type", "Stage", "Ward / Hobli", "Tags", "Status", "Actions"].map((h) => (
              <th key={h} className="px-5 py-3 text-[10.5px] font-semibold tracking-[0.1em] uppercase text-muted whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {members.map((m) => {
            const isSuspended = m.status === "Suspended";
            return (
              <tr
                key={m.id}
                className={`border-b border-hairline last:border-0 ${
                  isSuspended ? "bg-brick/[0.02]" : "hover:bg-ink/[0.02]"
                }`}
              >
                {/* Member */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="relative w-8 h-8 rounded-full bg-ink text-white text-[11px] font-semibold flex items-center justify-center shrink-0">
                      {m.initials}
                      {/* Status dot — red when suspended, green otherwise */}
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                          isSuspended ? "bg-brick" : "bg-forest"
                        }`}
                      />
                    </span>
                    <div className="min-w-0">
                      <p className={`text-[13.5px] font-medium truncate ${isSuspended ? "text-muted line-through decoration-brick/50" : "text-ink"}`}>
                        {m.name}
                      </p>
                      <p className="text-[11.5px] text-muted truncate">{m.phone}</p>
                    </div>
                  </div>
                </td>

                {/* Udyami ID */}
                <td className="px-5 py-3.5">
                  <span className="text-[11px] font-mono border border-hairline text-muted px-2 py-1 rounded-lg">{m.udyamiId}</span>
                </td>

                {/* Business */}
                <td className="px-5 py-3.5 text-[13px] text-muted whitespace-nowrap">{m.business || "—"}</td>

                {/* Member Type */}
                <td className="px-5 py-3.5 text-[13px] text-muted whitespace-nowrap">{m.memberType || "—"}</td>

                {/* Stage */}
                <td className="px-5 py-3.5">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STAGE_CLASS[m.stage] || "bg-hairline/60 text-muted"}`}>
                    {m.stage}
                  </span>
                </td>

                {/* Ward / Hobli */}
                <td className="px-5 py-3.5 text-[13px] text-muted whitespace-nowrap">{m.ward || "—"}</td>

                {/* Tags */}
                <td className="px-5 py-3.5">
                  {m.tag && (
                    <span className="text-[10.5px] font-medium bg-steel/10 text-steel px-2 py-0.5 rounded-full whitespace-nowrap">{m.tag}</span>
                  )}
                </td>

                {/* Status */}
                <td className="px-5 py-3.5">
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                    isSuspended ? "bg-brick/10 text-brick" : "bg-forest/10 text-forest"
                  }`}>
                    {isSuspended ? "Suspended" : "Active"}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onView(m)}
                      title="View"
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-ink hover:bg-ink/5 transition-colors"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => onEdit(m)}
                      title="Edit"
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-ink hover:bg-ink/5 transition-colors"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => onSuspend(m)}
                      title={isSuspended ? "Activate" : "Suspend"}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                        isSuspended
                          ? "text-forest hover:bg-forest/10"
                          : "text-muted hover:text-amber hover:bg-amber/10"
                      }`}
                    >
                      <Ban size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(m)}
                      title="Delete"
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-brick hover:bg-brick/5 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}