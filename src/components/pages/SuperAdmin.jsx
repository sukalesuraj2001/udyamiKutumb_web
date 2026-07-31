import React, { useState, useEffect } from "react";
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import {
  Users, Network, Crown, User, CreditCard,
  UserCheck, UserX, TrendingUp, IndianRupee,
  Calendar, Wallet, UserPlus, Download,
  MoreHorizontal, Search, SlidersHorizontal
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboard } from "../redux/slices/dashboardSlice.js";



// const KPI_CP = [
//   {
//     key: "totalCP",
//     label: "Total Channel Partners",
//     value: stats.totalChannelPartners,
//     icon: Network,
//     badge: "All states",
//     tone: "blue",
//   },
//   {
//     key: "activeCP",
//     label: "Active Partners",
//     value: stats.activeChannelPartners,
//     icon: UserCheck,
//     badge: "Active",
//     tone: "green",
//   },
//   {
//     key: "inactiveCP",
//     label: "Inactive Partners",
//     value: stats.inactiveChannelPartners,
//     icon: UserX,
//     badge: "Needs action",
//     tone: "amber",
//   },
// ];

// MONTHLY_REVENUE array — 
const MONTHLY_REVENUE = [];

const REVENUE_STATS = [
  { label: "Today", icon: IndianRupee },
  { label: "This Month", icon: Calendar },
  { label: "Total Revenue", icon: TrendingUp },
  { label: "Pending", icon: Wallet },
];

// const GROWTH_DATA = [
//   { week: "W1", members: 10200 }, { week: "W2", members: 10480 },
//   { week: "W3", members: 10850 }, { week: "W4", members: 11120 },
//   { week: "W5", members: 11340 }, { week: "W6", members: 11580 },
//   { week: "W7", members: 11890 }, { week: "W8", members: 12100 },
//   { week: "W9", members: 12280 }, { week: "W10", members: 12458 },
// ];

// const GROWTH_STATS = [
//   { label: "Today", value: "28", icon: UserPlus, badge: "New joiners" },
//   { label: "Week", value: "128", icon: TrendingUp, badge: "↗ 14% up" },
//   { label: "Month", value: "482", icon: Calendar, badge: "↗ 8% up" },
//   { label: "Total", value: "12,458", icon: Users, badge: "All time" },
// ];

// const DIST_DATA = [
//   { name: "Free Users", value: 6824, color: "#3B82F6", pct: 55 },
//   { name: "Basic Users", value: 3245, color: "#1E293B", pct: 26 },
//   { name: "Prime Users", value: 2389, color: "#F59E0B", pct: 19 },
// ];

// const DIST_DATA = userDistribution;

const CP_DATA = [];

/* ─── TONE MAPS ─────────────────────────────────────────────── */
// const ICON_TONE = {
//   blue: { bg: "bg-blue-50", icon: "text-blue-600" },
//   slate: { bg: "bg-slate-50", icon: "text-slate-500" },
//   amber: { bg: "bg-amber-50", icon: "text-amber-500" },
//   green: { bg: "bg-emerald-50", icon: "text-emerald-600" },
// };

const BADGE_TONE = {
  blue: "bg-blue-50 text-blue-700 border border-blue-100",
  slate: "bg-slate-100 text-slate-600 border border-slate-200",
  amber: "bg-amber-50 text-amber-700 border border-amber-100",
  green: "bg-emerald-50 text-emerald-700 border border-emerald-100",
};

/* ─── SHARED SUBCOMPONENTS ──────────────────────────────────── */
const CardHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-center justify-between px-4 sm:px-5 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-[#F1F5F9]">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center shrink-0">
        <Icon size={15} className="text-[#2563EB]" strokeWidth={2.2} />
      </div>
      <div>
        <h2 className="text-[13px] sm:text-[14px] font-semibold text-[#1E293B] leading-tight">{title}</h2>
        <p className="text-[10px] sm:text-[11px] text-[#94A3B8] mt-0.5">{subtitle}</p>
      </div>
    </div>
    <button className="w-7 h-7 rounded-lg hover:bg-[#F8FAFC] flex items-center justify-center text-[#CBD5E1] hover:text-[#64748B] transition-colors">
      <MoreHorizontal size={14} />
    </button>
  </div>
);

const RevTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl px-3 py-2.5 shadow-lg">
      <p className="text-[10px] font-semibold text-[#94A3B8] mb-1 uppercase tracking-wide">{label}</p>
      <p className="text-[14px] font-bold text-[#1E293B]">₹{Number(payload[0].value).toLocaleString("en-IN")}</p>
    </div>
  );
};

const GrowthTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl px-3 py-2.5 shadow-lg">
      <p className="text-[10px] font-semibold text-[#94A3B8] mb-1 uppercase tracking-wide">{label}</p>
      <p className="text-[14px] font-bold text-[#1E293B]">
        {Number(payload[0].value).toLocaleString("en-IN")}
        <span className="text-[#94A3B8] font-normal text-[11px] ml-1">members</span>
      </p>
    </div>
  );
};

const DistTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl px-3 py-2.5 shadow-lg">
      <p className="text-[10px] font-semibold text-[#94A3B8] mb-1">{d.name}</p>
      <p className="text-[14px] font-bold text-[#1E293B]">
        {d.value.toLocaleString("en-IN")}
        <span className="text-[#94A3B8] font-normal text-[11px] ml-1">· {d.pct}%</span>
      </p>
    </div>
  );
};

/* ─── MAIN ──────────────────────────────────────────────────── */
export default function SuperAdmin() {
  const [search, setSearch] = useState("");
  const dispatch = useDispatch();
  const { stats, userDistribution, loading } = useSelector((s) => s.dashboard);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  const DIST_DATA = (userDistribution || []).map((item, i) => ({
    ...item,
    color: ["#3B82F6", "#1E293B", "#F59E0B"][i] ?? "#94A3B8",
    pct: stats?.totalUsers
      ? Math.round((item.value / stats.totalUsers) * 100)
      : 0,
  }));

  const KPI_PRIMARY = [
    {
      key: "totalMembers",
      label: "Total Members",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      badge: `${stats?.totalUsers ?? 0} Registered`,
      tone: "blue",
    },
    {
      key: "freeUsers",
      label: "Free Users",
      value: stats?.freeUsers ?? 0,
      icon: User,
      badge: `${Math.round(((stats?.freeUsers ?? 0) / (stats?.totalUsers || 1)) * 100)}% of Total`,
      tone: "slate",
    },
    {
      key: "basicUsers",
      label: "Basic Users",
      value: stats?.basicUsers ?? 0,
      icon: CreditCard,
      badge: `${Math.round(((stats?.basicUsers ?? 0) / (stats?.totalUsers || 1)) * 100)}% of Total`,
      tone: "blue",
    },
    {
      key: "primeUsers",
      label: "Prime Users",
      value: stats?.primeUsers ?? 0,
      icon: Crown,
      badge: `${Math.round(((stats?.primeUsers ?? 0) / (stats?.totalUsers || 1)) * 100)}% of Total`,
      tone: "amber",
    },
  ];

  const ICON_TONE = {
    blue: { bg: "bg-blue-50", icon: "text-blue-600" },
    slate: { bg: "bg-slate-50", icon: "text-slate-500" },
    amber: { bg: "bg-amber-50", icon: "text-amber-500" },
    green: { bg: "bg-emerald-50", icon: "text-emerald-600" },
  };

  const KPI_CP = [
    { key: "totalCP", label: "Total Channel Partners", value: stats?.totalChannelPartners ?? 0, icon: Network, badge: "All states", tone: "blue" },
    { key: "activeCP", label: "Active Partners", value: stats?.activeChannelPartners ?? 0, icon: UserCheck, badge: "Active", tone: "green" },
    { key: "inactiveCP", label: "Inactive Partners", value: stats?.inactiveChannelPartners ?? 0, icon: UserX, badge: "Needs action", tone: "amber" },
  ];

  const totalDist = DIST_DATA.reduce((s, d) => s + d.value, 0);

  const filtered = []

  if (loading && !stats?.totalUsers) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400 text-[14px]">
        Loading dashboard...
      </div>
    );
  }
  return (
    <div className="bg-[#F8FAFC] -m-4 sm:-m-6 p-4 sm:p-6 min-h-full space-y-4 sm:space-y-5">

      {/* ── TOP ACTION BAR ───────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[17px] sm:text-[20px] font-bold text-[#0F172A] leading-tight">Super Admin</h1>
          <p className="text-[11px] sm:text-[12px] text-[#94A3B8] mt-0.5">Platform overview · Live data</p>
        </div>
 
      </div>

      {/* ── 4 PRIMARY KPI CARDS ──────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {KPI_PRIMARY.map(({ key, label, value, icon: Icon, badge, tone }) => {
          const t = ICON_TONE[tone];
          return (
            <div key={key} className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-shadow">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <p className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8] leading-tight">{label}</p>
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${t.bg} flex items-center justify-center shrink-0`}>
                  <Icon size={13} className={t.icon} strokeWidth={2} />
                </div>
              </div>
              <p className="text-[22px] sm:text-[28px] font-bold text-[#0F172A] tabular-nums leading-none mb-2 sm:mb-3">{value}</p>
              <span className={`inline-flex items-center text-[9px] sm:text-[10.5px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full ${BADGE_TONE[tone]}`}>
                {badge}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── 3 CP KPI PILLS ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {KPI_CP.map(({ key, label, value, icon: Icon, badge, tone }) => {
          const t = ICON_TONE[tone];
          return (
            <div key={key} className="bg-white border border-[#E2E8F0] rounded-xl px-4 sm:px-5 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
              <div className={`w-9 h-9 rounded-xl ${t.bg} flex items-center justify-center shrink-0`}>
                <Icon size={16} className={t.icon} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-[11px] font-semibold text-[#94A3B8] uppercase tracking-[0.08em] truncate">{label}</p>
                <p className="text-[20px] sm:text-[22px] font-bold text-[#0F172A] tabular-nums leading-tight">{value}</p>
              </div>
              <span className={`inline-flex items-center text-[9.5px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full shrink-0 ${BADGE_TONE[tone]}`}>
                {badge}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── ROW 1: Revenue (3fr) + User Distribution (2fr) ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4">

        {/* Revenue Overview */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
          <CardHeader icon={TrendingUp} title="Revenue Overview" subtitle="Monthly revenue trend — FY 2025" />

          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-[#F1F5F9] border-b border-[#F1F5F9]">
            {REVENUE_STATS.map(({ label }) => (
              <div key={label} className="px-3 sm:px-4 py-3 sm:py-3.5">
                <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8] mb-1">
                  {label}
                </p>
                <p className="text-[14px] sm:text-[16px] font-bold text-[#CBD5E1] tabular-nums leading-none mb-1.5">
                  — —
                </p>
                <span className="inline-flex text-[9px] sm:text-[9.5px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-50 text-slate-400 border border-slate-100">
                  Coming soon
                </span>
              </div>
            ))}
          </div>

          <div className="px-4 sm:px-5 pt-4 pb-5 h-[180px] sm:h-[210px] flex flex-col items-center justify-center gap-2">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
              <TrendingUp size={16} className="text-slate-400" />
            </div>
            <p className="text-[12px] font-medium text-slate-400">Revenue data coming soon</p>
          </div>
        </div>

        {/* User Distribution */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden flex flex-col">
          <CardHeader icon={Users} title="User Distribution" subtitle="By membership plan" />

          <div className="p-4 sm:p-5 flex flex-col items-center gap-4 sm:gap-5 flex-1">
            <div className="relative w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={DIST_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={74}
                    paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {DIST_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip content={<DistTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[20px] sm:text-[22px] font-bold text-[#0F172A] tabular-nums leading-none">{(totalDist / 1000).toFixed(1)}k</p>
                <p className="text-[9px] font-semibold text-[#94A3B8] mt-0.5 tracking-[0.1em] uppercase">Total</p>
              </div>
            </div>

            <div className="w-full space-y-3">
              {DIST_DATA.map(({ name, value, color, pct }) => (
                <div key={name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-[11px] sm:text-[12px] font-medium text-[#1E293B]">{name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] sm:text-[11px] text-[#94A3B8] tabular-nums">{value.toLocaleString("en-IN")}</span>
                      <span className="text-[10px] sm:text-[11px] font-bold text-[#1E293B] tabular-nums w-7 text-right">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 2: Membership Growth (3fr) + CP Summary (2fr) ── */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4">

      </div> */}

      {/* ── FULL-WIDTH CP TABLE ──────────────────────────────── */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">

        {/* Table toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center shrink-0">
              <Network size={15} className="text-[#2563EB]" strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-[13px] sm:text-[14px] font-semibold text-[#1E293B]">Channel Partner Performance</h2>
              <p className="text-[10px] sm:text-[11px] text-[#94A3B8]">All regions · {CP_DATA.length} partners</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 sm:flex-none">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search partner..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-[180px] pl-8 pr-3 py-1.5 text-[12px] border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-[#1E293B] placeholder-[#94A3B8] outline-none focus:border-[#2563EB] focus:bg-white transition-all"
              />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-[#475569] border border-[#E2E8F0] rounded-lg hover:bg-[#F1F5F9] transition-colors">
              <SlidersHorizontal size={13} />
              Filter
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-[#475569] border border-[#E2E8F0] rounded-lg hover:bg-[#F1F5F9] transition-colors">
              <Download size={13} />
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                {["Channel Partner", "Region", "Members", "Revenue", "Active Users", "Status"].map((h) => (
                  <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[#94A3B8] px-4 sm:px-5 py-3 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="flex flex-col items-center justify-center py-12 sm:py-14 gap-2">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                        <Network size={16} className="text-slate-400" />
                      </div>
                      <p className="text-[12.5px] font-medium text-slate-400">
                        Channel partner data coming soon
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}