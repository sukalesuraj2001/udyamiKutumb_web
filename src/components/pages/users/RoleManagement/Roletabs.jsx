import React from "react";
import { Network, Settings, LayoutGrid, UserCheck, TableProperties, TreePine } from "lucide-react";

// Tab definitions — icons live here, not in roleHierarchy.js (no React deps there)
const TABS = [
  { key: "orgchart",    label: "Org Chart",     icon: Network },
  { key: "permissions", label: "Permissions",   icon: Settings },
  { key: "rolecards",   label: "Role Cards",    icon: LayoutGrid },
  { key: "assignroles", label: "Assign Roles",  icon: UserCheck },
  { key: "legacymatrix",label: "Legacy Matrix", icon: TableProperties },
  { key: "legacytree",  label: "Legacy Tree",   icon: TreePine },
];

// Props:
//   active   – currently active tab key
//   onChange – (key: string) => void
export default function RoleTabs({ active, onChange }) {
  return (
    <div className="flex items-center gap-0 border-b border-gray-200 overflow-x-auto scrollbar-hide">
      {TABS.map(({ key, label, icon: Icon }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`relative flex items-center gap-1.5 px-4 py-3 text-[12.5px] font-semibold whitespace-nowrap transition-all shrink-0
              ${isActive
                ? "text-blue-600"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
          >
            <Icon size={13} className={isActive ? "text-blue-500" : "text-gray-400"} />
            {label}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}