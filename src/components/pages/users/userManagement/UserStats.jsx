import React from "react";
import { Users, Shield, Activity, CheckCircle2 } from "lucide-react";

function StatCard({ label, value, icon: Icon, iconBg, iconColor }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon size={18} className={iconColor} />
        </div>
        <div>
          <p className="text-[10.5px] font-semibold tracking-widest uppercase text-gray-400">{label}</p>
          <p className="text-[26px] font-bold text-gray-900 leading-tight tabular-nums">{value}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * UserStats
 *
 * Props:
 *  total    number
 *  verified number
 *  roles    number
 *  recent   number
 */
export default function UserStats({ total, verified, roles, recent }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatCard label="Total Users"    value={total}    icon={Users}        iconBg="bg-blue-50"    iconColor="text-blue-500" />
      <StatCard label="Verified"       value={verified} icon={CheckCircle2} iconBg="bg-emerald-50" iconColor="text-emerald-500" />
      <StatCard label="Roles in Use"   value={roles}    icon={Shield}       iconBg="bg-violet-50"  iconColor="text-violet-500" />
      <StatCard label="Recent Actions" value={recent}   icon={Activity}     iconBg="bg-amber-50"   iconColor="text-amber-500" />
    </div>
  );
}