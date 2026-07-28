import { Users, ShoppingCart, TrendingUp, Crown } from "lucide-react";

const FUNNEL_STEPS    = [];
const TOP_TRIGGERS    = [];
const PLAN_CONVERSION = [];
const TOP_METRICS     = [
  { label: "Total Revenue (User App)", value: "— —", sub: null },
  { label: "Checkout → Paid",          value: "— —", sub: null },
  { label: "User → Paid",              value: "— —", sub: null },
  { label: "Active Members",           value: "— —", sub: null },
];

const ComingSoon = ({ icon, label }) => (
  <div className="flex flex-col items-center justify-center py-10 gap-2.5">
    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
      {icon}
    </div>
    <p className="text-[12.5px] font-semibold text-gray-400">{label}</p>
    <p className="text-[11px] text-gray-300">Data will appear here once available</p>
  </div>
);

export default function UpgradeFunnelTab() {
  return (
    <div className="space-y-4 pt-4">

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-4 gap-3">
        {TOP_METRICS.map((m) => (
          <div key={m.label} className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{m.label}</p>
            <p className="text-[24px] font-bold text-[#CBD5E1] leading-tight">{m.value}</p>
          </div>
        ))}
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-3 gap-5">

        {/* Funnel (2/3 width) */}
        <div className="col-span-2 rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-5 text-[15px] font-bold text-gray-900">User App Upgrade Funnel</h3>
          {FUNNEL_STEPS.length === 0 ? (
            <ComingSoon
              icon={<TrendingUp size={17} className="text-gray-400" />}
              label="Funnel data coming soon"
            />
          ) : (
            <>
              <div className="space-y-6">
                {FUNNEL_STEPS.map((step) => {
                  const maxCount = Math.max(...FUNNEL_STEPS.map((s) => s.count));
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
              <div className="mt-6 grid grid-cols-3 gap-3 border-t border-gray-100 pt-4">
                {[
                  { l: "Total Users",     v: "—", color: "text-indigo-600" },
                  { l: "Checkout Rate",   v: "—", color: "text-blue-600"   },
                  { l: "Conversion Rate", v: "—", color: "text-green-600"  },
                ].map((s) => (
                  <div key={s.l} className="text-center">
                    <p className={`text-[18px] font-bold ${s.color}`}>{s.v}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{s.l}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Top Upgrade Triggers */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-[14px] font-bold text-gray-900">Top Upgrade Triggers</h3>
            {TOP_TRIGGERS.length === 0 ? (
              <ComingSoon
                icon={<ShoppingCart size={17} className="text-gray-400" />}
                label="Triggers coming soon"
              />
            ) : (
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
            )}
          </div>

          {/* Plan Conversion */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-[14px] font-bold text-gray-900">Plan Conversion</h3>
            {PLAN_CONVERSION.length === 0 ? (
              <ComingSoon
                icon={<Crown size={17} className="text-gray-400" />}
                label="Conversion data coming soon"
              />
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}