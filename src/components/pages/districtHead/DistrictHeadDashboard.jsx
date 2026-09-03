// ============================================================
// DistrictHeadDashboard.jsx - District Executive Management Hub
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
} from "lucide-react";

import { fetchUsersByDistrict, fetchDashboard } from "../../redux/slices/dashboardSlice.js";
import { fetchHeadsByRole } from "../../redux/slices/headSlice.js";
import { fetchDistricts, fetchTalukasByDistrict } from "../../redux/slices/wardSlice.js";
import {
  getLocationByWardHeadId,
  fetchChannelPartners,
  searchMembers,
  getAllWardChaimansBy,
} from "../../redux/slices/areaChartSlice.js";
import { ROLES } from "../../utils/roles.js";
import { selectUser } from "../../redux/slices/authSlice.js";
import LocationBanner from "../../common/LocationBanner.jsx";

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

  let name =
    c.name ||
    c.fullName ||
    (c.firstName ? `${c.firstName} ${c.lastName || ""}`.trim() : "") ||
    c.userName;

  let email = c.email || c.emailAddress;
  let mobile = c.mobile || c.mobileNumber || c.phone;
  let wardName = c.wardHobli || c.wardName || c.ward || c.ward_name;
  let talukaName = c.taluk || c.talukaName || c.taluka || c.constituency;
  let districtName = c.district || c.districtName;

  const wc = c.wardChairman || c.wardHead || c.wardChart?.wardHead;
  if (wc && typeof wc === "object") {
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

  const chairmanId = c.wardChairmanUserId || c.wardHeadId || wc?.userId || c.userId || c._id;
  const hasChairman = Boolean(name || chairmanId || wc);

  if (!hasChairman) return null;

  return {
    id: chairmanId || `${wardName}_${name}`,
    name: name || "Assigned Chairman",
    email: email || "—",
    mobile: mobile || "—",
    wardHobli: wardName || "—",
    taluk: talukaName || "—",
    district: districtName || "—",
    status: c.status || "Active",
  };
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const DistrictHeadDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  // ── Local Navigation & Filter State ───────────────────────
  const [activeTab, setActiveTab] = useState("overview"); // overview | talukas | chairmen | members | channelPartners
  const [selectedTalukaFilter, setSelectedTalukaFilter] = useState("ALL");
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [memberPlanFilter, setMemberPlanFilter] = useState("ALL"); // ALL | PRIME | BASIC | FREE
  const [chairmanSearchQuery, setChairmanSearchQuery] = useState("");
  const [cpSearchQuery, setCpSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── Ward Chairmen View Mode & Pagination State ─────────────
  const [chairmanViewMode, setChairmanViewMode] = useState("grid"); // "grid" | "list"
  const [chairmanPage, setChairmanPage] = useState(1);
  const chairmanItemsPerPage = 10;

  // ── District Members Pagination & Limit State ──────────────
  const [memberPage, setMemberPage] = useState(1);
  const [memberItemsPerPage, setMemberItemsPerPage] = useState(10); // 10 | 25 | 50 | 100

  // ── Dynamic Location Data Extraction ──────────────────────
  const locationData = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("locationData") || "{}");
    } catch {
      return {};
    }
  }, []);

  const currentDistrictName = useMemo(() => {
    return (
      user?.district ||
      user?.districtName ||
      user?.district_name ||
      locationData?.districtName ||
      locationData?.district ||
      ""
    );
  }, [user, locationData]);

  const currentDistrictId = useMemo(() => {
    return (
      user?.districtId ||
      user?.district_id ||
      locationData?.districtId ||
      ""
    );
  }, [user, locationData]);

  // ── Redux Selectors ──────────────────────────────────────
  // 1. District Users (Members)
  const districtUsers = useSelector((s) => s.dashboard.districtUsers || []);
  const districtUsersTotal = useSelector((s) => s.dashboard.districtUsersTotal || 0);
  const districtUsersLoading = useSelector((s) => s.dashboard.districtUsersLoading || false);

  // 2. All Users (Fallback from fetchDashboard)
  const allUsers = useSelector((s) => s.dashboard.users || []);

  // 3. Search Results (Fallback from searchMembers)
  const searchResults = useSelector((s) => s.areaChart.searchResults || []);

  // 4. Taluka Heads (Multi-role variant resolution)
  const EMPTY_HEAD = { data: [], loading: false, error: null };
  const talukaHeadsState1 = useSelector((s) => s.head?.[ROLES.TALUKA_HEAD] ?? EMPTY_HEAD);
  const talukaHeadsState2 = useSelector((s) => s.head?.["TalukHead"] ?? EMPTY_HEAD);
  const talukaHeadsState3 = useSelector((s) => s.head?.["TalukaHead"] ?? EMPTY_HEAD);

  const talukaHeads = useMemo(() => {
    const list = [
      ...(talukaHeadsState1.data || []),
      ...(talukaHeadsState2.data || []),
      ...(talukaHeadsState3.data || []),
    ];
    const map = new Map();
    list.forEach((h) => {
      const key = (h.email || h.mobile || h.name || "").toLowerCase();
      if (key && !map.has(key)) map.set(key, h);
    });
    return Array.from(map.values());
  }, [talukaHeadsState1.data, talukaHeadsState2.data, talukaHeadsState3.data]);

  const talukaHeadsLoading =
    talukaHeadsState1.loading || talukaHeadsState2.loading || talukaHeadsState3.loading;

  // 5. Ward Chairmen (Multi-source)
  const wardChairmenState = useSelector((s) => s.head?.[ROLES.WARD_CHAIRMAN] ?? EMPTY_HEAD);
  const wardChairmenAltState = useSelector((s) => s.head?.["WardChairman"] ?? EMPTY_HEAD);
  const wardChairmen = wardChairmenState.data || [];
  const wardChairmenAlt = wardChairmenAltState.data || [];
  const wardChairmenListFromArea = useSelector((s) => s.areaChart?.wardChairmenList || []);
  const wardChairmenLoading = wardChairmenState.loading || wardChairmenAltState.loading;

  // 6. District / Taluka Hierarchy from Ward Slice & Area Chart Slice
  const districts = useSelector((s) => s.ward?.districts || []);
  const talukasFromWardSlice = useSelector((s) => s.ward?.talukas || []);
  const areaChartWards = useSelector((s) => s.areaChart?.wards || []);

  // 7. Channel Partners
  const channelPartners = useSelector((s) => s.areaChart?.channelPartners || []);
  const channelPartnersLoading = useSelector(
    (s) => s.areaChart?.channelPartnersStatus === "loading"
  );

  // ── Initial Data Fetching ────────────────────────────────
  const loadDashboardData = React.useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (user?.userId) {
        const positionId = user?.position?.positionId || localStorage.getItem("positionId") || user.userId;
        dispatch(getLocationByWardHeadId(positionId));
      }

      dispatch(fetchHeadsByRole(ROLES.TALUKA_HEAD));
      dispatch(fetchHeadsByRole("TalukHead"));
      dispatch(fetchHeadsByRole("TalukaHead"));

      dispatch(fetchHeadsByRole(ROLES.WARD_CHAIRMAN));
      dispatch(fetchHeadsByRole("WardChairman"));

      dispatch(fetchDashboard());
      dispatch(fetchChannelPartners({ limit: 100 }));
      dispatch(fetchDistricts());

      if (currentDistrictName) {
        dispatch(fetchUsersByDistrict(currentDistrictName));
      }

      if (currentDistrictId) {
        dispatch(searchMembers({ districtId: currentDistrictId }));
        dispatch(fetchTalukasByDistrict(currentDistrictId));
        dispatch(getAllWardChaimansBy(currentDistrictId));
      }
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }, [dispatch, user?.userId, currentDistrictName, currentDistrictId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Secondary effect when district name/id becomes available
  useEffect(() => {
    if (currentDistrictName && districtUsers.length === 0) {
      dispatch(fetchUsersByDistrict(currentDistrictName));
    }
    if (currentDistrictId && searchResults.length === 0) {
      dispatch(searchMembers({ districtId: currentDistrictId }));
      dispatch(fetchTalukasByDistrict(currentDistrictId));
      dispatch(getAllWardChaimansBy(currentDistrictId));
    }
  }, [dispatch, currentDistrictName, currentDistrictId, districtUsers.length, searchResults.length]);

  // Reset chairmanPage when search, filter, or view mode changes
  useEffect(() => {
    setChairmanPage(1);
  }, [chairmanSearchQuery, selectedTalukaFilter, chairmanViewMode]);

  // Reset memberPage when search, filter, or limit changes
  useEffect(() => {
    setMemberPage(1);
  }, [memberSearchQuery, selectedTalukaFilter, memberPlanFilter, memberItemsPerPage]);

  // ── Derived Data & Analytics ──────────────────────────────

  // 1. Combined Multi-Source District Members
  const combinedDistrictMembers = useMemo(() => {
    const map = new Map();

    const normalizeUser = (u) => ({
      userId: u.userId || u._id || u.id || u.mobileNumber || u.mobile,
      name: u.name || u.fullName || u.username || "Member",
      email: u.email || "—",
      mobileNumber: u.mobileNumber || u.mobile || u.phone || "—",
      ward: u.ward || u.wardName || "—",
      taluka: u.taluka || u.talukaName || u.taluk || "—",
      district: u.district || u.districtName || "—",
      state: u.state || "—",
      role: u.role || u.userRole || u.userType || "",
      isPrime: Boolean(u.isPrime),
      isBasic: Boolean(u.isBasic),
    });

    // Source 1: districtUsers from dashboardSlice (fetchUsersByDistrict)
    districtUsers.forEach((u) => {
      const norm = normalizeUser(u);
      if (norm.userId) map.set(String(norm.userId), norm);
    });

    // Source 2: searchResults from areaChartSlice (searchMembers)
    searchResults.forEach((u) => {
      const norm = normalizeUser(u);
      if (norm.userId && !map.has(String(norm.userId))) {
        map.set(String(norm.userId), norm);
      }
    });

    // Source 3: allUsers from fetchDashboard (filtered by district if available)
    allUsers.forEach((u) => {
      const uDistrict = u.district || u.districtName;
      const matchesDistrict =
        !currentDistrictName ||
        !uDistrict ||
        uDistrict.toLowerCase().includes(currentDistrictName.toLowerCase()) ||
        currentDistrictName.toLowerCase().includes(uDistrict.toLowerCase());

      if (matchesDistrict) {
        const norm = normalizeUser(u);
        if (norm.userId && !map.has(String(norm.userId))) {
          map.set(String(norm.userId), norm);
        }
      }
    });

    return Array.from(map.values());
  }, [districtUsers, searchResults, allUsers, currentDistrictName]);

  // 2. Combined Multi-Source Taluka Heads
  const districtTalukaHeads = useMemo(() => {
    const map = new Map();

    const addHead = (h) => {
      if (!h || !h.name) return;
      const hDistrict = h.district || h.districtName;
      const isMatch =
        !currentDistrictName ||
        !hDistrict ||
        hDistrict === "—" ||
        hDistrict.toLowerCase().includes(currentDistrictName.toLowerCase()) ||
        currentDistrictName.toLowerCase().includes(hDistrict.toLowerCase());

      if (isMatch) {
        const key = `${(h.taluk || h.talukaName || "").toLowerCase()}_${(h.name || "").toLowerCase()}`;
        if (!map.has(key)) map.set(key, h);
      }
    };

    // Source 1: role endpoint responses ('taluka_head', 'TalukHead', 'TalukaHead')
    talukaHeads.forEach(addHead);

    // Source 2: members with TalukaHead role
    combinedDistrictMembers.forEach((u) => {
      const r = (u.role || u.userRole || u.userType || "").toLowerCase();
      if (r.includes("taluk") || r.includes("taluka")) {
        addHead(u);
      }
    });

    return Array.from(map.values());
  }, [talukaHeads, combinedDistrictMembers, currentDistrictName]);

  // 3. Combined Multi-Source Ward Chairmen
  const combinedWardChairmen = useMemo(() => {
    const map = new Map();

    const addRecord = (item) => {
      const details = extractChairmanDetails(item);
      if (details && details.name) {
        const key = `${(details.wardHobli || "").toLowerCase()}_${(details.name || "").toLowerCase()}`;
        if (!map.has(key)) {
          map.set(key, details);
        }
      }
    };

    // Source 1: headSlice ROLES.WARD_CHAIRMAN ('ward_chairman')
    wardChairmen.forEach(addRecord);

    // Source 2: headSlice 'WardChairman'
    wardChairmenAlt.forEach(addRecord);

    // Source 3: areaChartWards (18 wards hierarchy from getLocationByWardHeadId)
    areaChartWards.forEach(addRecord);

    // Source 4: wardChairmenList from areaChartSlice
    wardChairmenListFromArea.forEach(addRecord);

    return Array.from(map.values());
  }, [wardChairmen, wardChairmenAlt, areaChartWards, wardChairmenListFromArea]);

  const districtWardChairmen = useMemo(() => {
    if (!combinedWardChairmen.length) return [];
    if (!currentDistrictName) return combinedWardChairmen;

    return combinedWardChairmen.filter((h) => {
      const hDistrict = h.district;
      if (!hDistrict || hDistrict === "—") return true;
      return (
        hDistrict.toLowerCase().includes(currentDistrictName.toLowerCase()) ||
        currentDistrictName.toLowerCase().includes(hDistrict.toLowerCase())
      );
    });
  }, [combinedWardChairmen, currentDistrictName]);

  // 4. Normalized Taluka List
  const talukasList = useMemo(() => {
    const map = new Map();

    // From ward slice
    talukasFromWardSlice.forEach((t) => {
      const name = t.talukaName || t.name;
      if (name && !map.has(name.toLowerCase())) {
        map.set(name.toLowerCase(), {
          id: t.talukaId || t.id || name,
          name,
          wardCount: t.wardCount || 0,
        });
      }
    });

    // From location wards hierarchy
    areaChartWards.forEach((w) => {
      const tName = w.constituency || w.talukaName;
      if (tName) {
        const key = tName.toLowerCase();
        const existing = map.get(key) || { id: tName, name: tName, wardCount: 0 };
        existing.wardCount += 1;
        map.set(key, existing);
      }
    });

    // From members
    combinedDistrictMembers.forEach((u) => {
      const tName = u.taluka || u.talukaName;
      if (tName && tName !== "—" && !map.has(tName.toLowerCase())) {
        map.set(tName.toLowerCase(), { id: tName, name: tName, wardCount: 0 });
      }
    });

    // From taluka heads
    districtTalukaHeads.forEach((th) => {
      const tName = th.taluk || th.talukaName;
      if (tName && tName !== "—" && !map.has(tName.toLowerCase())) {
        map.set(tName.toLowerCase(), { id: tName, name: tName, wardCount: 0 });
      }
    });

    // From ward chairmen
    districtWardChairmen.forEach((wc) => {
      const tName = wc.taluk || wc.talukaName;
      if (tName && tName !== "—" && !map.has(tName.toLowerCase())) {
        map.set(tName.toLowerCase(), { id: tName, name: tName, wardCount: 0 });
      }
    });

    return Array.from(map.values());
  }, [talukasFromWardSlice, areaChartWards, combinedDistrictMembers, districtTalukaHeads, districtWardChairmen]);

  // Membership Plan Breakdown
  const totalMemberCount = combinedDistrictMembers.length;
  const primeCount = useMemo(
    () => combinedDistrictMembers.filter((u) => u.isPrime).length,
    [combinedDistrictMembers]
  );
  const basicCount = useMemo(
    () => combinedDistrictMembers.filter((u) => u.isBasic && !u.isPrime).length,
    [combinedDistrictMembers]
  );
  const freeCount = useMemo(
    () => combinedDistrictMembers.filter((u) => !u.isPrime && !u.isBasic).length,
    [combinedDistrictMembers]
  );

  const memberStatusData = useMemo(() => {
    if (!totalMemberCount) return [];
    return [
      { name: "Prime Members", value: primeCount, color: "#8B5CF6" },
      { name: "Basic Members", value: basicCount, color: "#3B82F6" },
      { name: "Free Members", value: freeCount, color: "#9CA3AF" },
    ].filter((d) => d.value > 0);
  }, [totalMemberCount, primeCount, basicCount, freeCount]);

  // Member count per Taluka for Bar Chart
  const talukaMemberDistribution = useMemo(() => {
    const counts = {};
    combinedDistrictMembers.forEach((u) => {
      const tName = u.taluka || u.talukaName || u.ward || "Unassigned";
      if (tName && tName !== "—") {
        counts[tName] = (counts[tName] || 0) + 1;
      }
    });

    return Object.keys(counts)
      .map((tName) => ({
        name: tName,
        members: counts[tName],
      }))
      .sort((a, b) => b.members - a.members);
  }, [combinedDistrictMembers]);

  // District KPIs
  const activeTalukHeadsCount = districtTalukaHeads.length;
  const totalTalukasCount = Math.max(talukasList.length, activeTalukHeadsCount);
  const talukaHeadCoveragePercent = totalTalukasCount
    ? Math.round((activeTalukHeadsCount / totalTalukasCount) * 100)
    : 0;

  const totalWardsCount = useMemo(() => {
    if (areaChartWards.length > 0) return areaChartWards.length;
    return districtWardChairmen.length || 0;
  }, [areaChartWards, districtWardChairmen]);

  const activeWardChairmenCount = districtWardChairmen.length;

  const districtChannelPartnersCount = useMemo(() => {
    if (!currentDistrictName) return channelPartners.length;
    return channelPartners.filter((cp) => {
      const cpDistrict = cp.districtName || cp.district;
      return (
        !cpDistrict ||
        cpDistrict.toLowerCase().includes(currentDistrictName.toLowerCase()) ||
        currentDistrictName.toLowerCase().includes(cpDistrict.toLowerCase())
      );
    }).length;
  }, [channelPartners, currentDistrictName]);

  // Filtered District Members Table Data
  const filteredMembers = useMemo(() => {
    return combinedDistrictMembers.filter((u) => {
      // Taluka Filter
      if (selectedTalukaFilter !== "ALL") {
        const uTaluka = u.taluka || u.talukaName;
        if (uTaluka?.toLowerCase() !== selectedTalukaFilter.toLowerCase()) {
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
        const emailMatch = u.email?.toLowerCase().includes(q);
        return nameMatch || mobileMatch || wardMatch || emailMatch;
      }
      return true;
    });
  }, [combinedDistrictMembers, selectedTalukaFilter, memberPlanFilter, memberSearchQuery]);

  // Paginated Members for Directory
  const totalMemberPages = Math.ceil(filteredMembers.length / memberItemsPerPage) || 1;
  const paginatedMembers = useMemo(() => {
    const start = (memberPage - 1) * memberItemsPerPage;
    return filteredMembers.slice(start, start + memberItemsPerPage);
  }, [filteredMembers, memberPage, memberItemsPerPage]);

  // Filtered Ward Chairmen List
  const filteredWardChairmen = useMemo(() => {
    return districtWardChairmen.filter((c) => {
      if (selectedTalukaFilter !== "ALL") {
        const cTaluka = c.taluk || c.talukaName;
        if (cTaluka?.toLowerCase() !== selectedTalukaFilter.toLowerCase()) {
          return false;
        }
      }
      if (chairmanSearchQuery.trim()) {
        const q = chairmanSearchQuery.toLowerCase();
        const nameMatch = c.name?.toLowerCase().includes(q);
        const wardMatch = c.wardHobli?.toLowerCase().includes(q);
        const mobileMatch = c.mobile?.includes(q);
        return nameMatch || wardMatch || mobileMatch;
      }
      return true;
    });
  }, [districtWardChairmen, selectedTalukaFilter, chairmanSearchQuery]);

  // Paginated Ward Chairmen for List View
  const totalChairmanPages = Math.ceil(filteredWardChairmen.length / chairmanItemsPerPage) || 1;
  const paginatedWardChairmen = useMemo(() => {
    if (chairmanViewMode === "grid") return filteredWardChairmen;
    const start = (chairmanPage - 1) * chairmanItemsPerPage;
    return filteredWardChairmen.slice(start, start + chairmanItemsPerPage);
  }, [filteredWardChairmen, chairmanViewMode, chairmanPage]);

  // Filtered Channel Partners List
  const filteredChannelPartners = useMemo(() => {
    let list = channelPartners;
    if (currentDistrictName) {
      list = list.filter((cp) => {
        const cpDistrict = cp.districtName || cp.district;
        return (
          !cpDistrict ||
          cpDistrict.toLowerCase().includes(currentDistrictName.toLowerCase()) ||
          currentDistrictName.toLowerCase().includes(cpDistrict.toLowerCase())
        );
      });
    }
    if (selectedTalukaFilter !== "ALL") {
      list = list.filter((cp) => {
        const cpTaluka = cp.talukaName || cp.taluka;
        return cpTaluka?.toLowerCase() === selectedTalukaFilter.toLowerCase();
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
  }, [channelPartners, currentDistrictName, selectedTalukaFilter, cpSearchQuery]);

  // Summary KPI Cards Config
  const kpiCards = [
    {
      label: "Total District Members",
      value: districtUsersLoading ? "…" : totalMemberCount.toLocaleString(),
      badge: `${primeCount} Prime · ${basicCount} Basic`,
      icon: Users,
      colorBg: "bg-blue-500",
      lightBg: "bg-blue-50",
      textColor: "text-blue-600",
      borderColor: "border-blue-100",
    },
    {
      label: "Active Talukas",
      value: `${activeTalukHeadsCount} / ${totalTalukasCount}`,
      badge: `${talukaHeadCoveragePercent}% Coverage`,
      icon: Flag,
      colorBg: "bg-emerald-500",
      lightBg: "bg-emerald-50",
      textColor: "text-emerald-600",
      borderColor: "border-emerald-100",
    },
    {
      label: "Ward Chairmen Assigned",
      value: `${activeWardChairmenCount} Chairmen`,
      badge: totalWardsCount > 0 ? `${totalWardsCount} Total Wards` : "Active Network",
      icon: ShieldCheck,
      colorBg: "bg-purple-500",
      lightBg: "bg-purple-50",
      textColor: "text-purple-600",
      borderColor: "border-purple-100",
    },
    {
      label: "Channel Partners",
      value: channelPartnersLoading ? "…" : String(districtChannelPartnersCount),
      badge: "Business Network",
      icon: Building2,
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
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              District Head Executive
            </span>
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mt-1">
            {currentDistrictName ? `${currentDistrictName} District Dashboard` : "District Executive Dashboard"}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Monitor and manage Talukas, Wards, Chairmen, Members, and Channel Partners under your district.
          </p>
        </div>

        {/* Header Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Taluka Filter Dropdown */}
          {/* <div className="relative">
            <select
              value={selectedTalukaFilter}
              onChange={(e) => setSelectedTalukaFilter(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-xs font-medium rounded-xl px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">All Talukas in District</option>
              {talukasList.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
            <Filter size={13} className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
          </div> */}

          {/* Refresh Button */}
          {/* <button
            onClick={loadDashboardData}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-xl transition-all"
            title="Refresh Live Data"
          >
            <RefreshCw size={13} className={isRefreshing ? "animate-spin text-blue-600" : ""} />
            <span>Refresh</span>
          </button> */}

          {/* Area Chart Quick Button */}
          <button
            onClick={() => navigate("/district-head-dashboard/area-chart")}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-xl shadow-sm transition-all"
          >
            <MapIcon size={13} />
            <span>District Area Chart</span>
          </button>
        </div>
      </div>

      {/* ── LOCATION BANNER ────────────────────────────────── */}
      <LocationBanner level="district" />

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
          { id: "overview", label: "Overview & Analytics", icon: BarChart2 },
          { id: "talukas", label: `Talukas (${totalTalukasCount})`, icon: Flag },
          { id: "chairmen", label: `Ward Chairmen (${districtWardChairmen.length})`, icon: ShieldCheck },
          { id: "members", label: `District Members (${totalMemberCount})`, icon: Users },
          { id: "channelPartners", label: `Channel Partners (${districtChannelPartnersCount})`, icon: Building2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${isActive
                ? "bg-blue-600 text-white shadow-sm"
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

            {/* BAR CHART — Taluka-wise Member Distribution */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <BarChart2 size={16} className="text-blue-600" />
                    Taluka-wise Member Breakdown
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Member counts across all Talukas in {currentDistrictName || "the district"}
                  </p>
                </div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                  {talukaMemberDistribution.length} Talukas
                </span>
              </div>

              {talukaMemberDistribution.length === 0 ? (
                <EmptyState message="No Taluka member distribution data available." />
              ) : (
                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={talukaMemberDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
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
                      <Bar dataKey="members" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* DONUT CHART — Membership Plan Distribution */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <Award size={16} className="text-purple-600" />
                  Membership Plan Distribution
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">District member plans breakdown</p>

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
                              ({totalMemberCount > 0 ? Math.round((d.value / totalMemberCount) * 100) : 0}%)
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
              Leadership Coverage & Operations Status
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Taluka Heads Coverage Bar */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-700">Taluka Head Coverage</span>
                  <span className="font-bold text-emerald-600">
                    {activeTalukHeadsCount} / {totalTalukasCount} Assigned ({talukaHeadCoveragePercent}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, talukaHeadCoveragePercent)}%` }}
                  />
                </div>
                <p className="text-[11px] text-gray-400">
                  {totalTalukasCount - activeTalukHeadsCount > 0
                    ? `${totalTalukasCount - activeTalukHeadsCount} Talukas currently require Taluka Head assignment.`
                    : "All Talukas have an active Taluka Head assigned."}
                </p>
              </div>

              {/* Ward Chairmen Coverage */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-700">Ward Chairmen Network</span>
                  <span className="font-bold text-purple-600">
                    {activeWardChairmenCount} Active Chairmen
                  </span>
                </div>
                <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${totalWardsCount > 0 ? Math.min(100, Math.round((activeWardChairmenCount / totalWardsCount) * 100)) : 100}%`,
                    }}
                  />
                </div>
                <p className="text-[11px] text-gray-400">
                  Active Ward Chairmen monitoring wards across the district.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: TALUKAS HIERARCHY MONITOR ─────────────────── */}
      {activeTab === "talukas" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-800">Talukas in {currentDistrictName || "District"}</h2>
              <p className="text-xs text-gray-400">
                Taluka level monitoring, assigned Taluka Heads, and member counts
              </p>
            </div>
            <button
              onClick={() => navigate("/area-chart")}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-all"
            >
              <span>Explore Ward Area Charts</span>
              <ExternalLink size={13} />
            </button>
          </div>

          {talukasList.length === 0 ? (
            <EmptyState message="No Talukas found for this district." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {talukasList.map((taluka) => {
                // Find assigned Taluka Head for this taluka
                const assignedHead = districtTalukaHeads.find(
                  (h) =>
                    h.taluk?.toLowerCase() === taluka.name?.toLowerCase() ||
                    h.talukaName?.toLowerCase() === taluka.name?.toLowerCase()
                );

                // Count members in this taluka
                const memberCount = combinedDistrictMembers.filter(
                  (u) => (u.taluka || u.talukaName)?.toLowerCase() === taluka.name?.toLowerCase()
                ).length;

                return (
                  <div
                    key={taluka.name}
                    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                            <Flag size={18} />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-gray-800">{taluka.name}</h3>
                            <p className="text-xs text-gray-400">Taluka Constituency</p>
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
                          Assigned Taluka Head
                        </p>
                        {assignedHead ? (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                              {assignedHead.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-xs overflow-hidden">
                              <p className="font-semibold text-gray-800 truncate">{assignedHead.name}</p>
                              <p className="text-gray-400 truncate">{assignedHead.mobile || assignedHead.email}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-amber-600 italic">No Taluka Head assigned yet.</p>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-gray-400">Members</span>
                          <p className="font-bold text-gray-800">{memberCount.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Known Wards</span>
                          <p className="font-bold text-gray-800">{taluka.wardCount || "—"}</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedTalukaFilter(taluka.name);
                        setActiveTab("members");
                      }}
                      className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition-all"
                    >
                      <span>View Taluka Members</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: WARD CHAIRMEN DIRECTORY ───────────────────── */}
      {activeTab === "chairmen" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-gray-800">Ward Chairmen Directory</h2>
              <p className="text-xs text-gray-400">
                All assigned Ward Chairmen monitoring wards across {currentDistrictName || "the district"}
              </p>
            </div>

            {/* Controls: Search & View Mode Toggle */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Search chairman, ward..."
                  value={chairmanSearchQuery}
                  onChange={(e) => setChairmanSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
              </div>

              {/* Grid / List View Toggle */}
              <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold text-gray-600">
                <button
                  onClick={() => setChairmanViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${chairmanViewMode === "grid"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "hover:text-gray-900"
                    }`}
                  title="Grid / Card View"
                >
                  <Grid size={15} />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  onClick={() => setChairmanViewMode("list")}
                  className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${chairmanViewMode === "list"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "hover:text-gray-900"
                    }`}
                  title="List View"
                >
                  <List size={15} />
                  <span className="hidden sm:inline">List</span>
                </button>
              </div>
            </div>
          </div>

          {wardChairmenLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredWardChairmen.length === 0 ? (
            <EmptyState message="No Ward Chairmen found." />
          ) : chairmanViewMode === "grid" ? (
            /* GRID / CARD VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWardChairmen.map((chairman, idx) => (
                <div
                  key={chairman.id || idx}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                        {chairman.name?.charAt(0).toUpperCase() || "W"}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-800">{chairman.name}</h3>
                        <p className="text-xs text-purple-600 font-medium">Ward Chairman</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {chairman.status || "Active"}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Ward:</span>
                      <span className="font-semibold text-gray-800">{chairman.wardHobli || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Taluka:</span>
                      <span className="font-semibold text-gray-800">{chairman.taluk || "—"}</span>
                    </div>
                    {chairman.mobile && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Mobile:</span>
                        <span className="font-medium text-gray-800">{chairman.mobile}</span>
                      </div>
                    )}
                    {chairman.email && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Email:</span>
                        <span className="font-medium text-gray-800 truncate max-w-[160px]" title={chairman.email}>
                          {chairman.email}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* LIST / TABLE VIEW WITH PAGINATION */
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden space-y-2">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 bg-slate-50 text-gray-500 font-semibold uppercase tracking-wider">
                      <th className="p-3.5">Ward Chairman</th>
                      <th className="p-3.5">Ward</th>
                      <th className="p-3.5">Taluka</th>
                      <th className="p-3.5">Contact (Mobile / Email)</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedWardChairmen.map((chairman, idx) => (
                      <tr key={chairman.id || idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center flex-shrink-0">
                              {chairman.name?.charAt(0).toUpperCase() || "W"}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{chairman.name}</p>
                              <p className="text-[11px] text-purple-600 font-medium">Ward Chairman</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 font-semibold text-gray-800">{chairman.wardHobli || "—"}</td>
                        <td className="p-3.5 text-gray-600 font-medium">{chairman.taluk || "—"}</td>
                        <td className="p-3.5 text-gray-700">
                          <div>
                            <p className="font-medium text-gray-800">{chairman.mobile || "—"}</p>
                            <p className="text-[11px] text-blue-600 font-medium truncate max-w-[180px]" title={chairman.email || ""}>
                              {chairman.email || "—"}
                            </p>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {chairman.status || "Active"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Bar */}
              {totalChairmanPages > 1 && (
                <div className="p-4 border-t border-gray-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <span className="text-gray-500">
                    Showing{" "}
                    <span className="font-semibold text-gray-800">
                      {(chairmanPage - 1) * chairmanItemsPerPage + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold text-gray-800">
                      {Math.min(chairmanPage * chairmanItemsPerPage, filteredWardChairmen.length)}
                    </span>{" "}
                    of <span className="font-semibold text-gray-800">{filteredWardChairmen.length}</span> Ward Chairmen
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setChairmanPage((prev) => Math.max(prev - 1, 1))}
                      disabled={chairmanPage === 1}
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-gray-700 flex items-center gap-1 transition-all"
                    >
                      <ChevronLeft size={13} />
                      <span>Prev</span>
                    </button>

                    {Array.from({ length: totalChairmanPages }, (_, i) => i + 1).map((pg) => (
                      <button
                        key={pg}
                        onClick={() => setChairmanPage(pg)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${chairmanPage === pg
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                          }`}
                      >
                        {pg}
                      </button>
                    ))}

                    <button
                      onClick={() => setChairmanPage((prev) => Math.min(prev + 1, totalChairmanPages))}
                      disabled={chairmanPage === totalChairmanPages}
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

      {/* ── TAB 4: DISTRICT MEMBERS DIRECTORY ────────────────── */}
      {activeTab === "members" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4 p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-gray-800">District Members Directory</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Showing {filteredMembers.length.toLocaleString()} total members in {currentDistrictName || "district"}
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Limit Dropdown Selector */}
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
                    className={`px-2.5 py-1 rounded-lg transition-all ${memberPlanFilter === plan ? "bg-white text-blue-600 shadow-sm" : "hover:text-gray-900"
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
                  className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Members Table */}
          {districtUsersLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredMembers.length === 0 ? (
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
                    {paginatedMembers.map((u) => (
                      <tr key={u.userId || u._id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0">
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
                        <td className="p-3.5 text-gray-600">{u.district || u.districtName || "—"}</td>
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
                <div className="p-4 border-t border-gray-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <span className="text-gray-500">
                    Showing{" "}
                    <span className="font-semibold text-gray-800">
                      {(memberPage - 1) * memberItemsPerPage + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold text-gray-800">
                      {Math.min(memberPage * memberItemsPerPage, filteredMembers.length)}
                    </span>{" "}
                    of <span className="font-semibold text-gray-800">{filteredMembers.length.toLocaleString()}</span> Members
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
                          className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${pg === current
                            ? "bg-blue-600 text-white shadow-sm"
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
                Business partner units operating within {currentDistrictName || "the district"}
              </p>
            </div>

            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Search partner, business name..."
                value={cpSearchQuery}
                onChange={(e) => setCpSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
            </div>
          </div>

          {channelPartnersLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredChannelPartners.length === 0 ? (
            <EmptyState message="No Channel Partners found in this district." icon={Building2} />
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
                      <span className="text-gray-400">Ward:</span>
                      <span className="font-semibold text-gray-800">{cp.wardName || cp.ward || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Taluka:</span>
                      <span className="font-semibold text-gray-800">{cp.talukaName || cp.taluka || "—"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default DistrictHeadDashboard;