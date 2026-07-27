// LegacyMatrixTab.jsx - Row height + button size + header icons updated

import { useState } from "react";
import { Check, X, Eye, Plus, Pencil, Trash2, Download } from "lucide-react";
import { LegacyMatrixROLES } from "../data/roles";

const ACTIONS = [
  { key: "View",   label: "View",   Icon: Eye      },
  { key: "Create", label: "Create", Icon: Plus      },
  { key: "Edit",   label: "Edit",   Icon: Pencil    },
  { key: "Delete", label: "Delete", Icon: Trash2    },
  { key: "Export", label: "Export", Icon: Download  },
];

const DEFAULT_PERMISSIONS = {
  national_head:      { View: true,  Create: true,  Edit: true,  Delete: true,  Export: true  },
  state_head:         { View: true,  Create: true,  Edit: true,  Delete: true,  Export: true  },
  district_head:      { View: true,  Create: true,  Edit: true,  Delete: false, Export: true  },
  taluk_head:         { View: true,  Create: true,  Edit: true,  Delete: false, Export: false },
  ward_chairman:      { View: true,  Create: true,  Edit: false, Delete: false, Export: false },
  sector_coordinator: { View: true,  Create: true,  Edit: false, Delete: false, Export: false },
  president:          { View: true,  Create: true,  Edit: true,  Delete: true,  Export: true  },
  vice_president:     { View: true,  Create: true,  Edit: true,  Delete: false, Export: true  },
  general_secretary:  { View: true,  Create: true,  Edit: true,  Delete: false, Export: true  },
  treasurer:          { View: true,  Create: false, Edit: false, Delete: false, Export: true  },
  functional_system:  { View: true,  Create: true,  Edit: true,  Delete: false, Export: true  },
  channel_partner:    { View: true,  Create: true,  Edit: false, Delete: false, Export: false },
  member:             { View: true,  Create: false, Edit: false, Delete: false, Export: false },
};

export default function LegacyMatrixTab() {
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);
  const [hoveredCell, setHoveredCell] = useState(null);

  const toggle = (roleId, action) => {
    setPermissions((prev) => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        [action]: !prev[roleId][action],
      },
    }));
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[14px] font-bold text-gray-900">Legacy Management Matrix</h2>
        <p className="text-[12px] text-gray-400 mt-0.5">
          <span className="text-emerald-600 font-medium"></span> ·{" "}
          <span className="text-red-400 font-medium"></span>
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="text-[11px] w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-4 text-[10px] font-semibold tracking-wider uppercase text-gray-400 whitespace-nowrap sticky left-0 bg-gray-50 min-w-[190px]">
                  Role
                </th>
                {ACTIONS.map(({ key, label, Icon }) => (
                  <th key={key} className="px-3 py-4 min-w-[100px]">
                    <div className="flex flex-col items-center gap-1.5">
                      <Icon size={14} className="text-gray-400" />
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                        {label}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {LegacyMatrixROLES.map((role) => (
                <tr key={role.id} className="hover:bg-gray-50/40 transition-colors">
                  <td className="px-4 py-3.5 sticky left-0 bg-white whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold border ${role.scopeColor}`}>
                        L{role.level}
                      </span>
                      <span className={`font-semibold text-[12px] ${role.textColor}`}>
                        {role.name}
                      </span>
                    </div>
                  </td>
                  {ACTIONS.map(({ key }) => {
                    const allowed = permissions[role.id]?.[key] ?? false;
                    const cellKey = `${role.id}-${key}`;
                    const hovered = hoveredCell === cellKey;
                    return (
                      <td
                        key={key}
                        className="px-3 py-3.5 text-center transition-all cursor-pointer select-none"
                        onMouseEnter={() => setHoveredCell(cellKey)}
                        onMouseLeave={() => setHoveredCell(null)}
                        onClick={() => toggle(role.id, key)}
                        title={`${role.name} · ${key}: Click to ${allowed ? "deny" : "allow"}`}
                      >
                        {allowed ? (
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${hovered ? "bg-emerald-200" : "bg-emerald-50"}`}>
                            <Check size={14} className="text-emerald-600" />
                          </span>
                        ) : (
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${hovered ? "bg-red-100" : "bg-red-50"}`}>
                            <X size={13} className="text-red-400" />
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-6 text-[11.5px] text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <Check size={11} className="text-emerald-600" />
          </span>
          Allowed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center">
            <X size={11} className="text-red-400" />
          </span>
          Denied
        </span>
        <span className="text-gray-400 italic">Click any cell to toggle</span>
      </div>
    </div>
  );
}