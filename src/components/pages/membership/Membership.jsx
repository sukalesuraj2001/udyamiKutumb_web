import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboard } from "../../redux/slices/dashboardSlice.js";
import { fetchMembershipPlans } from "../../redux/slices/membershipPlansSlice.js";
import {
  Users, Receipt, ShoppingBag, BarChart2,
  TrendingUp, Settings, UserPlus, CreditCard, Crown,
} from "lucide-react";

import SubscriptionsTab from "./Subscription.jsx";
import PaymentsTab      from "./Paymentstab.jsx";
import BuyPlanTab       from "./Buyplantab.jsx";
import RevenueTab       from "./Revenuetab.jsx";
import UpgradeFunnelTab from "./Upgradefunneltab.jsx";
import ManagePlansTab   from "./Manageplanstab.jsx";

// ── Badge ────────────────────────────────────────────────────────────────────
const Badge = ({ children, color = "gray" }) => {
  const colors = {
    blue:  "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    amber: "bg-amber-50 text-amber-700",
    gray:  "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${colors[color]}`}>
      {children}
    </span>
  );
};

const Check = () => (
  <svg className="h-3.5 w-3.5 shrink-0 text-green-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <polyline strokeLinecap="round" strokeLinejoin="round" points="20 6 9 17 4 12" />
  </svg>
);

const TABS = [
  { id: "subscriptions", label: "Subscriptions", Icon: Users,       Component: SubscriptionsTab },
  { id: "payments",      label: "Payments",       Icon: Receipt,     Component: PaymentsTab      },
  { id: "buyplan",       label: "Buy Plan",       Icon: ShoppingBag, Component: BuyPlanTab       },
  { id: "revenue",       label: "Revenue",        Icon: BarChart2,   Component: RevenueTab       },
  { id: "funnel",        label: "Upgrade Funnel", Icon: TrendingUp,  Component: UpgradeFunnelTab },
  { id: "manage",        label: "Manage Plans",   Icon: Settings,    Component: ManagePlansTab   },
];

export default function MembershipPage() {
  const dispatch    = useDispatch();
  const [activeTab, setActiveTab] = useState("subscriptions");

  // ── Redux selectors ──────────────────────────────────────────────────────
  const stats = useSelector((s) => s.dashboard.stats);        // totalUsers, primeUsers
  const plans = useSelector((s) => s.membershipPlans.list);   // membership plans array

  // ── Fetch on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchDashboard());
    dispatch(fetchMembershipPlans());
  }, [dispatch]);

  // ── Derived values ────────────────────────────────────────────────────────
  const totalMembers  = stats?.totalUsers   ?? 0;
  const primeMembers  = stats?.primeUsers   ?? 0;
  const activeMembers = totalMembers;  // adjust when inactive API available

  // ── Metric cards ─────────────────────────────────────────────────────────
  const METRICS = [
    { label: "Total Members",   Icon: Users,      value: String(totalMembers),  badge: "All plans",   color: "blue"  },
    { label: "Active",          Icon: Users,      value: String(activeMembers), badge: "100%",        color: "green" },
    { label: "Prime Members",   Icon: Crown,      value: String(primeMembers),  badge: "Highest tier",color: "amber" },
    { label: "Revenue",         Icon: CreditCard, value: "— —",                 badge: "Coming soon", color: "gray"  },
    { label: "Pending",         Icon: Receipt,    value: "— —",                 badge: "Coming soon", color: "gray"  },
    { label: "Expired / Grace", Icon: Users,      value: "— —",                 badge: "Coming soon", color: "gray"  },
  ];

  // ── Plan preview from API ─────────────────────────────────────────────────
  const basicPlan = plans.find((p) => p.membershipType === "BASIC"  && p.durationDays >= 365);
  const primePlan = plans.find((p) => p.membershipType === "PRIME"  && p.durationDays >= 365);

  const ActiveComponent = TABS.find((t) => t.id === activeTab)?.Component ?? SubscriptionsTab;

  return (
    <div className="min-h-screen bg-gray-50 p-7 font-sans text-sm text-gray-800">

      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900">Membership Management</h1>
          <p className="mt-0.5 text-[13px] text-gray-500">
            Manage Udyami membership plans, subscriptions &amp; payments
          </p>
        </div>
      </div>

      {/* ── Metric Cards ─────────────────────────────────────── */}
      <div className="mb-5 grid grid-cols-6 gap-3">
        {METRICS.map((m) => (
          <div key={m.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              <m.Icon size={13} />
              {m.label}
            </div>
            <p className={`text-[22px] font-bold leading-tight ${m.value === "— —" ? "text-[#CBD5E1]" : "text-gray-900"}`}>
              {m.value}
            </p>
            <div className="mt-1.5">
              <Badge color={m.color}>{m.badge}</Badge>
            </div>
          </div>
        ))}
      </div>

      {/* ── Plan Preview Cards ────────────────────────────────── */}
      <div className="mb-5 grid grid-cols-2 gap-4">

        {/* Basic Plan */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-1 flex items-center gap-2 text-[15px] font-bold text-gray-900">
            <CreditCard size={18} className="text-blue-600" />
            {basicPlan?.planName ?? "Basic Plan"}
          </div>
          {basicPlan ? (
            <>
              <p className="mb-4 text-[22px] font-extrabold text-gray-900">
                ₹{basicPlan.price.toLocaleString("en-IN")}
                <span className="text-[13px] font-normal text-gray-400 ml-1">/ Year</span>
              </p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                {(basicPlan.features ?? []).map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[12px] text-gray-600">
                    <Check /> {f.featureName ?? f}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-3 text-[12.5px] text-gray-300 italic">Plan details coming soon</p>
          )}
        </div>

        {/* Prime Plan */}
        <div className="rounded-2xl border-[1.5px] border-amber-400 bg-white p-5">
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[15px] font-bold text-gray-900">
              <Crown size={18} className="text-amber-500" />
              {primePlan?.planName ?? "Prime Plan"}
            </div>
            {primePlan?.isPopular && (
              <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                {primePlan.badge || "Most Popular"}
              </span>
            )}
          </div>
          {primePlan ? (
            <>
              <p className="mb-4 text-[22px] font-extrabold text-gray-900">
                ₹{primePlan.price.toLocaleString("en-IN")}
                <span className="text-[13px] font-normal text-gray-400 ml-1">/ Year</span>
              </p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                {(primePlan.features ?? []).map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[12px] text-gray-600">
                    <Check /> {f.featureName ?? f}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-3 text-[12.5px] text-gray-300 italic">Plan details coming soon</p>
          )}
        </div>
      </div>

      {/* ── Tab Bar ──────────────────────────────────────────── */}
      <div className="rounded-t-xl border border-b-0 border-gray-200 bg-white">
        <div className="flex overflow-x-auto px-2">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-3.5 text-[13px] font-medium transition-colors
                ${activeTab === id
                  ? "border-blue-600 text-blue-600 font-semibold"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ──────────────────────────────────────── */}
      <div className="min-h-[400px]">
        <ActiveComponent />
      </div>
    </div>
  );
}