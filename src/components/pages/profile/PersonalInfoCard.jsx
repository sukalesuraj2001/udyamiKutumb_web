import React from "react";
import { User } from "lucide-react";

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 py-3 px-5 border-b border-[#F1F5F9] last:border-0">
      <span className="text-[10px] font-semibold uppercase tracking-[0.07em] text-slate-400">
        {label}
      </span>
      <span className="text-[13px] text-[#1a2b4a] font-medium">
        {value || <span className="text-slate-300 font-normal">Not provided</span>}
      </span>
    </div>
  );
}

export default function PersonalInfoCard({ user, profileDetails }) {
  const {
    alternateMobile, gender, state, district,
    assembly, ward, pincode, homeAddress, officeAddress,
  } = profileDetails || {};

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F1F5F9]">
        <div className="w-8 h-8 rounded-lg bg-[#EEF3FD] flex items-center justify-center shrink-0">
          <User size={15} className="text-[#1a56db]" />
        </div>
        <div>
          <h2 className="text-[14px] font-semibold text-[#1a2b4a]">Personal information</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Your account details</p>
        </div>
      </div>

      <div className="grid grid-cols-2 max-sm:grid-cols-1">
        <InfoRow label="Full name"       value={user?.name} />
        <InfoRow label="Email"           value={user?.email} />
        <InfoRow label="Mobile"          value={user?.mobileNumber} />
        <InfoRow label="Alternate mobile" value={alternateMobile} />
        <InfoRow label="Gender"          value={gender} />
        <InfoRow label="Role"            value={user?.role} />
        <InfoRow label="State"           value={state} />
        <InfoRow label="District"        value={district} />
        <InfoRow label="Assembly"        value={assembly} />
        <InfoRow label="Ward"            value={ward} />
        <InfoRow label="Pincode"         value={pincode} />
        <InfoRow label="Account type"    value={user?.accountType || "Regular"} />
      </div>
      <div className="px-5 border-t border-[#F1F5F9]">
        <InfoRow label="Home address"   value={homeAddress} />
        <InfoRow label="Office address" value={officeAddress} />
      </div>
    </div>
  );
}