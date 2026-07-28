// ============================================================
// DistrictHeadDashboard.jsx
// ============================================================

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import {
  Users,
  Map,
  UserCheck,
  BarChart2,
  InboxIcon,
  CheckCircle2,
  AlertCircle,
  Circle,
} from "lucide-react";

import { fetchUsersByDistrict } from "../../redux/slices/dashboardSlice.js";
import { fetchHeadsByRole } from "../../redux/slices/headSlice.js";
import { ROLES } from "../../utils/roles.js";
import { selectUser } from "../../redux/slices/authSlice.js";
import LocationBanner from "../../common/LocationBanner.jsx";
// ============================================================
// HELPERS
// ============================================================

const EmptyState = ({ message = "No data available" }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
      <InboxIcon size={18} className="text-gray-400" />
    </div>
    <p className="text-sm text-gray-400">{message}</p>
  </div>
);

const DonutTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
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
// MAIN
// ============================================================

const DistrictHeadDashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  // ── district users ────────────────────────────────────────
  const districtUsers = useSelector((s) => s.dashboard.districtUsers);
  const districtUsersTotal = useSelector((s) => s.dashboard.districtUsersTotal);
  const districtUsersLoading = useSelector((s) => s.dashboard.districtUsersLoading);
  const districtUsersError = useSelector((s) => s.dashboard.districtUsersError);

  // ── taluka heads (for active taluks count) ─────────────────
  const ROLE = ROLES.TALUKA_HEAD;
  const EMPTY_HEAD = { data: [], loading: false, error: null };
  const { data: talukaHeads, loading: talukaLoading } =
    useSelector((s) => s.head?.[ROLE] ?? EMPTY_HEAD);

  // ── fetch on mount ────────────────────────────────────────
  useEffect(() => {
    if (user?.district) {
      dispatch(fetchUsersByDistrict(user.district));
    }
    dispatch(fetchHeadsByRole(ROLE));
  }, [dispatch, user?.district]);

  // ── derived ───────────────────────────────────────────────
  const activeTaluks = talukaHeads.length;

  // member plan breakdown for donut
  const primeCount = districtUsers.filter((u) => u.isPrime).length;
  const basicCount = districtUsers.filter((u) => u.isBasic && !u.isPrime).length;
  const freeCount = districtUsers.filter((u) => !u.isPrime && !u.isBasic).length;

  const memberStatusData =
    districtUsersTotal > 0
      ? [
        { name: "Prime", value: primeCount, color: "#8B5CF6" },
        { name: "Basic", value: basicCount, color: "#3B82F6" },
        { name: "Free", value: freeCount, color: "#E5E7EB" },
      ].filter((d) => d.value > 0)
      : [];

  // ── summary cards ─────────────────────────────────────────
  const summaryCards = [
    {
      label: "Total Members",
      value: districtUsersLoading ? "…" : String(districtUsersTotal),
      sub: "District members",
      hasData: districtUsersTotal > 0,
      icon: Users,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Active Taluks",
      value: talukaLoading ? "…" : String(activeTaluks),
      sub: `${activeTaluks} taluk head${activeTaluks !== 1 ? "s" : ""}`,
      hasData: activeTaluks > 0,
      icon: Map,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      label: "Channel Partners",
      value: "—",
      sub: "No data yet",
      hasData: false,
      icon: UserCheck,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">

      {/* ── PAGE HEADER ──────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-semibold text-gray-800">District Head</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          District-wide operations overview · Live data
        </p>
      </div>

      <LocationBanner level="district" />

      {/* ── SUMMARY CARDS ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-medium text-gray-500 leading-snug">
                  {card.label}
                </span>
                <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 ${card.iconBg}`}>
                  <Icon size={17} className={card.iconColor} />
                </div>
              </div>
              <p className={`text-3xl font-semibold leading-none ${card.hasData ? "text-gray-800" : "text-gray-300"}`}>
                {card.value}
              </p>
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full w-fit ${card.hasData ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"
                }`}>
                {card.sub}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── ANALYTICS ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* LEFT — District Member Growth (empty — no monthly API yet) */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1">
            <BarChart2 size={15} className="text-blue-500" />
            District Member Growth
          </h2>
          <p className="text-xs text-gray-400 mb-2">Monthly registration trend</p>
          <EmptyState message="Month-wise growth data not available yet." />
        </div>

        {/* RIGHT — Member Plan Donut */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-1">Member Plans</h2>
          <p className="text-xs text-gray-400 mb-2">Plan distribution</p>

          {memberStatusData.length === 0 ? (
            <EmptyState message="No member data available." />
          ) : (
            <>
              <div className="flex items-center justify-center h-44">
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
                  <p className="text-xl font-bold text-gray-800">
                    {districtUsersTotal.toLocaleString()}
                  </p>
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
                        {districtUsersTotal > 0
                          ? Math.round((d.value / districtUsersTotal) * 100)
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

      {/* ── RECENT MEMBERS TABLE ─────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-700">District Members</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              All registered members in this district
              {districtUsersTotal > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                  {districtUsersTotal} total
                </span>
              )}
            </p>
          </div>
        </div>

        {districtUsersLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          </div>
        ) : districtUsersError ? (
          <EmptyState message={districtUsersError} />
        ) : districtUsers.length === 0 ? (
          <EmptyState message="No members found in this district." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-gray-100 bg-gray-50">
                  {["Name", "Mobile", "Ward", "District", "State", "Plan"].map((h) => (
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
                {districtUsers.map((u) => (
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
                    <td className="px-5 py-3 text-gray-600 capitalize">{u.ward ?? "—"}</td>
                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{u.district}</td>
                    <td className="px-5 py-3 text-gray-600">{u.state}</td>
                    <td className="px-5 py-3">
                      {u.isPrime ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">Prime</span>
                      ) : u.isBasic ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">Basic</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Free</span>
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

export default DistrictHeadDashboard;