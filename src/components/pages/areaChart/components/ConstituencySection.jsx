import React, { useState } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import WardCard from "./WardCard.jsx";

export default function ConstituencySection({ constituency, wards }) {
  const [open, setOpen] = useState(true);
  const activeCount = wards.filter((w) => w.is_active).length;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Accordion Header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          {/* Icon container — matches Super Admin icon style */}
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <MapPin size={14} className="text-blue-600" />
          </div>
          <div>
            <span className="block text-[15px] font-semibold text-slate-800">
              {constituency}
            </span>
            <span className="block text-[12px] text-slate-500 mt-0.5">
              {wards.length} ward{wards.length !== 1 ? "s" : ""} ·{" "}
              <span className="text-emerald-600 font-medium">{activeCount} active</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Ward count badge */}
          <span className="hidden sm:inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
            {wards.length} ward{wards.length !== 1 ? "s" : ""}
          </span>
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform duration-200 shrink-0 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Ward Grid */}
      {open && (
        <div className="border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-3 sm:p-4 md:p-5">
          {wards.map((w) => (
            <WardCard key={w.id} ward={w} />
          ))}
        </div>
      )}
    </div>
  );
}