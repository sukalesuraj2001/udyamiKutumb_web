import React from "react";
import { BarChart2, SlidersHorizontal, Megaphone, TrendingUp, Users, Clock, Coins, CheckCircle2, XCircle } from "lucide-react";

const COMING_CARDS = [
  { label: "Campaigns", icon: Megaphone },
  { label: "Total Reach", icon: Users },
  { label: "Delivered", icon: CheckCircle2 },
  { label: "Pending", icon: Clock },
  { label: "Failed", icon: XCircle },
  { label: "Delivery Rate", icon: TrendingUp },
  { label: "Credits Used", icon: Coins },
];

export default function Analytics() {
  return (
    <div className="space-y-6">

      {/* ── Filter Bar — Coming Soon ── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-700">
            <SlidersHorizontal size={15} className="text-blue-600" />
            Filters
          </div>
          <span className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-50 text-slate-400 border border-slate-100">
            Coming soon
          </span>
        </div>
        <div className="px-5 py-8 flex flex-col items-center justify-center gap-2">
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
            <SlidersHorizontal size={16} className="text-slate-400" />
          </div>
          <p className="text-[12px] font-medium text-slate-400">
            Filter controls coming soon
          </p>
        </div>
      </div>

      {/* ── KPI Cards — Coming Soon ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
        {COMING_CARDS.map(({ label, icon: Icon }) => (
          <div
            key={label}
            className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 flex items-center justify-between"
          >
            <div className="min-w-0">
              <p className="text-[9.5px] font-semibold tracking-widest uppercase text-gray-400 mb-1 truncate">
                {label}
              </p>
              <p className="text-[18px] font-bold leading-none tabular-nums text-gray-200">
                — —
              </p>
            </div>
            <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ml-2 bg-slate-100">
              <Icon size={15} className="text-slate-300" />
            </span>
          </div>
        ))}
      </div>

      {/* ── Charts — Coming Soon ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {["Delivery Trend", "Channel Distribution"].map((title) => (
          <div
            key={title}
            className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5"
          >
            <p className="text-[13px] font-semibold text-gray-700 mb-0.5">{title}</p>
            <p className="text-[11px] text-gray-400 mb-4">Live data coming soon</p>
            <div className="h-[220px] flex flex-col items-center justify-center gap-2 bg-slate-50 rounded-xl">
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                <BarChart2 size={16} className="text-slate-400" />
              </div>
              <p className="text-[12px] font-medium text-slate-400">Coming soon</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Campaign Table — Coming Soon ── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
        <p className="text-[13px] font-semibold text-gray-700 mb-0.5">Campaign History</p>
        <p className="text-[11px] text-gray-400 mb-6">Live data coming soon</p>

        <div className="flex flex-col items-center justify-center py-14 gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Megaphone size={22} className="text-slate-300" />
          </div>
          <p className="text-[13.5px] font-semibold text-gray-500">Campaign analytics coming soon</p>
          <p className="text-[12px] text-gray-400 text-center max-w-xs">
            Real-time delivery stats, channel breakdown, and campaign history will appear here once the backend is connected.
          </p>
        </div>
      </div>

    </div>
  );
}