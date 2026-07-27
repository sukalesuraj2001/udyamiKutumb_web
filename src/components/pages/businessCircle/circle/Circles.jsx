import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useSelector } from "react-redux";
import { selectUser } from "../../../redux/slices/authSlice.js";
import CircleCard from "./CircleCard.jsx";
import CircleFormPanel from "./CircleFormPanel.jsx";
import DeleteCircleModal from "./DeleteCircleModal.jsx";

// ─── Sample data (replace with API) ───────────────────────────────────────────
const SAMPLE_CIRCLES = [
  { id: "c1", name: "Malleswaram Circle G5", location: "Malleshwaram", meetingDay: "18th june", meetingTime: "5pm", seatsFilled: 0, status: "Active" },
  { id: "c2", name: "Nelamangala Circle -G33", location: "Nelamangala", meetingDay: "26th June", meetingTime: "5pm", seatsFilled: 14, status: "Active" },
  { id: "c3", name: "Yeshwanthpur Circle", location: "Yeshwanthapura", meetingDay: "", meetingTime: "", seatsFilled: 3, status: "Active" },
  { id: "c4", name: "Indiranagar Growth Circle", location: "C.V. Raman Nagar", meetingDay: "Thursday", meetingTime: "8:00 AM", seatsFilled: 0, status: "Active" },
  { id: "c5", name: "Jayanagar Enterprise Circle", location: "Jayanagar", meetingDay: "Saturday", meetingTime: "9:00 AM", seatsFilled: 2, status: "Active" },
  { id: "c6", name: "Bangalore Central Circle", location: "Shivajinagar", meetingDay: "Tuesday", meetingTime: "7:30 AM", seatsFilled: 4, status: "Active" },
];

const MY_CIRCLE = {
  name: "G5 Malleshwaram circle",
  stats: { members: 44, attendance: "78%", coverage: "15/18", openItems: 3 },
  leadership: [
    { role: "Chairman", name: "Pavithra" },
    { role: "President", name: "Suresh Rao" },
    { role: "General secretary", name: "Anita Kumar" },
    { role: "Treasurer", name: null },
  ],
  openItems: [
    { label: "Applications", count: 2, color: "bg-orange-100 text-orange-600" },
    { label: "Lead appeals", count: 1, color: "bg-purple-100 text-purple-600" },
    { label: "Red scorecards", count: 3, color: "bg-red-100   text-red-600" },
    { label: "Sectors unfilled", count: 6, color: null },
  ],
  spinOff: { wardName: "Ward 4 (G5.48)", members: 28 },
};

// ─── Member view ──────────────────────────────────────────────────────────────
function MemberCircleView() {
  const { name, stats, leadership, openItems, spinOff } = MY_CIRCLE;
  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12.5px] text-[#9CA3AF] mb-0.5">Circles</p>
          <h2 className="text-[22px] font-bold text-[#111827]">{name}</h2>
        </div>
        <button className="shrink-0 border border-[#D1D5DB] rounded-xl px-4 py-2 text-[13.5px] font-medium text-[#374151] hover:bg-gray-50 transition-colors">
          Message chairman
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Members", value: stats.members },
          { label: "Attendance", value: stats.attendance },
          { label: "Coverage", value: stats.coverage },
          { label: "Open items", value: stats.openItems },
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
          <p className="text-[15px] font-semibold text-[#111827] mb-4">Open items</p>
          <table className="w-full text-[13.5px]">
            <tbody>
              {openItems.map(({ label, count, color }, i) => (
                <tr key={label} className={i < openItems.length - 1 ? "border-b border-[#F3F4F6]" : ""}>
                  <td className="py-3 text-[#374151]">{label}</td>
                  <td className="py-3 text-right">
                    {color ? (
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-[12.5px] font-semibold ${color}`}>
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
      <div className="flex items-center justify-between gap-4 rounded-xl bg-teal-50 border border-teal-200 px-4 py-3">
        <div className="flex items-center gap-2.5 text-[13px] text-teal-700">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
          {spinOff.wardName} has {spinOff.members} members — eligible to spin off
        </div>
        <button className="shrink-0 bg-teal-700 hover:bg-teal-800 transition-colors text-white text-[13px] font-semibold px-4 py-2 rounded-lg">
          Start spin-off
        </button>
      </div>

    </div>
  );
}

// ─── Admin / other roles view ─────────────────────────────────────────────────
function AdminCirclesView() {
  const [circles, setCircles] = useState(SAMPLE_CIRCLES);
  const [panel, setPanel] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleCreate = () => setPanel({ mode: "create" });
  const handleEdit = (c) => setPanel({ mode: "edit", circle: c });
  const handleDelete = (c) => setDeleteTarget(c);
  const handleManageSeats = (c) => console.log("Manage seats:", c);

  const handleFormSubmit = (form) => {
    if (form.id) {
      setCircles((prev) => prev.map((c) => (c.id === form.id ? { ...c, ...form, location: form.assembly || form.location } : c)));
    } else {
      setCircles((prev) => [...prev, { id: `c-${Date.now()}`, name: form.name, location: form.assembly || form.location, meetingDay: form.meetingDay, meetingTime: form.meetingTime, seatsFilled: 0, status: "Active" }]);
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
        <h2 className="text-[18px] font-semibold text-[#111827]">Circles</h2>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-[#3B5BDB] text-white text-[13.5px] font-semibold px-4 py-2.5 rounded-xl hover:bg-[#3451C7] transition-colors"
        >
          <Plus size={16} /> New circle
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {circles.map((c) => (
          <CircleCard key={c.id} circle={c} onEdit={handleEdit} onDelete={handleDelete} onManageSeats={handleManageSeats} />
        ))}
      </div>

      {panel && <CircleFormPanel mode={panel.mode} circle={panel.circle} onClose={() => setPanel(null)} onSubmit={handleFormSubmit} />}
      {deleteTarget && <DeleteCircleModal circle={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleConfirmDelete} />}
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────
const CIRCLE_DETAIL_ROLES = ["Member", "DistrictHead", "TalukHead"];

export default function Circles() {
  const user = useSelector(selectUser);
  return CIRCLE_DETAIL_ROLES.includes(user?.role)
    ? <MemberCircleView />
    : <AdminCirclesView />;
}