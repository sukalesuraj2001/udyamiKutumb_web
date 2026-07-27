import { Shield, Users, GitBranch, Crown, Network, Settings, LayoutGrid, UserCheck, TableProperties, TreePine } from "lucide-react";

// ─── Stat Card ────────────────────────────────────────────────────────────────
const STAT_META = [
  { label: "Total Roles",      icon: Shield,    iconBg: "bg-violet-50", iconColor: "text-violet-500" },
  { label: "Total Users",      icon: Users,     iconBg: "bg-emerald-50",iconColor: "text-emerald-500"},
  { label: "Hierarchy Levels", icon: GitBranch, iconBg: "bg-blue-50",   iconColor: "text-blue-500"  },
  { label: "Admin Roles",      icon: Crown,     iconBg: "bg-amber-50",  iconColor: "text-amber-500" },
];

export function StatCards({ stats }) {
  return (
    <div className="flex flex-wrap gap-3">
      {stats.map((s, i) => {
        const meta = STAT_META[i];
        const Icon = meta.icon;
        return (
          <div key={s.label} className="flex-1 min-w-0 rounded-xl border border-gray-200 bg-white px-5 py-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
            <div className={`w-10 h-10 rounded-lg ${meta.iconBg} flex items-center justify-center shrink-0`}>
              <Icon size={18} className={meta.iconColor} />
            </div>
            <div className="min-w-0">
              <p className="text-[10.5px] font-semibold tracking-widest uppercase text-gray-400 truncate">{s.label}</p>
              <p className="text-[26px] font-bold text-gray-900 leading-tight tabular-nums">{s.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Tab Bar ─────────────────────────────────────────────────────────────────
export const TABS = [
  { key: "orgchart",     label: "Org Chart",     icon: Network         },
  { key: "permissions",  label: "Permissions",   icon: Settings        },
  { key: "rolecards",    label: "Role Cards",    icon: LayoutGrid      },
  { key: "assignroles",  label: "Assign Roles",  icon: UserCheck       },
  { key: "legacymatrix", label: "Legacy Matrix", icon: TableProperties },
  { key: "legacytree",   label: "Legacy Tree",   icon: TreePine        },
];

export function TabBar({ active, onChange }) {
  return (
    <div className="flex items-center gap-0 border-b border-gray-200 overflow-x-auto scrollbar-hide">
      {TABS.map(({ key, label, icon: Icon }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`relative flex items-center gap-1.5 px-4 py-3 text-[12.5px] font-semibold whitespace-nowrap transition-all shrink-0
              ${isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}
          >
            <Icon size={13} className={isActive ? "text-blue-500" : "text-gray-400"} />
            {label}
            {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />}
          </button>
        );
      })}
    </div>
  );
}