import React, { useState } from "react";

const CAPABILITIES = [
  "Pass & track leads",
  "Log Gratitude Slip",
  "Book Face to Face",
  "Invite guest",
  "Give / request Appreciation",
  "UC Training",
  "Browse directory",
  "Endorse sector join",
  "Resolve tag overlap",
  "Approve application",
  "Meetings & attendance",
];

const ROLES = ["Member", "Sector head", "Circle leader", "Admin", "Super"];

// true = checked, false = dash
const MATRIX_INIT = [
  //                          Member  SectorH  CircleL  Admin  Super
  /* Pass & track leads */   [true,   true,    true,    false, false],
  /* Log Gratitude Slip */   [true,   true,    true,    false, false],
  /* Book Face to Face */    [true,   true,    true,    false, false],
  /* Invite guest */         [true,   true,    true,    false, false],
  /* Give / request App */   [true,   true,    true,    false, false],
  /* UC Training */          [true,   true,    true,    false, false],
  /* Browse directory */     [true,   true,    true,    true,  true ],
  /* Endorse sector join */  [false,  true,    true,    false, false],
  /* Resolve tag overlap */  [false,  true,    true,    false, false],
  /* Approve application */  [false,  false,   true,    false, false],
  /* Meetings & attendance */[false,  false,   true,    false, false],
];

const Check = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1B4332" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function RolesAccess() {
  const [matrix, setMatrix] = useState(MATRIX_INIT);

  const toggle = (row, col) => {
    setMatrix((prev) =>
      prev.map((r, ri) => ri !== row ? r : r.map((v, ci) => ci !== col ? v : !v))
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-bold text-[#111827]">Roles & permissions</h2>
        <button className="bg-[#1B4332] hover:bg-[#14532D] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-xl transition-colors">
          Save matrix
        </button>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 overflow-x-auto">
        <table className="w-full text-[13.5px] min-w-[560px]">
          <thead>
            <tr className="border-b border-[#E5E7EB]">
              <th className="pb-3 text-left text-[12px] font-medium text-[#9CA3AF] w-1/3">Capability</th>
              {ROLES.map((r) => (
                <th key={r} className="pb-3 text-center text-[12px] font-medium text-[#9CA3AF]">{r}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CAPABILITIES.map((cap, ri) => (
              <tr key={cap} className={ri < CAPABILITIES.length - 1 ? "border-b border-[#F3F4F6]" : ""}>
                <td className="py-3 text-[#374151]">{cap}</td>
                {ROLES.map((_, ci) => (
                  <td key={ci} className="py-3 text-center">
                    <button
                      onClick={() => toggle(ri, ci)}
                      className="inline-flex items-center justify-center w-7 h-7 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {matrix[ri][ci] ? <Check /> : <span className="text-[#D1D5DB] text-lg leading-none">—</span>}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
