import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  TrendingUp,
  MapPin,
  Building2,
  Layers,
  BarChart2,
  FileText,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Info,
  ArrowRight,
  Activity,
} from "lucide-react";

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const SUMMARY_CARDS_ROW1 = [
  {
    label: "Total District Heads",
    value: "24",
    icon: Building2,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
    badge: "3 pending",
    badgeColor: "bg-amber-50 text-amber-700",
  },
  {
    label: "Total Taluk Heads",
    value: "138",
    icon: MapPin,
    iconColor: "text-violet-600",
    iconBg: "bg-violet-50",
    badge: "↑ 6 this week",
    badgeColor: "bg-blue-50 text-blue-700",
    badgeIcon: "check",
  },
  {
    label: "Total Ward / Hobli Heads",
    value: "892",
    icon: Layers,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
    badge: "↑ 22 this week",
    badgeColor: "bg-blue-50 text-blue-700",
    badgeIcon: "check",
  },
  {
    label: "Total Members",
    value: "14,320",
    icon: Users,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
    badge: "↑ 214 this week",
    badgeColor: "bg-blue-50 text-blue-700",
    badgeIcon: "check",
  },
];

const SUMMARY_CARDS_ROW2 = [
  {
    label: "Total Channel Partners",
    value: "47",
    icon: Users,
    iconColor: "text-cyan-600",
    iconBg: "bg-cyan-50",
    badge: "All districts",
    badgeColor: "bg-gray-100 text-gray-600",
  },
  {
    label: "Active Members",
    value: "11,845",
    icon: UserCheck,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
    badge: "83% of total",
    badgeColor: "bg-gray-100 text-gray-600",
  },
  {
    label: "Pending Approvals",
    value: "186",
    icon: Clock,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50",
    badge: "⚠ Needs action",
    badgeColor: "bg-amber-50 text-amber-700",
  },
  {
    label: "Inactive Members",
    value: "2,475",
    icon: UserX,
    iconColor: "text-rose-500",
    iconBg: "bg-rose-50",
    badge: "17% of total",
    badgeColor: "bg-gray-100 text-gray-600",
  },
];

const MEMBERSHIP_GROWTH_DATA = [
  { month: "Aug", members: 8200 },
  { month: "Sep", members: 9100 },
  { month: "Oct", members: 9800 },
  { month: "Nov", members: 10400 },
  { month: "Dec", members: 11200 },
  { month: "Jan", members: 11900 },
  { month: "Feb", members: 12600 },
  { month: "Mar", members: 13100 },
  { month: "Apr", members: 13500 },
  { month: "May", members: 13900 },
  { month: "Jun", members: 14100 },
  { month: "Jul", members: 14320 },
];

const DISTRICT_PERFORMANCE_DATA = [
  { name: "Excellent", value: 8, color: "#22c55e" },
  { name: "Good", value: 9, color: "#3b82f6" },
  { name: "Average", value: 5, color: "#f59e0b" },
  { name: "Needs Attention", value: 2, color: "#ef4444" },
];

const TOP_DISTRICTS = [
  { district: "Bengaluru Urban", members: 2840, growth: "+12%", status: "Excellent" },
  { district: "Mysuru", members: 1920, growth: "+9%", status: "Excellent" },
  { district: "Hubballi-Dharwad", members: 1540, growth: "+7%", status: "Good" },
  { district: "Mangaluru", members: 1380, growth: "+6%", status: "Good" },
  { district: "Belagavi", members: 1200, growth: "+5%", status: "Good" },
  { district: "Tumakuru", members: 980, growth: "+4%", status: "Average" },
  { district: "Kalaburagi", members: 720, growth: "+2%", status: "Average" },
];

const RECENT_ACTIVITIES = [
  {
    icon: Users,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    text: "120 new members joined today across 5 districts",
    time: "Just now",
  },
  {
    icon: CheckCircle2,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    text: "Bengaluru Urban District reached 95% completion",
    time: "2 hours ago",
  },
  {
    icon: UserCheck,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    text: "4 Taluk Heads approved in Mysuru District",
    time: "5 hours ago",
  },
  {
    icon: AlertTriangle,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    text: "2 District Heads pending approval — review required",
    time: "Yesterday",
  },
  {
    icon: TrendingUp,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    text: "Membership growth up 8% compared to last month",
    time: "Yesterday",
  },
  {
    icon: Info,
    iconBg: "bg-gray-100",
    iconColor: "text-gray-500",
    text: "Monthly district performance report generated",
    time: "2 days ago",
  },
];

const QUICK_ACTIONS = [
  { label: "View District Heads", icon: Building2, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
  { label: "View Taluk Heads", icon: MapPin, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
  { label: "View Ward/Hobli Heads", icon: Layers, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  { label: "Open Area Chart", icon: BarChart2, color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-100" },
  { label: "Generate Report", icon: FileText, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
];

const STATUS_STYLES = {
  Excellent: "bg-emerald-50 text-emerald-700",
  Good: "bg-blue-50 text-blue-700",
  Average: "bg-amber-50 text-amber-700",
  "Needs Attention": "bg-rose-50 text-rose-600",
};

// ─── Reusable Components ──────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-gray-400 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && (
        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors">
          {action} <ArrowRight size={12} />
        </button>
      )}
    </div>
  );
}

function StatCard({ card }) {
  const Icon = card.icon;
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide leading-tight">
          {card.label}
        </span>
        <span className={`p-1.5 rounded-lg ${card.iconBg}`}>
          <Icon size={16} className={card.iconColor} />
        </span>
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-3">{card.value}</p>
      <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${card.badgeColor}`}>
        {card.badge}
      </span>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-3 py-2">
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        <p className="text-sm font-semibold text-gray-800">
          {payload[0].value.toLocaleString()} members
        </p>
      </div>
    );
  }
  return null;
}

function CustomPieTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-3 py-2">
        <p className="text-sm font-semibold text-gray-800">{payload[0].name}</p>
        <p className="text-xs text-gray-500">{payload[0].value} districts</p>
      </div>
    );
  }
  return null;
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function StateHeadDashboard() {
  const [activeDistrict, setActiveDistrict] = useState(null);

  const totalDistricts = DISTRICT_PERFORMANCE_DATA.reduce((s, d) => s + d.value, 0);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">State Head</h1>
        <p className="text-sm text-gray-400 mt-0.5">Karnataka · Platform overview · Live data</p>
      </div>

      {/* ── Row 1: Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {SUMMARY_CARDS_ROW1.map((card) => (
          <StatCard key={card.label} card={card} />
        ))}
      </div>

      {/* ── Row 2: Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {SUMMARY_CARDS_ROW2.map((card) => (
          <StatCard key={card.label} card={card} />
        ))}
      </div>

      {/* ── Analytics Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

        {/* Membership Growth — Line Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <SectionHeader
            icon={TrendingUp}
            title="Membership Growth"
            subtitle="Monthly member growth — Karnataka FY 2025"
            action="Full report"
          />

          {/* Inline revenue-style stats */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            {[
              { label: "THIS MONTH", value: "+421", badge: "↑ 3% vs last month", badgeColor: "bg-blue-50 text-blue-700" },
              { label: "TOTAL MEMBERS", value: "14,320", badge: "All time", badgeColor: "bg-gray-100 text-gray-500" },
              { label: "INACTIVE", value: "2,475", badge: "⚠ Review", badgeColor: "bg-amber-50 text-amber-700" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{s.label}</p>
                <p className="text-lg font-bold text-gray-900">{s.value}</p>
                <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${s.badgeColor}`}>
                  {s.badge}
                </span>
              </div>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={MEMBERSHIP_GROWTH_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="members"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: "#2563eb", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* District Performance — Donut Chart */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col">
          <SectionHeader
            icon={Activity}
            title="District Performance"
            subtitle="By operational status"
          />

          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie
                    data={DISTRICT_PERFORMANCE_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    onMouseEnter={(_, index) => setActiveDistrict(index)}
                    onMouseLeave={() => setActiveDistrict(null)}
                  >
                    {DISTRICT_PERFORMANCE_DATA.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={entry.color}
                        opacity={activeDistrict === null || activeDistrict === index ? 1 : 0.5}
                        style={{ cursor: "pointer", outline: "none" }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Centre label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-gray-900">{totalDistricts}</span>
                <span className="text-xs text-gray-400">Districts</span>
              </div>
            </div>

            {/* Legend */}
            <div className="w-full mt-2 space-y-2">
              {DISTRICT_PERFORMANCE_DATA.map((d) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="text-xs text-gray-600">{d.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-800">{d.value}</span>
                    <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(d.value / totalDistricts) * 100}%`,
                          backgroundColor: d.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Table + Activity + Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Top Performing Districts — Table */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <SectionHeader
            icon={BarChart2}
            title="Top Performing Districts"
            subtitle="Ranked by member count"
            action="View all"
          />

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-4">
                    District
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-4">
                    Members
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-4">
                    Growth
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {TOP_DISTRICTS.map((row, i) => (
                  <tr
                    key={row.district}
                    className="hover:bg-gray-50 transition-colors duration-100"
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs text-gray-300 font-medium w-4 text-right flex-shrink-0">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-sm font-medium text-gray-800">{row.district}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-right text-sm font-semibold text-gray-800">
                      {row.members.toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <span className="text-xs font-medium text-emerald-600 flex items-center justify-end gap-0.5">
                        <ChevronUp size={12} strokeWidth={2.5} />
                        {row.growth.replace("+", "")}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          STATUS_STYLES[row.status] ?? "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Activity + Quick Actions */}
        <div className="flex flex-col gap-4">

          {/* Recent Activities */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex-1">
            <SectionHeader
              icon={Activity}
              title="Recent Activities"
              subtitle="Latest state-level updates"
            />

            <div className="space-y-3">
              {RECENT_ACTIVITIES.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-start gap-3">
                    <span className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5 ${item.iconBg}`}>
                      <Icon size={13} className={item.iconColor} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 leading-relaxed">{item.text}</p>
                      <p className="text-xs text-gray-300 mt-0.5">{item.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <SectionHeader icon={ChevronUp} title="Quick Actions" />

            <div className="grid grid-cols-1 gap-2">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${action.border} ${action.bg} hover:opacity-80 transition-opacity duration-150 text-left w-full group`}
                  >
                    <span className={`p-1 rounded-lg bg-white shadow-sm`}>
                      <Icon size={14} className={action.color} />
                    </span>
                    <span className="text-xs font-medium text-gray-700 flex-1">{action.label}</span>
                    <ArrowRight size={12} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}