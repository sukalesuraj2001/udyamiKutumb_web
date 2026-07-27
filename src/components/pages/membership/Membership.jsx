import { useState } from "react";
import {
  Users, Receipt, ShoppingBag, BarChart2,
  TrendingUp, Settings, FileText, UserPlus,
  CreditCard, Crown,
} from "lucide-react";

// ── Tab Components (import from their own files in your project) ────────────
import SubscriptionsTab  from "./Subscription.jsx";
import PaymentsTab       from "./PaymentsTab.jsx";
import BuyPlanTab        from "./BuyPlanTab.jsx";
import RevenueTab        from "./RevenueTab.jsx";
import UpgradeFunnelTab  from "./UpgradeFunnelTab.jsx";
import ManagePlansTab    from "./ManagePlansTab.jsx";
// import ComplianceTab     from "./ComplianceTab.jsx";

// ── Badge ───────────────────────────────────────────────────────────────────
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

// ── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
  { id: "subscriptions", label: "Subscriptions",  Icon: Users,       Component: SubscriptionsTab  },
  { id: "payments",      label: "Payments",        Icon: Receipt,     Component: PaymentsTab       },
  { id: "buyplan",       label: "Buy Plan",        Icon: ShoppingBag, Component: BuyPlanTab        },
  { id: "revenue",       label: "Revenue",         Icon: BarChart2,   Component: RevenueTab        },
  { id: "funnel",        label: "Upgrade Funnel",  Icon: TrendingUp,  Component: UpgradeFunnelTab  },
  { id: "manage",        label: "Manage Plans",    Icon: Settings,    Component: ManagePlansTab    },
  // { id: "compliance",    label: "Compliance",      Icon: FileText,    Component: ComplianceTab     },
];

const METRICS = [
  { label: "Total Members",   Icon: Users,      value: "24",  badge: "All plans",    color: "blue"  },
  { label: "Active",          Icon: Users,      value: "24",  badge: "100%",          color: "green" },
  { label: "Prime Members",   Icon: Crown,      value: "12",  badge: "Highest tier",  color: "amber" },
  { label: "Revenue",         Icon: CreditCard, value: "₹0",  badge: "This period",   color: "gray"  },
  { label: "Pending",         Icon: Receipt,    value: "0",   badge: "Payments",      color: "gray"  },
  { label: "Expired / Grace", Icon: Users,      value: "0",   badge: "None",          color: "gray"  },
];

const BASIC_FEATURES = [
  "Udyami ID Card", "Networking events",
  "Business directory", "Monthly newsletter",
  "Basic training", "Govt scheme alerts",
];

const PRIME_FEATURES = [
  "Everything in Basic", "Priority mentorship",
  "Premium training", "Business loan assist",
  "Marketing support", "Exhibition passes",
  "Relationship manager", "WhatsApp group",
];

// ── Check icon ───────────────────────────────────────────────────────────────
const Check = () => (
  <svg className="h-3.5 w-3.5 shrink-0 text-green-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <polyline strokeLinecap="round" strokeLinejoin="round" points="20 6 9 17 4 12" />
  </svg>
);

// ── Main Page ────────────────────────────────────────────────────────────────
export default function MembershipPage() {
  const [activeTab, setActiveTab] = useState("subscriptions");

  // Find active tab component
  const activeTabObj = TABS.find((t) => t.id === activeTab);
  const ActiveComponent = activeTabObj?.Component ?? SubscriptionsTab;

  return (
    <div className="min-h-screen bg-gray-50 p-7 font-sans text-sm text-gray-800">

      {/* ── Page Header ─────────────────────────────────── */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900">Membership Management</h1>
          <p className="mt-0.5 text-[13px] text-gray-500">
            Manage Udyami membership plans, subscriptions &amp; payments
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-blue-700 transition-colors">
          <UserPlus size={15} /> Assign Plan
        </button>
      </div>

      {/* ── Metric Cards ────────────────────────────────── */}
      <div className="mb-5 grid grid-cols-6 gap-3">
        {METRICS.map((m) => (
          <div key={m.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              <m.Icon size={13} />
              {m.label}
            </div>
            <p className="text-[22px] font-bold text-gray-900">{m.value}</p>
            <div className="mt-1.5">
              <Badge color={m.color}>{m.badge}</Badge>
            </div>
          </div>
        ))}
      </div>

      {/* ── Plan Preview Cards ───────────────────────────── */}
      <div className="mb-5 grid grid-cols-2 gap-4">

        {/* Basic */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-1 flex items-center gap-2 text-[15px] font-bold text-gray-900">
            <CreditCard size={18} className="text-blue-600" />
            Basic Plan
          </div>
          <p className="mb-4 text-[22px] font-extrabold text-gray-900">
            ₹10,000 <span className="text-[13px] font-normal text-gray-400">/ Year</span>
          </p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            {BASIC_FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-1.5 text-[12px] text-gray-600">
                <Check /> {f}
              </div>
            ))}
          </div>
        </div>

        {/* Prime */}
        <div className="rounded-2xl border-[1.5px] border-amber-400 bg-white p-5">
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[15px] font-bold text-gray-900">
              <Crown size={18} className="text-amber-500" />
              Prime Plan
            </div>
            <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Most Popular
            </span>
          </div>
          <p className="mb-4 text-[22px] font-extrabold text-gray-900">
            ₹25,000 <span className="text-[13px] font-normal text-gray-400">/ Year</span>
          </p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            {PRIME_FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-1.5 text-[12px] text-gray-600">
                <Check /> {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Bar ──────────────────────────────────────── */}
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

      {/* ── Active Tab Content ───────────────────────────── */}
      {/*
        Each tab component handles its own toolbar/search/filters internally.
        ComplianceTab reuses PaymentsTab data (same table, different view).
        The rounded-b-xl on the content area closes the tab panel visually.
      */}
      <div className="min-h-[400px]">
        <ActiveComponent />
      </div>

    </div>
  );
}