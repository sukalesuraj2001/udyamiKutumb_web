// ============================================================
// SuperAdmin.jsx - Executive Command Center & Strategic Platform Hub
// ============================================================

import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Users,
  Map as MapIcon,
  UserCheck,
  BarChart2,
  InboxIcon,
  RefreshCw,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Grid,
  List,
  Award,
  ArrowRight,
  TrendingUp,
  MapPin,
  Building2,
  Phone,
  Mail,
  Download,
  Flag,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  UserPlus,
  Globe,
  Settings,
  Layers,
  Briefcase,
  Newspaper,
  Sliders,
  Crown,
  UserX,
  PlusCircle,
  Layers3,
} from "lucide-react";

import { fetchDashboard } from "../redux/slices/dashboardSlice.js";
import { fetchHeadsByRole } from "../redux/slices/headSlice.js";
import { fetchDistricts, fetchTalukasByDistrict } from "../redux/slices/wardSlice.js";
import { fetchChannelPartners } from "../redux/slices/areaChartSlice.js";
import { ROLES } from "../utils/roles.js";

// ============================================================
// HELPERS & REUSABLE COMPONENTS
// ============================================================

const EmptyState = ({ message = "No data available", icon: Icon = InboxIcon }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 text-gray-400">
      <Icon size={20} />
    </div>
    <p className="text-sm font-medium text-gray-500">{message}</p>
  </div>
);

const DonutTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs">
        <p className="text-gray-500 mb-0.5">{payload[0].name}</p>
        <p className="font-semibold" style={{ color: payload[0].payload.color }}>
          {payload[0].value.toLocaleString()} members
        </p>
      </div>
    );
  }
  return null;
};

const BarTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs">
        <p className="font-semibold text-gray-800 mb-0.5">{payload[0].payload.name}</p>
        <p className="text-blue-600 font-medium">
          {payload[0].value.toLocaleString()} Members
        </p>
      </div>
    );
  }
  return null;
};

/** Normalizes leadership record across APIs */
const extractLeaderDetails = (item, roleLabel) => {
  if (!item) return null;

  let name =
    item.name ||
    item.fullName ||
    (item.firstName ? `${item.firstName} ${item.lastName || ""}`.trim() : "") ||
    item.userName;

  let email = item.email || item.emailAddress;
  let mobile = item.mobile || item.mobileNumber || item.phone;
  let wardName = item.wardHobli || item.wardName || item.ward || item.ward_name;
  let talukaName = item.taluk || item.talukaName || item.taluka || item.constituency;
  let districtName = item.district || item.districtName;
  let stateName = item.state || "Karnataka";

  if (!name) return null;

  return {
    id: item.id || item.userId || item._id || `${name}_${roleLabel}`,
    name,
    email: email || "—",
    mobile: mobile || "—",
    role: roleLabel,
    wardName: wardName || "—",
    talukaName: talukaName || "—",
    districtName: districtName || "—",
    stateName: stateName || "—",
    status: item.status || "Active",
  };
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function SuperAdmin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ── Navigation & Filter State ──────────────────────────────
  const [activeTab, setActiveTab] = useState("overview"); // overview | districts | leadership | members | channelPartners | governance
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState("ALL");
  const [districtSearchQuery, setDistrictSearchQuery] = useState("");
  
  // Leadership tab filters & view state
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("ALL"); // ALL | DISTRICT_HEAD | TALUKA_HEAD | WARD_CHAIRMAN
  const [leadershipSearchQuery, setLeadershipSearchQuery] = useState("");
  const [leadershipViewMode, setLeadershipViewMode] = useState("grid"); // "grid" | "list"
  const [leadershipPage, setLeadershipPage] = useState(1);
  const leadershipItemsPerPage = 10;

  // Members directory filters & limit state
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [memberPlanFilter, setMemberPlanFilter] = useState("ALL"); // ALL | PRIME | BASIC | FREE
  const [memberPage, setMemberPage] = useState(1);
  const [memberItemsPerPage, setMemberItemsPerPage] = useState(10); // 10 | 25 | 50 | 100

  // Channel partners filter state
  const [cpSearchQuery, setCpSearchQuery] = useState("");

  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── Redux Selectors ──────────────────────────────────────
  // 1. Dashboard slice
  const { stats, users: allPlatformUsers, userDistribution, loading: dashboardLoading } = useSelector(
    (s) => s.dashboard
  );

  // 2. Districts list from Ward slice
  const districtsFromWardSlice = useSelector((s) => s.ward?.districts || []);

  // 3. District Heads
  const EMPTY_HEAD = { data: [], loading: false, error: null };
  const districtHeadsState = useSelector((s) => s.head?.[ROLES.DISTRICT_HEAD] ?? EMPTY_HEAD);
  const districtHeadsStateAlt = useSelector((s) => s.head?.["DistrictHead"] ?? EMPTY_HEAD);
  const districtHeads = useMemo(
    () => [...(districtHeadsState.data || []), ...(districtHeadsStateAlt.data || [])],
    [districtHeadsState.data, districtHeadsStateAlt.data]
  );

  // 4. Taluka Heads
  const talukaHeadsState1 = useSelector((s) => s.head?.[ROLES.TALUKA_HEAD] ?? EMPTY_HEAD);
  const talukaHeadsState2 = useSelector((s) => s.head?.["TalukHead"] ?? EMPTY_HEAD);
  const talukaHeadsState3 = useSelector((s) => s.head?.["TalukaHead"] ?? EMPTY_HEAD);
  const talukaHeads = useMemo(
    () => [
      ...(talukaHeadsState1.data || []),
      ...(talukaHeadsState2.data || []),
      ...(talukaHeadsState3.data || []),
    ],
    [talukaHeadsState1.data, talukaHeadsState2.data, talukaHeadsState3.data]
  );

  // 5. Ward Chairmen
  const wardChairmenState1 = useSelector((s) => s.head?.[ROLES.WARD_CHAIRMAN] ?? EMPTY_HEAD);
  const wardChairmenState2 = useSelector((s) => s.head?.["WardChairman"] ?? EMPTY_HEAD);
  const wardChairmen = useMemo(
    () => [...(wardChairmenState1.data || []), ...(wardChairmenState2.data || [])],
    [wardChairmenState1.data, wardChairmenState2.data]
  );

  // 6. Channel Partners
  const channelPartners = useSelector((s) => s.areaChart?.channelPartners || []);
  const channelPartnersLoading = useSelector(
    (s) => s.areaChart?.channelPartnersStatus === "loading"
  );

  // ── Initial Data Fetching ────────────────────────────────
  const loadSuperAdminData = React.useCallback(async () => {
    setIsRefreshing(true);
    try {
      dispatch(fetchDashboard());
      dispatch(fetchDistricts());
      dispatch(fetchChannelPartners({ limit: 200 }));

      // Fetch all leadership role variants
      dispatch(fetchHeadsByRole(ROLES.DISTRICT_HEAD));
      dispatch(fetchHeadsByRole("DistrictHead"));

      dispatch(fetchHeadsByRole(ROLES.TALUKA_HEAD));
      dispatch(fetchHeadsByRole("TalukHead"));
      dispatch(fetchHeadsByRole("TalukaHead"));

      dispatch(fetchHeadsByRole(ROLES.WARD_CHAIRMAN));
      dispatch(fetchHeadsByRole("WardChairman"));
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }, [dispatch]);

  useEffect(() => {
    loadSuperAdminData();
  }, [loadSuperAdminData]);

  // Reset leadership pagination when filters change
  useEffect(() => {
    setLeadershipPage(1);
  }, [leadershipSearchQuery, selectedDistrictFilter, selectedRoleFilter, leadershipViewMode]);

  // Reset member pagination when filters change
  useEffect(() => {
    setMemberPage(1);
  }, [memberSearchQuery, selectedDistrictFilter, memberPlanFilter, memberItemsPerPage]);

  // ── Derived Data & Analytics ──────────────────────────────

  // 1. Normalized Districts List
  const masterDistrictsList = useMemo(() => {
    const map = new Map();

    // From ward slice
    districtsFromWardSlice.forEach((d) => {
      const name = d.districtName || d.name;
      if (name && !map.has(name.toLowerCase())) {
        map.set(name.toLowerCase(), {
          id: d.districtId || d.id || name,
          name,
          state: d.state || "Karnataka",
          talukaCount: d.talukaCount || 0,
        });
      }
    });

    // From members & heads
    (allPlatformUsers || []).forEach((u) => {
      const dName = u.district || u.districtName;
      if (dName && dName !== "—" && !map.has(dName.toLowerCase())) {
        map.set(dName.toLowerCase(), {
          id: dName,
          name: dName,
          state: u.state || "Karnataka",
          talukaCount: 0,
        });
      }
    });

    districtHeads.forEach((dh) => {
      const dName = dh.district || dh.districtName;
      if (dName && dName !== "—" && !map.has(dName.toLowerCase())) {
        map.set(dName.toLowerCase(), {
          id: dName,
          name: dName,
          state: dh.state || "Karnataka",
          talukaCount: 0,
        });
      }
    });

    return Array.from(map.values());
  }, [districtsFromWardSlice, allPlatformUsers, districtHeads]);

  // Filtered members based on global District filter & tab filters
  const filteredPlatformMembers = useMemo(() => {
    return (allPlatformUsers || []).filter((u) => {
      const uDistrict = u.district || u.districtName;

      // Global District Filter
      if (selectedDistrictFilter !== "ALL") {
        if (!uDistrict || uDistrict.toLowerCase() !== selectedDistrictFilter.toLowerCase()) {
          return false;
        }
      }

      // Plan Filter
      if (memberPlanFilter === "PRIME" && !u.isPrime) return false;
      if (memberPlanFilter === "BASIC" && (!u.isBasic || u.isPrime)) return false;
      if (memberPlanFilter === "FREE" && (u.isPrime || u.isBasic)) return false;

      // Search Query
      if (memberSearchQuery.trim()) {
        const q = memberSearchQuery.toLowerCase();
        const nameMatch = u.name?.toLowerCase().includes(q);
        const mobileMatch = u.mobileNumber?.includes(q);
        const wardMatch = u.ward?.toLowerCase().includes(q);
        const districtMatch = uDistrict?.toLowerCase().includes(q);
        return nameMatch || mobileMatch || wardMatch || districtMatch;
      }

      return true;
    });
  }, [allPlatformUsers, selectedDistrictFilter, memberPlanFilter, memberSearchQuery]);

  // Paginated Members for Directory
  const totalMemberPages = Math.ceil(filteredPlatformMembers.length / memberItemsPerPage) || 1;
  const paginatedPlatformMembers = useMemo(() => {
    const start = (memberPage - 1) * memberItemsPerPage;
    return filteredPlatformMembers.slice(start, start + memberItemsPerPage);
  }, [filteredPlatformMembers, memberPage, memberItemsPerPage]);

  // 2. Master Unified Leadership Directory (District Heads, Taluka Heads, Ward Chairmen)
  const masterLeadershipDirectory = useMemo(() => {
    const map = new Map();

    const addLeader = (item, roleLabel) => {
      const details = extractLeaderDetails(item, roleLabel);
      if (details) {
        const key = `${details.role}_${(details.districtName || "").toLowerCase()}_${(details.name || "").toLowerCase()}`;
        if (!map.has(key)) map.set(key, details);
      }
    };

    districtHeads.forEach((dh) => addLeader(dh, "District Head"));
    talukaHeads.forEach((th) => addLeader(th, "Taluka Head"));
    wardChairmen.forEach((wc) => addLeader(wc, "Ward Chairman"));

    return Array.from(map.values());
  }, [districtHeads, talukaHeads, wardChairmen]);

  // Filtered Leadership Directory
  const filteredLeadershipList = useMemo(() => {
    return masterLeadershipDirectory.filter((leader) => {
      // Global District Filter
      if (selectedDistrictFilter !== "ALL") {
        if (
          leader.districtName &&
          leader.districtName !== "—" &&
          leader.districtName.toLowerCase() !== selectedDistrictFilter.toLowerCase()
        ) {
          return false;
        }
      }

      // Role Filter
      if (selectedRoleFilter === "DISTRICT_HEAD" && leader.role !== "District Head") return false;
      if (selectedRoleFilter === "TALUKA_HEAD" && leader.role !== "Taluka Head") return false;
      if (selectedRoleFilter === "WARD_CHAIRMAN" && leader.role !== "Ward Chairman") return false;

      // Search Query
      if (leadershipSearchQuery.trim()) {
        const q = leadershipSearchQuery.toLowerCase();
        const nameMatch = leader.name.toLowerCase().includes(q);
        const wardMatch = leader.wardName.toLowerCase().includes(q);
        const talukaMatch = leader.talukaName.toLowerCase().includes(q);
        const districtMatch = leader.districtName.toLowerCase().includes(q);
        const mobileMatch = leader.mobile.includes(q);
        return nameMatch || wardMatch || talukaMatch || districtMatch || mobileMatch;
      }

      return true;
    });
  }, [masterLeadershipDirectory, selectedDistrictFilter, selectedRoleFilter, leadershipSearchQuery]);

  // Paginated Leadership
  const totalLeadershipPages = Math.ceil(filteredLeadershipList.length / leadershipItemsPerPage) || 1;
  const paginatedLeadershipList = useMemo(() => {
    if (leadershipViewMode === "grid") return filteredLeadershipList;
    const start = (leadershipPage - 1) * leadershipItemsPerPage;
    return filteredLeadershipList.slice(start, start + leadershipItemsPerPage);
  }, [filteredLeadershipList, leadershipViewMode, leadershipPage]);

  // 3. Platform Counts & KPIs
  const totalMembersCount = stats?.totalUsers || allPlatformUsers.length || 0;
  const freeCount = stats?.freeUsers || allPlatformUsers.filter((u) => !u.isPrime && !u.isBasic).length;
  const basicCount = stats?.basicUsers || allPlatformUsers.filter((u) => u.isBasic && !u.isPrime).length;
  const primeCount = stats?.primeUsers || allPlatformUsers.filter((u) => u.isPrime).length;

  const totalDistrictsCount = masterDistrictsList.length || 28;
  const assignedDistrictHeadsCount = useMemo(() => {
    const set = new Set();
    districtHeads.forEach((dh) => {
      const dName = dh.district || dh.districtName;
      if (dName && dName !== "—") set.add(dName.toLowerCase());
    });
    return set.size;
  }, [districtHeads]);

  const districtHeadCoveragePercent = totalDistrictsCount
    ? Math.round((assignedDistrictHeadsCount / totalDistrictsCount) * 100)
    : 0;

  const activeTalukaHeadsCount = useMemo(() => {
    const set = new Set();
    talukaHeads.forEach((th) => {
      const name = th.name;
      if (name) set.add(name.toLowerCase());
    });
    return set.size;
  }, [talukaHeads]);

  const activeWardChairmenCount = useMemo(() => {
    const set = new Set();
    wardChairmen.forEach((wc) => {
      const name = wc.name;
      if (name) set.add(name.toLowerCase());
    });
    return set.size;
  }, [wardChairmen]);

  // Membership Plan Donut Data
  const memberStatusData = useMemo(() => {
    if (!totalMembersCount) return [];
    return [
      { name: "Prime Members", value: primeCount, color: "#8B5CF6" },
      { name: "Basic Members", value: basicCount, color: "#3B82F6" },
      { name: "Free Members", value: freeCount, color: "#9CA3AF" },
    ].filter((d) => d.value > 0);
  }, [totalMembersCount, primeCount, basicCount, freeCount]);

  // District Member Distribution Bar Chart Data
  const districtMemberDistribution = useMemo(() => {
    const counts = {};
    (allPlatformUsers || []).forEach((u) => {
      const dName = u.district || u.districtName || "Unassigned";
      if (dName && dName !== "—") {
        counts[dName] = (counts[dName] || 0) + 1;
      }
    });

    return Object.keys(counts)
      .map((dName) => ({
        name: dName,
        members: counts[dName],
      }))
      .sort((a, b) => b.members - a.members)
      .slice(0, 10);
  }, [allPlatformUsers]);

  // Filtered Channel Partners List
  const filteredChannelPartners = useMemo(() => {
    let list = channelPartners;
    if (selectedDistrictFilter !== "ALL") {
      list = list.filter((cp) => {
        const cpDistrict = cp.districtName || cp.district;
        return cpDistrict?.toLowerCase() === selectedDistrictFilter.toLowerCase();
      });
    }
    if (cpSearchQuery.trim()) {
      const q = cpSearchQuery.toLowerCase();
      list = list.filter(
        (cp) =>
          cp.businessName?.toLowerCase().includes(q) ||
          cp.contactPerson?.toLowerCase().includes(q) ||
          cp.mobileNumber?.includes(q)
      );
    }
    return list;
  }, [channelPartners, selectedDistrictFilter, cpSearchQuery]);

  // Top KPI Cards Config
  const kpiCards = [
    {
      label: "Total System Members",
      value: dashboardLoading ? "…" : totalMembersCount.toLocaleString(),
      badge: `${primeCount} Prime · ${basicCount} Basic`,
      icon: Users,
      colorBg: "bg-blue-500",
      lightBg: "bg-blue-50",
      textColor: "text-blue-600",
      borderColor: "border-blue-100",
    },
    {
      label: "Districts & Coverage",
      value: `${assignedDistrictHeadsCount} / ${totalDistrictsCount}`,
      badge: `${districtHeadCoveragePercent}% Assigned`,
      icon: Globe,
      colorBg: "bg-emerald-500",
      lightBg: "bg-emerald-50",
      textColor: "text-emerald-600",
      borderColor: "border-emerald-100",
    },
    {
      label: "Active Taluka Heads",
      value: `${activeTalukaHeadsCount} Heads`,
      badge: "Across Districts",
      icon: Flag,
      colorBg: "bg-purple-500",
      lightBg: "bg-purple-50",
      textColor: "text-purple-600",
      borderColor: "border-purple-100",
    },
    {
      label: "Active Ward Chairmen",
      value: `${activeWardChairmenCount} Chairmen`,
      badge: "Ward Leadership",
      icon: ShieldCheck,
      colorBg: "bg-amber-500",
      lightBg: "bg-amber-50",
      textColor: "text-amber-600",
      borderColor: "border-amber-100",
    },
  ];

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen space-y-6">

      {/* ── HEADER & TOP ACTIONS ─────────────────────────────── */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
              SuperAdmin Command Center
            </span>
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Platform Live
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mt-1">
            Platform Executive Command Hub
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Supreme monitoring and management of all Districts, Talukas, Wards, Leaders, Members, and Channel Partners.
          </p>
        </div>

        {/* Header Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Global District Filter Selector */}
          <div className="relative">
            <select
              value={selectedDistrictFilter}
              onChange={(e) => setSelectedDistrictFilter(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-xs font-medium rounded-xl px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              <option value="ALL">All Districts in Platform</option>
              {masterDistrictsList.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
            <Filter size={13} className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Refresh Button */}
          <button
            onClick={loadSuperAdminData}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-xl transition-all"
            title="Refresh Live Data"
          >
            <RefreshCw size={13} className={isRefreshing ? "animate-spin text-purple-600" : ""} />
            <span>Refresh</span>
          </button>

          {/* Quick Create Ward Action */}
          <button
            onClick={() => navigate("/super-admin-dashboard/create-ward")}
            className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-xl shadow-sm transition-all"
          >
            <PlusCircle size={13} />
            <span>Create Ward</span>
          </button>
        </div>
      </div>

      {/* ── KPI SUMMARY CARDS ──────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`bg-white rounded-2xl p-5 border ${card.borderColor} shadow-sm hover:shadow-md transition-all flex flex-col justify-between`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">{card.label}</p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">{card.value}</h3>
                </div>
                <div className={`p-2.5 rounded-xl ${card.lightBg} ${card.textColor}`}>
                  <Icon size={20} />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${card.lightBg} ${card.textColor}`}>
                  {card.badge}
                </span>
                <Sparkles size={13} className="text-gray-300" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── TAB NAVIGATION ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-1.5 flex flex-wrap gap-1 shadow-sm overflow-x-auto">
        {[
          { id: "overview", label: "Overview & Strategic Analytics", icon: BarChart2 },
          { id: "districts", label: `Districts Hierarchy (${totalDistrictsCount})`, icon: Globe },
          { id: "leadership", label: `Leadership Directory (${masterLeadershipDirectory.length})`, icon: ShieldCheck },
          { id: "members", label: `Platform Members (${totalMembersCount.toLocaleString()})`, icon: Users },
          { id: "channelPartners", label: `Channel Partners (${channelPartners.length})`, icon: Building2 },
          { id: "governance", label: "Governance & Quick Actions", icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: OVERVIEW & ANALYTICS ─────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* BAR CHART — District Member Distribution */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <BarChart2 size={16} className="text-purple-600" />
                    Top Districts Member Breakdown
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Member counts across top districts in the platform
                  </p>
                </div>
                <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg">
                  {districtMemberDistribution.length} Districts Shown
                </span>
              </div>

              {districtMemberDistribution.length === 0 ? (
                <EmptyState message="No district member distribution data available." />
              ) : (
                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={districtMemberDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: "#6B7280" }}
                        angle={-20}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} />
                      <RechartsTooltip content={<BarTooltip />} />
                      <Bar dataKey="members" fill="#8B5CF6" radius={[6, 6, 0, 0]} barSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* DONUT CHART — Membership Plan Distribution */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <Award size={16} className="text-blue-600" />
                  Membership Plan Distribution
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Platform member plans breakdown</p>

                {memberStatusData.length === 0 ? (
                  <EmptyState message="No member plan data available." />
                ) : (
                  <>
                    <div className="h-44 w-full my-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={memberStatusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={3}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                          >
                            {memberStatusData.map((entry) => (
                              <Cell key={entry.name} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip content={<DonutTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-2">
                      {memberStatusData.map((d) => (
                        <div key={d.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                            <span className="text-gray-600 font-medium">{d.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800">{d.value.toLocaleString()}</span>
                            <span className="text-gray-400">
                              ({totalMembersCount > 0 ? Math.round((d.value / totalMembersCount) * 100) : 0}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => setActiveTab("members")}
                className="w-full mt-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <span>View All Members</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

          {/* LEADERSHIP COVERAGE TRACKER */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600" />
              Platform Leadership Coverage Tracker
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* District Heads Coverage */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-700">District Heads Assigned</span>
                  <span className="font-bold text-emerald-600">
                    {assignedDistrictHeadsCount} / {totalDistrictsCount} ({districtHeadCoveragePercent}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, districtHeadCoveragePercent)}%` }}
                  />
                </div>
                <p className="text-[11px] text-gray-400">
                  District Heads monitoring operations across states.
                </p>
              </div>

              {/* Taluka Heads Coverage */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-700">Taluka Heads Network</span>
                  <span className="font-bold text-purple-600">
                    {activeTalukaHeadsCount} Active Heads
                  </span>
                </div>
                <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full w-full" />
                </div>
                <p className="text-[11px] text-gray-400">
                  Taluka Heads leading constituency operations.
                </p>
              </div>

              {/* Ward Chairmen Coverage */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-700">Ward Chairmen Network</span>
                  <span className="font-bold text-blue-600">
                    {activeWardChairmenCount} Active Chairmen
                  </span>
                </div>
                <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full w-full" />
                </div>
                <p className="text-[11px] text-gray-400">
                  Ward Chairmen managing local ward booths.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: DISTRICTS HIERARCHY MONITOR ──────────────── */}
      {activeTab === "districts" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-gray-800">Districts Hierarchy Monitor</h2>
              <p className="text-xs text-gray-400">
                All registered districts across the platform
              </p>
            </div>

            {/* District Search */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Search district name..."
                value={districtSearchQuery}
                onChange={(e) => setDistrictSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
            </div>
          </div>

          {masterDistrictsList.length === 0 ? (
            <EmptyState message="No districts found." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {masterDistrictsList
                .filter((d) =>
                  districtSearchQuery.trim()
                    ? d.name.toLowerCase().includes(districtSearchQuery.toLowerCase())
                    : true
                )
                .map((dist) => {
                  // Find assigned District Head
                  const assignedHead = districtHeads.find(
                    (dh) => (dh.district || dh.districtName)?.toLowerCase() === dist.name.toLowerCase()
                  );

                  // Count members in this district
                  const memberCount = (allPlatformUsers || []).filter(
                    (u) => (u.district || u.districtName)?.toLowerCase() === dist.name.toLowerCase()
                  ).length;

                  return (
                    <div
                      key={dist.name}
                      className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                              <Globe size={18} />
                            </div>
                            <div>
                              <h3 className="text-base font-bold text-gray-800">{dist.name}</h3>
                              <p className="text-xs text-gray-400">{dist.state}</p>
                            </div>
                          </div>

                          {assignedHead ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Active Head
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              Vacant Head
                            </span>
                          )}
                        </div>

                        {/* Head details section */}
                        <div className="mt-4 pt-3 border-t border-gray-50 space-y-2">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Assigned District Head
                          </p>
                          {assignedHead ? (
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                                {assignedHead.name?.charAt(0).toUpperCase()}
                              </div>
                              <div className="text-xs overflow-hidden">
                                <p className="font-semibold text-gray-800 truncate">{assignedHead.name}</p>
                                <p className="text-gray-400 truncate">{assignedHead.mobile || assignedHead.email}</p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-amber-600 italic">No District Head assigned yet.</p>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <div>
                            <span className="text-gray-400">Members</span>
                            <p className="font-bold text-gray-800">{memberCount.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">State</span>
                            <p className="font-bold text-gray-800">{dist.state}</p>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedDistrictFilter(dist.name);
                          setActiveTab("members");
                        }}
                        className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition-all"
                      >
                        <span>View District Members</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: LEADERSHIP DIRECTORY (ALL ROLES) ──────────── */}
      {activeTab === "leadership" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-gray-800">System Leadership Directory</h2>
              <p className="text-xs text-gray-400">
                All District Heads, Taluka Heads, and Ward Chairmen across the platform
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Role Filter Tabs */}
              <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold text-gray-600">
                {[
                  { id: "ALL", label: "All Roles" },
                  { id: "DISTRICT_HEAD", label: "District Heads" },
                  { id: "TALUKA_HEAD", label: "Taluka Heads" },
                  { id: "WARD_CHAIRMAN", label: "Ward Chairmen" },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRoleFilter(r.id)}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      selectedRoleFilter === r.id ? "bg-white text-purple-600 shadow-sm" : "hover:text-gray-900"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full md:w-60">
                <input
                  type="text"
                  placeholder="Search leader, ward, district..."
                  value={leadershipSearchQuery}
                  onChange={(e) => setLeadershipSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold text-gray-600">
                <button
                  onClick={() => setLeadershipViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${
                    leadershipViewMode === "grid" ? "bg-white text-purple-600 shadow-sm" : "hover:text-gray-900"
                  }`}
                  title="Grid View"
                >
                  <Grid size={15} />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  onClick={() => setLeadershipViewMode("list")}
                  className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${
                    leadershipViewMode === "list" ? "bg-white text-purple-600 shadow-sm" : "hover:text-gray-900"
                  }`}
                  title="List View"
                >
                  <List size={15} />
                  <span className="hidden sm:inline">List</span>
                </button>
              </div>
            </div>
          </div>

          {filteredLeadershipList.length === 0 ? (
            <EmptyState message="No leaders found matching your search and role criteria." />
          ) : leadershipViewMode === "grid" ? (
            /* GRID VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLeadershipList.map((leader, idx) => (
                <div
                  key={leader.id || idx}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                        {leader.name?.charAt(0).toUpperCase() || "L"}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-800">{leader.name}</h3>
                        <p className="text-xs text-purple-600 font-semibold">{leader.role}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {leader.status || "Active"}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">District:</span>
                      <span className="font-semibold text-gray-800">{leader.districtName}</span>
                    </div>
                    {leader.talukaName !== "—" && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Taluka:</span>
                        <span className="font-medium text-gray-800">{leader.talukaName}</span>
                      </div>
                    )}
                    {leader.wardName !== "—" && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Ward:</span>
                        <span className="font-medium text-gray-800">{leader.wardName}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Mobile:</span>
                      <span className="font-medium text-gray-800">{leader.mobile}</span>
                    </div>
                    {leader.email && leader.email !== "—" && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Email:</span>
                        <span className="font-medium text-gray-800 truncate max-w-[160px]" title={leader.email}>
                          {leader.email}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* LIST VIEW WITH PAGINATION */
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden space-y-2">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 bg-slate-50 text-gray-500 font-semibold uppercase tracking-wider">
                      <th className="p-3.5">Leader Name</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">District</th>
                      <th className="p-3.5">Taluka / Ward</th>
                      <th className="p-3.5">Contact (Mobile / Email)</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedLeadershipList.map((leader, idx) => (
                      <tr key={leader.id || idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center flex-shrink-0">
                              {leader.name?.charAt(0).toUpperCase() || "L"}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{leader.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                            {leader.role}
                          </span>
                        </td>
                        <td className="p-3.5 font-semibold text-gray-800">{leader.districtName}</td>
                        <td className="p-3.5 text-gray-600 font-medium">
                          {leader.wardName !== "—"
                            ? `${leader.wardName} (${leader.talukaName})`
                            : leader.talukaName !== "—"
                            ? leader.talukaName
                            : "—"}
                        </td>
                        <td className="p-3.5 text-gray-700">
                          <div>
                            <p className="font-medium text-gray-800">{leader.mobile}</p>
                            <p className="text-[11px] text-purple-600 font-medium truncate max-w-[180px]">
                              {leader.email}
                            </p>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {leader.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Leadership Pagination Bar */}
              {totalLeadershipPages > 1 && (
                <div className="p-4 border-t border-gray-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <span className="text-gray-500">
                    Showing{" "}
                    <span className="font-semibold text-gray-800">
                      {(leadershipPage - 1) * leadershipItemsPerPage + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold text-gray-800">
                      {Math.min(leadershipPage * leadershipItemsPerPage, filteredLeadershipList.length)}
                    </span>{" "}
                    of <span className="font-semibold text-gray-800">{filteredLeadershipList.length}</span> Leaders
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setLeadershipPage((prev) => Math.max(prev - 1, 1))}
                      disabled={leadershipPage === 1}
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-gray-700 flex items-center gap-1 transition-all"
                    >
                      <ChevronLeft size={13} />
                      <span>Prev</span>
                    </button>

                    {Array.from({ length: totalLeadershipPages }, (_, i) => i + 1).map((pg) => (
                      <button
                        key={pg}
                        onClick={() => setLeadershipPage(pg)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                          leadershipPage === pg
                            ? "bg-purple-600 text-white shadow-sm"
                            : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {pg}
                      </button>
                    ))}

                    <button
                      onClick={() => setLeadershipPage((prev) => Math.min(prev + 1, totalLeadershipPages))}
                      disabled={leadershipPage === totalLeadershipPages}
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-gray-700 flex items-center gap-1 transition-all"
                    >
                      <span>Next</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 4: PLATFORM MEMBERS DIRECTORY ───────────────── */}
      {activeTab === "members" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4 p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-gray-800">Platform Members Directory</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Showing {filteredPlatformMembers.length.toLocaleString()} members across all districts
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Limit Selector */}
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs text-gray-600 font-medium">
                <span className="text-gray-400">Show:</span>
                <select
                  value={memberItemsPerPage}
                  onChange={(e) => setMemberItemsPerPage(Number(e.target.value))}
                  className="bg-transparent font-semibold text-gray-800 focus:outline-none cursor-pointer"
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>

              {/* Plan Filter Tabs */}
              <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold text-gray-600">
                {["ALL", "PRIME", "BASIC", "FREE"].map((plan) => (
                  <button
                    key={plan}
                    onClick={() => setMemberPlanFilter(plan)}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      memberPlanFilter === plan ? "bg-white text-purple-600 shadow-sm" : "hover:text-gray-900"
                    }`}
                  >
                    {plan}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full md:w-56">
                <input
                  type="text"
                  placeholder="Search member, mobile, ward..."
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Members Table */}
          {dashboardLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredPlatformMembers.length === 0 ? (
            <EmptyState message="No members found matching your search and filter criteria." />
          ) : (
            <div className="bg-white rounded-2xl overflow-hidden space-y-2">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 bg-slate-50 text-gray-500 font-semibold uppercase tracking-wider">
                      <th className="p-3.5">Member</th>
                      <th className="p-3.5">Contact</th>
                      <th className="p-3.5">Taluka</th>
                      <th className="p-3.5">Ward</th>
                      <th className="p-3.5">District</th>
                      <th className="p-3.5">Membership Plan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedPlatformMembers.map((u) => (
                      <tr key={u.userId || u._id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center flex-shrink-0">
                              {u.name?.charAt(0).toUpperCase() || "M"}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{u.name}</p>
                              <p className="text-[11px] text-gray-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 font-medium text-gray-700">{u.mobileNumber || u.mobile || "—"}</td>
                        <td className="p-3.5 text-gray-600 font-medium">{u.taluka || u.talukaName || "—"}</td>
                        <td className="p-3.5 text-gray-600">{u.ward || "—"}</td>
                        <td className="p-3.5 text-gray-600 font-semibold">{u.district || u.districtName || "—"}</td>
                        <td className="p-3.5">
                          {u.isPrime ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                              Prime
                            </span>
                          ) : u.isBasic ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              Basic
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600">
                              Free
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Members Pagination Bar */}
              {totalMemberPages > 1 && (
                <div className="p-4 border-t border-gray-100 bg-slate-50 rounded-b-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <span className="text-gray-500">
                    Showing{" "}
                    <span className="font-semibold text-gray-800">
                      {(memberPage - 1) * memberItemsPerPage + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold text-gray-800">
                      {Math.min(memberPage * memberItemsPerPage, filteredPlatformMembers.length)}
                    </span>{" "}
                    of <span className="font-semibold text-gray-800">{filteredPlatformMembers.length.toLocaleString()}</span> Members
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setMemberPage((prev) => Math.max(prev - 1, 1))}
                      disabled={memberPage === 1}
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-gray-700 flex items-center gap-1 transition-all"
                    >
                      <ChevronLeft size={13} />
                      <span>Prev</span>
                    </button>

                    {/* Smart Page Buttons */}
                    {(() => {
                      const total = totalMemberPages;
                      const current = memberPage;
                      let pages = [];
                      if (total <= 7) {
                        pages = Array.from({ length: total }, (_, i) => i + 1);
                      } else if (current <= 4) {
                        pages = [1, 2, 3, 4, 5, "...", total];
                      } else if (current >= total - 3) {
                        pages = [1, "...", total - 4, total - 3, total - 2, total - 1, total];
                      } else {
                        pages = [1, "...", current - 1, current, current + 1, "...", total];
                      }

                      return pages.map((pg, idx) => (
                        <button
                          key={idx}
                          onClick={() => typeof pg === "number" && setMemberPage(pg)}
                          disabled={typeof pg !== "number"}
                          className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                            pg === current
                              ? "bg-purple-600 text-white shadow-sm"
                              : pg === "..."
                              ? "bg-transparent text-gray-400 cursor-default"
                              : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {pg}
                        </button>
                      ));
                    })()}

                    <button
                      onClick={() => setMemberPage((prev) => Math.min(prev + 1, totalMemberPages))}
                      disabled={memberPage === totalMemberPages}
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-gray-700 flex items-center gap-1 transition-all"
                    >
                      <span>Next</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 5: CHANNEL PARTNERS NETWORK ──────────────────── */}
      {activeTab === "channelPartners" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-gray-800">Channel Partners Network</h2>
              <p className="text-xs text-gray-400">
                Business partner units operating across the platform
              </p>
            </div>

            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Search partner, business name..."
                value={cpSearchQuery}
                onChange={(e) => setCpSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
            </div>
          </div>

          {channelPartnersLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredChannelPartners.length === 0 ? (
            <EmptyState message="No Channel Partners found." icon={Building2} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredChannelPartners.map((cp, idx) => (
                <div
                  key={cp.id || idx}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-800">{cp.businessName || cp.name}</h3>
                        <p className="text-xs text-gray-400">{cp.contactPerson || "Channel Partner"}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active Partner
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-50">
                    {cp.mobileNumber && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Contact:</span>
                        <span className="font-medium text-gray-800">{cp.mobileNumber}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">District:</span>
                      <span className="font-semibold text-gray-800">{cp.districtName || cp.district || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Ward:</span>
                      <span className="font-semibold text-gray-800">{cp.wardName || cp.ward || "—"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 6: GOVERNANCE & QUICK ACTIONS HUB ────────────── */}
      {activeTab === "governance" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-1">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <Settings size={18} className="text-purple-600" />
              Governance & Platform Management Quick Actions
            </h2>
            <p className="text-xs text-gray-400">
              Direct access to system administration, role configuration, sector taxonomies, and communications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: "User Role Management",
                desc: "Assign roles, set administrative permissions, and manage user access levels.",
                icon: ShieldCheck,
                path: "/admin-dashboard/users/roles",
                color: "bg-blue-50 text-blue-600",
              },
              {
                title: "Create Ward & GeoJSON",
                desc: "Create new wards, upload GeoJSON boundary files, and assign districts.",
                icon: PlusCircle,
                path: "/super-admin-dashboard/create-ward",
                color: "bg-emerald-50 text-emerald-600",
              },
              {
                title: "Business Circle Scoring",
                desc: "Configure scoring matrices, engagement points, and member ranking criteria.",
                icon: Sliders,
                path: "/admin-dashboard/business-circle/scoring",
                color: "bg-purple-50 text-purple-600",
              },
              {
                title: "Taxonomy & Sectors",
                desc: "Manage industry sectors, subsectors, and business tags.",
                icon: Layers,
                path: "/admin-dashboard/business-circle/taxonomy",
                color: "bg-amber-50 text-amber-600",
              },
              {
                title: "Communication Campaigns",
                desc: "Send bulk WhatsApp, SMS, and Email announcements across regions.",
                icon: Mail,
                path: "/super-admin-dashboard/communications",
                color: "bg-rose-50 text-rose-600",
              },
              {
                title: "Job Management",
                desc: "Review job postings, applicant queues, and employment listings.",
                icon: Briefcase,
                path: "/super-admin-dashboard/jobs",
                color: "bg-cyan-50 text-cyan-600",
              },
              {
                title: "News Management",
                desc: "Publish platform news, event updates, and official announcements.",
                icon: Newspaper,
                path: "/super-admin-dashboard/news",
                color: "bg-indigo-50 text-indigo-600",
              },
              {
                title: "Area Chart Builder",
                desc: "Build geographical layouts, assign chairmen slots, and view ward maps.",
                icon: MapIcon,
                path: "/super-admin-dashboard/area-chart",
                color: "bg-orange-50 text-orange-600",
              },
            ].map((action) => {
              const ActionIcon = action.icon;
              return (
                <div
                  key={action.title}
                  onClick={() => navigate(action.path)}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
                >
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl ${action.color}`}>
                      <ActionIcon size={22} />
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 group-hover:text-purple-700 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      {action.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}