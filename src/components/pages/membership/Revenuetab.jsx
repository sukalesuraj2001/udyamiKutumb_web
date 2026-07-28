import {
  IndianRupee, TrendingUp, Crown, CreditCard,
  CalendarPlus, AlertTriangle, RefreshCcw,
} from "lucide-react";

const MONTHLY_DATA  = [];  // ← empty
const PLAN_BREAKDOWN    = [];  // ← empty
const RECENT_RENEWALS   = [];  // ← empty

export default function RevenueTab() {
  const totalRevenue = 0;
  const thisMonth    = 0;
  const momChange    = 0;
  const primeMembers = 0;
  const basicMembers = 0;
  const newThisMonth = 0;
  const renewalDue   = 0;
  const lapsed       = 0;

  const topMetrics = [
    { label: "Total Revenue",      value: "— —", icon: <IndianRupee size={15} className="text-green-600" />,  iconBg: "bg-green-50",  sub: null },
    { label: "This Month",         value: "— —", icon: <TrendingUp  size={15} className="text-blue-600"  />,  iconBg: "bg-blue-50",   sub: null },
    { label: "Prime Members",      value: "— —", icon: <Crown       size={15} className="text-amber-600" />,  iconBg: "bg-amber-50",  sub: null },
    { label: "Basic Members",      value: "— —", icon: <CreditCard  size={15} className="text-blue-600"  />,  iconBg: "bg-blue-50",   sub: null },
    { label: "New This Month",     value: "— —", icon: <CalendarPlus size={15} className="text-purple-600"/>, iconBg: "bg-purple-50", sub: null },
    { label: "Renewal Due (≤30D)", value: "— —", icon: <AlertTriangle size={15} className="text-amber-600"/>, iconBg: "bg-amber-50",  sub: null },
    { label: "Lapsed",             value: "— —", icon: <RefreshCcw  size={15} className="text-red-500"   />,  iconBg: "bg-red-50",    sub: null },
  ];

  const ComingSoon = ({ icon, label }) => (
    <div className="flex flex-col items-center justify-center py-12 gap-2.5">
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
        {icon}
      </div>
      <p className="text-[12.5px] font-semibold text-gray-400">{label}</p>
      <p className="text-[11px] text-gray-300">Data will appear here once available</p>
    </div>
  );

  return (
    <div className="space-y-5 pt-4">

      {/* ── Top metric cards ── */}
      <div className="grid grid-cols-7 gap-3">
        {topMetrics.map((m) => (
          <div key={m.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              <span className={`flex h-5 w-5 items-center justify-center rounded-md ${m.iconBg}`}>
                {m.icon}
              </span>
              {m.label}
            </div>
            <p className="text-[18px] font-bold leading-tight text-[#CBD5E1]">{m.value}</p>
          </div>
        ))}
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-2 gap-5">

        {/* Monthly Revenue Trend */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <h3 className="text-[14px] font-bold text-gray-900">Monthly Revenue Trend</h3>
            <p className="text-[12px] text-gray-500">FY 2025 · Jan–Dec</p>
          </div>
          {MONTHLY_DATA.length === 0 ? (
            <ComingSoon
              icon={<TrendingUp size={17} className="text-gray-400" />}
              label="Revenue chart coming soon"
            />
          ) : (
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
          )}
        </div>

        {/* Plan Breakdown */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <h3 className="text-[14px] font-bold text-gray-900">Revenue by Plan</h3>
            <p className="text-[12px] text-gray-500">Breakdown across all active plans</p>
          </div>
          {PLAN_BREAKDOWN.length === 0 ? (
            <ComingSoon
              icon={<IndianRupee size={17} className="text-gray-400" />}
              label="Plan breakdown coming soon"
            />
          ) : (
            <>
              <div className="space-y-4">
                {PLAN_BREAKDOWN.map((p) => {
                  const total = PLAN_BREAKDOWN.reduce((s, x) => s + x.revenue, 0);
                  const pct = Math.round((p.revenue / total) * 100);
                  return (
                    <div key={p.plan}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-[13px] font-medium text-gray-700">{p.plan}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[12px] text-gray-400">{p.count} members</span>
                          <span className="text-[13px] font-semibold text-gray-900">₹{p.revenue.toLocaleString("en-IN")}</span>
                          <span className="w-8 text-right text-[11px] text-gray-400">{pct}%</span>
                        </div>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                        <div className={`h-full rounded-full ${p.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                <span className="text-[13px] font-semibold text-gray-700">Total Revenue</span>
                <span className="text-[15px] font-bold text-gray-900">
                  ₹{PLAN_BREAKDOWN.reduce((s, p) => s + p.revenue, 0).toLocaleString("en-IN")}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Recent Payments table ── */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h3 className="text-[14px] font-bold text-gray-900">Recent Payments</h3>
            <p className="text-[12px] text-gray-500">Last 5 successful transactions</p>
          </div>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["Member", "Plan", "Date", "Amount"].map((h) => (
                <th key={h} className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RECENT_RENEWALS.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <ComingSoon
                    icon={<CreditCard size={17} className="text-gray-400" />}
                    label="Recent payments coming soon"
                  />
                </td>
              </tr>
            ) : (
              RECENT_RENEWALS.map((r, i) => (
                <tr key={i} className={`hover:bg-gray-50 transition-colors ${i < RECENT_RENEWALS.length - 1 ? "border-b border-gray-100" : ""}`}>
                  <td className="px-5 py-3 text-[13px] font-semibold text-gray-900 whitespace-nowrap">{r.name}</td>
                  <td className="px-5 py-3">
                    {r.plan === "prime" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700"><Crown size={10} /> Prime</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700"><CreditCard size={10} /> Basic</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-[13px] text-gray-500">{r.date}</td>
                  <td className="px-5 py-3 text-[13px] font-semibold text-gray-900">₹{r.amount.toLocaleString("en-IN")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}