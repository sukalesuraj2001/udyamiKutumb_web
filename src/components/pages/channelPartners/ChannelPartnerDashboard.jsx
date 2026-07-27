
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
  Legend,
} from "recharts";
import {
  Users,
  UserPlus,
  Clock,
  TrendingUp,
  Share2,
  IndianRupee,
  Phone,
  FileCheck,
  CreditCard,
  Upload,
  Plus,
  Eye,
  Download,
  BadgeCheck,
  AlertCircle,
  CheckCircle2,
  Circle,
  ChevronRight,
  BarChart2,
  Activity,
} from "lucide-react";

const memberGrowthData = [
  { month: "Aug", registrations: 18 },
  { month: "Sep", registrations: 24 },
  { month: "Oct", registrations: 21 },
  { month: "Nov", registrations: 30 },
  { month: "Dec", registrations: 27 },
  { month: "Jan", registrations: 35 },
  { month: "Feb", registrations: 41 },
  { month: "Mar", registrations: 38 },
  { month: "Apr", registrations: 52 },
  { month: "May", registrations: 47 },
  { month: "Jun", registrations: 61 },
  { month: "Jul", registrations: 58 },
];

const registrationStatusData = [
  { name: "Completed", value: 142, color: "#3B82F6" },
  { name: "Pending", value: 38, color: "#F59E0B" },
  { name: "Rejected", value: 12, color: "#EF4444" },
];

const recentMembers = [
  { id: 1, name: "Ravi Kumar Singh", mobile: "9876543210", date: "17 Jul 2025", status: "Completed" },
  { id: 2, name: "Meena Devi Patil", mobile: "9812345678", date: "17 Jul 2025", status: "Pending" },
  { id: 3, name: "Suresh Babu Reddy", mobile: "9900112233", date: "16 Jul 2025", status: "Completed" },
  { id: 4, name: "Anita Sharma", mobile: "9765432109", date: "16 Jul 2025", status: "Rejected" },
  { id: 5, name: "Prakash Nair", mobile: "9654321098", date: "15 Jul 2025", status: "Completed" },
  { id: 6, name: "Lakshmi Venkat", mobile: "9543210987", date: "15 Jul 2025", status: "Pending" },
  { id: 7, name: "Mohammed Aslam", mobile: "9432109876", date: "14 Jul 2025", status: "Completed" },
];

const followUps = [
  { id: 1, task: "Call Mr. Ravi Kumar regarding membership renewal", priority: "high", icon: Phone },
  { id: 2, task: "Verify Aadhaar for Ms. Meena Devi Patil", priority: "high", icon: FileCheck },
  { id: 3, task: "Collect membership fee from Suresh Reddy", priority: "medium", icon: CreditCard },
  { id: 4, task: "Upload documents for Anita Sharma application", priority: "medium", icon: Upload },
  { id: 5, task: "Follow up on rejected application — Prakash Nair", priority: "low", icon: AlertCircle },
];

const recentActivities = [
  { id: 1, type: "success", text: "New member registered — Ravi Kumar Singh", time: "2 mins ago" },
  { id: 2, type: "success", text: "Payment received — ₹1,200 from Meena Patil", time: "18 mins ago" },
  { id: 3, type: "info", text: "Document uploaded — Aadhaar for Suresh Reddy", time: "45 mins ago" },
  { id: 4, type: "info", text: "Referral added — Lakshmi Venkat referred by CP-004", time: "1 hr ago" },
  { id: 5, type: "warning", text: "Follow-up due — Anita Sharma (Aadhaar pending)", time: "2 hrs ago" },
  { id: 6, type: "success", text: "Member ID generated — UB-2025-00871", time: "3 hrs ago" },
];

// ============================================================
// HELPER: STATUS BADGE
// ============================================================

const StatusBadge = ({ status }) => {
  const map = {
    Completed: "bg-green-50 text-green-700 border border-green-200",
    Pending: "bg-amber-50 text-amber-700 border border-amber-200",
    Rejected: "bg-red-50 text-red-700 border border-red-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status]}`}>
      {status === "Completed" && <CheckCircle2 size={11} />}
      {status === "Pending" && <Circle size={11} />}
      {status === "Rejected" && <AlertCircle size={11} />}
      {status}
    </span>
  );
};

// ============================================================
// HELPER: CUSTOM TOOLTIP (LINE CHART)
// ============================================================

const CustomLineTooltip = ({ active, payload, label }) => {
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
// HELPER: CUSTOM TOOLTIP (DONUT CHART)
// ============================================================

const CustomDonutTooltip = ({ active, payload }) => {
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
// HELPER: PROGRESS BAR
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
// MAIN COMPONENT
// ============================================================

const ChannelPartnerDashboard = () => {
  const [activeTab, setActiveTab] = useState("all");

  const totalRegistrations = registrationStatusData.reduce((s, d) => s + d.value, 0);

  // ── SUMMARY CARD DATA ──────────────────────────────────────
  const summaryCards = [
    {
      label: "Total Members",
      value: "192",
      sub: "12 this week",
      subOk: true,
      icon: Users,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Today's Registrations",
      value: "8",
      sub: "+3 vs yesterday",
      subOk: true,
      icon: UserPlus,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      label: "Pending Follow-ups",
      value: "5",
      sub: "Action needed",
      subOk: false,
      icon: Clock,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      label: "Active Leads",
      value: "23",
      sub: "In pipeline",
      subOk: true,
      icon: TrendingUp,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      label: "This Month Referrals",
      value: "61",
      sub: "47 last month",
      subOk: true,
      icon: Share2,
      iconBg: "bg-cyan-50",
      iconColor: "text-cyan-600",
    },
    {
      label: "Commission Earned",
      value: "₹18,640",
      sub: "This month",
      subOk: true,
      icon: IndianRupee,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
  ];

  // ── QUICK ACTIONS ──────────────────────────────────────────
  const quickActions = [
    { label: "Add Member", icon: Plus, color: "text-blue-600 bg-blue-50 hover:bg-blue-100" },
    { label: "View Members", icon: Eye, color: "text-purple-600 bg-purple-50 hover:bg-purple-100" },
    { label: "Upload Docs", icon: Upload, color: "text-amber-600 bg-amber-50 hover:bg-amber-100" },
    { label: "Generate ID", icon: BadgeCheck, color: "text-green-600 bg-green-50 hover:bg-green-100" },
    { label: "Download Report", icon: Download, color: "text-cyan-600 bg-cyan-50 hover:bg-cyan-100" },
  ];

  // ── PRIORITY COLOR MAP ─────────────────────────────────────
  const priorityDot = { high: "bg-red-500", medium: "bg-amber-500", low: "bg-gray-400" };

  // ── ACTIVITY ICON MAP ──────────────────────────────────────
  const activityIcon = {
    success: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50" },
    info: { icon: Activity, color: "text-blue-500", bg: "bg-blue-50" },
    warning: { icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-50" },
  };

  // ── MEMBER TABLE FILTER ────────────────────────────────────
  const filteredMembers =
    activeTab === "all"
      ? recentMembers
      : recentMembers.filter((m) => m.status.toLowerCase() === activeTab);

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">

      {/* ── PAGE HEADER ─────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Channel Partner</h1>
        <p className="text-sm text-gray-500 mt-0.5">Daily operations overview · Live data</p>
      </div>

      {/* ============================================================
          SECTION 1 — SUMMARY CARDS (6 cards)
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
                  card.subOk
                    ? "bg-blue-50 text-blue-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {card.sub}
              </span>
            </div>
          );
        })}
      </div>

      {/* ============================================================
          SECTION 2 — ANALYTICS ROW: Line Chart + Donut Chart
      ============================================================ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* LEFT — Member Growth Line Chart */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <BarChart2 size={15} className="text-blue-500" />
                Member Growth
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Monthly registration trend — FY 2025</p>
            </div>
          </div>

          <div className="mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={memberGrowthData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
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
                <Tooltip content={<CustomLineTooltip />} />
                <Line
                  type="monotone"
                  dataKey="registrations"
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
            <p className="text-xs text-gray-400 mt-0.5">By completion stage</p>
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
                <Tooltip content={<CustomDonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Center label rendered via absolute positioning trick using relative wrapper */}
          <div className="relative -mt-28 mb-16 flex justify-center items-center pointer-events-none">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-800">{totalRegistrations}</p>
              <p className="text-xs text-gray-400">TOTAL</p>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2 mt-1">
            {registrationStatusData.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-xs text-gray-600">{d.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-700">{d.value}</span>
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
          SECTION 3 — MEMBERS TABLE + FOLLOW-UP PANEL
      ============================================================ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* LEFT — Recent Member Registrations Table */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-700">Recent Member Registrations</h2>
              <p className="text-xs text-gray-400 mt-0.5">Latest onboarding activity</p>
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
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 text-xs rounded-full font-medium capitalize transition-colors ${
                  activeTab === tab
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
                    Mobile
                  </th>
                  <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Reg. Date
                  </th>
                  <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-blue-600">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-700">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">{member.mobile}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{member.date}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={member.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT — Pending Follow-ups */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-700">Pending Follow-ups</h2>
              <p className="text-xs text-gray-400 mt-0.5">Action required today</p>
            </div>
            <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              {followUps.length} pending
            </span>
          </div>

          <div className="space-y-3">
            {followUps.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group"
                >
                  <div className="mt-0.5 p-1.5 rounded-md bg-white border border-gray-200 flex-shrink-0">
                    <Icon size={13} className="text-gray-500 group-hover:text-blue-600 transition-colors" />
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
          SECTION 4 — PERFORMANCE CARD + ACTIVITIES + QUICK ACTIONS
      ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

        {/* Performance Card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Performance Tracker</h2>
            <p className="text-xs text-gray-400 mt-0.5">Target vs achievement</p>
          </div>

          {/* Today's Target */}
          <div className="space-y-1 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Today's Target</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-gray-700">8 / 10</span>
                <span className="text-xs font-bold text-blue-600">80%</span>
              </div>
            </div>
            <ProgressBar value={80} color="bg-blue-500" />
          </div>

          {/* Monthly Target */}
          <div className="space-y-1 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Monthly Target</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-gray-700">61 / 80</span>
                <span className="text-xs font-bold text-purple-600">76%</span>
              </div>
            </div>
            <ProgressBar value={76} color="bg-purple-500" />
          </div>

          {/* Commission Target */}
          <div className="space-y-1 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Commission Target</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-gray-700">₹18.6k / ₹25k</span>
                <span className="text-xs font-bold text-emerald-600">74%</span>
              </div>
            </div>
            <ProgressBar value={74} color="bg-emerald-500" />
          </div>

          {/* Achievement badge */}
          <div className="mt-5 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-500 font-medium">Overall Achievement</p>
              <p className="text-2xl font-bold text-blue-700 mt-0.5">76.7%</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <TrendingUp size={18} className="text-white" />
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Recent Activities</h2>
            <p className="text-xs text-gray-400 mt-0.5">Latest updates from today</p>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[17px] top-2 bottom-2 w-px bg-gray-100" />

            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const cfg = activityIcon[activity.type];
                const Icon = cfg.icon;
                return (
                  <div key={activity.id} className="flex items-start gap-3 relative">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg} z-10`}
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
            <p className="text-xs text-gray-400 mt-0.5">Shortcuts for daily tasks</p>
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

          {/* Referral code block */}
          <div className="mt-5 border border-dashed border-blue-200 rounded-lg px-4 py-3 bg-blue-50">
            <p className="text-xs text-blue-500 font-medium">Your Referral Code</p>
            <p className="text-lg font-bold text-blue-700 tracking-widest mt-0.5">CP-UB-0042</p>
            <p className="text-xs text-blue-400 mt-1">Share this code to earn commission</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ChannelPartnerDashboard;