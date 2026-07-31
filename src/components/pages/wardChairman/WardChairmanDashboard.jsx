// ============================================================
// WardChairmanDashboard.jsx
// Udyami Bharat Admin Portal — Ward Chairman Dashboard
// ============================================================

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchUsersByWard } from "../../redux/slices/dashboardSlice.js";
import {
  Users,
  UserCheck,
  UserPlus,
  Briefcase,
  IndianRupee,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Circle,
  MapPin,
  Flag,
  BarChart2,
  InboxIcon,
} from "lucide-react";
import { getLocationByWardHeadId, selectWardInfo } from "../../redux/slices/areaChartSlice.js";
import { selectUser } from "../../redux/slices/authSlice";

// ============================================================
// HELPER — STATUS BADGE
// ============================================================
const StatusBadge = ({ status }) => {
  const map = {
    Completed: "bg-green-50 text-green-700 border border-green-200",
    Pending: "bg-amber-50 text-amber-700 border border-amber-200",
    Rejected: "bg-red-50 text-red-700 border border-red-200",
    Active: "bg-blue-50 text-blue-700 border border-blue-200",
    Low: "bg-orange-50 text-orange-700 border border-orange-200",
  };
  const icons = {
    Completed: <CheckCircle2 size={11} />,
    Pending: <Circle size={11} />,
    Rejected: <AlertCircle size={11} />,
    Active: <CheckCircle2 size={11} />,
    Low: <AlertCircle size={11} />,
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {icons[status]}
      {status}
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
          {payload[0].value} members
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
  <div className="flex flex-col items-center justify-center py-12 text-center">
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
  const locationData = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("locationData")) || null;
    } catch {
      return null;
    }
  }, []);

  if (!locationData) return null;

  const crumbs = [
    { label: locationData.districtName, icon: MapPin, color: "text-blue-500", bg: "bg-blue-50" },
    { label: locationData.talukaName, icon: Flag, color: "text-purple-500", bg: "bg-purple-50" },
    { label: locationData.wardName, icon: MapPin, color: "text-emerald-500", bg: "bg-emerald-50" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-3.5 flex flex-wrap items-center gap-3">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest mr-1">
        Your Ward
      </span>
      {crumbs.map((c, i) => {
        const Icon = c.icon;
        return (
          <React.Fragment key={c.label}>
            {i > 0 && <ChevronRight size={13} className="text-gray-300 flex-shrink-0" />}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.color}`}>
              <Icon size={12} />
              {c.label}
            </span>
          </React.Fragment>
        );
      })}
      <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-gray-400">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        Live
      </span>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const WardChairmanDashboard = () => {
  const [memberTab, setMemberTab] = useState("all");

  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const wardInfo = useSelector(selectWardInfo);

  // ── API call on mount ─────────────────────────────────────
  useEffect(() => {
    if (user?.userId) {
      dispatch(getLocationByWardHeadId(user.userId));
    }
  }, [dispatch, user?.userId]);

  // ── Derived data ──────────────────────────────────────────
  const totalWardMembers = wardInfo?.totalWardChartMembers ?? null;
  const wardChartMembers = wardInfo?.wardChartMembers ?? [];
  const activeCount = wardChartMembers.filter((m) => m.isActive === true).length;
  const inactiveCount = wardChartMembers.filter((m) => m.isActive === false).length;
  const wardUsers = useSelector((s) => s.dashboard.wardUsers);
  const wardUsersTotal = useSelector((s) => s.dashboard.wardUsersTotal);
  const wardUsersLoading = useSelector((s) => s.dashboard.wardUsersLoading);
  const wardUsersError = useSelector((s) => s.dashboard.wardUsersError);
  const memberStatusData =
    wardChartMembers.length > 0
      ? [
        { name: "Active", value: activeCount, color: "#3B82F6" },
        { name: "Inactive", value: inactiveCount, color: "#E5E7EB" },
      ]
      : [];

  // Dispatch when locationData is available (after wardInfo loads):
  useEffect(() => {
    try {
      const loc = JSON.parse(localStorage.getItem("locationData"));
      if (loc?.wardName) {
        dispatch(fetchUsersByWard(loc.wardName));
      }
    } catch { }
  }, [dispatch]);

  const totalStatusCount = memberStatusData.reduce((s, d) => s + d.value, 0);

  // ── SUMMARY CARDS ─────────────────────────────────────────
  const summaryCards = [
    {
      label: "Total Members",
      value: totalWardMembers !== null ? String(totalWardMembers) : "—",
      sub: "Ward chart members",
      subOk: true,
      icon: Users,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Active Channel Partners",
      value: "—",
      sub: "No data yet",
      subOk: true,
      icon: UserCheck,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      label: "Active Business Leads",
      value: "—",
      sub: "No data yet",
      subOk: true,
      icon: Briefcase,
      iconBg: "bg-cyan-50",
      iconColor: "text-cyan-600",
    },
    // {
    //   label:     "Monthly Collection",
    //   value:     "—",
    //   sub:       "No data yet",
    //   subOk:     true,
    //   icon:      IndianRupee,
    //   iconBg:    "bg-emerald-50",
    //   iconColor: "text-emerald-600",
    // },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">

      {/* ── PAGE HEADER ──────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Ward Chairman</h1>
        <p className="text-sm text-gray-500 mt-0.5">Ward operations overview · Live data</p>
      </div>

      {/* ── WARD LOCATION BANNER ─────────────────────────────── */}
      <WardLocationBanner />

      {/* ── SUMMARY CARDS (5) ────────────────────────────────── */}
      {/* ── SUMMARY CARDS ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          const hasData = card.value !== "—";
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3"
            >
              {/* Top row — label + icon */}
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-medium text-gray-500 leading-snug">
                  {card.label}
                </span>
                <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 ${card.iconBg}`}>
                  <Icon size={17} className={card.iconColor} />
                </div>
              </div>

              {/* Value */}
              <p className={`text-3xl font-semibold leading-none ${hasData ? "text-gray-800" : "text-gray-300"}`}>
                {card.value}
              </p>

              {/* Badge */}
              <span
                className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full w-fit ${hasData
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

      {/* ── SECTION 2 — ANALYTICS ────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* LEFT — Ward Member Growth */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <BarChart2 size={15} className="text-blue-500" />
                Ward Member Growth
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Monthly registration trend</p>
            </div>
          </div>
          <EmptyState message="Month-wise growth data not available yet." />
        </div>

        {/* RIGHT — Member Status Donut */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="mb-1">
            <h2 className="text-sm font-semibold text-gray-700">Member Status</h2>
            <p className="text-xs text-gray-400 mt-0.5">Current distribution</p>
          </div>

          {memberStatusData.length === 0 ? (
            <EmptyState message="No member data available." />
          ) : (
            <>
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
                  <p className="text-xl font-bold text-gray-800">{totalStatusCount}</p>
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
                        {totalStatusCount > 0
                          ? Math.round((d.value / totalStatusCount) * 100)
                          : 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── SECTION 3 — CHANNEL PARTNER PERFORMANCE ──────────── */}
      {/* <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-5 pt-5 pb-3">
          <h2 className="text-sm font-semibold text-gray-700">Channel Partner Performance</h2>
          <p className="text-xs text-gray-400 mt-0.5">Ward-level partner activity</p>
        </div>
        <EmptyState message="Channel partner data not available yet." />
        <div className="pb-4" />
      </div> */}

      {/* ── SECTION 4 — RECENT MEMBER REGISTRATIONS ──────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-700">Recent Member Registrations</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Latest onboarding activity across ward
              {wardUsersTotal > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-blue-50 text-bTotal Memberslue-700 rounded-full text-xs font-medium">
                  {wardUsersTotal} total
                </span>
              )}
            </p>
          </div>
        </div>

        {wardUsersLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          </div>
        ) : wardUsersError ? (
          <EmptyState message={wardUsersError} />
        ) : wardUsers.length === 0 ? (
          <EmptyState message="No member registration data available yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-gray-100 bg-gray-50">
                  {["Name", "Mobile", "Gender", "District", "Pincode", "Plan"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {wardUsers.map((u) => (
                  <tr key={u.userId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-blue-600">
                            {u.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{u.mobileNumber}</td>
                    <td className="px-5 py-3 text-gray-600">{u.gender ?? "—"}</td>
                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{u.district}</td>
                    <td className="px-5 py-3 text-gray-600">{u.pincode}</td>
                    <td className="px-5 py-3">
                      {u.isPrime ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                          Prime
                        </span>
                      ) : u.isBasic ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          Basic
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
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
        <div className="pb-4" />
      </div>

    </div>
  );
};

export default WardChairmanDashboard;