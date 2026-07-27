import {
  IndianRupee, TrendingUp, Crown, CreditCard,
  CalendarPlus, AlertTriangle, RefreshCcw,
} from "lucide-react";

// ── Mini sparkline bars (pure CSS, no chart lib needed) ────────────────────
const Sparkline = ({ data, color = "#2563eb" }) => {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-0.5 h-10">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm opacity-80"
          style={{
            height: `${(v / max) * 100}%`,
            backgroundColor: color,
            minHeight: 2,
          }}
        />
      ))}
    </div>
  );
};

const MONTHLY_DATA = [28000, 35000, 42000, 38000, 51000, 47000, 60000, 55000, 72000, 68000, 85000, 112000];

const PLAN_BREAKDOWN = [
  { plan: "Prime Annual",       count: 12, revenue: 300000, color: "bg-amber-400"  },
  { plan: "Basic Annual",       count: 12, revenue:  120000, color: "bg-blue-500"   },
  { plan: "Prime Monthly",      count: 2,  revenue:   4998, color: "bg-amber-300"  },
  { plan: "Basic Monthly",      count: 2,  revenue:   1998, color: "bg-blue-300"   },
];

const RECENT_RENEWALS = [
  { name: "Rajesh Gowda",   plan: "prime", date: "10 Mar", amount: 25000 },
  { name: "Sunita Hegde",   plan: "basic", date: "9 Mar",  amount: 10000 },
  { name: "Kavita Rao",     plan: "prime", date: "4 Mar",  amount: 25000 },
  { name: "Arun Sharma",    plan: "prime", date: "2 Mar",  amount: 25000 },
  { name: "Preethi Nair",   plan: "basic", date: "1 Mar",  amount: 10000 },
];

export default function RevenueTab() {
  const totalRevenue  = 323308.2;
  const thisMonth     = 11800;
  const momChange     = -95;   // negative = down
  const primeMembers  = 12;
  const basicMembers  = 12;
  const newThisMonth  = 1;
  const renewalDue    = 0;
  const lapsed        = 0;

  const topMetrics = [
    {
      label: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString("en-IN")}`,
      icon: <IndianRupee size={15} className="text-green-600" />,
      iconBg: "bg-green-50",
      sub: null,
    },
    {
      label: "This Month",
      value: `₹${thisMonth.toLocaleString("en-IN")}`,
      icon: <TrendingUp size={15} className="text-blue-600" />,
      iconBg: "bg-blue-50",
      sub: { text: `${Math.abs(momChange)}% MoM`, down: momChange < 0 },
    },
    {
      label: "Prime Members",
      value: String(primeMembers),
      icon: <Crown size={15} className="text-amber-600" />,
      iconBg: "bg-amber-50",
      sub: { text: "50% of base", down: false },
    },
    {
      label: "Basic Members",
      value: String(basicMembers),
      icon: <CreditCard size={15} className="text-blue-600" />,
      iconBg: "bg-blue-50",
      sub: null,
    },
    {
      label: "New This Month",
      value: String(newThisMonth),
      icon: <CalendarPlus size={15} className="text-purple-600" />,
      iconBg: "bg-purple-50",
      sub: null,
    },
    {
      label: "Renewal Due (≤30D)",
      value: String(renewalDue),
      icon: <AlertTriangle size={15} className="text-amber-600" />,
      iconBg: "bg-amber-50",
      sub: null,
    },
    {
      label: "Lapsed",
      value: String(lapsed),
      icon: <RefreshCcw size={15} className="text-red-500" />,
      iconBg: "bg-red-50",
      sub: null,
    },
  ];

  const totalPlanRevenue = PLAN_BREAKDOWN.reduce((s, p) => s + p.revenue, 0);

  return (
    <div className="space-y-5 pt-4">

      {/* ── Top metric cards (7 cards matching screenshot) ── */}
      <div className="grid grid-cols-7 gap-3">
        {topMetrics.map((m) => (
          <div key={m.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              <span className={`flex h-5 w-5 items-center justify-center rounded-md ${m.iconBg}`}>
                {m.icon}
              </span>
              {m.label}
            </div>
            <p className="text-[18px] font-bold leading-tight text-gray-900">{m.value}</p>
            {m.sub && (
              <div className="mt-1.5">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold
                  ${m.sub.down ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
                  {m.sub.down ? "↓" : "↑"} {m.sub.text}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Two-column layout: Chart + Breakdown ── */}
      <div className="grid grid-cols-2 gap-5">

        {/* Monthly Revenue Trend */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[14px] font-bold text-gray-900">Monthly Revenue Trend</h3>
              <p className="text-[12px] text-gray-500">FY 2025 · Jan–Dec</p>
            </div>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
              ₹{(MONTHLY_DATA.reduce((a, b) => a + b, 0) / 1000).toFixed(0)}K total
            </span>
          </div>

          {/* Bar chart */}
          <div className="flex items-end gap-1.5 h-36 mb-3">
            {MONTHLY_DATA.map((v, i) => {
              const max = Math.max(...MONTHLY_DATA);
              const months = ["J","F","M","A","M","J","J","A","S","O","N","D"];
              const isLast = i === MONTHLY_DATA.length - 1;
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t-md transition-all ${isLast ? "bg-blue-600" : "bg-blue-200"}`}
                    style={{ height: `${(v / max) * 100}%`, minHeight: 4 }}
                    title={`₹${v.toLocaleString("en-IN")}`}
                  />
                  <span className="text-[9px] text-gray-400">{months[i]}</span>
                </div>
              );
            })}
          </div>

          {/* Sub stats row */}
          <div className="grid grid-cols-3 gap-3 border-t border-gray-100 pt-3">
            {[
              { l: "Today",       v: "₹18,420",     badge: "12% vs yesterday", up: true  },
              { l: "This Month",  v: `₹${thisMonth.toLocaleString("en-IN")}`, badge: "95% MoM",       up: false },
              { l: "Pending",     v: "₹1,24,500",   badge: "Awaiting clearance", up: null },
            ].map((s) => (
              <div key={s.l}>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{s.l}</p>
                <p className="text-[15px] font-bold text-gray-900 mt-0.5">{s.v}</p>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold mt-1
                  ${s.up === true ? "bg-green-50 text-green-700" : s.up === false ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"}`}>
                  {s.up === true ? "↑" : s.up === false ? "↓" : "⚠"} {s.badge}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Plan Breakdown */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <h3 className="text-[14px] font-bold text-gray-900">Revenue by Plan</h3>
            <p className="text-[12px] text-gray-500">Breakdown across all active plans</p>
          </div>

          <div className="space-y-4">
            {PLAN_BREAKDOWN.map((p) => {
              const pct = Math.round((p.revenue / totalPlanRevenue) * 100);
              return (
                <div key={p.plan}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[13px] font-medium text-gray-700">{p.plan}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] text-gray-400">{p.count} members</span>
                      <span className="text-[13px] font-semibold text-gray-900">
                        ₹{p.revenue.toLocaleString("en-IN")}
                      </span>
                      <span className="w-8 text-right text-[11px] text-gray-400">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full ${p.color} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div className="mt-5 flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
            <span className="text-[13px] font-semibold text-gray-700">Total Revenue</span>
            <span className="text-[15px] font-bold text-gray-900">
              ₹{totalPlanRevenue.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* ── Recent Renewals table ── */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h3 className="text-[14px] font-bold text-gray-900">Recent Payments</h3>
            <p className="text-[12px] text-gray-500">Last 5 successful transactions</p>
          </div>
          <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-semibold text-green-700">
            All verified
          </span>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["Member", "Plan", "Date", "Amount"].map((h) => (
                <th key={h} className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RECENT_RENEWALS.map((r, i) => (
              <tr key={i} className={`hover:bg-gray-50 transition-colors ${i < RECENT_RENEWALS.length - 1 ? "border-b border-gray-100" : ""}`}>
                <td className="px-5 py-3 text-[13px] font-semibold text-gray-900 whitespace-nowrap">{r.name}</td>
                <td className="px-5 py-3">
                  {r.plan === "prime" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                      <Crown size={10} /> Prime
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                      <CreditCard size={10} /> Basic
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-[13px] text-gray-500">{r.date}</td>
                <td className="px-5 py-3 text-[13px] font-semibold text-gray-900">
                  ₹{r.amount.toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}