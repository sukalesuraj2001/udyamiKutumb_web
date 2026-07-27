import { useState } from "react";
import { Users, Plus, ChevronRight, ChevronDown, Search } from "lucide-react";
import { ROLES } from "../data/roles";

export default function RoleCardsTab() {
  const [search, setSearch]           = useState("");
  const [scopeFilter, setScopeFilter] = useState("all");

  const scopes   = [...new Set(ROLES.map((r) => r.scope))];
  const filtered = ROLES.filter((r) => {
    if (scopeFilter !== "all" && r.scope !== scopeFilter) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Sub-header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[14px] font-bold text-gray-900">Role Definitions</h2>
          <p className="text-[12px] text-gray-400 mt-0.5">
            {ROLES.length} roles across {scopes.length} scope levels · {ROLES.reduce((s, r) => s + r.users, 0).toLocaleString()} total users
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 h-8 border border-gray-200 rounded-lg px-3 bg-white text-[12.5px] focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition-all">
            <Search size={12} className="text-gray-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search roles…"
              className="w-32 text-[12.5px] text-gray-700 placeholder:text-gray-400 focus:outline-none bg-transparent"
            />
          </div>
          <div className="relative">
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value)}
              className="h-8 appearance-none pl-3 pr-7 text-[12.5px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer"
            >
              <option value="all">All Scopes</option>
              {scopes.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <button className="inline-flex items-center gap-1.5 h-8 bg-blue-600 text-white text-[12.5px] font-semibold px-3 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors">
            <Plus size={13} />New Role
          </button>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((role) => (
          <div
            key={role.id}
            className={`rounded-xl border border-gray-200 border-l-4 ${role.borderColor} ${role.bgColor} p-4 flex flex-col gap-3 hover:shadow-sm transition-all group cursor-pointer`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className={`text-[13.5px] font-bold ${role.textColor}`}>{role.name}</span>
                {role.subtitle && <p className={`text-[10.5px] font-medium mt-0.5 ${role.userColor} opacity-80`}>{role.subtitle}</p>}
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${role.scopeColor}`}>
                  {role.scope}
                </span>
                <span className="text-[10px] text-gray-400 font-medium">L{role.level}</span>
              </div>
            </div>
            <p className="text-[12px] text-gray-600 leading-relaxed flex-1">{role.description}</p>
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center gap-1.5">
                <Users size={12} className="text-gray-400" />
                <span className={`text-[12px] font-semibold ${role.userColor}`}>{role.users.toLocaleString()} users</span>
              </div>
              <button className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 text-[11.5px] font-medium text-gray-400 hover:text-gray-700 transition-all">
                Manage <ChevronRight size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}