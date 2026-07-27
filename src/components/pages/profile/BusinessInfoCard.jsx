import React from "react";
import { Building2, AlertCircle } from "lucide-react";

function InfoRow({ label, value, fullWidth = false }) {
  return (
    <div className={`flex flex-col gap-1 py-3 px-5 border-b border-[#F1F5F9] last:border-0 ${fullWidth ? "col-span-2" : ""}`}>
      <span className="text-[10px] font-semibold uppercase tracking-[0.07em] text-slate-400">
        {label}
      </span>
      <span className="text-[13px] text-[#1a2b4a] font-medium">
        {value || <span className="text-slate-300 font-normal">Not provided</span>}
      </span>
    </div>
  );
}

export default function BusinessInfoCard({ hasBusiness, businessDetails }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F1F5F9]">
        <div className="w-8 h-8 rounded-lg bg-[#FFF7ED] flex items-center justify-center shrink-0">
          <Building2 size={15} className="text-amber-500" />
        </div>
        <div>
          <h2 className="text-[14px] font-semibold text-[#1a2b4a]">Business information</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Registered business details</p>
        </div>
      </div>

      {!hasBusiness ? (
        <div className="flex flex-col items-center justify-center gap-3 py-10 px-5">
          <div className="w-10 h-10 rounded-full bg-[#FFF7ED] flex items-center justify-center">
            <AlertCircle size={18} className="text-amber-400" />
          </div>
          <div className="text-center">
            <p className="text-[13px] font-medium text-slate-500">No business registered</p>
            <p className="text-[11.5px] text-slate-400 mt-0.5">
              Business details will appear here once registered.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 max-sm:grid-cols-1">
          <InfoRow label="Business name"    value={businessDetails?.businessName} />
          <InfoRow label="Business type"    value={businessDetails?.businessType} />
          <InfoRow label="Sector"           value={businessDetails?.sector} />
          <InfoRow label="Owner"            value={businessDetails?.owner} />
          <InfoRow label="GST number"       value={businessDetails?.gst} />
          <InfoRow label="Employees"        value={businessDetails?.employees} />
          <InfoRow label="Working hours"    value={businessDetails?.workingHours} />
          <InfoRow label="Annual turnover"  value={businessDetails?.turnover} />
          <InfoRow label="Established"      value={businessDetails?.establishedYear} />
          <InfoRow label="License number"   value={businessDetails?.licenseNumber} />
          <InfoRow label="Business address" value={businessDetails?.businessAddress} fullWidth />
        </div>
      )}
    </div>
  );
}