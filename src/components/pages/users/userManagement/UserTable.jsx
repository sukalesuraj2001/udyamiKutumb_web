import React from "react";
import { Eye, Shield, KeyRound, UserPlus } from "lucide-react";

// ── Shared badge helpers ──────────────────────────────────────

const STATUS_MAP = {
  verified: { label: "Verified",  cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  pending:  { label: "Pending",   cls: "bg-amber-50 text-amber-700 border border-amber-200" },
  inactive: { label: "Inactive",  cls: "bg-gray-100 text-gray-500 border border-gray-200" },
};

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
}

function RoleBadge({ role }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
      {role}
    </span>
  );
}

function TypeBadge({ type }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-600 border border-blue-200">
      {type}
    </span>
  );
}

function IconBtn({ icon: Icon, title, color = "text-gray-400", hoverColor = "hover:text-gray-600", onClick }) {
  return (
    <button
      title={title}
      
      onClick={onClick}
      
      className={`w-7 h-7 rounded-md flex items-center justify-center ${color} ${hoverColor} hover:bg-gray-100 transition-all`}
    >
      <Icon size={14} />
    </button>
  );
}

const TABLE_HEADERS = ["User", "Phone", "User Type", "Roles", "Assembly", "Ward", "Status", "Registered", "Last Login", ""];

/**
 * UserTable
 *
 * Props:
 *  users        array    – filtered list of user objects to display
 *  totalUsers   number   – unfiltered total (for footer count)
 *  onView       function(user)  – Eye icon handler
 *  onPermissions function(user) – Shield icon handler
 *  onResetPassword function(user) – KeyRound icon handler
 *  onAssignRole function(user)  – UserPlus icon handler
 */
export default function UserTable({
  users,
  totalUsers,
  onView,
  onPermissions,
  onResetPassword,
  onAssignRole,
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {TABLE_HEADERS.map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-[10.5px] font-semibold tracking-wider uppercase text-gray-400 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-12 text-gray-400 text-[13px]">
                  No users match your filters.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/60 transition-colors group">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="font-semibold text-gray-900">{u.name}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{u.phone}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <TypeBadge type={u.userType} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {u.roles.map((r) => <RoleBadge key={r} role={r} />)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{u.assembly}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{u.ward}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadge status={u.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{u.registered}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{u.lastLogin}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <IconBtn icon={Eye}      title="View"            hoverColor="hover:text-blue-600"    onClick={() => onView?.(u)} />
                      <IconBtn icon={Shield}   title="Permissions"     hoverColor="hover:text-violet-600"  onClick={() => onPermissions?.(u)} />
                      <IconBtn icon={KeyRound} title="Reset password"  hoverColor="hover:text-amber-600"   onClick={() => onResetPassword?.(u)} />
                      <IconBtn icon={UserPlus} title="Assign role"     hoverColor="hover:text-emerald-600" onClick={() => onAssignRole?.(u)} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table footer / pagination */}
      <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between bg-gray-50">
        <p className="text-[12px] text-gray-400">
          Showing <span className="font-semibold text-gray-600">{users.length}</span> of{" "}
          <span className="font-semibold text-gray-600">{totalUsers}</span> users
        </p>
        <div className="flex items-center gap-1">
          <button
            className="h-7 px-3 text-[12px] font-medium text-gray-500 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-40"
            disabled
          >
            Previous
          </button>
          <button className="h-7 w-7 text-[12px] font-semibold bg-blue-600 text-white rounded-md">1</button>
          <button className="h-7 px-3 text-[12px] font-medium text-gray-500 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}