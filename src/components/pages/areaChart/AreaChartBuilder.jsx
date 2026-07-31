import React, { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { UserPlus, SlidersHorizontal, Printer, Download, Search, PackageOpen, LayoutGrid, Loader2, AlertCircle, } from "lucide-react";
import ConstituencySection from "./components/ConstituencySection.jsx";
import PositionDetailsModal from "./models/PositionDetailsModal";
import { getLocationByWardHeadId, selectWards, selectLocationStatus, selectLocationError} from "../../redux/slices/areaChartSlice.js";
import { selectUser } from "../../redux/slices/authSlice";

// ─── Helpers ──────────────────────────────────────────────────────
const statusOf = (built = 0, total = 0) => {
  if (built <= 0) return "empty";
  if (total > 0 && built >= total) return "full";
  return "progress";
};

// ─── Component ────────────────────────────────────────────────────
export default function AreaChartBuilder() {
  const dispatch = useDispatch();

  const user = useSelector(selectUser);
  const wards = useSelector(selectWards);
  const locationStatus = useSelector(selectLocationStatus);
  const locationError = useSelector(selectLocationError);

  const [tab, setTab] = useState("urban");
  const [search, setSearch] = useState("");
  const [constituencyFilter, setConstituencyFilter] = useState("all");
  const [selectedPosition, setSelectedPosition] = useState(null);

  // ── Fetch ward list on mount (or when userId changes) ──
  useEffect(() => {
    if (user?.userId) {
      dispatch(getLocationByWardHeadId(user.userId));
    }
  }, [dispatch, user?.userId]);

  // ── Derived data ──────────────────────────────────────────────
  const constituencies = useMemo(
    () => ["all", ...new Set(wards.map((w) => w.constituency))],
    [wards]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return wards.filter((w) => {
      const matchesConstituency =
        constituencyFilter === "all" || w.constituency === constituencyFilter;
      const matchesSearch =
        !q ||
        w.ward_name.toLowerCase().includes(q) ||
        String(w.ward_number).toLowerCase().includes(q) ||
        w.constituency.toLowerCase().includes(q);
      return matchesConstituency && matchesSearch;
    });
  }, [wards, search, constituencyFilter]);

  const stats = useMemo(() => {
    const total = filtered.length;
    let full = 0, progress = 0, empty = 0;
    filtered.forEach((w) => {
      const s = statusOf(w.booths_built, w.booths_total);
      if (s === "full") full++;
      else if (s === "progress") progress++;
      else empty++;
    });
    return { total, full, progress, empty };
  }, [filtered]);

  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach((w) => {
      if (!map.has(w.constituency)) map.set(w.constituency, []);
      map.get(w.constituency).push(w);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const isLoading = locationStatus === "loading";
  const isError = locationStatus === "failed";

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="min-h-full space-y-5">

      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <LayoutGrid size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-[20px] font-bold text-gray-900 leading-tight tracking-tight">
              Area Chart Builder
            </h1>
            <p className="text-[12.5px] text-gray-500 mt-0.5">
              Build and manage ward hierarchy and organisational structure
            </p>
          </div>
        </div>

        {/* Header-level filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={constituencyFilter}
            onChange={(e) => setConstituencyFilter(e.target.value)}
            className="h-8 text-[12.5px] font-medium text-gray-700 border border-gray-200 rounded-lg px-3 pr-7 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all appearance-none cursor-pointer w-full xs:w-auto min-w-[130px]"
          >
            {constituencies.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All Constituencies" : c}
              </option>
            ))}
          </select>
          <select className="h-8 text-[12.5px] font-medium text-gray-400 border border-gray-200 rounded-lg px-3 pr-7 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all appearance-none cursor-pointer w-full xs:w-auto min-w-[130px]">
            <option>All Wards</option>
          </select>
          <select className="h-8 text-[12.5px] font-medium text-gray-400 border border-gray-200 rounded-lg px-3 pr-7 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all appearance-none cursor-pointer w-full xs:w-auto min-w-[130px]">
            <option>Pick a Hobli (Rural)</option>
          </select>
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div className="flex flex-wrap gap-2">
        <button
          disabled
          title="Open a ward's chart first"
          className="inline-flex items-center justify-center gap-2 h-8 bg-gray-900 text-white text-[12.5px] font-semibold px-4 rounded-lg opacity-40 cursor-not-allowed select-none w-full sm:w-auto"
        >
          <UserPlus size={13} />
          Invite Member
        </button>

        {[
          { Icon: SlidersHorizontal, label: "Customize Layout" },
          { Icon: Printer, label: "Print Chart" },
          { Icon: Download, label: "Download PDF" },
        ].map(({ Icon, label }) => (
          <button
            key={label}
            disabled
            title="Open a ward's chart first"
            className="inline-flex items-center justify-center gap-2 h-8 bg-white border border-gray-200 text-[12.5px] font-medium text-gray-400 px-4 rounded-lg cursor-not-allowed select-none w-full sm:w-auto"
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Total Wards"
          value={stats.total}
          badge="+1 this week"
          dotColor="bg-blue-500"
          iconBg="bg-blue-50"
          badgeCls="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Fully Built"
          value={stats.full}
          badge="Completed"
          dotColor="bg-emerald-500"
          iconBg="bg-emerald-50"
          badgeCls="bg-emerald-50 text-emerald-700"
        />
        <StatCard
          label="In Progress"
          value={stats.progress}
          badge="Active builds"
          dotColor="bg-amber-500"
          iconBg="bg-amber-50"
          badgeCls="bg-amber-50 text-amber-700"
        />
        <StatCard
          label="Empty"
          value={stats.empty}
          badge="Needs action"
          dotColor="bg-gray-400"
          iconBg="bg-gray-100"
          badgeCls="bg-gray-100 text-gray-500"
        />
      </div>

      {/* ── Tabs ── */}
      <div className="flex flex-wrap sm:inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 w-full sm:w-auto">
        <TabButton
          active={tab === "urban"}
          onClick={() => setTab("urban")}
          label={`Wards / Hoblis (${wards.length})`}
        />
        <TabButton
          active={tab === "rural"}
          onClick={() => setTab("rural")}
          label="Rural Hoblis (0)"
        />
      </div>

      {/* ── Rural empty state ── */}
      {tab === "rural" ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-6 sm:p-14 text-center">
          <div className="w-11 h-11 rounded-lg bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <PackageOpen size={20} className="text-gray-400" />
          </div>
          <p className="text-[13.5px] font-semibold text-gray-700 mb-1">
            No rural hoblis mapped yet
          </p>
          <p className="text-[12.5px] text-gray-500">
            Add hobli boundaries to start tracking rural coverage here.
          </p>
        </div>
      ) : (
        <>
          {/* ── Search + Bulk Print ── */}
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px] flex items-center gap-2 h-9 border border-gray-200 rounded-lg px-3 bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition-all">
              <Search size={13} className="text-gray-400 shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ward, number or constituency…"
                className="w-full text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none bg-transparent"
              />
            </div>
            <button className="inline-flex items-center justify-center gap-2 h-9 bg-blue-600 text-white text-[12.5px] font-semibold px-4 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors shrink-0 w-full sm:w-auto">
              <Download size={13} />
              Bulk Print All Wards (ZIP)
            </button>
          </div>

          {/* ── Loading State ── */}
          {isLoading && (
            <div className="rounded-xl border border-gray-200 bg-white p-14 text-center">
              <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center mx-auto mb-3">
                <Loader2 size={20} className="text-blue-500 animate-spin" />
              </div>
              <p className="text-[13.5px] font-semibold text-gray-700 mb-1">
                Loading wards…
              </p>
              <p className="text-[12.5px] text-gray-500">
                Fetching your area chart data.
              </p>
            </div>
          )}

          {/* ── Error State ── */}
          {isError && !isLoading && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-14 text-center">
              <div className="w-11 h-11 rounded-lg bg-red-100 flex items-center justify-center mx-auto mb-3">
                <AlertCircle size={20} className="text-red-500" />
              </div>
              <p className="text-[13.5px] font-semibold text-red-700 mb-1">
                Failed to load wards
              </p>
              <p className="text-[12.5px] text-red-500">{locationError}</p>
            </div>
          )}

          {/* ── Grouped Ward List ── */}
          {!isLoading && !isError && (
            <div className="space-y-3">
              {grouped.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-white p-14 text-center">
                  <div className="w-11 h-11 rounded-lg bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <Search size={18} className="text-gray-400" />
                  </div>
                  <p className="text-[13.5px] font-semibold text-gray-700 mb-1">
                    No wards match your search
                  </p>
                  <p className="text-[12.5px] text-gray-500">
                    Try a different ward name, number, or constituency.
                  </p>
                </div>
              ) : (
                grouped.map(([constituency, wardsInGroup]) => (
                  <ConstituencySection
                    key={constituency}
                    constituency={constituency}
                    wards={wardsInGroup}
                  />
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── Sub-components ── */

function StatCard({ label, value, badge, iconBg, dotColor, badgeCls }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[10.5px] font-semibold tracking-widest uppercase text-gray-400">
          {label}
        </p>
        <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center`}>
          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
        </div>
      </div>
      <p className="text-[28px] font-bold text-gray-900 leading-none tabular-nums mb-3">
        {value}
      </p>
      <span className={`inline-flex items-center text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${badgeCls}`}>
        {badge}
      </span>
    </div>
  );
}

function TabButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-md text-[12.5px] font-semibold transition-all ${active
        ? "bg-blue-600 text-white"
        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
        }`}
    >
      {label}
    </button>
  );
}