import { Users, ShoppingCart, TrendingUp, Crown } from "lucide-react";

const FUNNEL_STEPS = [
  { id: "free",     label: "Free users",        icon: <Users size={15} className="text-indigo-500" />,     count: 123, barColor: "bg-indigo-600", conversionLabel: "11% conversion"  },
  { id: "checkout", label: "Started checkout",  icon: <ShoppingCart size={15} className="text-indigo-400" />, count: 13,  barColor: "bg-indigo-500", conversionLabel: "100% conversion" },
  { id: "paid",     label: "Paid (converted)",  icon: <TrendingUp size={15} className="text-green-500" />,  count: 13,  barColor: "bg-indigo-400", conversionLabel: null              },
];

const TOP_TRIGGERS = [
  { label: "Unknown",               count: 13, pct: 100 },
  { label: "Referral",              count: 0,  pct: 0   },
  { label: "Social Media",          count: 0,  pct: 0   },
  { label: "Business Circle Event", count: 0,  pct: 0   },
];

const PLAN_CONVERSION = [
  { plan: "Basic → Prime", count: 3,  pct: 23 },
  { plan: "Free → Basic",  count: 10, pct: 77 },
];

const TOP_METRICS = [
  { label: "Total Revenue (User App)", value: "₹1,21,529.38", sub: null },
  { label: "Checkout → Paid",          value: "100%",          sub: null },
  { label: "User → Paid",              value: "10%",           sub: null },
  { label: "Active Members",           value: "24",            sub: "12 Basic · 12 Prime" },
];

export default function UpgradeFunnelTab() {
  const maxCount = Math.max(...FUNNEL_STEPS.map((s) => s.count));

  return (
    <div className="space-y-4 pt-4">

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-4 gap-3">
        {TOP_METRICS.map((m) => (
          <div key={m.label} className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{m.label}</p>
            <p className="text-[24px] font-bold text-gray-900 leading-tight">{m.value}</p>
            {m.sub && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-400">
                <Crown size={11} className="text-amber-500" /> {m.sub}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-3 gap-5">

        {/* Funnel (2/3 width) */}
        <div className="col-span-2 rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-5 text-[15px] font-bold text-gray-900">User App Upgrade Funnel</h3>
          <div className="space-y-6">
            {FUNNEL_STEPS.map((step) => {
              const widthPct = Math.max((step.count / maxCount) * 100, 4);
              return (
                <div key={step.id}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[13px] font-medium text-gray-700">
                      {step.icon} {step.label}
                    </div>
                    <span className="text-[13px] font-bold text-gray-900">{step.count}</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                    <div className={`h-full rounded-full ${step.barColor} transition-all duration-700`} style={{ width: `${widthPct}%` }} />
                  </div>
                  {step.conversionLabel && (
                    <p className="mt-1.5 text-[11px] text-gray-400">→ {step.conversionLabel}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-gray-100 pt-4">
            {[
              { l: "Total Users",     v: "123",   color: "text-indigo-600" },
              { l: "Checkout Rate",   v: "10.6%", color: "text-blue-600"   },
              { l: "Conversion Rate", v: "100%",  color: "text-green-600"  },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <p className={`text-[18px] font-bold ${s.color}`}>{s.v}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Top Upgrade Triggers */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-[14px] font-bold text-gray-900">Top Upgrade Triggers</h3>
            <div className="space-y-3">
              {TOP_TRIGGERS.map((t) => (
                <div key={t.label}>
                  <div className="mb-1 flex items-center justify-between text-[13px]">
                    <span className="font-medium text-gray-700">{t.label}</span>
                    <span className="font-bold text-gray-900">{t.count}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-indigo-400 transition-all duration-500" style={{ width: `${t.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Plan Conversion */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-[14px] font-bold text-gray-900">Plan Conversion</h3>
            <div className="space-y-4">
              {PLAN_CONVERSION.map((p) => (
                <div key={p.plan}>
                  <div className="mb-1.5 flex items-center justify-between text-[13px]">
                    <span className="font-medium text-gray-700">{p.plan}</span>
                    <span className="font-bold text-gray-900">{p.count} users</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-green-400 transition-all duration-500" style={{ width: `${p.pct}%` }} />
                  </div>
                  <p className="mt-1 text-right text-[11px] text-gray-400">{p.pct}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}