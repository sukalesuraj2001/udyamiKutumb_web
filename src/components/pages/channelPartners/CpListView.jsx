import React, { useState } from "react";
import { Eye, Pencil, ArrowUpDown, ArrowUp, ArrowDown, Trash2, Ban } from "lucide-react";

export default function CpListView({ members, onView, onEdit, onDelete, onSuspend }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const sortedMembers = [...members].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const valueA = (a[sortConfig.key] || "").toString().toLowerCase();
    const valueB = (b[sortConfig.key] || "").toString().toLowerCase();
    if (valueA < valueB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valueA > valueB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ col }) => {
    if (sortConfig.key !== col) return <ArrowUpDown size={12} className="text-gray-400" />;
    return sortConfig.direction === "asc"
      ? <ArrowUp size={12} className="text-blue-500" />
      : <ArrowDown size={12} className="text-blue-500" />;
  };

  const thClass = "px-5 py-3.5 text-[10.5px] font-semibold tracking-[0.08em] uppercase text-gray-500 cursor-pointer select-none";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th onClick={() => handleSort("name")} className={thClass}>
              <div className="flex items-center gap-1.5">Name <SortIcon col="name" /></div>
            </th>
            <th onClick={() => handleSort("Fields")} className={thClass}>
              <div className="flex items-center gap-1.5">Fields <SortIcon col="Fields" /></div>
            </th>
            <th onClick={() => handleSort("ward")} className={thClass}>
              <div className="flex items-center gap-1.5">Ward / Hobli <SortIcon col="ward" /></div>
            </th>
            <th className="px-5 py-3.5 text-[10.5px] font-semibold tracking-[0.08em] uppercase text-gray-500">
              Taluk
            </th>
            <th className="px-5 py-3.5 text-[10.5px] font-semibold tracking-[0.08em] uppercase text-gray-500">
              Status
            </th>
            <th className="px-5 py-3.5 text-[10.5px] font-semibold tracking-[0.08em] uppercase text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedMembers.map((m) => {
            const isSuspended = m.status === "Suspended";
            return (
              <tr
                key={m.id}
                className={`border-b border-gray-100 last:border-0 transition-colors ${
                  isSuspended ? "bg-red-50/30" : "hover:bg-blue-50/30"
                }`}
              >
                {/* Name */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="relative w-8 h-8 rounded-full bg-blue-600 text-white text-[11px] font-semibold flex items-center justify-center shrink-0">
                      {m.initials}
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                          isSuspended ? "bg-red-500" : "bg-emerald-500"
                        }`}
                      />
                    </span>
                    <div className="min-w-0">
                      <p className={`text-[13.5px] font-medium truncate ${
                        isSuspended ? "text-gray-400 line-through decoration-red-400/50" : "text-gray-800"
                      }`}>
                        {m.name}
                      </p>
                      <p className="text-[11.5px] text-gray-400 truncate">{m.phone}</p>
                    </div>
                  </div>
                </td>

                {/* Fields */}
                <td className="px-5 py-3.5 text-[13px] text-gray-500 whitespace-nowrap">{m.Fields || "—"}</td>

                {/* Ward */}
                <td className="px-5 py-3.5 text-[13px] text-gray-500 whitespace-nowrap">{m.ward || "—"}</td>

                {/* Taluk */}
                <td className="px-5 py-3.5">
                  {m.taluk && (
                    <span className="text-[10.5px] font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full whitespace-nowrap">
                      {m.taluk}
                    </span>
                  )}
                </td>

                {/* Status */}
                <td className="px-5 py-3.5">
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                    isSuspended
                      ? "bg-red-50 text-red-600"
                      : "bg-emerald-50 text-emerald-700"
                  }`}>
                    {isSuspended ? "Suspended" : "Active"}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onView(m)}
                      title="View"
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => onEdit(m)}
                      title="Edit"
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => onSuspend(m)}
                      title={isSuspended ? "Activate" : "Suspend"}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                        isSuspended
                          ? "text-emerald-500 hover:bg-emerald-50"
                          : "text-gray-400 hover:text-amber-500 hover:bg-amber-50"
                      }`}
                    >
                      <Ban size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(m)}
                      title="Delete"
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}