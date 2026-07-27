import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { IndianRupee, Calendar, TrendingUp, Wallet, MoreHorizontal } from "lucide-react";

const MONTHLY_REVENUE = [
  { month: "Jan", revenue: 284000 }, { month: "Feb", revenue: 312000 },
  { month: "Mar", revenue: 298000 }, { month: "Apr", revenue: 356000 },
  { month: "May", revenue: 389000 }, { month: "Jun", revenue: 421000 },
  { month: "Jul", revenue: 398000 }, { month: "Aug", revenue: 445000 },
  { month: "Sep", revenue: 467000 }, { month: "Oct", revenue: 489000 },
  { month: "Nov", revenue: 512000 }, { month: "Dec", revenue: 543000 },
];

const REVENUE_STATS = [
  { label: "Today Revenue",   value: "₹18,420",    icon: IndianRupee, badge: "↗ 12% vs yesterday",  warn: false },
  { label: "This Month",      value: "₹5,43,200",  icon: Calendar,    badge: "↗ 8% vs last month",   warn: false },
  { label: "Total Revenue",   value: "₹48,12,091", icon: TrendingUp,  badge: "All time",              warn: false },
  { label: "Pending Revenue", value: "₹1,24,500",  icon: Wallet,      badge: "⚠ Awaiting clearance", warn: true  },
];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.10)]">
      <p className="text-[10.5px] font-semibold text-[#94A3B8] mb-1 uppercase tracking-wide">{label}</p>
      <p className="text-[15px] font-bold text-[#1E293B]">₹{Number(payload[0].value).toLocaleString("en-IN")}</p>
    </div>
  );
};

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
            <p className="text-[22px] font-bold text-[#1E293B] tabular-nums leading-none mb-2">{value}</p>
            <span className={`inline-flex items-center text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${
              warn
                ? "bg-amber-50 text-amber-700 border border-amber-100"
                : "bg-emerald-50 text-emerald-600 border border-emerald-100"
            }`}>{badge}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="px-6 pb-6 pt-4">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MONTHLY_REVENUE} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="#F1F5F9" strokeDasharray="0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8", fontWeight: 500 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#E2E8F0", strokeWidth: 1 }} />
              <Line
                type="monotone" dataKey="revenue"
                stroke="#2563EB" strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: "#2563EB", strokeWidth: 2, stroke: "#fff" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}