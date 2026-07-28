import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { IndianRupee, Calendar, TrendingUp, Wallet, MoreHorizontal } from "lucide-react";

const MONTHLY_REVENUE = []; // ← empty

const REVENUE_STATS = [
  { label: "Today Revenue",   value: "— —", icon: IndianRupee, badge: "Coming soon", warn: false },
  { label: "This Month",      value: "— —", icon: Calendar,    badge: "Coming soon", warn: false },
  { label: "Total Revenue",   value: "— —", icon: TrendingUp,  badge: "Coming soon", warn: false },
  { label: "Pending Revenue", value: "— —", icon: Wallet,      badge: "Coming soon", warn: true  },
];

export default function RevenueOverview() {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)] overflow-hidden">

      {/* Card header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-[#F1F5F9]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center">
            <TrendingUp size={15} className="text-[#2563EB]" strokeWidth={2.2} />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-[#1E293B] leading-tight">Revenue Overview</h2>
            <p className="text-[11.5px] text-[#94A3B8] mt-0.5">Monthly revenue trend — FY 2025</p>
          </div>
        </div>
        <button className="w-8 h-8 rounded-lg hover:bg-[#F8FAFC] flex items-center justify-center transition-colors text-[#CBD5E1] hover:text-[#64748B]">
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-[#F1F5F9]">
        {REVENUE_STATS.map(({ label, value, icon: Icon, badge, warn }) => (
          <div key={label} className="px-6 py-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#94A3B8]">{label}</p>
              <div className={`w-6 h-6 rounded-md flex items-center justify-center ${warn ? "bg-amber-50" : "bg-[#EFF6FF]"}`}>
                <Icon size={12} className={warn ? "text-amber-500" : "text-[#2563EB]"} strokeWidth={2} />
              </div>
            </div>
            <p className="text-[22px] font-bold text-[#CBD5E1] tabular-nums leading-none mb-2">{value}</p>
            <span className="inline-flex items-center text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-slate-50 text-slate-400 border border-slate-100">
              {badge}
            </span>
          </div>
        ))}
      </div>

      {/* Chart — coming soon */}
      <div className="px-6 pb-6 pt-4">
        <div className="h-[200px] flex flex-col items-center justify-center gap-2.5 rounded-xl bg-slate-50 border border-dashed border-slate-200">
          <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center">
            <TrendingUp size={16} className="text-slate-400" />
          </div>
          <p className="text-[12.5px] font-semibold text-slate-400">Revenue chart coming soon</p>
          <p className="text-[11px] text-slate-300">Data will appear here once revenue is recorded</p>
        </div>
      </div>
    </div>
  );
}