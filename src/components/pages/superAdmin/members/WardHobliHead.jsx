import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Users } from "lucide-react";
import HeadTable from "../members/Headtable.jsx";
import { fetchHeadsByRole } from "../../../redux/slices/headSlice.js";
import { ROLES } from "../../../utils/roles.js";
import HeadViewModal from "../members/HeadViewModal.jsx";

const ROLE = ROLES.WARD_CHAIRMAN;
const EMPTY = { data: [], loading: false, error: null };

export default function WardHobliHead() {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((s) => s.head?.[ROLE] ?? EMPTY);
  const [viewRow, setViewRow] = useState(null);
  useEffect(() => { dispatch(fetchHeadsByRole(ROLE)); }, [dispatch]);

  return (
    <div className="bg-[#F8FAFC] -m-6 p-6 min-h-full space-y-5">
      <div>
        <h1 className="text-[20px] font-bold text-[#0F172A] leading-tight">Ward / Hobli Heads</h1>
        <p className="text-[12px] text-[#94A3B8] mt-0.5">
          {loading ? "Loading…" : error ? "Failed to load records" : `Manage all ward / hobli-level heads · ${data.length} records`}
        </p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-[12.5px] text-red-600">{error}</div>
      )}

      <HeadTable
        title="Ward / Hobli Head List"
        subtitle="All wards & hoblis · Taluk-level representatives"
        icon={Users}
        type="ward"
        data={data}
        loading={loading}
        onView={(row) => console.log("View", row)}
        onEdit={(row) => console.log("Edit", row)}
        onDelete={(row) => console.log("Delete", row)}
      />
      {/* ── View Modal ── */}
      <HeadViewModal
        row={viewRow}
        onClose={() => setViewRow(null)}
      />
    </div>
  );
}