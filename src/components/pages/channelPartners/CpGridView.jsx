import React from "react";
import { MapPin, Phone, Mail, Pencil, Wallet, Trash2 } from "lucide-react";

const SECTOR_COLORS = {
  "UB Queens":               "bg-rose-50 text-rose-600 border border-rose-200",
  "UB Reality Construction": "bg-orange-50 text-orange-600 border border-orange-200",
  "UB Finance & IT":         "bg-violet-50 text-violet-600 border border-violet-200",
  "UB PAC":                  "bg-teal-50 text-teal-600 border border-teal-200",
};

const TIER_STYLES = {
  Prime:  { strip: "bg-amber-50 border border-amber-100",  pts: "text-amber-700",  badge: "bg-amber-100 text-amber-800" },
  Gold:   { strip: "bg-yellow-50 border border-yellow-100", pts: "text-yellow-700", badge: "bg-yellow-100 text-yellow-800" },
  Silver: { strip: "bg-slate-50 border border-slate-200",   pts: "text-slate-600",  badge: "bg-slate-100 text-slate-700" },
  Basic:  { strip: "bg-gray-50 border border-gray-200",     pts: "text-gray-600",   badge: "bg-gray-100 text-gray-600" },
};

export default function CpGridView({ members, onView, onEdit, onDelete }) {
  const getSectorColor = (sector) => SECTOR_COLORS[sector] || "bg-blue-50 text-blue-600 border border-blue-100";
  const getTierStyle   = (tier)   => TIER_STYLES[tier]   || TIER_STYLES.Basic;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {members.map((m) => {
        const tier = getTierStyle(m.rewardTier);
        return (
          <div
            key={m.id}
            onClick={() => onView(m)}
            className="group rounded-2xl border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col gap-3"
          >
            {/* Top row — avatar + name + actions */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-10 h-10 rounded-full bg-blue-600 text-white text-[12px] font-semibold flex items-center justify-center shrink-0 shadow-sm">
                  {m.initials}
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-gray-800 truncate">{m.name}</p>
                  {m.sector && (
                    <span className={`inline-block mt-1 text-[10.5px] font-medium px-2 py-0.5 rounded-full ${getSectorColor(m.sector)}`}>
                      {m.sector}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(m); }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(m); }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* Contact info */}
            <div className="border-t border-gray-100 pt-2.5 space-y-1.5 text-[12.5px] text-gray-500">
              <p className="flex items-center gap-2">
                <MapPin size={12} className="shrink-0 text-gray-400" />
                <span className="truncate">{m.taluk}, {m.state}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone size={12} className="shrink-0 text-gray-400" />
                {m.phone}
              </p>
              <p className="flex items-center gap-2 truncate">
                <Mail size={12} className="shrink-0 text-gray-400" />
                {m.email}
              </p>
            </div>

            {/* Wallet / reward strip */}
            {(m.walletPoints !== undefined || m.rewardTier) && (
              <div className={`${tier.strip} rounded-xl px-3 py-2 flex items-center justify-between`}>
                <div className="flex items-center gap-1.5">
                  <Wallet size={14} className={tier.pts} />
                  <span className={`text-[13px] font-semibold ${tier.pts}`}>
                    {(m.walletPoints || 0).toLocaleString()} pts
                  </span>
                </div>
                {m.rewardTier && (
                  <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${tier.badge}`}>
                    {m.rewardTier}
                  </span>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-[10.5px] font-mono text-gray-400 truncate">{m.udyamiId}</span>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                m.status === "Active"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-500"
              }`}>
                {m.status}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}