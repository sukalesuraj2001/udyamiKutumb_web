import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";   // ← add
import { ArrowRight } from "lucide-react";

const TONES = {
  full: {
    bar: "bg-emerald-500",
    accentBorder: "border-l-emerald-500",
    badge: "bg-emerald-50 text-emerald-700",
    label: "Fully Built",
    dotColor: "bg-emerald-500",
    btnCls:
      "text-emerald-700 border-emerald-200 bg-emerald-50/60 hover:bg-emerald-600 hover:text-white hover:border-emerald-600",
  },
  progress: {
    bar: "bg-amber-500",
    accentBorder: "border-l-amber-500",
    badge: "bg-amber-50 text-amber-700",
    label: "In Progress",
    dotColor: "bg-amber-500",
    btnCls:
      "text-blue-600 border-blue-200 bg-blue-50/60 hover:bg-blue-600 hover:text-white hover:border-blue-600",
  },
  empty: {
    bar: "bg-slate-200",
    accentBorder: "border-l-slate-300",
    badge: "bg-slate-100 text-slate-500",
    label: "Empty",
    dotColor: "bg-slate-300",
    btnCls:
      "text-slate-600 border-slate-200 bg-white hover:bg-slate-700 hover:text-white hover:border-slate-700",
  },
};
// Role → base path mapping
const AREA_CHART_BASE = {
  SuperAdmin: "/super-admin-dashboard/area-chart",
  StateHead: "/state-head-dashboard/area-chart",
  DistrictHead: "/district-head-dashboard/area-chart",
  TalukHead: "/taluk-head-dashboard/area-chart",
  WardChairman: "/wardChairman/area-chart",
};

export default function WardCard({ ward }) {

  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);   // ← add

  const { ward_name, ward_number, booths_built = 0 } = ward;
  const booths_total = Number(ward.layoutCount || ward.booths_total || 103);
  const pct = Math.round((booths_built / (booths_total || 103)) * 100);
  const status = booths_built <= 0 ? "empty" : booths_built >= booths_total ? "full" : "progress";
  const t = TONES[status];

  const basePath = AREA_CHART_BASE[user?.role] ?? "/wardChairman/area-chart";  // ← add

  return (
    <div className={`rounded-xl border border-slate-200 border-l-[3px] ${t.accentBorder} bg-white p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group`}>
      <p className="text-[10.5px] font-bold tracking-widest uppercase text-slate-400 mb-1">Ward {ward_number}</p>
      <h4 className="text-[14px] font-semibold text-slate-800 leading-snug mb-0.5 line-clamp-2">{ward_name}</h4>
      <p className="text-[12px] text-slate-500 mb-4">{ward.constituency}</p>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${t.badge}`}>{t.label}</span>
          <span className="text-[11.5px] font-bold text-slate-600 tabular-nums">{booths_built}/{booths_total}</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div className={`h-full rounded-full ${t.bar} transition-all duration-500`} style={{ width: `${Math.max(pct, 3)}%` }} />
        </div>
        <p className="text-right text-[11px] font-medium text-slate-400 mt-1 tabular-nums">{pct}% complete</p>
      </div>

      <button
        onClick={() => {
          console.log('ward.id:', ward.id);      
          console.log('user.role:', user?.role); 
          console.log('basePath:', basePath);    
          navigate(`${basePath}/${ward.id}`, { state: { ward } });
        }}  // ← fix
        className={`w-full flex items-center justify-center gap-1.5 text-[12.5px] font-semibold border rounded-lg py-2 transition-all duration-200 ${t.btnCls}`}
      >
        View Chart
        <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform duration-150" />
      </button>
    </div>
  );
}