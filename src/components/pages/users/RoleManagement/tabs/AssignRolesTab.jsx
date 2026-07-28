import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  UserCheck, Search, Check, X, ChevronDown,
  AlertCircle, Loader2, MapPin,
} from "lucide-react";
import { fetchRoles, assignRole, clearAssignSuccess } from "../../../../redux/slices/rolesSlice";
import { fetchDashboard } from "../../../../redux/slices/dashboardSlice";
import api from "../../../../service/api.js";
import {
  fetchWardsByTalukaId,
  selectTalukaWards,
  selectTalukaWardsStatus,
} from "../../../../redux/slices/Areachartslice";

function RowSelect({ value, onChange, placeholder, options, loading, minWidth = "120px" }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={loading || options.length === 0}
        style={{ minWidth }}
        className="h-7 appearance-none pl-2 pr-7 text-[12px] text-gray-800 bg-white border border-blue-400 ring-2 ring-blue-500/20 rounded-lg focus:outline-none cursor-pointer disabled:opacity-50"
      >
        <option value="">{placeholder}</option>
        {options.map(({ value: v, label }) => (
          <option key={v} value={v}>{label}</option>
        ))}
      </select>
      {loading
        ? <Loader2 size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 animate-spin pointer-events-none" />
        : <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      }
    </div>
  );
}

export default function AssignRolesTab() {
  const dispatch = useDispatch();
  const { users } = useSelector((s) => s.dashboard);
  const { roles, loadingRoles, assigning, assignSuccessId, error } = useSelector((s) => s.roles);
  const token = useSelector((s) => s.auth.token);
  const currentUserId = useSelector((s) => s.auth.user?.userId);

  // ── Filter bar ───────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [districts, setDistricts] = useState([]);
  const [filterTalukas, setFilterTalukas] = useState([]);
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterTaluka, setFilterTaluka] = useState("");
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingFilterTalukas, setLoadingFilterTalukas] = useState(false);

  // ── Inline-edit base ─────────────────────────────────────────────────────────
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRoleId, setNewRoleId] = useState("");

  // ── DistrictHead flow ────────────────────────────────────────────────────────
  const [rowDistrict, setRowDistrict] = useState(""); // districtId for DH assign

  // ── TalukaHead flow ──────────────────────────────────────────────────────────
  const [dhUsersList, setDhUsersList] = useState([]); // [{userId, name, districtId}]
  const [availableDistricts, setAvailableDistricts] = useState([]); // districts that have DH
  const [selectedDHDistrict, setSelectedDHDistrict] = useState(""); // districtId chosen in UI
  const [selectedDistrictHeadId, setSelectedDistrictHeadId] = useState(""); // auto-resolved DH userId
  const [selectedTalukaIds, setSelectedTalukaIds] = useState([]);
  const [rowTalukas, setRowTalukas] = useState([]);
  const [loadingRoleUsers, setLoadingRoleUsers] = useState(false);
  const [loadingRowTalukas, setLoadingRowTalukas] = useState(false);

  // ── WardChairman flow ────────────────────────────────────────────────────────
  const [wcDistrict, setWcDistrict] = useState("");
  const [wcTalukas, setWcTalukas] = useState([]);
  const [wcTaluka, setWcTaluka] = useState("");
  const [talukaHeads, setTalukaHeads] = useState([]);
  const [selectedTalukaHeadId, setSelectedTalukaHeadId] = useState("");
  const [wards, setWards] = useState([]);
  const [selectedWardId, setSelectedWardId] = useState("");
  const [loadingWcTalukas, setLoadingWcTalukas] = useState(false);
  const [loadingTalukaHeads, setLoadingTalukaHeads] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  // selector
  const talukaWards = useSelector(selectTalukaWards);
  const talukaWardsStatus = useSelector(selectTalukaWardsStatus);



  const currentUserRole = useSelector((s) => s.auth.user?.role);

  const locationData = (() => {
    try { return JSON.parse(localStorage.getItem("locationData") || "{}"); }
    catch { return {}; }
  })();

  // ── Role filter map —  ──────────────
  const HIDDEN_ROLES_BY_LOGIN = {
    SuperAdmin: [],
    DistrictHead: ["SuperAdmin", "DistrictHead"],
    TalukHead: ["SuperAdmin", "DistrictHead", "TalukHead"],
    WardChairman: ["SuperAdmin", "DistrictHead", "TalukHead", "WardChairman"],
  };

  // roles array filter (existing `roles` variable)
  const visibleRoles = roles.filter(
    (r) => !(HIDDEN_ROLES_BY_LOGIN[currentUserRole] ?? []).includes(r.role)
  );
  // ── Mount ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchRoles());
    dispatch(fetchDashboard());
    loadAllDistricts();
  }, [dispatch]);

  useEffect(() => {
    if (!assignSuccessId) return;
    dispatch(fetchDashboard());
    const t = setTimeout(() => dispatch(clearAssignSuccess()), 3000);
    return () => clearTimeout(t);
  }, [assignSuccessId, dispatch]);

  // ── Role detection ───────────────────────────────────────────────────────────
  const selectedRoleObj = roles.find((r) => r.roleId === Number(newRoleId));
  const roleName = selectedRoleObj?.role || "";
  const isDistrictHead = roleName === "DistrictHead";
  const isTalukaHead = roleName === "TalukHead";
  const isWardChairman = roleName === "WardChairman" || roleName === "WardHead";

  // ── API helpers ──────────────────────────────────────────────────────────────

  const loadAllDistricts = async () => {
    try {
      setLoadingDistricts(true);
      const res = await api.get("/district/getAllDistricts", authHeader);
      setDistricts(res.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoadingDistricts(false); }
  };

  // Step 1 for TalukaHead:
  // getAllRoleUsers → filter district_head → get their districtIds
  // getAllDistricts → filter only districts that have a DH assigned
  const loadTalukaHeadDropdowns = async () => {
    try {
      setLoadingRoleUsers(true);

      // 1. Fetch all role users
      const roleUsersRes = await api.get("/roles/getAllRoleUsers", authHeader);
      const allUsers = roleUsersRes.data.data || [];

      // 2. Filter district_head users
      // Each user in response has: { userId, name, roles: [{roleId, roleName}] }
      // We need to also know which districtId each DH manages.
      // Since getAllRoleUsers may not return districtId directly,
      // we match DH users against our existing `districts` list (loaded at mount).
      // → But districts list has districtName, not DH userId.
      // So: fetch districts fresh here too (they carry assignedUserId or similar).
      // ── Adjust field names below to match your actual API response ──

      const dhUsers = allUsers.filter((u) =>
        u.roles?.some((r) => r.roleName === "district_head")
      );
      // dhUsers shape: [{ userId, name, roles, ... }]
      // We need districtId for each DH.
      // Option A: getAllRoleUsers already returns districtId on each user → use u.districtId
      // Option B: districts list has a districtHeadUserId field → cross-match
      // Using Option A (adjust if your API differs):
      setDhUsersList(dhUsers);

      // 3. Build availableDistricts: only districts whose DH is in dhUsers
      // Cross-match using districts (already loaded) that have a matching DH userId
      // Adjust `d.districtHeadUserId` to your actual field name:
      const districtRes = await api.get("/district/getAllDistricts", authHeader);
      const allDistricts = districtRes.data.data || [];

      // Build a map: districtId → DH userId
      // Assumption: district object has a field like `assignedUserId` or `districtHeadId`
      // pointing to the DH userId. Adjust field name below:
      const dhDistrictMap = {}; // { districtId: dhUserId }
      dhUsers.forEach((dh) => {
        // If DH user object has districtId directly:
        if (dh.districtId) dhDistrictMap[dh.districtId] = dh.userId;
      });

      // Filter districts that have an assigned DH
      const filtered = allDistricts.filter((d) => dhDistrictMap[d.districtId]);
      setAvailableDistricts(filtered);

      // Store map for later lookup
      setDhUsersList(dhUsers.map((dh) => ({ ...dh, _districtId: dh.districtId })));

    } catch (e) { console.error(e); }
    finally { setLoadingRoleUsers(false); }
  };

  // Step 2 for TalukaHead: district selected → resolve DH userId + fetch talukas
  const handleDHDistrictSelect = async (districtId) => {
    setSelectedDHDistrict(districtId);
    setSelectedDistrictHeadId("");
    setSelectedTalukaIds([]);
    setRowTalukas([]);
    if (!districtId) return;

    // Resolve which DH manages this district
    const matchedDH = dhUsersList.find((dh) => dh._districtId === districtId || dh.districtId === districtId);
    if (matchedDH) setSelectedDistrictHeadId(matchedDH.userId);

    // Fetch talukas under this district
    try {
      setLoadingRowTalukas(true);
      const res = await api.get(`/district/getAllDistricts?districtId=${districtId}`, authHeader);
      setRowTalukas(res.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoadingRowTalukas(false); }
  };

  // Filter bar district change
  const handleFilterDistrictChange = async (id) => {
    setFilterDistrict(id);
    setFilterTaluka("");
    setFilterTalukas([]);
    if (!id) return;
    try {
      setLoadingFilterTalukas(true);
      const res = await api.get(`/district/getAllDistricts?districtId=${id}`, authHeader);
      setFilterTalukas(res.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoadingFilterTalukas(false); }
  };



  // DistrictHead: district select
  const handleRowDistrictChange = (id) => setRowDistrict(id);

  // WardChairman: district → talukas
  const handleWcDistrictChange = async (id) => {
    setWcDistrict(id);
    setWcTaluka("");
    setWcTalukas([]);
    setTalukaHeads([]);
    setSelectedTalukaHeadId("");
    setWards([]);
    setSelectedWardId("");
    if (!id) return;
    try {
      setLoadingWcTalukas(true);
      const res = await api.get(`/district/getAllDistricts?districtId=${id}`, authHeader);
      setWcTalukas(res.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoadingWcTalukas(false); }
  };

  // WardChairman: taluka → talukaHeads + wards
  const handleWcTalukaChange = async (id) => {
    setWcTaluka(id);
    setTalukaHeads([]);
    setSelectedTalukaHeadId("");
    setWards([]);
    setSelectedWardId("");
    if (!id) return;
    try {
      setLoadingTalukaHeads(true);
      const res = await api.get(`/roles/getTalukaHeads?talukaId=${id}`, authHeader);
      setTalukaHeads(res.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoadingTalukaHeads(false); }

    try {
      setLoadingWards(true);
      const res = await api.get(`/district/getWards?talukaId=${id}`, authHeader);
      setWards(res.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoadingWards(false); }
  };

  // ── Role change handler ──────────────────────────────────────────────────────
  const handleRoleChange = (e) => {
    const roleId = e.target.value;
    setNewRoleId(roleId);
    resetRowState();

    const roleObj = roles.find((r) => r.roleId === Number(roleId));

    console.log("roleObj →", roleObj);                    // ← TalukHead வருதா?
    console.log("currentUserRole →", currentUserRole);    // ← "DistrictHead" வருதா?
    console.log("locationData →", locationData);          // ← districtId இருக்கா?

    // ── TalukHead flow ──
    if (roleObj?.role === "TalukHead") {
      if (currentUserRole === "DistrictHead") {
        const { districtId } = locationData;
        console.log("districtId →", districtId);
        if (districtId) {
          setSelectedDHDistrict(districtId);
          setSelectedDistrictHeadId(currentUserId);
          setLoadingRowTalukas(true);
          api.get(`/district/getAllDistricts?districtId=${districtId}`, authHeader)
            .then((res) => setRowTalukas(res.data.data || []))
            .catch(console.error)
            .finally(() => setLoadingRowTalukas(false));
        }
      } else {
        loadTalukaHeadDropdowns();
      }
    }

    // ── WardChairman + TalukHead login ── ✅ இங்கே இருக்கணும்
    if (roleObj?.role === "WardChairman" && currentUserRole === "TalukHead") {
      const { talukaId } = locationData;
      if (talukaId) {
        setWcTaluka(talukaId);
        setSelectedTalukaHeadId(currentUserId);
        dispatch(fetchWardsByTalukaId(talukaId));
      }
    }
  };

  // ── Reset ────────────────────────────────────────────────────────────────────
  const resetRowState = () => {
    // DH flow
    setRowDistrict("");
    // TH flow
    setDhUsersList([]);
    setAvailableDistricts([]);
    setSelectedDHDistrict("");
    setSelectedDistrictHeadId("");
    setSelectedTalukaIds([]);
    setRowTalukas([]);
    // WC flow
    setWcDistrict("");
    setWcTalukas([]);
    setWcTaluka("");
    setTalukaHeads([]);
    setSelectedTalukaHeadId("");
    setWards([]);
    setSelectedWardId("");
  };

  const openEdit = (u) => { setSelectedUser(u); setNewRoleId(""); resetRowState(); };
  const cancelEdit = () => { setSelectedUser(null); setNewRoleId(""); resetRowState(); };

  const toggleTalukaId = (id) =>
    setSelectedTalukaIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // ── canAssign ────────────────────────────────────────────────────────────────
  const canAssign = (() => {
    if (!newRoleId) return false;
    if (isDistrictHead) return !!rowDistrict;
    if (isTalukaHead) return !!selectedDistrictHeadId && selectedTalukaIds.length > 0;
    if (isWardChairman) {
      if (currentUserRole === "TalukHead") return !!selectedWardId; // ← taluka auto-set ஆகும்
      return !!wcTaluka && !!selectedTalukaHeadId && !!selectedWardId;
    }
    return false;
  })();
  // ── Payload & dispatch ───────────────────────────────────────────────────────
  const handleAssign = () => {
    if (!selectedUser || !newRoleId) return;
    const base = { userId: selectedUser.userId, roleId: Number(newRoleId), assignedBy: currentUserId };
    let payload;

    if (isDistrictHead) {
      payload = { ...base, type: "district_head", districtId: rowDistrict };

    } else if (isTalukaHead) {
      payload = {
        ...base,
        type: "taluka_head",
        districtHeadId: selectedDistrictHeadId,
        talukaIds: selectedTalukaIds,
      };

    } else if (isWardChairman) {
      payload = {
        ...base,
        type: "ward_chairman",
        talukaHeadId: selectedTalukaHeadId,
        talukaId: wcTaluka,
        wardId: selectedWardId,
      };
    } else {
      payload = { ...base, type: roleName.toLowerCase() };
    }

    dispatch(assignRole(payload)).then((res) => {
      if (res.meta.requestStatus === "fulfilled") cancelEdit();
    });
  };

  // ── Filter logic ─────────────────────────────────────────────────────────────
  const filterDistrictName = districts.find((d) => d.districtId === filterDistrict)?.districtName?.toLowerCase() || "";
  const filterTalukaName = filterTalukas.find((t) => t.talukaId === filterTaluka)?.talukaName?.toLowerCase() || "";

  const filteredUsers = users.filter((u) => {
    const loc = u.businessLocation?.toLowerCase() || "";
    return (
      (u.name.toLowerCase().includes(search.toLowerCase()) || u.mobileNumber?.includes(search)) &&
      (!filterDistrict || loc.includes(filterDistrictName)) &&
      (!filterTaluka || loc.includes(filterTalukaName))
    );
  });

  const getRoleBadge = (userRoles = []) => userRoles[0]?.role?.role || null;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* Header */}
      <div>
        <h2 className="text-[14px] font-bold text-gray-900">Assign Roles</h2>
        <p className="text-[12px] text-gray-400 mt-0.5">Search or filter users by district / taluk and assign them a role</p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 h-8 border border-gray-200 rounded-lg px-3 bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition-all">
          <Search size={12} className="text-gray-400 shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or phone…"
            className="w-44 text-[12.5px] text-gray-700 placeholder:text-gray-400 focus:outline-none bg-transparent" />
        </div>

        <div className="relative">
          <MapPin size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <select value={filterDistrict} onChange={(e) => handleFilterDistrictChange(e.target.value)}
            disabled={loadingDistricts}
            className="h-8 appearance-none pl-7 pr-7 text-[12px] text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer disabled:opacity-50 min-w-[150px]">
            <option value="">All Districts</option>
            {districts.map((d) => <option key={d.districtId} value={d.districtId}>{d.districtName}</option>)}
          </select>
          {loadingDistricts
            ? <Loader2 size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
            : <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />}
        </div>

        {filterDistrict && (
          <div className="relative">
            <select value={filterTaluka} onChange={(e) => setFilterTaluka(e.target.value)}
              disabled={loadingFilterTalukas}
              className="h-8 appearance-none pl-3 pr-7 text-[12px] text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer disabled:opacity-50 min-w-[140px]">
              <option value="">All Talukas</option>
              {filterTalukas.map((t) => <option key={t.talukaId} value={t.talukaId}>{t.talukaName}</option>)}
            </select>
            {loadingFilterTalukas
              ? <Loader2 size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
              : <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />}
          </div>
        )}

        {(filterDistrict || filterTaluka || search) && (
          <button onClick={() => { setSearch(""); setFilterDistrict(""); setFilterTaluka(""); setFilterTalukas([]); }}
            className="h-8 px-3 text-[11.5px] font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all flex items-center gap-1">
            <X size={11} /> Clear
          </button>
        )}
      </div>

      {/* Banners */}
      {assignSuccessId && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[12.5px] font-medium rounded-lg px-4 py-2.5">
          <Check size={14} /> Role assigned successfully.
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-[12.5px] font-medium rounded-lg px-4 py-2.5">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["User", "Phone", "Current Role", "Location", "Status", "Action"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[10.5px] font-semibold tracking-wider uppercase text-gray-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredUsers.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-[12.5px] text-gray-400">No users found.</td></tr>
            ) : filteredUsers.map((u) => {
              const badge = getRoleBadge(u.userRoles);
              const isEditing = selectedUser?.userId === u.userId;

              return (
                <tr key={u.userId} className={`transition-colors ${isEditing ? "bg-blue-50/40" : "hover:bg-gray-50/60"}`}>
                  <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{u.mobileNumber}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {badge
                      ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold border bg-blue-50 border-blue-200 text-blue-700">{badge}</span>
                      : <span className="text-gray-400 text-[11px]">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{u.businessLocation || "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold border ${u.isActive ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-gray-100 border-gray-200 text-gray-500"}`}>
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* Action cell */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <div className="flex flex-wrap items-start gap-2">

                        {/* Role select */}
                        <RowSelect
                          value={newRoleId}
                          onChange={handleRoleChange}
                          placeholder="Select role…"
                          options={visibleRoles.map((r) => ({ value: r.roleId, label: r.role }))}  // ✅
                          loading={loadingRoles}
                          minWidth="120px"
                        />

                        {/* ── DISTRICT HEAD flow ───── */}
                        {isDistrictHead && (
                          <RowSelect
                            value={rowDistrict}
                            onChange={(e) => handleRowDistrictChange(e.target.value)}
                            placeholder="District…"
                            options={districts.map((d) => ({ value: d.districtId, label: d.districtName }))}
                            minWidth="130px"
                          />
                        )}

                        {/* ── TALUKA HEAD flow ─────── */}
                        {isTalukaHead && (
                          <>
                            {/* SuperAdmin மட்டும் district dropdown பாக்கணும் */}
                            {currentUserRole !== "DistrictHead" && (
                              <RowSelect
                                value={selectedDHDistrict}
                                onChange={(e) => handleDHDistrictSelect(e.target.value)}
                                placeholder={loadingRoleUsers ? "Loading…" : "Select District…"}
                                options={availableDistricts.map((d) => ({ value: d.districtId, label: d.districtName }))}
                                loading={loadingRoleUsers}
                                minWidth="140px"
                              />
                            )}

                            {/* DistrictHead ku — district name badge show பண்ணு */}
                            {currentUserRole === "DistrictHead" && locationData.districtName && (
                              <span className="h-7 px-2.5 flex items-center text-[11.5px] font-medium bg-blue-50 border border-blue-200 text-blue-700 rounded-lg">
                                📍 {locationData.districtName}
                              </span>
                            )}

                            {/* Talukas — both roles ku show (selectedDHDistrict set ஆனா) */}
                            {selectedDHDistrict && (
                              <div className="flex flex-col gap-1">
                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                                  Talukas
                                  {selectedTalukaIds.length > 0 && (
                                    <span className="text-blue-600 ml-1">({selectedTalukaIds.length} selected)</span>
                                  )}
                                </p>
                                {loadingRowTalukas ? (
                                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                                    <Loader2 size={11} className="animate-spin" /> Loading talukas…
                                  </div>
                                ) : rowTalukas.length > 0 ? (
                                  <div className="flex flex-wrap gap-1.5 max-w-[300px]">
                                    {rowTalukas.map((t) => (
                                      <label key={t.talukaId}
                                        className={`flex items-center gap-1 text-[11px] cursor-pointer px-2 py-0.5 rounded border transition-colors ${selectedTalukaIds.includes(t.talukaId)
                                          ? "bg-blue-600 border-blue-600 text-white"
                                          : "bg-white border-gray-200 text-gray-600 hover:border-blue-300"
                                          }`}>
                                        <input type="checkbox"
                                          checked={selectedTalukaIds.includes(t.talukaId)}
                                          onChange={() => toggleTalukaId(t.talukaId)}
                                          className="sr-only" />
                                        {selectedTalukaIds.includes(t.talukaId) && <Check size={9} />}
                                        {t.talukaName}
                                      </label>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-gray-400">No talukas found</span>
                                )}
                              </div>
                            )}
                          </>
                        )}

                        {/* ── WARD CHAIRMAN flow ────── */}
                        {/* ── WARD CHAIRMAN flow ────── */}
                        {isWardChairman && (
                          <>
                            {/* TalukHead ku district + taluka + talukaHead hide */}
                            {currentUserRole !== "TalukHead" && (
                              <>
                                <RowSelect
                                  value={wcDistrict}
                                  onChange={(e) => handleWcDistrictChange(e.target.value)}
                                  placeholder="District…"
                                  options={districts.map((d) => ({ value: d.districtId, label: d.districtName }))}
                                  minWidth="130px"
                                />
                                {wcDistrict && (
                                  <RowSelect
                                    value={wcTaluka}
                                    onChange={(e) => handleWcTalukaChange(e.target.value)}
                                    placeholder="Taluka…"
                                    options={wcTalukas.map((t) => ({ value: t.talukaId, label: t.talukaName }))}
                                    loading={loadingWcTalukas}
                                    minWidth="120px"
                                  />
                                )}
                                {wcTaluka && (
                                  <RowSelect
                                    value={selectedTalukaHeadId}
                                    onChange={(e) => setSelectedTalukaHeadId(e.target.value)}
                                    placeholder="Taluka Head…"
                                    options={talukaHeads.map((u) => ({ value: u.userId, label: u.name }))}
                                    loading={loadingTalukaHeads}
                                    minWidth="140px"
                                  />
                                )}
                              </>
                            )}

                            {/* TalukHead ku — taluka name badge show */}
                            {currentUserRole === "TalukHead" && locationData.talukaName && (
                              <span className="h-7 px-2.5 flex items-center text-[11.5px] font-medium bg-blue-50 border border-blue-200 text-blue-700 rounded-lg">
                                📍 {locationData.talukaName}
                              </span>
                            )}

                            {/* Ward dropdown — TalukHead ku auto-loaded, others ku selectedTalukaHeadId பண்ணிட்டா */}
                            {(currentUserRole === "TalukHead" || selectedTalukaHeadId) && (
                              <RowSelect
                                value={selectedWardId}
                                onChange={(e) => setSelectedWardId(e.target.value)}
                                placeholder="Ward…"
                                options={
                                  currentUserRole === "TalukHead"
                                    ? talukaWards.map((w) => ({
                                      value: w.wardId,
                                      label: `${w.wardNumber} — ${w.wardName}`,
                                    }))
                                    : wards.map((w) => ({
                                      value: w.wardId,
                                      label: `${w.wardNumber} — ${w.wardName}`,
                                    }))
                                }
                                loading={currentUserRole === "TalukHead" ? talukaWardsStatus === "loading" : loadingWards}
                                minWidth="160px"
                              />
                            )}
                          </>
                        )}

                        {/* Assign button */}
                        <button onClick={handleAssign} disabled={!canAssign || assigning}
                          className="h-7 px-3 text-[11.5px] font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-40 flex items-center gap-1 self-start">
                          {assigning ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                          Assign
                        </button>

                        {/* Cancel */}
                        <button onClick={cancelEdit}
                          className="h-7 w-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors self-start">
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => openEdit(u)}
                        className="inline-flex items-center gap-1 h-7 px-3 text-[11.5px] font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300 transition-all whitespace-nowrap">
                        <UserCheck size={12} /> Change Role
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
          <p className="text-[12px] text-gray-400">
            Showing <span className="font-semibold text-gray-600">{filteredUsers.length}</span> of{" "}
            <span className="font-semibold text-gray-600">{users.length}</span> users
          </p>
        </div>
      </div>

      {/* Available Roles */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-[12.5px] font-semibold text-gray-700 mb-3">Available Roles</p>
        {loadingRoles ? (
          <div className="flex items-center gap-2 text-[12px] text-gray-400">
            <Loader2 size={13} className="animate-spin" /> Loading roles…
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {roles.map((r) => (
              <div key={r.roleId} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border bg-blue-50 border-blue-200 text-blue-700 text-[11px] font-medium">
                {r.role}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}