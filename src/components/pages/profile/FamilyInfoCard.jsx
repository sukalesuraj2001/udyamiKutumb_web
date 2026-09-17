import React from "react";
import { Users } from "lucide-react";

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

// ─── Children display — handles both string[] (legacy) and object[] (new) ─────
function ChildrenDisplay({ children }) {
  const list = Array.isArray(children) ? children.filter(Boolean) : [];

  if (list.length === 0) {
    return (
      <div className="flex flex-col gap-1.5 py-3 px-5 border-b border-[#F1F5F9] col-span-2 max-sm:col-span-1">
        <span className="text-[10px] font-semibold uppercase tracking-[0.07em] text-slate-400">Children</span>
        <span className="text-[13px] text-slate-300 font-normal">Not provided</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 py-3 px-5 border-b border-[#F1F5F9] col-span-2 max-sm:col-span-1">
      <span className="text-[10px] font-semibold uppercase tracking-[0.07em] text-slate-400">
        Children
      </span>
      <div className="flex flex-col gap-2 pt-0.5">
        {list.map((child, idx) => {
          // support both string (legacy) and object (new)
          const name = typeof child === "string" ? child : (child?.name || "—");
          const age = typeof child === "object" ? child?.age : null;
          const mobile = typeof child === "object" ? child?.mobile : null;
          const ageNum = age ? parseInt(age) : null;
          const isMinor = ageNum !== null && ageNum > 0 && ageNum < 18;

          return (
            <div
              key={idx}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#F8FAFF] border border-[#E2E8F4]"
            >
              {/* Index badge */}
              <div className="w-7 h-7 rounded-full bg-[#EEF3FD] flex items-center justify-center text-[11px] font-bold text-[#1a56db] shrink-0">
                {idx + 1}
              </div>

              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="text-[13px] font-semibold text-[#1a2b4a] truncate">
                  {name}
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {ageNum > 0 && (
                    <span className="text-[11px] text-slate-400">
                      Age {ageNum}
                    </span>
                  )}
                  {/* Show mobile only if not minor */}
                  {!isMinor && mobile && (
                    <span className="text-[11px] text-slate-500 font-medium">
                      · {mobile}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Spouse display with prefix and mobile ─────────────────────────────────────
function SpouseRow({ spouse, spouseMobile, gender }) {
  const prefix = gender === "Male" ? "Mrs." : gender === "Female" ? "Mr." : "";
  const nameDisplay = spouse ? (prefix ? `${prefix} ${spouse}` : spouse) : null;
  return <InfoRow label="Spouse" value={nameDisplay} />;
}

// ─── Siblings / Family Members display — handles string[], object[], or string ──
function SiblingsDisplay({ label, items }) {
  const rawList = Array.isArray(items) ? items.filter(Boolean) : (items ? [items] : []);

  if (rawList.length === 0) {
    return (
      <div className="flex flex-col gap-1.5 py-3 px-5 border-b border-[#F1F5F9] col-span-2 max-sm:col-span-1">
        <span className="text-[10px] font-semibold uppercase tracking-[0.07em] text-slate-400">{label}</span>
        <span className="text-[13px] text-slate-300 font-normal">Not provided</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 py-3 px-5 border-b border-[#F1F5F9] col-span-2 max-sm:col-span-1">
      <span className="text-[10px] font-semibold uppercase tracking-[0.07em] text-slate-400">
        {label}
      </span>
      <div className="flex flex-col gap-2 pt-0.5">
        {rawList.map((item, idx) => {
          const name = typeof item === "string" ? item : (item?.name || "—");
          const age = typeof item === "object" ? item?.age : null;
          const mobile = typeof item === "object" ? item?.mobile : null;
          const ageNum = age ? parseInt(age) : null;
          const isMinor = ageNum !== null && ageNum > 0 && ageNum < 18;

          return (
            <div
              key={idx}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#F8FAFF] border border-[#E2E8F4]"
            >
              <div className="w-7 h-7 rounded-full bg-[#EEF3FD] flex items-center justify-center text-[11px] font-bold text-[#1a56db] shrink-0">
                {idx + 1}
              </div>

              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="text-[13px] font-semibold text-[#1a2b4a] truncate">
                  {name}
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {ageNum > 0 && (
                    <span className="text-[11px] text-slate-400">
                      Age {ageNum}
                    </span>
                  )}
                  {!isMinor && mobile && (
                    <span className="text-[11px] text-slate-500 font-medium">
                      · {mobile}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Parent display component (Father / Mother) ─────────────────────────────
function ParentRow({ label, data, nameFallback, ageFallback, mobileFallback }) {
  const name = typeof data === "object" && data !== null ? (data.name || nameFallback) : (typeof data === "string" ? data : nameFallback);
  const age = typeof data === "object" && data !== null ? (data.age || ageFallback) : ageFallback;
  const mobile = typeof data === "object" && data !== null ? (data.mobile || mobileFallback) : mobileFallback;
  const ageNum = age ? parseInt(age) : null;

  if (!name) {
    return <InfoRow label={label} value={null} />;
  }

  const details = [
    ageNum > 0 ? `Age ${ageNum}` : null,
    mobile ? mobile : null
  ].filter(Boolean).join(" · ");

  const valueDisplay = details ? `${name} (${details})` : name;
  return <InfoRow label={label} value={valueDisplay} />;
}

export default function FamilyInfoCard({ profileDetails }) {
  const {
    familyCount,
    maritalStatus,
    spouse,
    spouseMobile,
    spouseMobileNumber,
    spousePhone,
    fatherName,
    fathersName,
    fatherAge,
    fatherMobile,
    father,
    fatherDetails,
    motherName,
    mothersName,
    motherAge,
    motherMobile,
    mother,
    motherDetails,
    brotherName,
    brothers,
    brother,
    sisterName,
    sisters,
    sister,
    gender,
    children,
    pets,
    hobbies,
    interests,
    activitiesOrInterests,
    familyInformation,
    selectedBusinessVertical,
  } = profileDetails || {};

  const sMobile = spouseMobile || spouseMobileNumber || spousePhone;
  const fatherObj = father || fatherDetails;
  const fatherNameVal = fatherName || fathersName;
  const motherObj = mother || motherDetails;
  const motherNameVal = motherName || mothersName;
  const brothersList = (Array.isArray(brothers) && brothers.length > 0) ? brothers : (brotherName || brother);
  const sistersList = (Array.isArray(sisters) && sisters.length > 0) ? sisters : (sisterName || sister);

  const isMarried = maritalStatus
    ? maritalStatus === "Married"
    : Boolean(spouse || (Array.isArray(children) && children.length > 0));

  const allInterests = (Array.isArray(interests) && interests.length > 0)
    ? interests
    : (activitiesOrInterests ? [activitiesOrInterests] : []);

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
        <InfoRow
          label="Family count"
          value={familyCount !== null && familyCount !== undefined ? String(familyCount) : null}
        />
        {maritalStatus && (
          <InfoRow label="Marital Status" value={maritalStatus} />
        )}
        {isMarried ? (
          <>
            <SpouseRow spouse={spouse} gender={gender} />
            {sMobile && (
              <InfoRow label="Spouse Mobile" value={sMobile} />
            )}
            <ChildrenDisplay children={children} />
          </>
        ) : (
          <>
            <ParentRow label="Father Name" data={fatherObj} nameFallback={fatherNameVal} ageFallback={fatherAge} mobileFallback={fatherMobile} />
            <ParentRow label="Mother Name" data={motherObj} nameFallback={motherNameVal} ageFallback={motherAge} mobileFallback={motherMobile} />
            <SiblingsDisplay label="Brother(s)" items={brothersList} />
            <SiblingsDisplay label="Sister(s)" items={sistersList} />
          </>
        )}
        <InfoRow label="Pets" value={pets} />
        <InfoRow label="Business vertical" value={selectedBusinessVertical} />
        <ChipGroup label="Hobbies" items={hobbies} />
        <ChipGroup label="Interests & Activities" items={allInterests} />
        {familyInformation && (
          <InfoRow label="Family information" value={familyInformation} fullWidth />
        )}
      </div>
    </div>
  );
}