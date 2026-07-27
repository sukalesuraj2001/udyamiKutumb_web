import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { PieChart as PieIcon, MoreHorizontal } from "lucide-react";

const DIST_DATA = [
  { name: "Free Users",  value: 6824, color: "#3B82F6", pct: 55 },
  { name: "Basic Users", value: 3245, color: "#1E293B", pct: 26 },
  { name: "Prime Users", value: 2389, color: "#F59E0B", pct: 19 },
];

const total = DIST_DATA.reduce((s, d) => s + d.value, 0);

const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.10)]">
      <p className="text-[10.5px] font-semibold text-[#94A3B8] mb-1">{d.name}</p>
      <p className="text-[15px] font-bold text-[#1E293B]">
        {d.value.toLocaleString("en-IN")}
        <span className="text-[#94A3B8] font-normal text-[12px] ml-1">· {d.pct}%</span>
      </p>
    </div>
  );
};

export default function UserDistribution() {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-[#F1F5F9]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center">
            <PieIcon size={15} className="text-[#2563EB]" strokeWidth={2.2} />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-[#1E293B] leading-tight">User Distribution</h2>
            <p className="text-[11.5px] text-[#94A3B8] mt-0.5">Breakdown by membership plan</p>
          </div>
        </div>
        <button className="w-8 h-8 rounded-lg hover:bg-[#F8FAFC] flex items-center justify-center transition-colors text-[#CBD5E1] hover:text-[#64748B]">
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col sm:flex-row items-center gap-8">
        {/* Doughnut */}
        <div className="relative w-[180px] h-[180px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={DIST_DATA} cx="50%" cy="50%" innerRadius={56} outerRadius={82}
                paddingAngle={3} dataKey="value" strokeWidth={0}>
                {DIST_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-[26px] font-bold text-[#1E293B] tabular-nums leading-none">{(total / 1000).toFixed(1)}k</p>
            <p className="text-[10px] font-semibold text-[#94A3B8] mt-1 tracking-[0.1em] uppercase">Total</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full min-w-0">
          {/* Summary line */}
          <div className="pb-4 mb-4 border-b border-[#F1F5F9]">
            <p className="text-[10.5px] font-semibold text-[#94A3B8] uppercase tracking-[0.1em] mb-1">Total Users</p>
            <p className="text-[28px] font-bold text-[#1E293B] tabular-nums leading-none">
              {total.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="space-y-4">
            {DIST_DATA.map(({ name, value, color, pct }) => (
              <div key={name}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-[13px] font-medium text-[#1E293B]">{name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] text-[#94A3B8] tabular-nums">{value.toLocaleString("en-IN")}</span>
                    <span className="text-[12px] font-bold text-[#1E293B] tabular-nums w-8 text-right">{pct}%</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}