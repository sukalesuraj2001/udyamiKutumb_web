import { useState } from "react";
import { Users, ChevronRight, ChevronDown, Info } from "lucide-react";
import { ROLES, ROLE_BY_ID } from "../data/roles";
import { TREE_DATA } from "../data/orgChart";

// ─── Recursive Tree Node ──────────────────────────────────────────────────────
function TreeNode({ node, depth = 0, expanded, onToggle }) {
  const role = ROLE_BY_ID[node.id];
  if (!role) return null;

  const isExpanded  = expanded[node.id] !== false; // default open
  const hasChildren = node.children && node.children.length > 0;
  const isRef       = node._ref;

  return (
    <div className={depth > 0 ? "ml-5 border-l-2 border-gray-100 pl-4" : ""}>
      <div
        className={`flex items-center gap-2 py-1.5 px-2 rounded-lg transition-colors ${hasChildren && !isRef ? "cursor-pointer hover:bg-gray-50" : ""} group`}
        onClick={() => hasChildren && !isRef && onToggle(node.id)}
      >
        <span className="w-4 h-4 flex items-center justify-center shrink-0">
          {hasChildren && !isRef
            ? isExpanded
              ? <ChevronDown size={12} className="text-gray-400" />
              : <ChevronRight size={12} className="text-gray-400" />
            : <span className="w-1.5 h-1.5 rounded-full bg-gray-200 inline-block" />
          }
        </span>

        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold border ${role.scopeColor} shrink-0`}>L{role.level}</span>

        <span className={`text-[12.5px] font-bold ${role.textColor} ${isRef ? "opacity-50" : ""}`}>
          {role.name}
          {isRef && <span className="ml-1 text-[10px] text-gray-400 font-normal">(ref)</span>}
        </span>

        {role.subtitle && (
          <span className={`text-[10.5px] font-medium ${role.userColor} opacity-70`}>· {role.subtitle}</span>
        )}

        {node.note && (
          <span className="text-[10.5px] text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-medium">{node.note}</span>
        )}

        <span className={`ml-auto text-[11px] font-semibold ${role.userColor} opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1`}>
          <Users size={11} className="text-gray-300" />
          {role.users.toLocaleString()}
        </span>
      </div>

      {hasChildren && isExpanded && !isRef && (
        <div className="mt-0.5">
          {node.children.map((child, idx) => (
            <TreeNode key={`${child.id}-${idx}`} node={child} depth={depth + 1} expanded={expanded} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tab ─────────────────────────────────────────────────────────────────────
export default function LegacyTreeTab() {
  const [expanded, setExpanded] = useState({});

  const onToggle    = (id) => setExpanded((prev) => ({ ...prev, [id]: prev[id] === false ? true : false }));
  const expandAll   = () => setExpanded({});
  const collapseAll = () => {
    const all = {};
    ROLES.forEach((r) => { all[r.id] = false; });
    setExpanded(all);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[14px] font-bold text-gray-900">Legacy Tree</h2>
          <p className="text-[12px] text-gray-400 mt-0.5">Hierarchical role tree · Udyami Circle reporting structure</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={expandAll}   className="h-7 px-3 text-[11.5px] font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Expand All</button>
          <button onClick={collapseAll} className="h-7 px-3 text-[11.5px] font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Collapse All</button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <TreeNode node={TREE_DATA} depth={0} expanded={expanded} onToggle={onToggle} />
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3">
        <Info size={15} className="text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-[12.5px] font-semibold text-amber-800">Zone Level (above Ward)</p>
          <p className="text-[12px] text-amber-700 mt-0.5 leading-relaxed">
            A Zone (e.g. G5) groups ~10 wards under GBA. MLA = patron; Udyami Patron × 10 seats.
            Advisory roles: Advisory × 3, Mentor × 3 per zone — strategic/mentorship input, reporting line.
          </p>
        </div>
      </div>
    </div>
  );
}