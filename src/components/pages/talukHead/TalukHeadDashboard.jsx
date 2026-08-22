// ============================================================
// TalukHeadDashboard.jsx - Complete Taluka Head Management Hub
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
  MapPin,
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
  UserPlus,
  TrendingUp,
} from "lucide-react";

import { fetchUsersByTaluka } from "../../redux/slices/dashboardSlice.js";
import { fetchHeadsByRole } from "../../redux/slices/headSlice.js";
import {
  getLocationByWardHeadId,
  getAllWardChaimansBy,
  fetchChannelPartners,
  searchMembers,
} from "../../redux/slices/areaChartSlice.js";
import { ROLES } from "../../utils/roles.js";
import { selectUser } from "../../redux/slices/authSlice.js";
import LocationBanner from "../../common/LocationBanner.jsx";
import WardCard from "../areaChart/components/WardCard.jsx";

// ============================================================
// HELPERS & COMPONENTS
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
          {payload[0].value.toLocaleString()} Total Members
        </p>
      </div>
    );
  }
  return null;
};

/** Normalizes any Ward Chairman data structure across all backend APIs */
const extractChairmanDetails = (c) => {
  if (!c) return null;

  // 1. Direct user object fields
  let name =
    c.name ||
    c.fullName ||
    (c.firstName ? `${c.firstName} ${c.lastName || ""}`.trim() : "") ||
    c.userName;

  let email = c.email || c.emailAddress;
  let mobile = c.mobile || c.mobileNumber || c.phone;
  let wardName = c.wardHobli || c.wardName || c.ward;

  // 2. Ward object containing wardChairman or wardHead
  const wc = c.wardChairman || c.wardHead || c.wardChart?.wardHead;
  if (wc) {
    if (!name) {
      name =
        wc.name ||
        wc.fullName ||
        (wc.firstName ? `${wc.firstName} ${wc.lastName || ""}`.trim() : "") ||
        wc.memberName ||
        wc.assignedUserName;
    }
    if (!email || email === "—") email = wc.email || wc.emailAddress;
    if (!mobile || mobile === "—") mobile = wc.mobileNumber || wc.mobile || wc.phone;
  }

  // 3. Nested wardChart.members (WardChairman slot)
  if (!name && c.wardChart?.members) {
    const rawMembers = c.wardChart.members;
    let found = null;
    if (Array.isArray(rawMembers)) {
      found = rawMembers.find(
        (m) => m?.userType === "WardChairman" || m?.slotId === "ward-chairman"
      );
    } else if (typeof rawMembers === "object") {
      const wcList = rawMembers.WardChairman || rawMembers.wardChairman || rawMembers.ward_chairman;
      if (Array.isArray(wcList) && wcList.length > 0) {
        found = wcList[0];
      }
    }
    if (found) {
      name = found.name || found.memberName || found.assignedUserName || found.fullName;
      if (!email || email === "—") email = found.email;
      if (!mobile || mobile === "—") mobile = found.mobileNumber || found.mobile;
    }
  }

  // 4. Fallback for wardName
  if (!wardName || wardName === "—") {
    wardName =
      c.ward_name ||
      c.wardName ||
      (c.wardNumber || c.ward_number ? `Ward ${c.wardNumber || c.ward_number}` : "") ||
      c.wardChart?.ward?.wardName ||
      "—";
  }

  const districtName = c.district || c.districtName || c.wardChart?.district?.districtName || "—";

  return {
    id: c.userId || c.id || c.wardId || Math.random(),
    name: name ? name.trim() : "",
    hasChairman: Boolean(name && name.trim()),
    email: email || "—",
    mobile: mobile || "—",
    wardName: wardName,
    districtName: districtName,
    status: name ? "Active Chairman" : "Vacant",
  };
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const TalukHeadDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  // ── Local UI State ─────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "wards" | "chairmen" | "cps" | "members"
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWardFilter, setSelectedWardFilter] = useState("all");
  const [selectedPlanFilter, setSelectedPlanFilter] = useState("all");
  const [wardStatusFilter, setWardStatusFilter] = useState("all"); // "all" | "built" | "progress" | "empty" | "vacant"

  // ── Redux Store Selectors ──────────────────────────────────
  const talukaUsers = useSelector((s) => s.dashboard.talukaUsers || []);
  const talukaUsersTotal = useSelector((s) => s.dashboard.talukaUsersTotal || 0);
  const talukaUsersLoading = useSelector((s) => s.dashboard.talukaUsersLoading || false);

  const searchResults = useSelector((s) => s.areaChart.searchResults || []);
  const searchStatus = useSelector((s) => s.areaChart.searchStatus);

  const wards = useSelector((s) => s.areaChart.wards || []);
  const wardsLoading = useSelector((s) => s.areaChart.locationStatus === "loading");

  const ROLE = ROLES.WARD_CHAIRMAN;
  const wardChairmenFromHead = useSelector((s) => s.head?.[ROLE]?.data || []);
  const wardChairmenListFromArea = useSelector((s) => s.areaChart.wardChairmenList || []);

  const channelPartners = useSelector((s) => s.areaChart.channelPartners || []);

  // Normalize and combine Ward Chairmen from all 3 API sources
  const normalizedWardChairmen = useMemo(() => {
    const list = [];
    const seenKeys = new Set();

    const addRecord = (item) => {
      const details = extractChairmanDetails(item);
      if (details && details.hasChairman) {
        const key = `${details.name.toLowerCase()}_${details.wardName.toLowerCase()}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          list.push(details);
        }
      }
    };

    // Source 1: fetchHeadsByRole(WARD_CHAIRMAN)
    wardChairmenFromHead.forEach(addRecord);

    // Source 2: getAllWardChaimansBy(talukaId)
    wardChairmenListFromArea.forEach(addRecord);

    // Source 3: areaChart.wards (getLocationByWardHeadId)
    wards.forEach(addRecord);

    return list;
  }, [wardChairmenFromHead, wardChairmenListFromArea, wards]);

  // Combine & Normalize Members from /talukas/users-by-taluka and /userprofile/search-users (by talukaId)
  const combinedTalukaMembers = useMemo(() => {
    const map = new Map();

    const normalizeUser = (u) => ({
      userId: u.userId || u._id || u.id || u.mobileNumber || u.mobile,
      name: u.name || u.fullName || u.username || "Member",
      email: u.email || "—",
      mobileNumber: u.mobileNumber || u.mobile || u.phone || "—",
      ward: u.ward || u.wardName || "—",
      district: u.district || u.districtName || "—",
      state: u.state || "—",
      isPrime: Boolean(u.isPrime),
      isBasic: Boolean(u.isBasic),
    });

    talukaUsers.forEach((u) => {
      const norm = normalizeUser(u);
      if (norm.userId) map.set(String(norm.userId), norm);
    });

    searchResults.forEach((u) => {
      const norm = normalizeUser(u);
      if (norm.userId && !map.has(String(norm.userId))) {
        map.set(String(norm.userId), norm);
      }
    });

    return Array.from(map.values());
  }, [talukaUsers, searchResults]);

  // ── Fetch Data on Mount / User change ─────────────────────
  const loadData = () => {
    if (user?.userId) {
      dispatch(getLocationByWardHeadId(user.userId));
    }
    if (user?.taluka) {
      dispatch(fetchUsersByTaluka(user.taluka));
    }
    dispatch(fetchHeadsByRole(ROLE));

    let locationData = null;
    try {
      locationData = JSON.parse(localStorage.getItem("locationData") || "{}");
    } catch (e) {
      // ignore
    }
    const talukaId = locationData?.talukaId || user?.talukaId;
    if (talukaId) {
      dispatch(searchMembers({ talukaId }));
      dispatch(getAllWardChaimansBy(talukaId));
    }
    dispatch(fetchChannelPartners({ limit: 100 }));
  };

  useEffect(() => {
    loadData();
  }, [dispatch, user?.userId, user?.taluka]);

  // Trigger searchMembers when locationData is resolved from getLocationByWardHeadId
  useEffect(() => {
    let locationData = null;
    try {
      locationData = JSON.parse(localStorage.getItem("locationData") || "{}");
    } catch (e) {
      // ignore
    }
    const talukaId = locationData?.talukaId || user?.talukaId;
    if (talukaId && searchResults.length === 0 && searchStatus !== "loading") {
      dispatch(searchMembers({ talukaId }));
    }
    if (talukaId && wardChairmenListFromArea.length === 0) {
      dispatch(getAllWardChaimansBy(talukaId));
    }
  }, [wards, user?.talukaId, dispatch]);

  // ── Derived Stats & Analytics ─────────────────────────────
  const effectiveMembers = combinedTalukaMembers;
  const totalMembersCount = Math.max(talukaUsersTotal, effectiveMembers.length);

  const primeCount = effectiveMembers.filter((u) => u.isPrime).length;
  const basicCount = effectiveMembers.filter((u) => u.isBasic && !u.isPrime).length;
  const freeCount = effectiveMembers.filter((u) => !u.isPrime && !u.isBasic).length;

  const totalWardsCount = wards.length;
  const activeWardsCount = wards.filter(
    (w) => Number(w.totalMembers || w.totalWardChartMembers || w.booths_built || 0) > 0
  ).length;

  const wardsWithChairman = wards.filter((w) => {
    const details = extractChairmanDetails(w);
    return details && details.hasChairman;
  }).length;
  const vacantWardsCount = Math.max(0, totalWardsCount - wardsWithChairman);

  const memberPlanData =
    totalMembersCount > 0
      ? [
          { name: "Prime", value: primeCount, color: "#8B5CF6" },
          { name: "Basic", value: basicCount, color: "#3B82F6" },
          { name: "Free", value: freeCount, color: "#9CA3AF" },
        ].filter((d) => d.value > 0)
      : [];

  const wardBarData = useMemo(() => {
    return wards.map((w) => ({
      name: w.ward_name ? `W-${w.ward_number} ${w.ward_name}` : `Ward ${w.ward_number || w.id}`,
      members: Number(w.totalMembers || w.totalWardChartMembers || w.booths_built || 0),
    }));
  }, [wards]);

  // Unique Wards List for dropdown filters
  const uniqueWardNames = useMemo(() => {
    const set = new Set();
    effectiveMembers.forEach((u) => {
      if (u.ward && u.ward !== "—") set.add(u.ward);
    });
    wards.forEach((w) => {
      if (w.ward_name) set.add(w.ward_name);
    });
    channelPartners.forEach((cp) => {
      const wName = cp.wardName || cp.ward || cp.ward_name;
      if (wName) set.add(wName);
    });
    return Array.from(set).sort();
  }, [effectiveMembers, wards, channelPartners]);

  // Filtered Members Directory
  const filteredMembers = useMemo(() => {
    return effectiveMembers.filter((u) => {
      // Search query filter
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.mobileNumber?.includes(q) ||
        u.ward?.toLowerCase().includes(q);

      // Ward filter
      const matchesWard =
        selectedWardFilter === "all" ||
        u.ward?.toLowerCase() === selectedWardFilter.toLowerCase();

      // Plan filter
      let matchesPlan = true;
      if (selectedPlanFilter === "prime") matchesPlan = u.isPrime;
      else if (selectedPlanFilter === "basic") matchesPlan = u.isBasic && !u.isPrime;
      else if (selectedPlanFilter === "free") matchesPlan = !u.isPrime && !u.isBasic;

      return matchesSearch && matchesWard && matchesPlan;
    });
  }, [effectiveMembers, searchQuery, selectedWardFilter, selectedPlanFilter]);

  // Filtered Wards Grid
  const filteredWards = useMemo(() => {
    return wards.filter((w) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        w.ward_name?.toLowerCase().includes(q) ||
        String(w.ward_number).includes(q) ||
        w.constituency?.toLowerCase().includes(q);

      const built = Number(w.totalMembers || w.totalWardChartMembers || w.booths_built || 0);
      const total = Number(w.layoutCount || w.booths_total || 103);
      const chairmanDetails = extractChairmanDetails(w);
      const hasChairman = Boolean(chairmanDetails && chairmanDetails.hasChairman);

      let matchesStatus = true;
      if (wardStatusFilter === "built") matchesStatus = built >= total && total > 0;
      else if (wardStatusFilter === "progress") matchesStatus = built > 0 && built < total;
      else if (wardStatusFilter === "empty") matchesStatus = built === 0;
      else if (wardStatusFilter === "vacant") matchesStatus = !hasChairman;

      return matchesSearch && matchesStatus;
    });
  }, [wards, searchQuery, wardStatusFilter]);

  // Filtered Ward Chairmen List
  const filteredChairmen = useMemo(() => {
    return normalizedWardChairmen.filter((c) => {
      const q = searchQuery.toLowerCase();
      return (
        !q ||
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.mobile?.includes(q) ||
        c.wardName?.toLowerCase().includes(q)
      );
    });
  }, [normalizedWardChairmen, searchQuery]);

  // Filtered Channel Partners List
  const filteredCPs = useMemo(() => {
    return channelPartners.filter((cp) => {
      const name = cp.name || cp.fullName || cp.cpName || cp.userName || "Channel Partner";
      const email = cp.email || "";
      const mobile = cp.mobile || cp.mobileNumber || cp.phone || "";
      const ward = cp.wardName || cp.ward || cp.ward_name || "";
      const business = cp.businessName || cp.companyName || cp.company || "";

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        name.toLowerCase().includes(q) ||
        email.toLowerCase().includes(q) ||
        mobile.includes(q) ||
        ward.toLowerCase().includes(q) ||
        business.toLowerCase().includes(q);

      const matchesWard =
        selectedWardFilter === "all" ||
        ward.toLowerCase() === selectedWardFilter.toLowerCase();

      return matchesSearch && matchesWard;
    });
  }, [channelPartners, searchQuery, selectedWardFilter]);

  // ── KPI Cards Definition ──────────────────────────────────
  const kpiCards = [
    {
      label: "Total Taluka Members",
      value: (talukaUsersLoading || searchStatus === "loading") ? "…" : String(totalMembersCount),
      sub: `${primeCount} Prime · ${basicCount} Basic · ${freeCount} Free`,
      icon: Users,
      iconBg: "bg-blue-50 text-blue-600",
      pillBg: "bg-blue-50 text-blue-700 border-blue-100",
    },
    {
      label: "Wards Under Taluka",
      value: wardsLoading ? "…" : String(totalWardsCount),
      sub: `${activeWardsCount} Active · ${vacantWardsCount} Chairmen Vacant`,
      icon: MapPin,
      iconBg: "bg-emerald-50 text-emerald-600",
      pillBg: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
    {
      label: "Appointed Ward Chairmen",
      value: String(normalizedWardChairmen.length),
      sub: `${normalizedWardChairmen.length} active chairmen`,
      icon: ShieldCheck,
      iconBg: "bg-purple-50 text-purple-600",
      pillBg: "bg-purple-50 text-purple-700 border-purple-100",
    },
    {
      label: "Channel Partners",
      value: String(channelPartners.length),
      sub: `${channelPartners.length} active CPs across wards`,
      icon: UserCheck,
      iconBg: "bg-amber-50 text-amber-600",
      pillBg: "bg-amber-50 text-amber-700 border-amber-100",
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      {/* ── HEADER & ACTIONS ────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Taluka Head Dashboard
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-purple-50 text-purple-700 rounded-full border border-purple-200">
              Taluka Leadership
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Taluka-wide operations, Ward management & leadership directory
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw size={14} className={(wardsLoading || searchStatus === "loading") ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={() => navigate("/taluk-head-dashboard/area-chart")}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <MapPin size={14} />
            Taluka Area Chart
          </button>
        </div>
      </div>

      {/* ── LOCATION BANNER ────────────────────────────────── */}
      <LocationBanner level="taluka" />

      {/* ── METRIC CARDS ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between gap-3 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-semibold text-gray-500 leading-snug">
                  {card.label}
                </span>
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${card.iconBg}`}
                >
                  <Icon size={18} />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 leading-none">
                  {card.value}
                </p>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 mt-2 rounded-full border ${card.pillBg}`}
                >
                  {card.sub}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── TABS NAVIGATION ────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 rounded-xl shadow-sm">
        <div className="flex gap-2 overflow-x-auto py-2">
          {[
            { id: "overview", label: "Overview & Analytics", icon: BarChart2 },
            { id: "wards", label: `Wards (${totalWardsCount})`, icon: MapPin },
            { id: "chairmen", label: `Ward Chairmen (${normalizedWardChairmen.length})`, icon: ShieldCheck },
            { id: "cps", label: `Channel Partners (${channelPartners.length})`, icon: UserCheck },
            { id: "members", label: `Taluka Members (${totalMembersCount})`, icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery("");
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? "bg-blue-50 text-blue-600 border border-blue-200 shadow-xs"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: OVERVIEW & ANALYTICS                                  */}
      {/* ============================================================ */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* ANALYTICS CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* LEFT — Ward Member Distribution Bar Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <BarChart2 size={16} className="text-blue-500" />
                    Ward Member Distribution
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Member counts across all wards in this taluka
                  </p>
                </div>
                <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                  {wards.length} Wards
                </span>
              </div>

              {wardBarData.length === 0 ? (
                <EmptyState message="No ward member data available yet." />
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={wardBarData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: "#6B7280" }}
                        interval={0}
                        angle={-25}
                        textAnchor="end"
                      />
                      <YAxis tick={{ fontSize: 10, fill: "#6B7280" }} />
                      <RechartsTooltip content={<BarTooltip />} />
                      <Bar dataKey="members" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* RIGHT — Member Plan Donut */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-800 mb-0.5">Member Plans</h2>
                <p className="text-xs text-gray-400 mb-3">Plan tier breakdown</p>

                {memberPlanData.length === 0 ? (
                  <EmptyState message="No member data available." />
                ) : (
                  <>
                    <div className="flex items-center justify-center h-44 relative">
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
                          <RechartsTooltip content={<DonutTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <p className="text-xl font-bold text-gray-900">{totalMembersCount}</p>
                        <p className="text-[10px] font-semibold text-gray-400 tracking-wider">TOTAL</p>
                      </div>
                    </div>

                    <div className="space-y-2 mt-2 border-t border-gray-100 pt-3">
                      {memberPlanData.map((d) => (
                        <div key={d.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                            <span className="text-gray-600 font-medium">{d.name} Plan</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800">{d.value}</span>
                            <span className="text-gray-400 text-[11px]">
                              ({totalMembersCount > 0 ? Math.round((d.value / totalMembersCount) * 100) : 0}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* WARDS QUICK OVERVIEW GRID */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <MapPin size={16} className="text-emerald-500" />
                  Wards Overview ({wards.length})
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Quick status of all wards managed under this taluka
                </p>
              </div>
              <button
                onClick={() => setActiveTab("wards")}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                View All Wards
                <ArrowRight size={13} />
              </button>
            </div>

            {wards.length === 0 ? (
              <EmptyState message="No wards loaded for this taluka." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {wards.slice(0, 8).map((ward) => (
                  <WardCard key={ward.id || ward.ward_number} ward={ward} constituencyWardCount={wards.length} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: WARDS GRID & MANAGEMENT                                */}
      {/* ============================================================ */}
      {activeTab === "wards" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          {/* SEARCH & FILTERS BAR */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div className="relative w-full sm:w-72">
              <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search Ward Name or Number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <Filter size={14} className="text-gray-400 flex-shrink-0" />
              {[
                { id: "all", label: "All Wards" },
                { id: "built", label: "Fully Built" },
                { id: "progress", label: "In Progress" },
                { id: "empty", label: "Empty" },
                { id: "vacant", label: "Chairman Vacant" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setWardStatusFilter(f.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    wardStatusFilter === f.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* WARDS GRID DISPLAY */}
          {filteredWards.length === 0 ? (
            <EmptyState message="No matching wards found." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredWards.map((ward) => (
                <WardCard key={ward.id || ward.ward_number} ward={ward} constituencyWardCount={wards.length} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: WARD CHAIRMEN DIRECTORY                               */}
      {/* ============================================================ */}
      {activeTab === "chairmen" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-bold text-gray-800">Ward Chairmen Directory</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                All appointed Ward Chairmen under this taluka
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search Chairman Name, Email, Ward..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {filteredChairmen.length === 0 ? (
            <EmptyState message="No Ward Chairmen found." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider text-left">
                    <th className="px-4 py-3">Chairman Name</th>
                    <th className="px-4 py-3">Assigned Ward</th>
                    <th className="px-4 py-3">Mobile Number</th>
                    <th className="px-4 py-3">District</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredChairmen.map((c, idx) => (
                    <tr key={c.id || idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center flex-shrink-0">
                            {c.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{c.name}</p>
                            <p className="text-[11px] text-gray-400">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-700">
                        {c.wardName}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{c.mobile}</td>
                      <td className="px-4 py-3 text-gray-600">{c.districtName}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: CHANNEL PARTNERS DIRECTORY                            */}
      {/* ============================================================ */}
      {activeTab === "cps" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <UserCheck size={16} className="text-amber-600" />
                Channel Partners Directory ({channelPartners.length})
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Ward-wise Channel Partners operating in this taluka
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <div className="relative w-full sm:w-64">
                <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Name, Business, Ward..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Ward Filter */}
              <select
                value={selectedWardFilter}
                onChange={(e) => setSelectedWardFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-700"
              >
                <option value="all">All Wards</option>
                {uniqueWardNames.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredCPs.length === 0 ? (
            <EmptyState message="No Channel Partners found." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider text-left">
                    <th className="px-4 py-3">Channel Partner Name</th>
                    <th className="px-4 py-3">Business / Company</th>
                    <th className="px-4 py-3">Assigned Ward</th>
                    <th className="px-4 py-3">Mobile Number</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCPs.map((cp, idx) => {
                    const cpName = cp.name || cp.fullName || cp.cpName || cp.userName || "Channel Partner";
                    const email = cp.email || "—";
                    const mobile = cp.mobile || cp.mobileNumber || cp.phone || "—";
                    const ward = cp.wardName || cp.ward || cp.ward_name || "—";
                    const business = cp.businessName || cp.companyName || cp.company || "—";
                    const status = cp.status || (cp.isActive ? "active" : "active");

                    return (
                      <tr key={cp.id || cp._id || idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center flex-shrink-0">
                              {cpName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{cpName}</p>
                              <p className="text-[11px] text-gray-400">{email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {business}
                        </td>
                        <td className="px-4 py-3 font-semibold text-blue-700 capitalize">
                          {ward}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{mobile}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full capitalize">
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 5: TALUKA MEMBERS DIRECTORY                              */}
      {/* ============================================================ */}
      {activeTab === "members" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          {/* SEARCH & FILTERS */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div className="relative w-full sm:w-72">
              <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search Name, Email, Mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              {/* Ward Filter */}
              <select
                value={selectedWardFilter}
                onChange={(e) => setSelectedWardFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-700"
              >
                <option value="all">All Wards</option>
                {uniqueWardNames.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>

              {/* Plan Filter */}
              <select
                value={selectedPlanFilter}
                onChange={(e) => setSelectedPlanFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-700"
              >
                <option value="all">All Plans</option>
                <option value="prime">Prime</option>
                <option value="basic">Basic</option>
                <option value="free">Free</option>
              </select>
            </div>
          </div>

          {/* MEMBERS TABLE */}
          {(talukaUsersLoading || searchStatus === "loading") ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredMembers.length === 0 ? (
            <EmptyState message="No members found matching criteria." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider text-left">
                    <th className="px-4 py-3">Member Name</th>
                    <th className="px-4 py-3">Mobile Number</th>
                    <th className="px-4 py-3">Ward</th>
                    <th className="px-4 py-3">District</th>
                    <th className="px-4 py-3">State</th>
                    <th className="px-4 py-3">Membership Plan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredMembers.map((u) => (
                    <tr key={u.userId || u.mobileNumber} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{u.name}</p>
                            <p className="text-[11px] text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{u.mobileNumber || "—"}</td>
                      <td className="px-4 py-3 font-medium text-gray-700 capitalize">
                        {u.ward || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{u.district || "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{u.state || "—"}</td>
                      <td className="px-4 py-3">
                        {u.isPrime ? (
                          <span className="px-2 py-0.5 text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 rounded-full">
                            Prime
                          </span>
                        ) : u.isBasic ? (
                          <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                            Basic
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-semibold bg-gray-100 text-gray-600 rounded-full">
                            Free
                          </span>
                        )}
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
  );
};

export default TalukHeadDashboard;