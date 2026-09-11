import React from "react";
import { Users, Heart, Sparkles, Dog, Bookmark } from "lucide-react";

function InfoRow({ label, value, fullWidth = false }) {
  return (
    <div className={`flex flex-col gap-1 py-3 px-5 border-b border-[#F1F5F9] last:border-0 ${fullWidth ? "col-span-2 max-sm:col-span-1" : ""}`}>
      <span className="text-[10px] font-semibold uppercase tracking-[0.07em] text-slate-400">
        {label}
      </span>
      <span className="text-[13px] text-[#1a2b4a] font-medium">
        {value || <span className="text-slate-300 font-normal">Not provided</span>}
      </span>
    </div>
  );
}

function ChipGroup({ label, items }) {
  const list = Array.isArray(items) ? items.filter(Boolean) : (items ? [items] : []);
  return (
    <div className="flex flex-col gap-1.5 py-3 px-5 border-b border-[#F1F5F9] last:border-0 col-span-2 max-sm:col-span-1">
      <span className="text-[10px] font-semibold uppercase tracking-[0.07em] text-slate-400">
        {label}
      </span>
      {list.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {list.map((item, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#EEF3FD] text-[#1a56db] border border-[#D5E2FC]"
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-[13px] text-slate-300 font-normal">Not provided</span>
      )}
    </div>
  );
}

export default function FamilyInfoCard({ profileDetails }) {
  const {
    familyCount,
    spouse,
    children,
    pets,
    hobbies,
    interests,
    activitiesOrInterests,
    familyInformation,
    selectedBusinessVertical,
  } = profileDetails || {};

  const allInterests = (Array.isArray(interests) && interests.length > 0)
    ? interests
    : (activitiesOrInterests ? [activitiesOrInterests] : []);

  const hasAnyData = familyCount || spouse || (children && children.length) || pets || (hobbies && hobbies.length) || allInterests.length || familyInformation || selectedBusinessVertical;

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F1F5F9]">
        <div className="w-8 h-8 rounded-lg bg-[#F0FDF4] flex items-center justify-center shrink-0">
          <Users size={15} className="text-[#166534]" />
        </div>
        <div>
          <h2 className="text-[14px] font-semibold text-[#1a2b4a]">Family & Personal details</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Family members, hobbies and personal interests</p>
        </div>
      </div>

      <div className="grid grid-cols-2 max-sm:grid-cols-1">
        <InfoRow label="Family count" value={familyCount !== null && familyCount !== undefined ? String(familyCount) : null} />
        <InfoRow label="Spouse" value={spouse} />
        <InfoRow label="Pets" value={pets} />
        <InfoRow label="Business vertical" value={selectedBusinessVertical} />
        <ChipGroup label="Children" items={children} />
        <ChipGroup label="Hobbies" items={hobbies} />
        <ChipGroup label="Interests & Activities" items={allInterests} />
        {familyInformation && (
          <InfoRow label="Family information" value={familyInformation} fullWidth />
        )}
      </div>
    </div>
  );
}
