/**
 * Analytics.jsx — Enterprise Communication Module
 *
 * Features
 *  • 7 KPI cards (computed from filtered data)
 *  • 8-field filter bar (date range, channel, status, name, state, district, taluk, ward)
 *  • 4 Recharts charts (Line, Donut, Bar, Area)
 *  • Campaign table — search, sort, paginate, status badges
 *  • Export UI — Excel / CSV / PDF
 *  • Loading skeletons + empty states
 *
 * TODO (backend integration):
 *  • Replace MOCK_CAMPAIGNS with `useGetCampaignsQuery(filters)` (RTK Query)
 *  • Replace CHART_* constants with API-derived data
 *  • Wire export buttons to real download endpoints
 *
 * Dependency: npm install recharts
 */

import React, { useState, useMemo, useCallback } from "react";
import {
  Megaphone,
  Send,
  CheckCircle2,
  XCircle,
  Coins,
  Clock,
  Users,
  TrendingUp,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  SlidersHorizontal,
  X,
  AlertCircle,
  BarChart2,
} from "lucide-react";
import DashCard from "./ui/DashCard.jsx";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data   (TODO: replace with RTK Query hooks)
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_CAMPAIGNS = [
  { id: 1,  name: "Monsoon Alert – Zone A",        channel: "SMS",       scheduledAt: "2025-07-01", reach: 4200, delivered: 3980, failed: 120, pending: 100, credits: 4200, status: "Completed", state: "Tamil Nadu", district: "Chennai",    taluk: "Ambattur",   ward: "Ward 12" },
  { id: 2,  name: "Ration Card Renewal Notice",    channel: "SMS",       scheduledAt: "2025-07-02", reach: 8500, delivered: 8120, failed: 230, pending: 150, credits: 8500, status: "Completed", state: "Tamil Nadu", district: "Chennai",    taluk: "Sholinganallur", ward: "Ward 4" },
  { id: 3,  name: "Water Cut Notification",        channel: "WhatsApp",  scheduledAt: "2025-07-03", reach: 3100, delivered: 2950, failed: 80,  pending: 70,  credits: 6200, status: "Completed", state: "Tamil Nadu", district: "Coimbatore", taluk: "Singanallur", ward: "Ward 7" },
  { id: 4,  name: "Health Camp – July 2025",       channel: "Email",     scheduledAt: "2025-07-04", reach: 1200, delivered: 1100, failed: 60,  pending: 40,  credits: 1200, status: "Completed", state: "Tamil Nadu", district: "Madurai",    taluk: "Madurai East", ward: "Ward 2" },
  { id: 5,  name: "Road Closure – NH47",           channel: "IVR",       scheduledAt: "2025-07-05", reach: 5600, delivered: 5200, failed: 250, pending: 150, credits: 11200, status: "Completed", state: "Tamil Nadu", district: "Salem",      taluk: "Salem West", ward: "Ward 9" },
  { id: 6,  name: "Election Awareness Drive",      channel: "SMS",       scheduledAt: "2025-07-06", reach: 12000, delivered: 11500, failed: 320, pending: 180, credits: 12000, status: "Completed", state: "Tamil Nadu", district: "Chennai",    taluk: "Adyar",      ward: "Ward 1" },
  { id: 7,  name: "Vaccination Reminder – Round 3", channel: "WhatsApp", scheduledAt: "2025-07-07", reach: 6700, delivered: 6400, failed: 180, pending: 120, credits: 13400, status: "Completed", state: "Tamil Nadu", district: "Tiruchirappalli", taluk: "Srirangam", ward: "Ward 5" },
  { id: 8,  name: "Property Tax Due Alert",        channel: "SMS",       scheduledAt: "2025-07-08", reach: 9200, delivered: 8800, failed: 280, pending: 120, credits: 9200, status: "Completed", state: "Tamil Nadu", district: "Coimbatore", taluk: "Coimbatore North", ward: "Ward 3" },
  { id: 9,  name: "Flood Warning – Low Areas",     channel: "IVR",       scheduledAt: "2025-07-09", reach: 3800, delivered: 3600, failed: 140, pending: 60,  credits: 7600, status: "Running",   state: "Tamil Nadu", district: "Chennai",    taluk: "Manali",     ward: "Ward 11" },
  { id: 10, name: "Birth Certificate Camp",        channel: "Email",     scheduledAt: "2025-07-10", reach: 800,  delivered: 720,  failed: 50,  pending: 30,  credits: 800,  status: "Running",   state: "Tamil Nadu", district: "Madurai",    taluk: "Madurai West", ward: "Ward 6" },
  { id: 11, name: "School Enrollment Drive",       channel: "SMS",       scheduledAt: "2025-07-11", reach: 5100, delivered: 4800, failed: 190, pending: 110, credits: 5100, status: "Running",   state: "Tamil Nadu", district: "Salem",      taluk: "Mettur",     ward: "Ward 8" },
  { id: 12, name: "Drinking Water Quality Update", channel: "WhatsApp",  scheduledAt: "2025-07-12", reach: 2400, delivered: 0,   failed: 0,   pending: 2400, credits: 4800, status: "Scheduled", state: "Tamil Nadu", district: "Tiruchirappalli", taluk: "Tiruchirappalli West", ward: "Ward 14" },
  { id: 13, name: "Patta Transfer Status",         channel: "SMS",       scheduledAt: "2025-07-13", reach: 3600, delivered: 0,   failed: 0,   pending: 3600, credits: 3600, status: "Scheduled", state: "Tamil Nadu", district: "Chennai",    taluk: "Perambur",   ward: "Ward 16" },
  { id: 14, name: "Street Light Fault Report",     channel: "IVR",       scheduledAt: "2025-07-14", reach: 1900, delivered: 600, failed: 1100, pending: 200, credits: 3800, status: "Failed",    state: "Tamil Nadu", district: "Coimbatore", taluk: "Podanur",    ward: "Ward 10" },
  { id: 15, name: "Bus Route Change – Route 21C",  channel: "SMS",       scheduledAt: "2025-07-15", reach: 2700, delivered: 800, failed: 1700, pending: 200, credits: 2700, status: "Failed",    state: "Tamil Nadu", district: "Madurai",    taluk: "Melur",      ward: "Ward 13" },
];

// ── Chart seed data ──────────────────────────────────────────────────────────

const DELIVERY_TREND = [
  { date: "Jul 1",  delivered: 3980, failed: 120, pending: 100 },
  { date: "Jul 2",  delivered: 8120, failed: 230, pending: 150 },
  { date: "Jul 3",  delivered: 2950, failed: 80,  pending: 70  },
  { date: "Jul 4",  delivered: 1100, failed: 60,  pending: 40  },
  { date: "Jul 5",  delivered: 5200, failed: 250, pending: 150 },
  { date: "Jul 6",  delivered: 11500, failed: 320, pending: 180 },
  { date: "Jul 7",  delivered: 6400, failed: 180, pending: 120 },
  { date: "Jul 8",  delivered: 8800, failed: 280, pending: 120 },
  { date: "Jul 9",  delivered: 3600, failed: 140, pending: 60  },
  { date: "Jul 10", delivered: 720,  failed: 50,  pending: 30  },
  { date: "Jul 11", delivered: 4800, failed: 190, pending: 110 },
  { date: "Jul 12", delivered: 0,    failed: 0,   pending: 2400 },
  { date: "Jul 13", delivered: 0,    failed: 0,   pending: 3600 },
  { date: "Jul 14", delivered: 600,  failed: 1100, pending: 200 },
  { date: "Jul 15", delivered: 800,  failed: 1700, pending: 200 },
];

const CHANNEL_DIST = [
  { name: "SMS",      value: 6,  color: "#6366f1" },
  { name: "WhatsApp", value: 3,  color: "#22c55e" },
  { name: "Email",    value: 3,  color: "#3b82f6" },
  { name: "IVR",      value: 3,  color: "#f59e0b" },
];

const CAMPAIGN_PERF = MOCK_CAMPAIGNS.slice(0, 8).map((c) => ({
  name: c.name.length > 18 ? c.name.slice(0, 18) + "…" : c.name,
  delivered: c.delivered,
  failed: c.failed,
  pending: c.pending,
}));

const CREDIT_USAGE = DELIVERY_TREND.map((d, i) => ({
  date: d.date,
  credits: MOCK_CAMPAIGNS[i]?.credits ?? 0,
}));

// ── Filter option lists ──────────────────────────────────────────────────────

const CHANNELS  = ["All", "SMS", "WhatsApp", "Email", "IVR"];
const STATUSES  = ["All", "Completed", "Running", "Scheduled", "Failed"];
const STATES    = ["All", "Tamil Nadu"];
const DISTRICTS = ["All", "Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli"];
const TALUKS    = {
  All:               ["All"],
  Chennai:           ["All", "Ambattur", "Adyar", "Perambur", "Sholinganallur", "Manali"],
  Coimbatore:        ["All", "Coimbatore North", "Singanallur", "Podanur"],
  Madurai:           ["All", "Madurai East", "Madurai West", "Melur"],
  Salem:             ["All", "Salem West", "Mettur"],
  Tiruchirappalli:   ["All", "Srirangam", "Tiruchirappalli West"],
};
const WARDS = {
  All:           ["All"],
  Ambattur:      ["All", "Ward 12"],
  Adyar:         ["All", "Ward 1"],
  Perambur:      ["All", "Ward 16"],
  Sholinganallur:["All", "Ward 4"],
  Manali:        ["All", "Ward 11"],
  "Coimbatore North": ["All", "Ward 3"],
  Singanallur:   ["All", "Ward 7"],
  Podanur:       ["All", "Ward 10"],
  "Madurai East":["All", "Ward 2"],
  "Madurai West":["All", "Ward 6"],
  Melur:         ["All", "Ward 13"],
  "Salem West":  ["All", "Ward 9"],
  Mettur:        ["All", "Ward 8"],
  Srirangam:     ["All", "Ward 5"],
  "Tiruchirappalli West": ["All", "Ward 14"],
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 5;

export default function Analytics() {
  // ── Loading simulation (TODO: replace with RTK Query isLoading) ───────────
  const [isLoading] = useState(false);

  // ── Filter state ──────────────────────────────────────────────────────────
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    channel: "All",
    status: "All",
    campaignName: "",
    state: "All",
    district: "All",
    taluk: "All",
    ward: "All",
  });
  const [showFilters, setShowFilters] = useState(true);

  const setFilter = useCallback((key, val) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: val };
      // cascade resets
      if (key === "district") { next.taluk = "All"; next.ward = "All"; }
      if (key === "taluk")    { next.ward = "All"; }
      return next;
    });
  }, []);

  const resetFilters = () =>
    setFilters({ dateFrom: "", dateTo: "", channel: "All", status: "All", campaignName: "", state: "All", district: "All", taluk: "All", ward: "All" });

  // ── Table state ───────────────────────────────────────────────────────────
  const [search, setSearch]         = useState("");
  const [sortKey, setSortKey]       = useState("scheduledAt");
  const [sortDir, setSortDir]       = useState("desc");
  const [page, setPage]             = useState(1);

  // ── Derived: filtered campaigns ───────────────────────────────────────────
  const filtered = useMemo(() => {
    return MOCK_CAMPAIGNS.filter((c) => {
      if (filters.channel !== "All" && c.channel !== filters.channel) return false;
      if (filters.status  !== "All" && c.status  !== filters.status)  return false;
      if (filters.state   !== "All" && c.state   !== filters.state)   return false;
      if (filters.district !== "All" && c.district !== filters.district) return false;
      if (filters.taluk   !== "All" && c.taluk   !== filters.taluk)   return false;
      if (filters.ward    !== "All" && c.ward    !== filters.ward)     return false;
      if (filters.campaignName && !c.name.toLowerCase().includes(filters.campaignName.toLowerCase())) return false;
      if (filters.dateFrom && c.scheduledAt < filters.dateFrom) return false;
      if (filters.dateTo   && c.scheduledAt > filters.dateTo)   return false;
      return true;
    });
  }, [filters]);

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const total     = filtered.length;
    const reach     = filtered.reduce((s, c) => s + c.reach,     0);
    const delivered = filtered.reduce((s, c) => s + c.delivered, 0);
    const pending   = filtered.reduce((s, c) => s + c.pending,   0);
    const failed    = filtered.reduce((s, c) => s + c.failed,    0);
    const credits   = filtered.reduce((s, c) => s + c.credits,   0);
    const rate      = reach > 0 ? ((delivered / reach) * 100).toFixed(1) : "0.0";
    return { total, reach, delivered, pending, failed, rate, credits };
  }, [filtered]);

  // ── Table: search + sort + paginate ───────────────────────────────────────
  const tableData = useMemo(() => {
    let rows = [...filtered];
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((c) => c.name.toLowerCase().includes(q) || c.channel.toLowerCase().includes(q));
    }
    rows.sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      const cmp = typeof av === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [filtered, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(tableData.length / PAGE_SIZE));
  const pageRows   = tableData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  };

  // ── Export handlers (TODO: wire to backend endpoints) ─────────────────────
  const handleExport = (type) => {
    // TODO: dispatch(exportCampaigns({ type, filters }))
    alert(`Export as ${type} — connect to backend endpoint here.`);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Filter Bar ── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
        {/* Header row */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-700">
            <SlidersHorizontal size={15} className="text-blue-600" />
            Filters
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-gray-600 transition-colors"
            >
              <RefreshCw size={13} /> Reset
            </button>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="text-[12px] text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showFilters ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {/* Filter fields */}
        {showFilters && (
          <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {/* Date From */}
            <FilterField label="Date From">
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilter("dateFrom", e.target.value)}
                className={inputCls}
              />
            </FilterField>

            {/* Date To */}
            <FilterField label="Date To">
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilter("dateTo", e.target.value)}
                className={inputCls}
              />
            </FilterField>

            {/* Channel */}
            <FilterField label="Channel">
              <select value={filters.channel} onChange={(e) => setFilter("channel", e.target.value)} className={inputCls}>
                {CHANNELS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </FilterField>

            {/* Status */}
            <FilterField label="Campaign Status">
              <select value={filters.status} onChange={(e) => setFilter("status", e.target.value)} className={inputCls}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </FilterField>

            {/* Campaign Name */}
            <FilterField label="Campaign Name">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search name…"
                  value={filters.campaignName}
                  onChange={(e) => setFilter("campaignName", e.target.value)}
                  className={`${inputCls} pl-7`}
                />
              </div>
            </FilterField>

            {/* State */}
            <FilterField label="State">
              <select value={filters.state} onChange={(e) => setFilter("state", e.target.value)} className={inputCls}>
                {STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </FilterField>

            {/* District */}
            <FilterField label="District">
              <select value={filters.district} onChange={(e) => setFilter("district", e.target.value)} className={inputCls}>
                {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </FilterField>

            {/* Taluk */}
            <FilterField label="Taluk">
              <select value={filters.taluk} onChange={(e) => setFilter("taluk", e.target.value)} className={inputCls}>
                {(TALUKS[filters.district] ?? TALUKS.All).map((t) => <option key={t}>{t}</option>)}
              </select>
            </FilterField>

            {/* Ward */}
            <FilterField label="Ward">
              <select value={filters.ward} onChange={(e) => setFilter("ward", e.target.value)} className={inputCls}>
                {(WARDS[filters.taluk] ?? WARDS.All).map((w) => <option key={w}>{w}</option>)}
              </select>
            </FilterField>
          </div>
        )}
      </div>

      {/* ── KPI Cards ── */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
          {Array.from({ length: 7 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
          <StatCard label="Campaigns"     value={kpis.total}                 icon={Megaphone}    color="blue"   />
          <StatCard label="Total Reach"   value={fmt(kpis.reach)}            icon={Users}        color="violet" />
          <StatCard label="Delivered"     value={fmt(kpis.delivered)}        icon={CheckCircle2} color="green"  />
          <StatCard label="Pending"       value={fmt(kpis.pending)}          icon={Clock}        color="amber"  />
          <StatCard label="Failed"        value={fmt(kpis.failed)}           icon={XCircle}      color="red"    />
          <StatCard label="Delivery Rate" value={`${kpis.rate}%`}           icon={TrendingUp}   color="teal"   />
          <StatCard label="Credits Used"  value={fmt(kpis.credits)}          icon={Coins}        color="slate"  />
        </div>
      )}

      {/* ── Charts Row ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonChart key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* 1. Delivery Trend — Line */}
          <DashCard title="Delivery Trend" subtitle="Messages by day">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={DELIVERY_TREND} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} width={38} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="delivered" stroke="#22c55e" strokeWidth={2} dot={false} name="Delivered" />
                <Line type="monotone" dataKey="failed"    stroke="#ef4444" strokeWidth={2} dot={false} name="Failed"    />
                <Line type="monotone" dataKey="pending"   stroke="#f59e0b" strokeWidth={2} dot={false} name="Pending"   />
              </LineChart>
            </ResponsiveContainer>
          </DashCard>

          {/* 2. Channel Distribution — Donut */}
          <DashCard title="Channel Distribution" subtitle="Campaigns by channel">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={CHANNEL_DIST}
                  cx="50%" cy="50%"
                  innerRadius={58} outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {CHANNEL_DIST.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [`${v} campaigns`, n]} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </DashCard>

          {/* 3. Campaign Performance — Bar */}
          {/* <DashCard title="Campaign Performance" subtitle="Top 8 campaigns">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={CAMPAIGN_PERF} margin={{ top: 4, right: 12, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#9ca3af" }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} width={38} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="delivered" fill="#22c55e" name="Delivered" radius={[3, 3, 0, 0]} />
                <Bar dataKey="failed"    fill="#ef4444" name="Failed"    radius={[3, 3, 0, 0]} />
                <Bar dataKey="pending"   fill="#f59e0b" name="Pending"   radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </DashCard> */}

          {/* 4. Credit Usage — Area */}
          {/* <DashCard title="Credit Usage" subtitle="Credits consumed per day">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={CREDIT_USAGE} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="creditGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date"    tick={{ fontSize: 10, fill: "#9ca3af" }} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} width={42} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${fmt(v)} cr`, "Credits"]} />
                <Area type="monotone" dataKey="credits" stroke="#6366f1" strokeWidth={2} fill="url(#creditGrad)" name="Credits" />
              </AreaChart>
            </ResponsiveContainer>
          </DashCard> */}
        </div>
      )}

      {/* ── Campaign Table ── */}
      <DashCard
        title="Campaign History"
        subtitle={`${tableData.length} campaign${tableData.length !== 1 ? "s" : ""} found`}
        action={
          /* Export buttons */
          <div className="flex items-center gap-2">
            <span className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wider hidden sm:block">Export</span>
            <ExportBtn label="Excel" icon={<TableIcon />}    onClick={() => handleExport("Excel")} color="green" />
            <ExportBtn label="CSV"   icon={<FileText size={12} />} onClick={() => handleExport("CSV")}   color="blue"  />
            <ExportBtn label="PDF"   icon={<FileText size={12} />} onClick={() => handleExport("PDF")}   color="red"   />
          </div>
        }
      >
        {/* Search bar */}
        <div className="mb-4 relative max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search campaigns…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-8 pr-3 py-2 text-[13px] border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={12} />
            </button>
          )}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : pageRows.length === 0 ? (
          <EmptyState message="No campaigns match your filters." />
        ) : (
          <>
            <div className="overflow-x-auto -mx-5">
              <table className="w-full text-left min-w-[860px]">
                <thead>
                  <tr className="border-t border-b border-gray-100 bg-gray-50">
                    {TABLE_COLS.map((col) => (
                      <th
                        key={col.key}
                        onClick={() => col.sortable && handleSort(col.key)}
                        className={`px-5 py-3 text-[10.5px] font-semibold tracking-widest uppercase text-gray-400 whitespace-nowrap ${col.sortable ? "cursor-pointer select-none hover:text-gray-600" : ""} ${col.align === "right" ? "text-right" : ""}`}
                      >
                        <span className={`inline-flex items-center gap-1 ${col.align === "right" ? "justify-end" : ""}`}>
                          {col.label}
                          {col.sortable && (
                            <SortIcon active={sortKey === col.key} dir={sortDir} />
                          )}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((c) => (
                    <tr key={c.id} className="border-b border-gray-100 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 text-[13px] font-semibold text-gray-800 max-w-[180px] truncate" title={c.name}>{c.name}</td>
                      <td className="px-5 py-3"><ChannelBadge channel={c.channel} /></td>
                      <td className="px-5 py-3 text-[13px] text-gray-500 tabular-nums whitespace-nowrap">{c.scheduledAt}</td>
                      <td className="px-5 py-3 text-[13px] text-gray-800 tabular-nums text-right">{fmt(c.reach)}</td>
                      <td className="px-5 py-3 text-[13px] text-green-600 font-semibold tabular-nums text-right">{fmt(c.delivered)}</td>
                      <td className="px-5 py-3 text-[13px] text-red-500  font-semibold tabular-nums text-right">{fmt(c.failed)}</td>
                      <td className="px-5 py-3 text-[13px] text-amber-500 font-semibold tabular-nums text-right">{fmt(c.pending)}</td>
                      <td className="px-5 py-3 text-[13px] text-gray-700 tabular-nums text-right">{fmt(c.credits)}</td>
                      <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
                      <td className="px-5 py-3">
                        <button className="text-[12px] text-blue-600 hover:underline font-medium">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between text-[12.5px] text-gray-500">
              <span>
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, tableData.length)} of {tableData.length}
              </span>
              <div className="flex items-center gap-1">
                <PageBtn disabled={page === 1}          onClick={() => setPage(1)}                      icon={<ChevronsLeft  size={13} />} />
                <PageBtn disabled={page === 1}          onClick={() => setPage((p) => p - 1)}           icon={<ChevronLeft   size={13} />} />
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - page) <= 2)
                  .map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-7 h-7 rounded-lg text-[12px] font-medium transition-colors ${
                        p === page
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-100 text-gray-600"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                <PageBtn disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}           icon={<ChevronRight  size={13} />} />
                <PageBtn disabled={page === totalPages} onClick={() => setPage(totalPages)}              icon={<ChevronsRight size={13} />} />
              </div>
            </div>
          </>
        )}
      </DashCard>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const TABLE_COLS = [
  { key: "name",        label: "Campaign",  sortable: true,  align: "left"  },
  { key: "channel",     label: "Channel",   sortable: true,  align: "left"  },
  { key: "scheduledAt", label: "Scheduled", sortable: true,  align: "left"  },
  { key: "reach",       label: "Reach",     sortable: true,  align: "right" },
  { key: "delivered",   label: "Delivered", sortable: true,  align: "right" },
  { key: "failed",      label: "Failed",    sortable: true,  align: "right" },
  { key: "pending",     label: "Pending",   sortable: true,  align: "right" },
  { key: "credits",     label: "Credits",   sortable: true,  align: "right" },
  { key: "status",      label: "Status",    sortable: true,  align: "left"  },
  { key: "actions",     label: "Actions",   sortable: false, align: "left"  },
];

const tooltipStyle = {
  fontSize: 12,
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
};

const inputCls =
  "w-full px-3 py-2 text-[13px] border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all";

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

const COLOR_MAP = {
  blue:   { icon: "bg-blue-600",   text: "text-blue-600",   bg: "bg-blue-50"   },
  violet: { icon: "bg-violet-500", text: "text-violet-500", bg: "bg-violet-50" },
  green:  { icon: "bg-green-500",  text: "text-green-600",  bg: "bg-green-50"  },
  red:    { icon: "bg-red-500",    text: "text-red-500",    bg: "bg-red-50"    },
  amber:  { icon: "bg-amber-400",  text: "text-amber-600",  bg: "bg-amber-50"  },
  teal:   { icon: "bg-teal-500",   text: "text-teal-600",   bg: "bg-teal-50"   },
  slate:  { icon: "bg-slate-500",  text: "text-slate-600",  bg: "bg-slate-50"  },
};

function StatCard({ label, value, icon: Icon, color }) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.blue;
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 flex items-center justify-between">
      <div className="min-w-0">
        <p className="text-[9.5px] font-semibold tracking-widest uppercase text-gray-400 mb-1 truncate">{label}</p>
        <p className={`text-[22px] font-bold leading-none tabular-nums ${c.text}`}>{value}</p>
      </div>
      <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ml-2 ${c.icon}`}>
        <Icon size={15} color="white" />
      </span>
    </div>
  );
}

function FilterField({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">{label}</label>
      {children}
    </div>
  );
}

const STATUS_STYLES = {
  Completed: "bg-green-50  text-green-700  border-green-200",
  Running:   "bg-blue-50   text-blue-700   border-blue-200",
  Scheduled: "bg-amber-50  text-amber-700  border-amber-200",
  Failed:    "bg-red-50    text-red-700    border-red-200",
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
      {status}
    </span>
  );
}

const CHANNEL_STYLES = {
  SMS:      "bg-indigo-50 text-indigo-700",
  WhatsApp: "bg-green-50  text-green-700",
  Email:    "bg-blue-50   text-blue-700",
  IVR:      "bg-amber-50  text-amber-700",
};

function ChannelBadge({ channel }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${CHANNEL_STYLES[channel] ?? "bg-gray-100 text-gray-600"}`}>
      {channel}
    </span>
  );
}

function SortIcon({ active, dir }) {
  if (!active) return <ChevronUp size={11} className="opacity-25" />;
  return dir === "asc"
    ? <ChevronUp   size={11} className="text-blue-600" />
    : <ChevronDown size={11} className="text-blue-600" />;
}

function PageBtn({ disabled, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors
        ${disabled
          ? "text-gray-300 cursor-not-allowed bg-transparent"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
        }`}
    >
      {icon}
    </button>
  );
}

function ExportBtn({ label, icon, onClick, color }) {
  const cls = {
    green: "text-green-600 hover:bg-green-50  border-green-200",
    blue:  "text-blue-600  hover:bg-blue-50   border-blue-200",
    red:   "text-red-500   hover:bg-red-50    border-red-200",
  }[color];
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-2.5 py-1.5 text-[11.5px] font-semibold border rounded-lg transition-colors ${cls}`}
    >
      {icon}{label}
    </button>
  );
}

function TableIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M3 15h18M9 3v18" />
    </svg>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 animate-pulse">
      <div className="h-2.5 w-16 bg-gray-200 rounded mb-2" />
      <div className="h-6 w-12 bg-gray-200 rounded" />
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 animate-pulse">
      <div className="h-3 w-32 bg-gray-200 rounded mb-1" />
      <div className="h-2 w-20 bg-gray-100 rounded mb-4" />
      <div className="h-48 bg-gray-100 rounded-xl" />
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
        <BarChart2 size={22} className="text-gray-400" />
      </div>
      <p className="text-[13.5px] font-semibold text-gray-700 mb-1">No data found</p>
      <p className="text-[12.5px] text-gray-400 max-w-xs">{message}</p>
    </div>
  );
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function fmt(n) {
  if (n === undefined || n === null) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + "K";
  return String(n);
}