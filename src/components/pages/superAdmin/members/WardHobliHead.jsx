import React from "react";
import { Users } from "lucide-react";
import HeadTable from "../members/Headtable.jsx";
import { WARD_HOBLI_DATA } from "./headData.js";

export default function WardHobliHead() {
  const handleView   = (row) => console.log("View",   row.memberId);
  const handleEdit   = (row) => console.log("Edit",   row.memberId);
  const handleDelete = (row) => console.log("Delete", row.memberId);

  return (
    <div className="bg-[#F8FAFC] -m-6 p-6 min-h-full space-y-5">

      {/* ── PAGE HEADER ──────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-[#0F172A] leading-tight">Ward / Hobli Heads</h1>
          <p className="text-[12px] text-[#94A3B8] mt-0.5">
            Manage all ward / hobli-level heads · {WARD_HOBLI_DATA.length} records
          </p>
        </div>
      </div>

      {/* ── TABLE ────────────────────────────────────────────── */}
      <HeadTable
        title="Ward / Hobli Head List"
        subtitle="All wards & hoblis · Taluk-level representatives"
        icon={Users}
        type="ward"
        data={WARD_HOBLI_DATA}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}