// ============================================================
// DistrictHeadDashboard.jsx
// Udyami Bharat Admin Portal — District Head Dashboard
// Design system: matches Super Admin Dashboard (same cards,
// typography, spacing, color palette, chart style)
// ============================================================

import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  Map,
  UserCheck,
  Share2,
  UserPlus,
  IndianRupee,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Circle,
  Activity,
  MapPin,
  Calendar,
  Star,
  TrendingUp,
  Eye,
  BarChart2,
  FileText,
  ShieldCheck,
  CreditCard,
  BadgeCheck,
  PieChart as PieIcon,
  Building2,
  Layers,
} from "lucide-react";

// ============================================================
// DUMMY DATA
// ============================================================

const memberGrowthData = [
  { month: "Aug", members: 112 },
  { month: "Sep", members: 148 },
  { month: "Oct", members: 135 },
  { month: "Nov", members: 184 },
  { month: "Dec", members: 162 },
  { month: "Jan", members: 210 },
  { month: "Feb", members: 238 },
  { month: "Mar", members: 221 },
  { month: "Apr", members: 275 },
  { month: "May", members: 259 },
  { month: "Jun", members: 308 },
  { month: "Jul", members: 292 },
];

const registrationStatusData = [
  { name: "Approved", value: 1840, color: "#3B82F6" },
  { name: "Pending",  value: 312,  color: "#F59E0B" },
  { name: "Rejected", value: 96,   color: "#EF4444" },
];

const talukData = [
  { id: 1, name: "Hosapete Taluk",    members: 612, wardChairmen: 8,  cps: 32, performance: 91, status: "Active" },
  { id: 2, name: "Sandur Taluk",      members: 484, wardChairmen: 6,  cps: 24, performance: 78, status: "Active" },
  { id: 3, name: "Siruguppa Taluk",   members: 371, wardChairmen: 5,  cps: 19, performance: 65, status: "Active" },
  { id: 4, name: "Kampli Taluk",      members: 298, wardChairmen: 4,  cps: 15, performance: 54, status: "Low"    },
  { id: 5, name: "Bellary Taluk",     members: 483, wardChairmen: 7,  cps: 27, performance: 83, status: "Active" },
];

const recentMembers = [
  { id: 1, name: "Ranjith Kumar",    taluk: "Hosapete",  ward: "Ward 3-B", date: "17 Jul 2025", status: "Approved" },
  { id: 2, name: "Savitha Reddy",    taluk: "Sandur",    ward: "Ward 1-A", date: "17 Jul 2025", status: "Pending"  },
  { id: 3, name: "Mahesh Patil",     taluk: "Bellary",   ward: "Ward 5-C", date: "16 Jul 2025", status: "Approved" },
  { id: 4, name: "Deepa Nair",       taluk: "Kampli",    ward: "Ward 2-D", date: "16 Jul 2025", status: "Rejected" },
  { id: 5, name: "Irfan Shaikh",     taluk: "Siruguppa", ward: "Ward 4-A", date: "15 Jul 2025", status: "Pending"  },
  { id: 6, name: "Latha Krishnamurthy", taluk: "Hosapete", ward: "Ward 3-A", date: "15 Jul 2025", status: "Approved" },
  { id: 7, name: "Basavaraju M.",    taluk: "Bellary",   ward: "Ward 5-B", date: "14 Jul 2025", status: "Approved" },
];

const pendingApprovals = [
  { id: 1, task: "Membership approval — 14 members across Hosapete Taluk",   type: "approval", priority: "high"   },
  { id: 2, task: "Verify documents — Deepa Nair (Aadhaar mismatch, Kampli)", type: "doc",      priority: "high"   },
  { id: 3, task: "Pending KYC — 6 members in Sandur Taluk",                  type: "kyc",      priority: "medium" },
  { id: 4, task: "Pending payment — ₹8,400 from Siruguppa Ward 4-A",         type: "payment",  priority: "medium" },
  { id: 5, task: "Channel Partner approval — 2 new CPs in Bellary Taluk",    type: "cp",       priority: "low"    },
];

const recentActivities = [
  { id: 1, type: "success", text: "Taluk Head assigned — Hosapete Taluk (Mr. Vijay Anand)",       time: "10 mins ago" },
  { id: 2, type: "info",    text: "New Ward Chairman added — Ward 3-B, Hosapete",                  time: "42 mins ago" },
  { id: 3, type: "success", text: "Membership approved — Ranjith Kumar (Prime Plan)",              time: "1 hr ago"    },
  { id: 4, type: "info",    text: "Business lead submitted — Bellary Taluk (5 new leads)",         time: "2 hrs ago"   },
  { id: 5, type: "success", text: "Payment received — ₹12,800 from Sandur Taluk collections",     time: "3 hrs ago"   },
  { id: 6, type: "warning", text: "Low performance alert — Kampli Taluk (54% achievement)",        time: "4 hrs ago"   },
];

// ============================================================
// HELPER — STATUS BADGE
// ============================================================

const StatusBadge = ({ status }) => {
  const map = {
    Approved: "bg-green-50 text-green-700 border border-green-200",
    Pending:  "bg-amber-50 text-amber-700 border border-amber-200",
    Rejected: "bg-red-50 text-red-700 border border-red-200",
    Active:   "bg-blue-50 text-blue-700 border border-blue-200",
    Low:      "bg-orange-50 text-orange-700 border border-orange-200",
  };
  const icons = {
    Approved: <CheckCircle2 size={11} />,
    Pending:  <Circle size={11} />,
    Rejected: <AlertCircle size={11} />,
    Active:   <CheckCircle2 size={11} />,
    Low:      <AlertCircle size={11} />,
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {icons[status]}
      {status}
    </span>
  );
};

// ============================================================
// HELPER — PROGRESS BAR
// ============================================================

const ProgressBar = ({ value, color = "bg-blue-500" }) => (
  <div className="w-full bg-gray-100 rounded-full h-1.5">
    <div
      className={`h-1.5 rounded-full transition-all duration-500 ${color}`}
      style={{ width: `${Math.min(value, 100)}%` }}
    />
  </div>
);

// ============================================================
// HELPER — TALUK PERFORMANCE BAR (inline colored)
// ============================================================

const PerfBar = ({ value }) => {
  const color =
    value >= 80 ? "bg-green-500" : value >= 60 ? "bg-blue-500" : "bg-amber-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-700 w-9 text-right">{value}%</span>
    </div>
  );
};

// ============================================================
// HELPER — LINE CHART TOOLTIP
// ============================================================

const LineTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2">
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-blue-600">{payload[0].value} members</p>
      </div>
    );
  }
  return null;
};

// ============================================================
// HELPER — DONUT TOOLTIP
// ============================================================

const DonutTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2">
        <p className="text-xs text-gray-500 mb-0.5">{payload[0].name}</p>
        <p className="text-sm font-semibold" style={{ color: payload[0].payload.color }}>
          {payload[0].value.toLocaleString()} members
        </p>
      </div>
    );
  }
  return null;
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const DistrictHeadDashboard = () => {
  const [memberTab, setMemberTab] = useState("all");

  const totalRegistrations = registrationStatusData.reduce((s, d) => s + d.value, 0);

  // ── SUMMARY CARDS ─────────────────────────────────────────
  const summaryCards = [
    {
      label: "Total Members",
      value: "2,248",
      sub: "292 this month",
      subOk: true,
      icon: Users,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Active Taluks",
      value: "5",
      sub: "4 of 5 active",
      subOk: true,
      icon: Map,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      label: "Active Ward Chairmen",
      value: "30",
      sub: "Across all taluks",
      subOk: true,
      icon: UserCheck,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      label: "Active Channel Partners",
      value: "117",
      sub: "3 pending approval",
      subOk: false,
      icon: Share2,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      label: "New Registrations",
      value: "292",
      sub: "This month",
      subOk: true,
      icon: UserPlus,
      iconBg: "bg-cyan-50",
      iconColor: "text-cyan-600",
    },
    {
      label: "District Collection",
      value: "₹3.84L",
      sub: "₹5L target",
      subOk: true,
      icon: IndianRupee,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
  ];

  // ── QUICK ACTIONS ─────────────────────────────────────────
  const quickActions = [
    { label: "View Taluks",            icon: Map,       color: "text-blue-600 bg-blue-50 hover:bg-blue-100"     },
    { label: "View Members",           icon: Users,     color: "text-purple-600 bg-purple-50 hover:bg-purple-100" },
    { label: "View Reports",           icon: BarChart2, color: "text-amber-600 bg-amber-50 hover:bg-amber-100"   },
    { label: "Membership Approvals",   icon: BadgeCheck,color: "text-green-600 bg-green-50 hover:bg-green-100"   },
    { label: "Analytics Dashboard",    icon: PieIcon,   color: "text-cyan-600 bg-cyan-50 hover:bg-cyan-100"      },
  ];

  // ── APPROVAL ICON MAP ─────────────────────────────────────
  const approvalIcon = {
    approval: { icon: ShieldCheck,   bg: "bg-green-50",  color: "text-green-500"  },
    doc:      { icon: FileText,      bg: "bg-blue-50",   color: "text-blue-500"   },
    kyc:      { icon: AlertCircle,   bg: "bg-red-50",    color: "text-red-500"    },
    payment:  { icon: CreditCard,    bg: "bg-amber-50",  color: "text-amber-500"  },
    cp:       { icon: UserCheck,     bg: "bg-purple-50", color: "text-purple-500" },
  };

  const priorityDot = { high: "bg-red-500", medium: "bg-amber-500", low: "bg-gray-400" };

  // ── ACTIVITY ICON MAP ─────────────────────────────────────
  const activityCfg = {
    success: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50" },
    info:    { icon: Activity,     color: "text-blue-500",  bg: "bg-blue-50"  },
    warning: { icon: AlertCircle,  color: "text-amber-500", bg: "bg-amber-50" },
  };

  // ── MEMBER TABLE FILTER ───────────────────────────────────
  const filteredMembers =
    memberTab === "all"
      ? recentMembers
      : recentMembers.filter((m) => m.status.toLowerCase() === memberTab);

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">

      {/* ── PAGE HEADER ──────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-semibold text-gray-800">District Head</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          District-wide operations overview · Live data
        </p>
      </div>

      {/* ============================================================
          SECTION 1 — SUMMARY CARDS (6)
      ============================================================ */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide leading-tight">
                  {card.label}
                </span>
                <div className={`p-1.5 rounded-lg ${card.iconBg}`}>
                  <Icon size={15} className={card.iconColor} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800 leading-none">{card.value}</p>
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full w-fit ${
                  card.subOk ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"
                }`}
              >
                {card.sub}
              </span>
            </div>
          );
        })}
      </div>

      {/* ============================================================
          SECTION 2 — ANALYTICS: District Member Growth + Registration Status
      ============================================================ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* LEFT — District Member Growth */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <BarChart2 size={15} className="text-blue-500" />
                District Member Growth
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Monthly registration trend — FY 2025
              </p>
            </div>
          </div>
          <div className="mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={memberGrowthData}
                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<LineTooltip />} />
                <Line
                  type="monotone"
                  dataKey="members"
                  stroke="#3B82F6"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: "#3B82F6", stroke: "#fff", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT — Registration Status Donut */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="mb-1">
            <h2 className="text-sm font-semibold text-gray-700">Registration Status</h2>
            <p className="text-xs text-gray-400 mt-0.5">District-wide breakdown</p>
          </div>
          <div className="flex items-center justify-center mt-2 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={registrationStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {registrationStatusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<DonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Center label */}
          <div className="relative -mt-28 mb-16 flex justify-center items-center pointer-events-none">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-800">
                {totalRegistrations.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">TOTAL</p>
            </div>
          </div>
          {/* Legend */}
          <div className="space-y-2 mt-1">
            {registrationStatusData.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: d.color }}
                  />
                  <span className="text-xs text-gray-600">{d.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-700">
                    {d.value.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-400">
                    {Math.round((d.value / totalRegistrations) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================
          SECTION 3 — TALUK PERFORMANCE TABLE
      ============================================================ */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-700">Taluk Performance</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              District-level taluk activity — July 2025
            </p>
          </div>
          <button className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:underline">
            View all <ChevronRight size={13} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-100">
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Taluk Name
                </th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Members
                </th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Ward Chairmen
                </th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Channel Partners
                </th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wide w-48">
                  Performance
                </th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {talukData.map((taluk) => (
                <tr key={taluk.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Map size={13} className="text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{taluk.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm font-semibold text-gray-700">
                      {taluk.members.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm font-semibold text-gray-700">{taluk.wardChairmen}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm font-semibold text-gray-700">{taluk.cps}</span>
                  </td>
                  <td className="px-5 py-3 w-48">
                    <PerfBar value={taluk.performance} />
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={taluk.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================
          SECTION 4 — RECENT MEMBER REGISTRATIONS TABLE
      ============================================================ */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-700">
              Recent Member Registrations
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Latest onboarding activity across district
            </p>
          </div>
          <button className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:underline">
            View all <ChevronRight size={13} />
          </button>
        </div>

        {/* Filter tabs */}
        <div className="px-5 flex gap-1 mb-3">
          {["all", "approved", "pending", "rejected"].map((tab) => (
            <button
              key={tab}
              onClick={() => setMemberTab(tab)}
              className={`px-3 py-1 text-xs rounded-full font-medium capitalize transition-colors ${
                memberTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-100">
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Member Name
                </th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Taluk
                </th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Ward
                </th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Registration Date
                </th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredMembers.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-purple-600">
                          {m.name.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">
                      {m.taluk}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{m.ward}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{m.date}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={m.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================
          SECTION 5 — DISTRICT PERFORMANCE + PENDING APPROVALS
      ============================================================ */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* District Performance KPIs */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-700">District Performance</h2>
            <p className="text-xs text-gray-400 mt-0.5">KPI tracking — July 2025</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Monthly Member Target</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-700">292 / 350</span>
                  <span className="text-xs font-bold text-blue-600">83%</span>
                </div>
              </div>
              <ProgressBar value={83} color="bg-blue-500" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Members Added (Cumulative)</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-700">2,248 / 2,500</span>
                  <span className="text-xs font-bold text-purple-600">90%</span>
                </div>
              </div>
              <ProgressBar value={90} color="bg-purple-500" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Collection Progress</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-700">₹3.84L / ₹5L</span>
                  <span className="text-xs font-bold text-emerald-600">77%</span>
                </div>
              </div>
              <ProgressBar value={77} color="bg-emerald-500" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Taluk Activation Rate</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-700">4 / 5</span>
                  <span className="text-xs font-bold text-amber-600">80%</span>
                </div>
              </div>
              <ProgressBar value={80} color="bg-amber-500" />
            </div>
          </div>

          {/* Overall District Achievement */}
          <div className="mt-5 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-500 font-medium">District Achievement</p>
              <p className="text-2xl font-bold text-blue-700 mt-0.5">82.5%</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <TrendingUp size={18} className="text-white" />
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-700">Pending Approvals</h2>
              <p className="text-xs text-gray-400 mt-0.5">Requires your action today</p>
            </div>
            <span className="text-xs font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
              {pendingApprovals.length} pending
            </span>
          </div>

          <div className="space-y-3">
            {pendingApprovals.map((item) => {
              const cfg = approvalIcon[item.type];
              const Icon = cfg.icon;
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group"
                >
                  <div
                    className={`mt-0.5 p-1.5 rounded-md border border-gray-200 flex-shrink-0 ${cfg.bg}`}
                  >
                    <Icon size={13} className={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 leading-snug">{item.task}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          { high: "bg-red-500", medium: "bg-amber-500", low: "bg-gray-400" }[item.priority]
                        }`}
                      />
                      <span className="text-xs capitalize text-gray-400">
                        {item.priority} priority
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    size={13}
                    className="text-gray-300 group-hover:text-gray-500 flex-shrink-0 mt-1"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============================================================
          SECTION 6 — RECENT ACTIVITIES + QUICK ACTIONS + DISTRICT OVERVIEW
      ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

        {/* Recent Activities */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Recent Activities</h2>
            <p className="text-xs text-gray-400 mt-0.5">Latest updates from today</p>
          </div>
          <div className="relative">
            <div className="absolute left-[17px] top-2 bottom-2 w-px bg-gray-100" />
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const cfg = activityCfg[activity.type];
                const Icon = cfg.icon;
                return (
                  <div key={activity.id} className="flex items-start gap-3 relative">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${cfg.bg}`}
                    >
                      <Icon size={13} className={cfg.color} />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-xs text-gray-700 leading-snug">{activity.text}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Quick Actions</h2>
            <p className="text-xs text-gray-400 mt-0.5">Shortcuts for district operations</p>
          </div>
          <div className="space-y-2.5">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${action.color}`}
                >
                  <Icon size={15} />
                  {action.label}
                  <ChevronRight size={14} className="ml-auto opacity-50" />
                </button>
              );
            })}
          </div>
        </div>

        {/* District Overview */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-700">District Overview</h2>
            <p className="text-xs text-gray-400 mt-0.5">Coverage &amp; scheduling snapshot</p>
          </div>

          <div className="space-y-3">
            {/* Total Taluks */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Layers size={15} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-blue-500 font-medium">Total Taluks</p>
                <p className="text-lg font-bold text-blue-700">5 Taluks</p>
              </div>
            </div>

            {/* Total Wards */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 border border-purple-100">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Building2 size={15} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-purple-500 font-medium">Total Wards</p>
                <p className="text-lg font-bold text-purple-700">30 Wards</p>
              </div>
            </div>

            {/* Active Meetings */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-100">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users size={15} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs text-green-500 font-medium">Active Meetings</p>
                <p className="text-lg font-bold text-green-700">4 this week</p>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Calendar size={15} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-amber-500 font-medium">Upcoming Events</p>
                <p className="text-lg font-bold text-amber-700">6 scheduled</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DistrictHeadDashboard;