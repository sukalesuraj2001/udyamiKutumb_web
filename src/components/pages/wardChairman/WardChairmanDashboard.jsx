// ============================================================
// WardChairmanDashboard.jsx
// Udyami Bharat Admin Portal — Ward Chairman Dashboard
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
  UserCheck,
  UserPlus,
  ClipboardList,
  Briefcase,
  IndianRupee,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Circle,
  Activity,
  MapPin,
  Calendar,
  Flag,
  TrendingUp,
  Eye,
  BadgeCheck,
  BarChart2,
  FileText,
  ShieldCheck,
  Phone,
  Star,
} from "lucide-react";

// ============================================================
// DUMMY DATA
// ============================================================

const memberGrowthData = [
  { month: "Aug", members: 22 },
  { month: "Sep", members: 31 },
  { month: "Oct", members: 28 },
  { month: "Nov", members: 40 },
  { month: "Dec", members: 35 },
  { month: "Jan", members: 48 },
  { month: "Feb", members: 55 },
  { month: "Mar", members: 50 },
  { month: "Apr", members: 67 },
  { month: "May", members: 62 },
  { month: "Jun", members: 74 },
  { month: "Jul", members: 71 },
];

const memberStatusData = [
  { name: "Active", value: 284, color: "#3B82F6" },
  { name: "Pending", value: 47, color: "#F59E0B" },
  { name: "Inactive", value: 21, color: "#E5E7EB" },
];

const channelPartners = [
  { id: 1, name: "Rajesh Kumar", area: "Ward 4-A", added: 42, leads: 18, performance: 88, status: "Active" },
  { id: 2, name: "Sunita Devi", area: "Ward 4-B", added: 36, leads: 14, performance: 74, status: "Active" },
  { id: 3, name: "Arun Prasad", area: "Ward 4-C", added: 29, leads: 9,  performance: 61, status: "Active" },
  { id: 4, name: "Kavitha Nair", area: "Ward 4-D", added: 18, leads: 5,  performance: 45, status: "Low" },
  { id: 5, name: "Mohammed Farooq", area: "Ward 4-E", added: 51, leads: 22, performance: 94, status: "Active" },
];

const recentMembers = [
  { id: 1, name: "Priya Sharma", mobile: "9876512340", joined: "17 Jul 2025", cp: "Rajesh Kumar", status: "Completed" },
  { id: 2, name: "Venkatesh Rao", mobile: "9812340067", joined: "17 Jul 2025", cp: "Mohammed Farooq", status: "Pending" },
  { id: 3, name: "Saritha Bai", mobile: "9900445566", joined: "16 Jul 2025", cp: "Sunita Devi", status: "Completed" },
  { id: 4, name: "Dilip Patil", mobile: "9765001122", joined: "16 Jul 2025", cp: "Arun Prasad", status: "Rejected" },
  { id: 5, name: "Rekha Menon", mobile: "9654112233", joined: "15 Jul 2025", cp: "Kavitha Nair", status: "Pending" },
  { id: 6, name: "Sunil Yadav", mobile: "9543009988", joined: "15 Jul 2025", cp: "Rajesh Kumar", status: "Completed" },
  { id: 7, name: "Fatima Begum", mobile: "9432887766", joined: "14 Jul 2025", cp: "Mohammed Farooq", status: "Completed" },
];

const pendingApprovals = [
  { id: 1, task: "Verify member documents — Venkatesh Rao", type: "doc", priority: "high" },
  { id: 2, task: "Approve membership — Rekha Menon (Basic Plan)", type: "approval", priority: "high" },
  { id: 3, task: "Review business lead submission — Arun Prasad CP", type: "lead", priority: "medium" },
  { id: 4, task: "Pending KYC — Dilip Patil (Aadhaar mismatch)", type: "kyc", priority: "high" },
  { id: 5, task: "Pending payment — Saritha Bai (₹1,200 due)", type: "payment", priority: "medium" },
];

const recentActivities = [
  { id: 1, type: "success", text: "New member added — Priya Sharma via Rajesh Kumar", time: "5 mins ago" },
  { id: 2, type: "info",    text: "Channel Partner assigned — Kavitha Nair (Ward 4-D)", time: "32 mins ago" },
  { id: 3, type: "success", text: "Membership approved — Sunil Yadav (Prime Plan)", time: "1 hr ago" },
  { id: 4, type: "info",    text: "Business lead submitted — Mohammed Farooq (3 new)", time: "2 hrs ago" },
  { id: 5, type: "success", text: "Payment received — ₹2,400 from Fatima Begum", time: "3 hrs ago" },
  { id: 6, type: "warning", text: "KYC pending alert — 4 members require document check", time: "4 hrs ago" },
];

// ============================================================
// HELPER — STATUS BADGE
// ============================================================

const StatusBadge = ({ status }) => {
  const map = {
    Completed: "bg-green-50 text-green-700 border border-green-200",
    Pending:   "bg-amber-50 text-amber-700 border border-amber-200",
    Rejected:  "bg-red-50 text-red-700 border border-red-200",
    Active:    "bg-blue-50 text-blue-700 border border-blue-200",
    Low:       "bg-orange-50 text-orange-700 border border-orange-200",
  };
  const icons = {
    Completed: <CheckCircle2 size={11} />,
    Pending:   <Circle size={11} />,
    Rejected:  <AlertCircle size={11} />,
    Active:    <CheckCircle2 size={11} />,
    Low:       <AlertCircle size={11} />,
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
// HELPER — PERFORMANCE BAR (inline, colored)
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
          {payload[0].value} members
        </p>
      </div>
    );
  }
  return null;
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const WardChairmanDashboard = () => {
  const [memberTab, setMemberTab] = useState("all");

  const totalMembers = memberStatusData.reduce((s, d) => s + d.value, 0);

  // ── SUMMARY CARDS ─────────────────────────────────────────
  const summaryCards = [
    {
      label: "Total Members",
      value: "352",
      sub: "14 this week",
      subOk: true,
      icon: Users,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Active Channel Partners",
      value: "5",
      sub: "4 of 5 active",
      subOk: true,
      icon: UserCheck,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      label: "New Registrations Today",
      value: "11",
      sub: "+4 vs yesterday",
      subOk: true,
      icon: UserPlus,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      label: "Pending Approvals",
      value: "5",
      sub: "Action needed",
      subOk: false,
      icon: ClipboardList,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      label: "Active Business Leads",
      value: "68",
      sub: "In pipeline",
      subOk: true,
      icon: Briefcase,
      iconBg: "bg-cyan-50",
      iconColor: "text-cyan-600",
    },
    {
      label: "Monthly Collection",
      value: "₹64,800",
      sub: "₹80k target",
      subOk: true,
      icon: IndianRupee,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
  ];

  // ── QUICK ACTIONS ─────────────────────────────────────────
  const quickActions = [
    { label: "View Members", icon: Eye, color: "text-blue-600 bg-blue-50 hover:bg-blue-100" },
    { label: "View Channel Partners", icon: UserCheck, color: "text-purple-600 bg-purple-50 hover:bg-purple-100" },
    { label: "Approve Members", icon: BadgeCheck, color: "text-green-600 bg-green-50 hover:bg-green-100" },
    { label: "View Reports", icon: BarChart2, color: "text-amber-600 bg-amber-50 hover:bg-amber-100" },
    { label: "Business Leads", icon: Briefcase, color: "text-cyan-600 bg-cyan-50 hover:bg-cyan-100" },
  ];

  // ── APPROVAL ICON MAP ──────────────────────────────────────
  const approvalIcon = {
    doc:      { icon: FileText,   bg: "bg-blue-50",   color: "text-blue-500" },
    approval: { icon: ShieldCheck,bg: "bg-green-50",  color: "text-green-500" },
    lead:     { icon: Briefcase,  bg: "bg-purple-50", color: "text-purple-500" },
    kyc:      { icon: AlertCircle,bg: "bg-red-50",    color: "text-red-500" },
    payment:  { icon: IndianRupee,bg: "bg-amber-50",  color: "text-amber-500" },
  };

  const priorityDot = { high: "bg-red-500", medium: "bg-amber-500", low: "bg-gray-400" };

  // ── ACTIVITY ICON MAP ─────────────────────────────────────
  const activityCfg = {
    success: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50" },
    info:    { icon: Activity,     color: "text-blue-500",  bg: "bg-blue-50" },
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
        <h1 className="text-xl font-semibold text-gray-800">Ward Chairman</h1>
        <p className="text-sm text-gray-500 mt-0.5">Ward operations overview · Live data</p>
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
          SECTION 2 — ANALYTICS: Member Growth + Member Status
      ============================================================ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* LEFT — Ward Member Growth */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <BarChart2 size={15} className="text-blue-500" />
                Ward Member Growth
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Monthly registration trend — FY 2025</p>
            </div>
          </div>
          <div className="mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={memberGrowthData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
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

        {/* RIGHT — Member Status Donut */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="mb-1">
            <h2 className="text-sm font-semibold text-gray-700">Member Status</h2>
            <p className="text-xs text-gray-400 mt-0.5">Current distribution</p>
          </div>
          <div className="flex items-center justify-center mt-2 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={memberStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {memberStatusData.map((entry) => (
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
              <p className="text-xl font-bold text-gray-800">{totalMembers}</p>
              <p className="text-xs text-gray-400">TOTAL</p>
            </div>
          </div>
          {/* Legend */}
          <div className="space-y-2 mt-1">
            {memberStatusData.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-xs text-gray-600">{d.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-700">{d.value}</span>
                  <span className="text-xs text-gray-400">
                    {Math.round((d.value / totalMembers) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================
          SECTION 3 — CHANNEL PARTNER PERFORMANCE TABLE
      ============================================================ */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-700">Channel Partner Performance</h2>
            <p className="text-xs text-gray-400 mt-0.5">Ward-level partner activity — July 2025</p>
          </div>
          <button className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:underline">
            View all <ChevronRight size={13} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-100">
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Channel Partner</th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Members Added</th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Leads Generated</th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wide w-48">Performance</th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {channelPartners.map((cp) => (
                <tr key={cp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-blue-600">{cp.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">{cp.name}</p>
                        <p className="text-xs text-gray-400">{cp.area}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm font-semibold text-gray-700">{cp.added}</span>
                    <span className="text-xs text-gray-400 ml-1">members</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm font-semibold text-gray-700">{cp.leads}</span>
                    <span className="text-xs text-gray-400 ml-1">leads</span>
                  </td>
                  <td className="px-5 py-3 w-48">
                    <PerfBar value={cp.performance} />
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={cp.status} />
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
            <h2 className="text-sm font-semibold text-gray-700">Recent Member Registrations</h2>
            <p className="text-xs text-gray-400 mt-0.5">Latest onboarding activity across ward</p>
          </div>
          <button className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:underline">
            View all <ChevronRight size={13} />
          </button>
        </div>

        {/* Filter tabs */}
        <div className="px-5 flex gap-1 mb-3">
          {["all", "completed", "pending", "rejected"].map((tab) => (
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
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Member Name</th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Mobile</th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Joined Date</th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Channel Partner</th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredMembers.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-purple-600">{m.name.charAt(0)}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{m.mobile}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{m.joined}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{m.cp}</span>
                  </td>
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
          SECTION 5 — WARD PERFORMANCE + PENDING APPROVALS
      ============================================================ */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* Ward Performance KPIs */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Ward Performance</h2>
            <p className="text-xs text-gray-400 mt-0.5">KPI tracking — July 2025</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Monthly Member Target</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-700">71 / 90</span>
                  <span className="text-xs font-bold text-blue-600">79%</span>
                </div>
              </div>
              <ProgressBar value={79} color="bg-blue-500" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Members Achieved (Cumulative)</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-700">352 / 400</span>
                  <span className="text-xs font-bold text-purple-600">88%</span>
                </div>
              </div>
              <ProgressBar value={88} color="bg-purple-500" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Collection Progress</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-700">₹64.8k / ₹80k</span>
                  <span className="text-xs font-bold text-emerald-600">81%</span>
                </div>
              </div>
              <ProgressBar value={81} color="bg-emerald-500" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Partner Activation Rate</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-700">4 / 5</span>
                  <span className="text-xs font-bold text-amber-600">80%</span>
                </div>
              </div>
              <ProgressBar value={80} color="bg-amber-500" />
            </div>
          </div>

          {/* Overall Completion */}
          <div className="mt-5 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-500 font-medium">Overall Completion</p>
              <p className="text-2xl font-bold text-blue-700 mt-0.5">82%</p>
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
                  <div className={`mt-0.5 p-1.5 rounded-md border border-gray-200 flex-shrink-0 ${cfg.bg}`}>
                    <Icon size={13} className={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 leading-snug">{item.task}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${priorityDot[item.priority]}`} />
                      <span className="text-xs capitalize text-gray-400">{item.priority} priority</span>
                    </div>
                  </div>
                  <ChevronRight size={13} className="text-gray-300 group-hover:text-gray-500 flex-shrink-0 mt-1" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============================================================
          SECTION 6 — RECENT ACTIVITIES + QUICK ACTIONS + WARD OVERVIEW
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
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${cfg.bg}`}>
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
            <p className="text-xs text-gray-400 mt-0.5">Shortcuts for ward operations</p>
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

        {/* Ward Overview */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Ward Overview</h2>
            <p className="text-xs text-gray-400 mt-0.5">Coverage &amp; scheduling snapshot</p>
          </div>

          <div className="space-y-3">
            {/* Total Areas Covered */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin size={15} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-blue-500 font-medium">Total Areas Covered</p>
                <p className="text-lg font-bold text-blue-700">5 Sub-Wards</p>
              </div>
            </div>

            {/* Active Meetings */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-100">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users size={15} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs text-green-500 font-medium">Active Meetings</p>
                <p className="text-lg font-bold text-green-700">2 this week</p>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 border border-purple-100">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar size={15} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-purple-500 font-medium">Upcoming Events</p>
                <p className="text-lg font-bold text-purple-700">3 scheduled</p>
              </div>
            </div>

            {/* Top Performer highlight */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Star size={15} className="text-amber-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-amber-500 font-medium">Top Performer</p>
                <p className="text-sm font-bold text-amber-700 truncate">Mohammed Farooq (94%)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default WardChairmanDashboard;