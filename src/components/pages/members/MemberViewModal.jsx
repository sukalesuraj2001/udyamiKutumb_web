import React from "react";
import { Eye, Pencil, Trash2, UserX, UserCheck } from "lucide-react";

const STAGE_CLASS = {
  Idea: "bg-steel/10 text-steel",
  Registered: "bg-forest/10 text-forest",
  Growing: "bg-amber-tint text-amber",
};

const STATUS_CLASS = {
  Active: "bg-green-50 text-green-700 border-green-200",
  Suspended: "bg-red-50 text-red-700 border-red-200",
  Inactive: "bg-gray-50 text-gray-700 border-gray-200",
  "At Risk": "bg-yellow-50 text-yellow-700 border-yellow-200",
};

export default function MemberListView({ members, onView, onEdit, onDelete, onSuspend }) {
  return (
    <div className="rounded-2xl border border-hairline bg-white overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-hairline">
            {["Member", "Udyami ID", "Business", "Stage", "Ward", "Status", "Tags", "Actions"].map((h) => (
              <th key={h} className="px-5 py-3 text-[10.5px] font-semibold tracking-[0.1em] uppercase text-muted whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.id} className="border-b border-hairline last:border-0 hover:bg-ink/[0.02]">
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-ink text-white text-[11px] font-semibold flex items-center justify-center shrink-0">
                    {m.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-medium text-ink truncate">{m.name}</p>
                    <p className="text-[11.5px] text-muted truncate">{m.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3.5">
                <span className="text-[11px] font-mono border border-hairline text-muted px-2 py-1 rounded-lg">{m.udyamiId}</span>
              </td>
              <td className="px-5 py-3.5 text-[13px] text-muted whitespace-nowrap">{m.business || "—"}</td>
              <td className="px-5 py-3.5">
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STAGE_CLASS[m.stage] || "bg-hairline/60 text-muted"}`}>
                  {m.stage}
                </span>
              </td>
              <td className="px-5 py-3.5 text-[13px] text-muted whitespace-nowrap">{m.ward}</td>
              <td className="px-5 py-3.5">
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  m.status === "Suspended" 
                    ? "bg-red-50 text-red-700 border border-red-200" 
                    : "bg-green-50 text-green-700 border border-green-200"
                }`}>
                  {m.status || "Active"}
                </span>
              </td>
              <td className="px-5 py-3.5">
                {m.tag && (
                  <span className="text-[10.5px] font-medium bg-steel/10 text-steel px-2 py-0.5 rounded-full whitespace-nowrap">{m.tag}</span>
                )}
              </td>
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-1">
                  <button onClick={() => onView(m)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-ink hover:bg-ink/5 transition-colors">
                    <Eye size={14} />
                  </button>
                  <button onClick={() => onEdit(m)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-ink hover:bg-ink/5 transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button 
                    onClick={() => onSuspend(m)} 
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      m.status === "Suspended" 
                        ? "text-green-600 hover:text-green-800 hover:bg-green-50" 
                        : "text-red-500 hover:text-red-700 hover:bg-red-50"
                    }`}
                    title={m.status === "Suspended" ? "Activate Member" : "Suspend Member"}
                  >
                    {m.status === "Suspended" ? <UserCheck size={13} /> : <UserX size={13} />}
                  </button>
                  <button onClick={() => onDelete(m)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-brick hover:bg-brick/5 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}