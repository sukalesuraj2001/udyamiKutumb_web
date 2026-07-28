import React, { useState } from "react";
import { Shield, ChevronDown, ChevronUp } from "lucide-react";
import { ROLES, PERMISSION_MODULES } from "../data/roles";

// ─── Permission cycle: none → read → write → none ────────────────────────────
const CYCLE = ["none", "read", "write"];
const nextPerm = (current) => CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length];

// ─── Badge styling per value ──────────────────────────────────────────────────
const PERM_STYLE = {
  write: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-300", label: "WRITE" },
  read:  { bg: "bg-sky-100",     text: "text-sky-700",     border: "border-sky-300",     label: "READ"  },
  none:  { bg: "bg-gray-100",    text: "text-gray-400",    border: "border-gray-200",    label: "NONE"  },
};

const  ROLESS =[]

function PermBadge({ value, onClick, readOnly = false }) {
  const s = PERM_STYLE[value] ?? PERM_STYLE.none;
  return (
    <button
      onClick={readOnly ? undefined : onClick}
      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10.5px] font-bold border
        ${s.bg} ${s.text} ${s.border}
        ${readOnly ? "cursor-default" : "cursor-pointer hover:opacity-80 active:scale-95 transition-all select-none"}`}
    >
      {s.label}
    </button>
  );
}

// ─── Coming Soon placeholder ──────────────────────────────────────────────────
function ComingSoon() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white flex flex-col items-center justify-center gap-2 py-16 px-4">
      <svg width="30" height="30" className="text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
      </svg>
      <p className="text-[13.5px] font-semibold text-gray-500">Coming soon</p>
      <p className="text-[12px] text-gray-400 text-center max-w-[220px]">
        Roles and permissions will appear here once configured.
      </p>
    </div>
  );
}

export default function PermissionsTab() {
  const [perms, setPerms] = useState(() => {
    const map = {};
    ROLES.forEach((r) => { map[r.id] = { ...r.permissions }; });
    return map;
  });
  const [expandedRole, setExpandedRole] = useState(null);

  const handleClick = (roleId, moduleKey) => {
    setPerms((prev) => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        [moduleKey]: nextPerm(prev[roleId][moduleKey] ?? "none"),
      },
    }));
  };

  // ── Coming soon if no data ─────────────────────────────────────────────────
  if (!ROLESS?.length || !PERMISSION_MODULES?.length) {
    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-[14px] font-bold text-gray-900">Permissions Matrix</h2>
            <p className="text-[12px] text-gray-400 mt-0.5">Module-level access per role · click a row to expand details</p>
          </div>
        </div>
        <ComingSoon />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-[14px] font-bold text-gray-900">Permissions Matrix</h2>
          <p className="text-[12px] text-gray-400 mt-0.5">Module-level access per role · click a row to expand details</p>
        </div>
        <p className="text-[11.5px] text-gray-400 flex items-center gap-1">
          <Shield size={12} className="text-gray-300" />
          Click a cell to cycle: <span className="font-semibold text-gray-500 ml-1">none → read → write</span>
        </p>
      </div>

      {/* Matrix table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-[10.5px] font-semibold tracking-wider uppercase text-gray-400 whitespace-nowrap sticky left-0 bg-gray-50 min-w-[180px]">
                  Module
                </th>
                {ROLESS.map((r) => (
                  <th key={r.id} className="text-center px-3 py-3 min-w-[110px]">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`text-[10.5px] font-bold whitespace-nowrap ${r.textColor}`}>{r.name}</span>
                      <span className="text-[9.5px] text-gray-400">{r.subtitle}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {PERMISSION_MODULES.map((mod) => (
                <tr key={mod.key} className="hover:bg-gray-50/40 transition-colors">
                  <td className="px-4 py-3 sticky left-0 bg-white font-semibold text-gray-700 whitespace-nowrap text-[12.5px]">
                    {mod.label}
                  </td>
                  {ROLES.map((role) => (
                    <td key={role.id} className="px-3 py-3 text-center">
                      <PermBadge
                        value={perms[role.id]?.[mod.key] ?? "none"}
                        onClick={() => handleClick(role.id, mod.key)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role detail cards */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-[12.5px] font-semibold text-gray-700">Role Details</p>
          <p className="text-[11.5px] text-gray-400">Click a role to see description and current permission summary</p>
        </div>
        <div className="divide-y divide-gray-50">
          {ROLES.map((role) => {
            const isOpen = expandedRole === role.id;
            const rolePerms = perms[role.id] ?? {};
            const writeCnt = Object.values(rolePerms).filter((v) => v === "write").length;
            const readCnt  = Object.values(rolePerms).filter((v) => v === "read").length;

            return (
              <div key={role.id}>
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50/60 transition-colors"
                  onClick={() => setExpandedRole(isOpen ? null : role.id)}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: role.nodeBg }}>
                    <Shield size={13} style={{ color: role.nodeColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-[12.5px] font-bold ${role.textColor}`}>{role.name}</span>
                    <span className="ml-2 text-[11px] text-gray-400">{role.subtitle}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10.5px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">{writeCnt}W</span>
                    <span className="text-[10.5px] font-semibold text-sky-600 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">{readCnt}R</span>
                  </div>
                  {isOpen ? <ChevronUp size={13} className="text-gray-400 shrink-0" /> : <ChevronDown size={13} className="text-gray-400 shrink-0" />}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4">
                    <p className="text-[12px] text-gray-500 mb-3 ml-10">{role.description}</p>
                    <div className="ml-10 flex flex-wrap gap-2">
                      {PERMISSION_MODULES.map((mod) => {
                        const val = rolePerms[mod.key] ?? "none";
                        if (val === "none") return null;
                        return (
                          <div key={mod.key} className="flex items-center gap-1.5">
                            <span className="text-[11px] text-gray-600 font-medium">{mod.label}</span>
                            <PermBadge value={val} readOnly />
                          </div>
                        );
                      })}
                      {Object.values(rolePerms).every((v) => v === "none") && (
                        <span className="text-[11.5px] text-gray-400 italic">No permissions granted</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}