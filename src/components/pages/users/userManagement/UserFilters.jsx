import React from "react";
import { Search, X, ChevronDown, ListFilter } from "lucide-react";

/**
 * UserFilters
 *
 * Props:
 *  search        string
 *  roleFilter    string
 *  statusFilter  string
 *  typeFilter    string
 *  dateFrom      string
 *  dateTo        string
 *  hasFilters    boolean
 *  onSearchChange      function(value)
 *  onRoleChange        function(value)
 *  onStatusChange      function(value)
 *  onTypeChange        function(value)
 *  onDateFromChange    function(value)
 *  onDateToChange      function(value)
 *  onClearFilters      function()
 */
export default function UserFilters({
  search,
  roleFilter,
  statusFilter,
  typeFilter,
  dateFrom,
  dateTo,
  hasFilters,
  onSearchChange,
  onRoleChange,
  onStatusChange,
  onTypeChange,
  onDateFromChange,
  onDateToChange,
  onClearFilters,
}) {
  return (
    <div className="space-y-3">
      {/* Row 1 */}
      <div className="flex flex-wrap gap-2">
        {/* Search */}
        <div className="flex-1 min-w-[220px] flex items-center gap-2 h-9 border border-gray-200 rounded-lg px-3 bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition-all">
          <Search size={13} className="text-gray-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search users…"
            className="w-full text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none bg-transparent"
          />
          {search && (
            <button onClick={() => onSearchChange("")} className="shrink-0 text-gray-400 hover:text-gray-600">
              <X size={12} />
            </button>
          )}
        </div>

        {/* Role filter */}
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => onRoleChange(e.target.value)}
            className="h-9 appearance-none pl-3 pr-8 text-[12.5px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="User">User</option>
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {/* Status filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="h-9 appearance-none pl-3 pr-8 text-[12.5px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Row 2 */}
      <div className="flex flex-wrap items-center gap-2">
        {/* User type */}
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => onTypeChange(e.target.value)}
            className="h-9 appearance-none pl-3 pr-8 text-[12.5px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer"
          >
            <option value="all">All User Types</option>
            <option value="Both">Both</option>
            <option value="Member">Member</option>
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2 h-9 border border-gray-200 rounded-lg px-3 bg-white text-[12.5px] text-gray-500">
          <span className="font-medium text-gray-600 shrink-0">Registered from</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="text-[12.5px] text-gray-700 focus:outline-none bg-transparent cursor-pointer"
          />
          <span className="text-gray-400">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="text-[12.5px] text-gray-700 focus:outline-none bg-transparent cursor-pointer"
          />
        </div>

        {/* Clear filters */}
        {hasFilters ? (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center gap-1.5 h-9 px-3 text-[12.5px] font-medium text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-all"
          >
            <X size={12} />
            Clear Filters
          </button>
        ) : (
          <button className="inline-flex items-center gap-1.5 h-9 px-3 text-[12.5px] font-medium text-gray-400 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
            <ListFilter size={12} />
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}