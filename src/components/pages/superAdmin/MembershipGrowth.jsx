import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, UserPlus, Calendar, TrendingUp, MoreHorizontal } from "lucide-react";

const GROWTH_DATA = [
  { week: "W1", members: 10200 }, { week: "W2", members: 10480 },
  { week: "W3", members: 10850 }, { week: "W4", members: 11120 },
  { week: "W5", members: 11340 }, { week: "W6", members: 11580 },
  { week: "W7", members: 11890 }, { week: "W8", members: 12100 },
  { week: "W9", members: 12280 }, { week: "W10", members: 12458 },
];

const GROWTH_STATS = [
  { label: "Today",         value: "28",     icon: UserPlus,   badge: "New joiners" },
  { label: "This Week",     value: "128",    icon: TrendingUp, badge: "↗ 14% up"   },
  { label: "This Month",    value: "482",    icon: Calendar,   badge: "↗ 8% up"    },
  { label: "Total Members", value: "12,458", icon: Users,      badge: "All time"   },
];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.10)]">
      <p className="text-[10.5px] font-semibold text-[#94A3B8] mb-1 uppercase tracking-wide">{label}</p>
      <p className="text-[15px] font-bold text-[#1E293B]">{Number(payload[0].value).toLocaleString("en-IN")} <span className="text-[#94A3B8] font-normal text-[12px]">members</span></p>
    </div>
  );
};

export default function MembershipGrowth() {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-[#F1F5F9]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center">
            <Users size={15} className="text-[#2563EB]" strokeWidth={2.2} />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-[#1E293B] leading-tight">Membership Growth</h2>
            <p className="text-[11.5px] text-[#94A3B8] mt-0.5">Weekly cumulative member count</p>
          </div>
        </div>
        <button className="w-8 h-8 rounded-lg hover:bg-[#F8FAFC] flex items-center justify-center transition-colors text-[#CBD5E1] hover:text-[#64748B]">
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-[#F1F5F9]">
        {GROWTH_STATS.map(({ label, value, icon: Icon, badge }) => (
          <div key={label} className="px-6 py-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#94A3B8]">{label}</p>
              <div className="w-6 h-6 rounded-md bg-[#EFF6FF] flex items-center justify-center">
                <Icon size={12} className="text-[#2563EB]" strokeWidth={2} />
              </div>
            </div>
            <p className="text-[22px] font-bold text-[#1E293B] tabular-nums leading-none mb-2">{value}</p>
            <span className="inline-flex items-center text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
              {badge}
            </span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="px-6 pb-6 pt-4">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={GROWTH_DATA} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="memberGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#2563EB" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#F1F5F9" strokeDasharray="0" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#94A3B8", fontWeight: 500 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#E2E8F0", strokeWidth: 1 }} />
              <Area
                type="monotone" dataKey="members"
                stroke="#2563EB" strokeWidth={2.5}
                fill="url(#memberGrad)" dot={false}
                activeDot={{ r: 5, fill: "#2563EB", strokeWidth: 2, stroke: "#fff" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}