import React, { useState, useEffect, useMemo } from "react";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../../../redux/slices/authSlice.js";
import {
  getLocationByWardHeadId,
  selectWards,
} from "../../../redux/slices/areaChartSlice.js";
import {
  fetchBusinessCircleDashboard,
  selectBusinessCircleData,
  selectBusinessCircleLoading,
  selectBusinessCircleError,
} from "../../../redux/slices/businessCircleSlice.js";
import CircleCard from "./CircleCard.jsx";
import CircleFormPanel from "./CircleFormPanel.jsx";
import DeleteCircleModal from "./DeleteCircleModal.jsx";

// ─── Member view ──────────────────────────────────────────────────────────────
function MemberCircleView({ dataObj, summary, circlesList, loading, error }) {
  const circleName =
    dataObj.taluka?.talukaName
      ? `${dataObj.taluka.talukaName} Circle`
      : dataObj.district?.districtName
      ? `${dataObj.district.districtName} Circle`
      : "Business Circle";

  // Extract leadership from ward positions
  const leadership = useMemo(() => {
    let chairmanName = null;
    let presidentName = null;
    let secretaryName = null;
    let treasurerName = null;

    const wards = dataObj.wards || [];
    const assemblies = dataObj.assemblies || [];
    const items = wards.length > 0 ? wards : assemblies;

    items.forEach((item) => {
      if (Array.isArray(item.positions)) {
        item.positions.forEach((pos) => {
          const type = pos.assignment?.assignmentType;
          const posName = (pos.position?.positionName || "").toLowerCase();
          const userName = pos.user?.name;

          if (userName) {
            if ((type === "ward_chairman" || posName.includes("chairman")) && !chairmanName) {
              chairmanName = userName;
            } else if ((type === "president" || posName.includes("president")) && !presidentName) {
              presidentName = userName;
            } else if ((type === "secretary" || posName.includes("secretary")) && !secretaryName) {
              secretaryName = userName;
            } else if ((type === "treasurer" || posName.includes("treasurer")) && !treasurerName) {
              treasurerName = userName;
            }
          }
        });
      }
    });

    return [
      { role: "Chairman", name: chairmanName || "Nik (Aramane Nagara)" },
      { role: "President", name: presidentName || null },
      { role: "General secretary", name: secretaryName || null },
      { role: "Treasurer", name: treasurerName || null },
    ];
  }, [dataObj]);

  const openItemsList = [
    { label: "Basic members", count: summary.basicMembers ?? 0, color: "bg-blue-100 text-blue-600" },
    { label: "Prime members", count: summary.primeMembers ?? 31, color: "bg-emerald-100 text-emerald-600" },
    { label: "Gratitude slips", count: summary.totalGratitudeSlips ?? 15, color: "bg-purple-100 text-purple-600" },
    { label: "Leads pushed", count: summary.totalLeads ?? 27, color: "bg-amber-100 text-amber-600" },
  ];

  const eligibleCircle = circlesList.find(
    (c) => c.raw?.status?.toLowerCase() === "eligible" || c.status === "Active"
  ) || circlesList[0];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12.5px] text-[#9CA3AF] mb-0.5">Circles Overview</p>
          <h2 className="text-[22px] font-bold text-[#111827]">{circleName}</h2>
        </div>
        <button className="shrink-0 border border-[#D1D5DB] rounded-xl px-4 py-2 text-[13.5px] font-medium text-[#374151] hover:bg-gray-50 transition-colors">
          Message chairman
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Members", value: summary.totalMembers ?? 33 },
          { label: "Attendance", value: `${summary.attendancePercentage ?? 21}%` },
          { label: "Coverage", value: `${summary.uniquePresentMembers ?? 7}/${summary.totalMembers ?? 33}` },
          { label: "Open leads", value: summary.totalLeads ?? 27 },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl bg-[#F9F7F4] border border-[#EDE9E0] p-4">
            <p className="text-[12px] text-[#9CA3AF] mb-2">{label}</p>
            <p className="text-[28px] font-bold text-[#111827] leading-none">{value}</p>
          </div>
        ))}
      </div>

      {/* Leadership + Open items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Leadership */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
          <p className="text-[15px] font-semibold text-[#111827] mb-4">Leadership</p>
          <table className="w-full text-[13.5px]">
            <tbody>
              {leadership.map(({ role, name: person }, i) => (
                <tr key={role} className={i < leadership.length - 1 ? "border-b border-[#F3F4F6]" : ""}>
                  <td className="py-3 text-[#6B7280] w-1/2">{role}</td>
                  <td className="py-3">
                    {person ? (
                      <span className="text-[#111827] font-medium">{person}</span>
                    ) : (
                      <span className="inline-block bg-[#FEF3C7] text-[#92400E] text-[12px] font-medium px-2.5 py-1 rounded-lg">
                        Unassigned
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Open items */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
          <p className="text-[15px] font-semibold text-[#111827] mb-4">Summary Activity</p>
          <table className="w-full text-[13.5px]">
            <tbody>
              {openItemsList.map(({ label, count, color }, i) => (
                <tr key={label} className={i < openItemsList.length - 1 ? "border-b border-[#F3F4F6]" : ""}>
                  <td className="py-3 text-[#374151]">{label}</td>
                  <td className="py-3 text-right">
                    {color ? (
                      <span className={`inline-flex items-center justify-center min-w-7 h-7 px-2 rounded-full text-[12.5px] font-semibold ${color}`}>
                        {count}
                      </span>
                    ) : (
                      <span className="text-[#374151] font-medium">{count}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Spin-off banner */}
      {eligibleCircle && (
        <div className="flex items-center justify-between gap-4 rounded-xl bg-teal-50 border border-teal-200 px-4 py-3">
          <div className="flex items-center gap-2.5 text-[13px] text-teal-700">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            {eligibleCircle.name} has {eligibleCircle.seatsFilled} members — active circle
          </div>
          <button className="shrink-0 bg-teal-700 hover:bg-teal-800 transition-colors text-white text-[13px] font-semibold px-4 py-2 rounded-lg">
            Start spin-off
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Admin / Circles Grid view ────────────────────────────────────────────────
function AdminCirclesView({ initialCircles, loading }) {
  const [circles, setCircles] = useState([]);
  const [panel, setPanel] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (initialCircles && initialCircles.length > 0) {
      setCircles(initialCircles);
    }
  }, [initialCircles]);

  const handleCreate = () => setPanel({ mode: "create" });
  const handleEdit = (c) => setPanel({ mode: "edit", circle: c });
  const handleDelete = (c) => setDeleteTarget(c);
  const handleManageSeats = (c) => console.log("Manage seats:", c);

  const handleFormSubmit = (form) => {
    if (form.id) {
      setCircles((prev) =>
        prev.map((c) =>
          c.id === form.id
            ? { ...c, ...form, location: form.assembly || form.location }
            : c
        )
      );
    } else {
      setCircles((prev) => [
        ...prev,
        {
          id: `c-${Date.now()}`,
          name: form.name,
          location: form.assembly || form.location,
          meetingDay: form.meetingDay || "Weekly",
          meetingTime: form.meetingTime || "10:00 AM",
          seatsFilled: 0,
          status: "Active",
        },
      ]);
    }
    setPanel(null);
  };

  const handleConfirmDelete = (c) => {
    setCircles((prev) => prev.filter((x) => x.id !== c.id));
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-[18px] font-semibold text-[#111827]">Circles</h2>
          <span className="text-xs bg-blue-50 text-[#3B5BDB] px-2.5 py-0.5 rounded-full font-semibold">
            {circles.length} Circles
          </span>
          {loading && <Loader2 size={16} className="text-[#3B5BDB] animate-spin ml-1" />}
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-[#3B5BDB] text-white text-[13.5px] font-semibold px-4 py-2.5 rounded-xl hover:bg-[#3451C7] transition-colors"
        >
          <Plus size={16} /> New circle
        </button>
      </div>

      {circles.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 text-gray-400 text-sm">
          No circles available
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {circles.map((c) => (
            <CircleCard
              key={c.id}
              circle={c}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onManageSeats={handleManageSeats}
            />
          ))}
        </div>
      )}

      {panel && (
        <CircleFormPanel
          mode={panel.mode}
          circle={panel.circle}
          onClose={() => setPanel(null)}
          onSubmit={handleFormSubmit}
        />
      )}
      {deleteTarget && (
        <DeleteCircleModal
          circle={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────
export default function Circles() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const areaChartWards = useSelector(selectWards);
  const dashboardRes = useSelector(selectBusinessCircleData);
  const loading = useSelector(selectBusinessCircleLoading);
  const error = useSelector(selectBusinessCircleError);

  const userId = user?.userId || user?.id;

  // Dispatch location lookup if locationData is missing
  useEffect(() => {
    const locData = localStorage.getItem("locationData");
    if (!locData && userId) {
      const positionId = user?.position?.positionId || localStorage.getItem("positionId") || userId;
      dispatch(getLocationByWardHeadId(positionId));
    }
  }, [dispatch, userId, user?.position?.positionId]);

  // Determine user location ID and role type (district vs taluka)
  const { entityId, entityType } = useMemo(() => {
    let locData = null;
    try {
      locData = JSON.parse(localStorage.getItem("locationData"));
    } catch (e) {
      locData = null;
    }

    const role = user?.role || user?.roles?.[0] || "";
    const isDistrictHead =
      role === "DistrictHead" || role === "district_head";
    const isTalukHead =
      role === "TalukHead" || role === "TalukaHead" || role === "taluka_head";

    let id = null;
    let type = "taluka";

    if (isDistrictHead) {
      type = "district";
      id = locData?.districtId || user?.districtId || user?.district_id || "3a4b9264-bc85-4d60-b74a-32ea61304150";
    } else if (isTalukHead) {
      type = "taluka";
      id = locData?.talukaId || user?.talukaId || user?.taluka_id || "f9a6257c-7cbe-4c1c-a25a-8403ee801110";
    } else {
      if (locData?.districtId) {
        type = "district";
        id = locData.districtId;
      } else if (locData?.talukaId) {
        type = "taluka";
        id = locData.talukaId;
      }
    }

    if (!id) {
      id = user?.districtId || user?.talukaId || "3a4b9264-bc85-4d60-b74a-32ea61304150";
      type = "district";
    }

    return { entityId: id, entityType: type };
  }, [user, areaChartWards]);

  // Fetch dashboard API
  useEffect(() => {
    if (entityId && entityType) {
      dispatch(fetchBusinessCircleDashboard({ id: entityId, type: entityType }));
    }
  }, [dispatch, entityId, entityType]);

  const dataObj = dashboardRes?.data || dashboardRes || {};
  const summary = dataObj.summary || {};

  // Build dynamic circles list from response (assemblies or wards)
  const circlesList = useMemo(() => {
    if (Array.isArray(dataObj.assemblies) && dataObj.assemblies.length > 0) {
      return dataObj.assemblies.map((a) => ({
        id: a.assemblyId || a.talukaId,
        name: `${a.assemblyName || a.talukaName} Circle`,
        location: `${a.assemblyName || a.talukaName} Constituency`,
        meetingDay: a.status === "Live" ? "Weekly" : "Scheduled",
        meetingTime: a.attendancePercentage != null ? `${a.attendancePercentage}% Attendance` : "10:00 AM",
        seatsFilled: a.totalMembers ?? a.members ?? 0,
        status: a.status?.toLowerCase() === "live" ? "Active" : "Inactive",
        raw: a,
      }));
    }

    if (Array.isArray(dataObj.wards) && dataObj.wards.length > 0) {
      return dataObj.wards.map((w) => ({
        id: w.wardId,
        name: `${w.wardNumber ? w.wardNumber + " " : ""}${w.wardName} Circle`,
        location: w.talukaName || w.wardName,
        meetingDay: w.status === "Live" ? "Weekly" : "Scheduled",
        meetingTime: w.attendancePercentage != null ? `${w.attendancePercentage}% Attendance` : "10:00 AM",
        seatsFilled: w.members ?? 0,
        status: w.status?.toLowerCase() === "live" ? "Active" : "Inactive",
        raw: w,
      }));
    }

    return [];
  }, [dataObj]);

  const CIRCLE_DETAIL_ROLES = ["Member", "DistrictHead", "TalukHead"];
  const isDetailView = CIRCLE_DETAIL_ROLES.includes(user?.role);

  return isDetailView ? (
    <MemberCircleView
      dataObj={dataObj}
      summary={summary}
      circlesList={circlesList}
      loading={loading}
      error={error}
    />
  ) : (
    <AdminCirclesView initialCircles={circlesList} loading={loading} />
  );
}