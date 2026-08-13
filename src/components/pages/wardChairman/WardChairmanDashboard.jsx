// ============================================================
// WardChairmanDashboard.jsx
// Udyami Bharat Admin Portal — Ward Chairman Dashboard
// ============================================================

import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchUsersByWard } from "../../redux/slices/dashboardSlice.js";
import { getLocationByWardHeadId, selectWardInfo } from "../../redux/slices/areaChartSlice.js";
import {
  fetchChannelPartnersByWard,
  fetchCloudPatraApplicationsByWard,
  fetchCloudPatraInterviewsByWardChairman,
  fetchCpSubmissions,
} from "../../redux/slices/Cponboardingslice.js";
import { getAllRoutesByChairman } from "../../redux/slices/Routetrackingslice.js";
import { selectUser } from "../../redux/slices/authSlice.js";
import {
  Users,
  UserCheck,
  Briefcase,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Circle,
  MapPin,
  Flag,
  BarChart2,
  InboxIcon,
  Navigation,
  Calendar,
  Search,
  ExternalLink,
  FileText,
  Clock,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";

// ============================================================
// HELPER — STATUS BADGE
// ============================================================
const StatusBadge = ({ status }) => {
  const normalized = status ? status.toLowerCase() : "";
  let badgeStyle = "bg-gray-100 text-gray-600 border-gray-200";
  let Icon = Circle;

  if (normalized === "completed" || normalized === "active" || normalized === "approved") {
    badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
    Icon = CheckCircle2;
  } else if (normalized === "pending" || normalized === "scheduled") {
    badgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
    Icon = Clock;
  } else if (normalized === "rejected" || normalized === "cancelled") {
    badgeStyle = "bg-red-50 text-red-700 border-red-200";
    Icon = AlertCircle;
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeStyle}`}>
      <Icon size={11} />
      <span className="capitalize">{status || "Unknown"}</span>
    </span>
  );
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
          {payload[0].value} {payload[0].name.toLowerCase().includes("member") ? "" : "count"}
        </p>
      </div>
    );
  }
  return null;
};

// ============================================================
// HELPER — EMPTY STATE
// ============================================================
const EmptyState = ({ message = "No data available" }) => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
      <InboxIcon size={18} className="text-gray-400" />
    </div>
    <p className="text-sm text-gray-400">{message}</p>
  </div>
);

// ============================================================
// HELPER — WARD LOCATION BANNER
// ============================================================
const WardLocationBanner = () => {
  const locationData = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("locationData")) || null;
    } catch {
      return null;
    }
  }, []);

  if (!locationData) return null;

  const crumbs = [
    { label: locationData.districtName, icon: MapPin, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
    { label: locationData.talukaName, icon: Flag, color: "text-purple-600", bg: "bg-purple-50 border-purple-100" },
    { label: locationData.wardName, icon: MapPin, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm px-5 py-3.5 flex flex-wrap items-center gap-3">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest mr-1">
        Assigned Ward
      </span>
      {crumbs.map((c, i) => {
        const Icon = c.icon;
        return (
          <React.Fragment key={c.label}>
            {i > 0 && <ChevronRight size={13} className="text-gray-300 flex-shrink-0" />}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.color}`}>
              <Icon size={12} />
              {c.label}
            </span>
          </React.Fragment>
        );
      })}
      <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        Ward Scoped Data
      </span>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT — WARD CHAIRMAN DASHBOARD
// ============================================================
const WardChairmanDashboard = () => {
  const [activeTab, setActiveTab] = useState("members");
  const [memberSearch, setMemberSearch] = useState("");

  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const token = useSelector((state) => state.auth.token);
  const wardInfo = useSelector(selectWardInfo);

  // ── Redux state selectors ─────────────────────────────────
  const wardUsers = useSelector((s) => s.dashboard.wardUsers) || [];
  const wardUsersTotal = useSelector((s) => s.dashboard.wardUsersTotal) || 0;
  const wardUsersLoading = useSelector((s) => s.dashboard.wardUsersLoading);
  const wardUsersError = useSelector((s) => s.dashboard.wardUsersError);

  const cpPartnerList = useSelector((s) => s.cpOnboarding.cpPartnerList) || [];
  const cpPartnerListStatus = useSelector((s) => s.cpOnboarding.cpPartnerListStatus);

  const cpApplications = useSelector((s) => s.cpOnboarding.cpApplications) || [];
  const cpApplicationsStatus = useSelector((s) => s.cpOnboarding.cpApplicationsStatus);

  const cpInterviews = useSelector((s) => s.cpOnboarding.cpInterviews) || [];
  const cpInterviewsStatus = useSelector((s) => s.cpOnboarding.cpInterviewsStatus);

  const submissions = useSelector((s) => s.cpOnboarding.submissions) || [];

  const routes = useSelector((s) => s.routeTracking.routes) || [];
  const routesStatus = useSelector((s) => s.routeTracking.status);

  // ── 1. Fetch Ward Location & Chairman Specific Data ────────
  useEffect(() => {
    if (user?.userId) {
      dispatch(getLocationByWardHeadId(user.userId));
      dispatch(fetchCloudPatraInterviewsByWardChairman(user.userId));
      dispatch(fetchCpSubmissions(user.userId));
      if (token) {
        dispatch(getAllRoutesByChairman({ wardChairmanId: user.userId, token }));
      }
    }
  }, [dispatch, user?.userId, token]);

  // ── 2. Fetch Ward Scoped Data when Ward Name / Id Available 
  useEffect(() => {
    let wardName = wardInfo?.wardName;
    let wardId = wardInfo?.wardId;

    if (!wardName || !wardId) {
      try {
        const loc = JSON.parse(localStorage.getItem("locationData"));
        if (loc?.wardName) wardName = loc.wardName;
        if (loc?.wardId) wardId = loc.wardId;
      } catch {}
    }

    if (wardName) {
      dispatch(fetchUsersByWard(wardName));
    }
    if (wardId) {
      dispatch(fetchChannelPartnersByWard(wardId));
      dispatch(fetchCloudPatraApplicationsByWard(wardId));
    }
  }, [dispatch, wardInfo?.wardId, wardInfo?.wardName]);

  // ── Derived Data & Metrics ────────────────────────────────
  const totalWardMembers = wardInfo?.totalWardChartMembers ?? null;
  const wardChartMembers = wardInfo?.wardChartMembers ?? [];
  const activeCount = useMemo(() => wardChartMembers.filter((m) => m.isActive === true).length, [wardChartMembers]);
  const inactiveCount = useMemo(() => wardChartMembers.filter((m) => m.isActive === false).length, [wardChartMembers]);

  // Ward Committee Donut Data
  const memberStatusData = useMemo(() => {
    if (wardChartMembers.length === 0) return [];
    return [
      { name: "Active", value: activeCount, color: "#10B981" },
      { name: "Inactive", value: inactiveCount, color: "#E5E7EB" },
    ];
  }, [wardChartMembers, activeCount, inactiveCount]);

  const totalCommitteeCount = useMemo(() => memberStatusData.reduce((s, d) => s + d.value, 0), [memberStatusData]);

  // Registered Ward Citizens Plan Distribution
  const primeCount = useMemo(() => wardUsers.filter((u) => u.isPrime).length, [wardUsers]);
  const basicCount = useMemo(() => wardUsers.filter((u) => u.isBasic && !u.isPrime).length, [wardUsers]);
  const freeCount = useMemo(() => wardUsers.filter((u) => !u.isPrime && !u.isBasic).length, [wardUsers]);

  const memberPlanData = useMemo(() => {
    if (wardUsers.length === 0) return [];
    return [
      { name: "Prime Plan", value: primeCount, color: "#8B5CF6" },
      { name: "Basic Plan", value: basicCount, color: "#3B82F6" },
      { name: "Free Plan", value: freeCount, color: "#94A3B8" },
    ].filter((d) => d.value > 0);
  }, [wardUsers.length, primeCount, basicCount, freeCount]);

  const totalPlanUsers = useMemo(() => memberPlanData.reduce((s, d) => s + d.value, 0), [memberPlanData]);

  // CP & Onboarding Counters
  const activeCPsCount = useMemo(() => (Array.isArray(cpPartnerList) ? cpPartnerList.length : 0), [cpPartnerList]);
  const pendingAppsCount = useMemo(() => {
    if (!Array.isArray(cpApplications)) return 0;
    return cpApplications.filter((a) => (a.status || "").toLowerCase() === "pending").length;
  }, [cpApplications]);
  const scheduledInterviewsCount = useMemo(() => (Array.isArray(cpInterviews) ? cpInterviews.length : 0), [cpInterviews]);
  const activeRoutesCount = useMemo(() => (Array.isArray(routes) ? routes.length : 0), [routes]);

  // Filtered members by search term
  const filteredWardUsers = useMemo(() => {
    if (!memberSearch.trim()) return wardUsers;
    const term = memberSearch.toLowerCase();
    return wardUsers.filter(
      (u) =>
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.mobileNumber?.includes(term) ||
        u.pincode?.includes(term)
    );
  }, [wardUsers, memberSearch]);


  // ── Summary KPI Cards ──────────────────────────────────────
  const summaryCards = [
    {
      label: "Total Ward Members",
      value: wardUsersLoading ? "..." : String(wardUsersTotal || wardUsers.length || 0),
      sub: "Registered citizens in ward",
      hasData: (wardUsersTotal || wardUsers.length) > 0,
      icon: Users,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Ward Committee",
      value: totalWardMembers !== null ? String(totalWardMembers) : "0",
      sub: `Active: ${activeCount} | Inactive: ${inactiveCount}`,
      hasData: totalWardMembers !== null && totalWardMembers > 0,
      icon: ShieldCheck,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      label: "Channel Partners",
      value: cpPartnerListStatus === "loading" ? "..." : String(activeCPsCount),
      sub: "Active CPs in ward",
      hasData: activeCPsCount > 0,
      icon: Briefcase,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      label: "CP Applications",
      value: cpApplicationsStatus === "loading" ? "..." : String(cpApplications.length),
      sub: `${pendingAppsCount} pending review`,
      hasData: cpApplications.length > 0,
      icon: InboxIcon,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      label: "Scheduled Interviews",
      value: cpInterviewsStatus === "loading" ? "..." : String(scheduledInterviewsCount),
      sub: "CP interview schedule",
      hasData: scheduledInterviewsCount > 0,
      icon: Calendar,
      iconBg: "bg-cyan-50",
      iconColor: "text-cyan-600",
    },
    {
      label: "Active Field Routes",
      value: routesStatus === "loading" ? "..." : String(activeRoutesCount),
      sub: "Assigned CP field routes",
      hasData: activeRoutesCount > 0,
      icon: Navigation,
      iconBg: "bg-rose-50",
      iconColor: "text-rose-600",
    },
  ];

  return (
    <div className="p-6 bg-gray-50/60 min-h-screen space-y-6">

      {/* ── PAGE HEADER ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Ward Chairman Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Ward operations, member analytics & live field updates</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/wardChairman/area-chart"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <BarChart2 size={16} />
            View Booth Chart
          </Link>
        </div>
      </div>

      {/* ── WARD LOCATION BANNER ─────────────────────────────── */}
      <WardLocationBanner />


      {/* ── SUMMARY KPI CARDS (6) ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-4 flex flex-col justify-between gap-3 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-medium text-gray-500 leading-tight">
                  {card.label}
                </span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${card.iconBg}`}>
                  <Icon size={16} className={card.iconColor} />
                </div>
              </div>

              <div>
                <p className={`text-2xl font-bold leading-none tracking-tight ${card.hasData ? "text-gray-900" : "text-gray-400"}`}>
                  {card.value}
                </p>
                <span className={`inline-flex items-center gap-1 text-[11px] font-medium mt-2 px-2 py-0.5 rounded-md ${card.hasData ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                  {card.sub}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── SECTION 2 — ANALYTICS CHARTS ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* LEFT — Member Plan Distribution */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Users size={16} className="text-blue-600" />
                Member Plan Breakdown
              </h2>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {wardUsers.length} Users
              </span>
            </div>
            <p className="text-xs text-gray-400">Distribution of registered ward citizens by tier</p>
          </div>

          {memberPlanData.length === 0 ? (
            <EmptyState message="No member subscription data available." />
          ) : (
            <div className="mt-4">
              <div className="h-44 flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={memberPlanData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {memberPlanData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<DonutTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-gray-800">{totalPlanUsers}</span>
                  <span className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">Members</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-100">
                {memberPlanData.map((d) => (
                  <div key={d.name} className="text-center p-1.5 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-center gap-1.5 mb-0.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                      <span className="text-[11px] font-medium text-gray-600">{d.name}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-800">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* MIDDLE — Committee Active Status */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600" />
                Ward Committee Status
              </h2>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {wardChartMembers.length} Posts
              </span>
            </div>
            <p className="text-xs text-gray-400">Active vs vacant ward committee positions</p>
          </div>

          {memberStatusData.length === 0 ? (
            <EmptyState message="No ward committee chart data available." />
          ) : (
            <div className="mt-4">
              <div className="h-44 flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={memberStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
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

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-gray-800">{totalCommitteeCount}</span>
                  <span className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">Committee</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-100">
                {memberStatusData.map((d) => (
                  <div key={d.name} className="text-center p-1.5 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-center gap-1.5 mb-0.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                      <span className="text-[11px] font-medium text-gray-600">{d.name}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-800">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Onboarding & Activity Pipeline */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Briefcase size={16} className="text-purple-600" />
                CP & Onboarding Summary
              </h2>
              <Link to="/ward-chairman/cp/applications" className="text-xs font-medium text-purple-600 hover:underline">
                View All
              </Link>
            </div>
            <p className="text-xs text-gray-400">Overview of Channel Partner activity in ward</p>
          </div>

          <div className="space-y-3 my-auto py-2">
            <div className="p-3 bg-purple-50/60 rounded-lg border border-purple-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                  <InboxIcon size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">CP Applications</p>
                  <p className="text-[11px] text-gray-500">{pendingAppsCount} pending evaluation</p>
                </div>
              </div>
              <span className="text-lg font-bold text-purple-700">{cpApplications.length}</span>
            </div>

            <div className="p-3 bg-cyan-50/60 rounded-lg border border-cyan-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-100 text-cyan-700">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">Scheduled Interviews</p>
                  {/* <p className="text-[11px] text-gray-500">Cloud Patra CP interviews</p> */}
                </div>
              </div>
              <span className="text-lg font-bold text-cyan-700">{cpInterviews.length}</span>
            </div>

            <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                  <FileText size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">CP Form Submissions</p>
                  <p className="text-[11px] text-gray-500">Form entries recorded by CPs</p>
                </div>
              </div>
              <span className="text-lg font-bold text-amber-700">{submissions.length}</span>
            </div>
          </div>

          {/* <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Active Routes: <strong className="text-gray-800">{routes.length}</strong></span>
            <Link to="/wardChairman-head-dashboard/cp-route-tracking" className="text-blue-600 hover:underline inline-flex items-center gap-1">
              Route Tracker <ExternalLink size={11} />
            </Link>
          </div> */}
        </div>

      </div>

      {/* ── SECTION 3 — INTERACTIVE MULTI-TAB WORKSPACE ───────── */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
        
        {/* TAB NAVIGATION HEADER */}
        <div className="border-b border-gray-200 bg-gray-50/50 px-5 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("members")}
              className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
                activeTab === "members"
                  ? "border-blue-600 text-blue-600 bg-white shadow-2xs"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/60"
              }`}
            >
              <Users size={15} />
              Ward Members
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-700">
                {wardUsers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("cps")}
              className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
                activeTab === "cps"
                  ? "border-purple-600 text-purple-600 bg-white shadow-2xs"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/60"
              }`}
            >
              <Briefcase size={15} />
              Channel Partners
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-purple-100 text-purple-700">
                {cpPartnerList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("applications")}
              className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
                activeTab === "applications"
                  ? "border-amber-600 text-amber-600 bg-white shadow-2xs"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/60"
              }`}
            >
              <InboxIcon size={15} />
              Applications & Interviews
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-700">
                {cpApplications.length + cpInterviews.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("routes")}
              className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
                activeTab === "routes"
                  ? "border-rose-600 text-rose-600 bg-white shadow-2xs"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/60"
              }`}
            >
              <Navigation size={15} />
              Field Routes
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-700">
                {routes.length}
              </span>
            </button>
          </div>

          {/* SEARCH BAR (For Members Tab) */}
          {activeTab === "members" && (
            <div className="relative pb-3 md:pb-2">
              <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, mobile, pincode..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 w-full md:w-64 shadow-2xs"
              />
            </div>
          )}
        </div>

        {/* TAB CONTENTS */}
        <div className="p-5">

          {/* TAB 1: WARD MEMBERS */}
          {activeTab === "members" && (
            <div>
              {wardUsersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                </div>
              ) : wardUsersError ? (
                <EmptyState message={wardUsersError} />
              ) : filteredWardUsers.length === 0 ? (
                <EmptyState message={memberSearch ? "No members match your search." : "No registered members found in this ward."} />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/70 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <th className="px-4 py-3">Member Name</th>
                        <th className="px-4 py-3">Mobile Number</th>
                        <th className="px-4 py-3">Gender</th>
                        <th className="px-4 py-3">District</th>
                        <th className="px-4 py-3">Pincode</th>
                        <th className="px-4 py-3">Membership Plan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredWardUsers.slice(0, 10).map((u) => (
                        <tr key={u.userId || u._id || u.mobileNumber} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-700 font-semibold text-xs">
                                {u.name?.charAt(0).toUpperCase() || "U"}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-800">{u.name || "N/A"}</p>
                                <p className="text-[11px] text-gray-400">{u.email || "No email"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600 font-medium">{u.mobileNumber || "—"}</td>
                          <td className="px-4 py-3 text-xs text-gray-600">{u.gender || "—"}</td>
                          <td className="px-4 py-3 text-xs text-gray-600">{u.district || "—"}</td>
                          <td className="px-4 py-3 text-xs text-gray-600">{u.pincode || "—"}</td>
                          <td className="px-4 py-3">
                            {u.isPrime ? (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                                Prime
                              </span>
                            ) : u.isBasic ? (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                Basic
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                                Free
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span>Showing top {Math.min(10, filteredWardUsers.length)} of {filteredWardUsers.length} members</span>
                    {/* <Link to="/wardChairman-head-dashboard/members" className="text-blue-600 font-semibold hover:underline flex items-center gap-1">
                      View Full Member Directory <ChevronRight size={14} />
                    </Link> */}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CHANNEL PARTNERS */}
          {activeTab === "cps" && (
            <div>
              {cpPartnerListStatus === "loading" ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
                </div>
              ) : cpPartnerList.length === 0 ? (
                <EmptyState message="No Channel Partners found in this ward." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/70 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <th className="px-4 py-3">Partner Name</th>
                        <th className="px-4 py-3">Contact</th>
                        <th className="px-4 py-3">Role / Designation</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {cpPartnerList.map((cp) => (
                        <tr key={cp._id || cp.userId || cp.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 text-purple-700 font-semibold text-xs">
                                {(cp.name || cp.fullName || "C")?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-800">{cp.name || cp.fullName || "Channel Partner"}</p>
                                <p className="text-[11px] text-gray-400">{cp.email || "No email"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600 font-medium">{cp.mobileNumber || cp.phone || "—"}</td>
                          <td className="px-4 py-3 text-xs text-gray-600">{cp.role || "Channel Partner"}</td>
                          <td className="px-4 py-3">
                            <StatusBadge status={cp.status || (cp.isActive ? "Active" : "Pending")} />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              to={`/wardChairman-head-dashboard/members/channelPartners/${cp._id || cp.userId || cp.id}`}
                              className="text-xs font-semibold text-purple-600 hover:text-purple-800 hover:underline"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: APPLICATIONS & INTERVIEWS */}
          {activeTab === "applications" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Applications Card */}
              <div className="border border-gray-200/80 rounded-xl p-4 bg-gray-50/40">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                  <h3 className="text-xs font-semibold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                    <InboxIcon size={14} className="text-amber-600" />
                    CP Applications ({cpApplications.length})
                  </h3>
                  <Link to="/ward-chairman/cp/applications" className="text-xs font-semibold text-amber-600 hover:underline">
                    Manage Onboarding
                  </Link>
                </div>

                {cpApplications.length === 0 ? (
                  <EmptyState message="No CP applications submitted yet." />
                ) : (
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {cpApplications.map((app) => (
                      <div key={app._id || app.applicationId} className="p-3 bg-white border border-gray-200/70 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{app.applicantName || app.name || "Applicant"}</p>
                          <p className="text-[11px] text-gray-400">{app.contactNumber || app.mobileNumber || "No contact"}</p>
                        </div>
                        <StatusBadge status={app.status || "Pending"} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Scheduled Interviews Card */}
              <div className="border border-gray-200/80 rounded-xl p-4 bg-gray-50/40">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                  <h3 className="text-xs font-semibold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                    <Calendar size={14} className="text-cyan-600" />
                    Scheduled Interviews ({cpInterviews.length})
                  </h3>
                  <Link to="/ward-chairman/cp/interviews" className="text-xs font-semibold text-cyan-600 hover:underline">
                    View Schedule
                  </Link>
                </div>

                {cpInterviews.length === 0 ? (
                  <EmptyState message="No interviews scheduled yet." />
                ) : (
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {cpInterviews.map((iv) => (
                      <div key={iv._id || iv.interviewId} className="p-3 bg-white border border-gray-200/70 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{iv.candidateName || iv.name || "Candidate"}</p>
                          <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <Clock size={11} /> {iv.interviewDate || iv.date || "Scheduled"} {iv.interviewTime ? `at ${iv.interviewTime}` : ""}
                          </p>
                        </div>
                        <StatusBadge status={iv.status || "Scheduled"} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 4: FIELD ROUTES */}
          {activeTab === "routes" && (
            <div>
              {routesStatus === "loading" ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 rounded-full border-2 border-rose-600 border-t-transparent animate-spin" />
                </div>
              ) : routes.length === 0 ? (
                <EmptyState message="No field tracking routes created yet." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/70 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <th className="px-4 py-3">Route Title / Name</th>
                        <th className="px-4 py-3">Assigned Channel Partner</th>
                        <th className="px-4 py-3">Distance & Duration</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {routes.map((rt) => (
                        <tr key={rt._id || rt.id || rt.routeId} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-4 py-3">
                            <p className="text-xs font-semibold text-gray-800">{rt.routeName || rt.title || "Field Route"}</p>
                            <p className="text-[11px] text-gray-400">{rt.startLocation || "Start"} → {rt.endLocation || "End"}</p>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600 font-medium">
                            {rt.channelPartnerName || rt.assignedTo || "Unassigned"}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600">
                            {rt.distance ? `${rt.distance} km` : "—"} {rt.duration ? `(${rt.duration})` : ""}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={rt.status || "Active"} />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              to="/wardChairman-head-dashboard/cp-route-tracking"
                              className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline flex items-center justify-end gap-1"
                            >
                              View Data <ArrowUpRight size={13} />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default WardChairmanDashboard;