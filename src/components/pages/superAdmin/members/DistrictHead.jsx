import React from "react";
import { Users } from "lucide-react";
import HeadTable from "../members/Headtable.jsx";
import { DISTRICT_HEAD_DATA } from "./Headdata.js";

export default function DistrictHead() {
  const handleView   = (row) => console.log("View",   row.memberId);
  const handleEdit   = (row) => console.log("Edit",   row.memberId);
  const handleDelete = (row) => console.log("Delete", row.memberId);

  return (
    <div className="bg-[#F8FAFC] -m-6 p-6 min-h-full space-y-5">

      {/* ── PAGE HEADER ──────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-[#0F172A] leading-tight">District Heads</h1>
          <p className="text-[12px] text-[#94A3B8] mt-0.5">
            Manage all district-level heads · {DISTRICT_HEAD_DATA.length} records
          </p>
        </div>
      </div>

      {/* ── TABLE ────────────────────────────────────────────── */}
      <HeadTable
        title="District Head List"
        subtitle="All districts · State-level representatives"
        icon={Users}
        type="district"
        data={DISTRICT_HEAD_DATA}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}