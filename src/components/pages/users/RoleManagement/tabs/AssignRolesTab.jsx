import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  UserCheck, Search, Check, X, ChevronDown,
  AlertCircle, Loader2, MapPin, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, Filter, Shield, Repeat
} from "lucide-react";
import { fetchRoles, assignRole, changeRole, clearAssignSuccess, clearChangeError, clearChangeSuccess } from "../../../../redux/slices/rolesSlice";
import { fetchDashboard } from "../../../../redux/slices/dashboardSlice";
import api from "../../../../service/api.js";

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

// ── Role types accepted by POST /roles/assign-role ──────────────────────────
// Exact `type` strings the backend expects — see ROLE_ASSIGNMENT_API.md
const ROLE_TYPES = [
  { type: "district_head", label: "District Head" },
  { type: "taluka_head", label: "Taluka Head" },
  { type: "ward_chairman", label: "Ward Chairman" },
  { type: "circle_leader", label: "Circle Leader" },
  { type: "circle_president", label: "Circle President" },
  { type: "vice_president", label: "Vice President" },
  { type: "general_secretary", label: "General Secretary" },
  { type: "treasurer", label: "Treasurer" },
];

const CIRCLE_TIER_TYPES = [
  "circle_leader",
  "circle_president",
  "vice_president",
  "general_secretary",
  "treasurer",
];

// Which geography fields are actually sent in the POST body for each type
// (per the API doc's request-body table + sample payloads).
const REQUIRED_FIELDS_BY_TYPE = {
  district_head: ["districtId"],
  taluka_head: ["districtId", "talukaId"],
  ward_chairman: ["talukaId", "wardId"],
  circle_leader: ["wardId"],
  circle_president: ["wardId"],
  vice_president: ["wardId"],
  general_secretary: ["wardId"],
  treasurer: ["wardId"],
};

export default function AssignRolesTab() {
  const dispatch = useDispatch();
  // GET /auth/getAllUsers now returns the caller's FULL scoped user list in
  // one call (no ?page=/&limit= query params) — see the fetchDashboard
  // effect below. `allUsers` holds that full array; search and the
  // district/taluka/ward filters run entirely client-side against it
  // (see `filteredUsers`), and the pagination controls below just slice
  // `filteredUsers` for display — neither ever triggers another API call.
  const { users: allUsers } = useSelector((s) => s.dashboard);
  const { roles, loadingRoles, assigning, assignSuccessId, error, changing, changeError, changeSuccessId } = useSelector((s) => s.roles);
  const token = useSelector((s) => s.auth.token);
  const authUser = useSelector((s) => s.auth.user);

  // Role detection for logged in user
  const currentUserRoleRaw = authUser?.role || authUser?.roleName || authUser?.userRoles?.[0]?.role?.role || "";
  const roleLower = currentUserRoleRaw.toLowerCase();

  const isSuperAdmin = roleLower.includes("superadmin") || roleLower.includes("super_admin") || roleLower === "admin";
  const isDistrictHead = roleLower.includes("districthead") || roleLower.includes("district_head") || roleLower === "district head";
  const isTalukaHead = roleLower.includes("talukhead") || roleLower.includes("taluka_head") || roleLower.includes("talukahead") || roleLower === "taluk head" || roleLower === "taluka head";
  const isWardChairman = roleLower.includes("wardchairman") || roleLower.includes("ward_chairman") || roleLower === "ward chairman";

  const locationData = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("locationData") || sessionStorage.getItem("locationData") || "{}");
    } catch {
      return {};
    }
  }, []);

  const loggedInDistrictId = locationData?.districtId || authUser?.districtId || authUser?.positions?.[0]?.district?.districtId || authUser?.location?.district?.districtId || "";
  const loggedInDistrictName = locationData?.districtName || authUser?.districtName || authUser?.positions?.[0]?.district?.districtName || authUser?.location?.district?.districtName || "";
  const loggedInTalukaId = locationData?.talukaId || authUser?.talukaId || authUser?.positions?.[0]?.taluka?.talukaId || authUser?.location?.taluka?.talukaId || "";
  const loggedInTalukaName = locationData?.talukaName || authUser?.talukaName || authUser?.positions?.[0]?.taluka?.talukaName || authUser?.location?.taluka?.talukaName || "";
  const loggedInWardId = locationData?.wardId || authUser?.wardId || authUser?.positions?.[0]?.ward?.wardId || authUser?.location?.ward?.wardId || "";
  const loggedInWardName = locationData?.wardName || authUser?.wardName || authUser?.positions?.[0]?.ward?.wardName || authUser?.location?.ward?.wardName || "";

  // ── Filter bar states ────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [districts, setDistricts] = useState([]);
  const [filterTalukas, setFilterTalukas] = useState([]);
  const [filterWards, setFilterWards] = useState([]);

  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterTaluka, setFilterTaluka] = useState("");
  const [filterWard, setFilterWard] = useState("");

  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingFilterTalukas, setLoadingFilterTalukas] = useState(false);
  const [loadingFilterWards, setLoadingFilterWards] = useState(false);

  // ── Pagination states ────────────────────────────────────────────────────────
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // ── Inline-edit base ─────────────────────────────────────────────────────────
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRoleType, setNewRoleType] = useState("");

  // ── Cascade dropdowns for the Assign flow (District → Taluka → Ward) ───────
  const [assignDistrictId, setAssignDistrictId] = useState("");
  const [assignTalukaId, setAssignTalukaId] = useState("");
  const [assignWardId, setAssignWardId] = useState("");
  const [assignTalukas, setAssignTalukas] = useState([]);
  const [assignWards, setAssignWards] = useState([]);
  const [loadingAssignTalukas, setLoadingAssignTalukas] = useState(false);
  const [loadingAssignWards, setLoadingAssignWards] = useState(false);

  // ── Change Person (PUT /roles/change-role) modal state ─────────────────────
  const [changeModalUser, setChangeModalUser] = useState(null);
  const [changeModalPositionId, setChangeModalPositionId] = useState("");
  const [newUserId, setNewUserId] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");

  const authHeader = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  // ── Mount ────────────────────────────────────────────────────────────────────
  // fetchDashboard() takes no page/limit args — it fetches the caller's full
  // user list in one call, so this only needs to run once on mount.
  useEffect(() => {
    dispatch(fetchRoles());
    dispatch(fetchDashboard());
    loadAllDistricts();
  }, [dispatch]);

  useEffect(() => {
    if (!assignSuccessId) return;
    // Refresh the full user list so the table reflects the change — no
    // page/limit args needed now that fetchDashboard always fetches
    // everything in one call.
    dispatch(fetchDashboard());
    const t = setTimeout(() => dispatch(clearAssignSuccess()), 3000);
    return () => clearTimeout(t);
  }, [assignSuccessId, dispatch]);

  useEffect(() => {
    if (!changeSuccessId) return;
    const t = setTimeout(() => dispatch(clearChangeSuccess()), 3000);
    return () => clearTimeout(t);
  }, [changeSuccessId, dispatch]);

  // ── Role Scoped Filter initialization ────────────────────────────────────────
  useEffect(() => {
    if (isDistrictHead && loggedInDistrictId) {
      setFilterDistrict(loggedInDistrictId);
      loadFilterTalukasForDistrict(loggedInDistrictId, loggedInDistrictName);
    } else if (isTalukaHead && loggedInTalukaId) {
      if (loggedInDistrictId) setFilterDistrict(loggedInDistrictId);
      setFilterTaluka(loggedInTalukaId);
      loadFilterWardsForTaluka(loggedInTalukaId, loggedInTalukaName);
    }
  }, [isDistrictHead, isTalukaHead, loggedInDistrictId, loggedInTalukaId]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterDistrict, filterTaluka, filterWard, pageSize]);

  // ── API helpers for Filter Dropdowns ─────────────────────────────────────────

  const loadAllDistricts = async () => {
    try {
      setLoadingDistricts(true);
      const res = await api.get("/district/getAllDistricts", authHeader);
      const apiDistricts = res.data.data || [];

      // Combine with unique districts from users' location and positions
      const distMap = new Map();
      apiDistricts.forEach((d) => {
        if (d.districtId) distMap.set(d.districtId, d);
      });

      allUsers.forEach((u) => {
        if (u.location?.district?.districtId && !distMap.has(u.location.district.districtId)) {
          distMap.set(u.location.district.districtId, {
            districtId: u.location.district.districtId,
            districtName: u.location.district.districtName,
          });
        }
        (u.positions || []).forEach((p) => {
          if (p.district?.districtId && !distMap.has(p.district.districtId)) {
            distMap.set(p.district.districtId, {
              districtId: p.district.districtId,
              districtName: p.district.districtName,
            });
          }
        });
      });

      setDistricts(Array.from(distMap.values()));
    } catch (e) {
      console.error("Failed to fetch districts", e);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const loadFilterTalukasForDistrict = async (dId, dName) => {
    if (!dId && !dName) {
      setFilterTalukas([]);
      return;
    }
    setLoadingFilterTalukas(true);
    try {
      let apiTalukas = [];
      if (dId) {
        const res = await api.get(`/district/getAllDistricts?districtId=${dId}`, authHeader);
        apiTalukas = res.data.data || [];
      }

      const talukaMap = new Map();
      apiTalukas.forEach((t) => {
        const key = t.talukaId || t.talukaName;
        if (key) talukaMap.set(key, { talukaId: t.talukaId, talukaName: t.talukaName });
      });

      allUsers.forEach((u) => {
        const locMatchDist = (dId && u.location?.district?.districtId === dId) ||
          (dName && u.location?.district?.districtName?.toLowerCase() === dName.toLowerCase());
        if (locMatchDist && u.location?.taluka) {
          const key = u.location.taluka.talukaId || u.location.taluka.talukaName;
          if (key && !talukaMap.has(key)) {
            talukaMap.set(key, { talukaId: u.location.taluka.talukaId, talukaName: u.location.taluka.talukaName });
          }
        }

        (u.positions || []).forEach((p) => {
          const matchDist = (dId && p.district?.districtId === dId) ||
            (dName && p.district?.districtName?.toLowerCase() === dName.toLowerCase());
          if (matchDist && p.taluka) {
            const key = p.taluka.talukaId || p.taluka.talukaName;
            if (key && !talukaMap.has(key)) {
              talukaMap.set(key, { talukaId: p.taluka.talukaId, talukaName: p.taluka.talukaName });
            }
          }
        });
      });

      setFilterTalukas(Array.from(talukaMap.values()));
    } catch (e) {
      console.error("Error loading talukas:", e);
    } finally {
      setLoadingFilterTalukas(false);
    }
  };

  const loadFilterWardsForTaluka = async (tId, tName) => {
    if (!tId && !tName) {
      setFilterWards([]);
      return;
    }
    setLoadingFilterWards(true);
    try {
      let apiWards = [];
      if (tId) {
        const res = await api.get(`/district/getAllDistricts?talukaId=${tId}`, authHeader);
        apiWards = res.data.data || [];
      }

      const wardMap = new Map();
      apiWards.forEach((w) => {
        const key = w.wardId || w.wardName;
        if (key) wardMap.set(key, { wardId: w.wardId, wardName: w.wardName });
      });

      allUsers.forEach((u) => {
        const locMatchTal = (tId && u.location?.taluka?.talukaId === tId) ||
          (tName && u.location?.taluka?.talukaName?.toLowerCase() === tName.toLowerCase());
        if (locMatchTal && u.location?.ward) {
          const key = u.location.ward.wardId || u.location.ward.wardName;
          if (key && !wardMap.has(key)) {
            wardMap.set(key, { wardId: u.location.ward.wardId, wardName: u.location.ward.wardName });
          }
        }

        (u.positions || []).forEach((p) => {
          const matchTaluka = (tId && p.taluka?.talukaId === tId) ||
            (tName && p.taluka?.talukaName?.toLowerCase() === tName.toLowerCase());
          if (matchTaluka && p.ward) {
            const key = p.ward.wardId || p.ward.wardName;
            if (key && !wardMap.has(key)) {
              wardMap.set(key, { wardId: p.ward.wardId, wardName: p.ward.wardName });
            }
          }
        });
      });

      setFilterWards(Array.from(wardMap.values()));
    } catch (e) {
      console.error("Error loading wards:", e);
    } finally {
      setLoadingFilterWards(false);
    }
  };

  // Filter change handlers
  const handleFilterDistrictChange = (dId) => {
    setFilterDistrict(dId);
    setFilterTaluka("");
    setFilterWard("");
    setFilterTalukas([]);
    setFilterWards([]);
    if (dId) {
      const selectedDistName = districts.find((d) => d.districtId === dId)?.districtName || "";
      loadFilterTalukasForDistrict(dId, selectedDistName);
    }
  };

  const handleFilterTalukaChange = (tId) => {
    setFilterTaluka(tId);
    setFilterWard("");
    setFilterWards([]);
    if (tId) {
      const selectedTalName = filterTalukas.find((t) => t.talukaId === tId)?.talukaName || "";
      loadFilterWardsForTaluka(tId, selectedTalName);
    }
  };

  const handleFilterWardChange = (wId) => {
    setFilterWard(wId);
  };

  const clearAllFilters = () => {
    setSearch("");
    if (isSuperAdmin) {
      setFilterDistrict("");
      setFilterTaluka("");
      setFilterWard("");
      setFilterTalukas([]);
      setFilterWards([]);
    } else if (isDistrictHead) {
      setFilterTaluka("");
      setFilterWard("");
      setFilterWards([]);
    } else if (isTalukaHead) {
      setFilterWard("");
    }
  };

  // ── Cascade dropdowns for the Assign flow ────────────────────────────────────
  // District → fetch talukas: GET /talukas/district/:districtId
  // Taluka   → fetch wards:   GET /talukas/getAllWardChaimansBy/:talukaId
  // (Confirmed against talukas.controller.ts — these are path params, not
  // query strings; the earlier ?districtId=/?talukaId= query-string routes
  // don't exist on the backend and 404.)
  const loadAssignTalukas = async (districtId) => {
    if (!districtId) {
      setAssignTalukas([]);
      return;
    }
    setLoadingAssignTalukas(true);
    try {
      const res = await api.get(`/talukas/district/${districtId}`, authHeader);
      // talukas.service.ts → getTalukasByDistrict returns { success, message, data }
      setAssignTalukas(res.data?.data || (Array.isArray(res.data) ? res.data : []));
    } catch (e) {
      console.error("Failed to fetch talukas", e);
      setAssignTalukas([]);
    } finally {
      setLoadingAssignTalukas(false);
    }
  };

  const loadAssignWards = async (talukaId) => {
    if (!talukaId) {
      setAssignWards([]);
      return;
    }
    setLoadingAssignWards(true);
    try {
      const res = await api.get(`/talukas/getAllWardChaimansBy/${talukaId}`, authHeader);
      // talukas.service.ts → getWardsByTalukaId returns { success, count, data }
      setAssignWards(res.data?.data || (Array.isArray(res.data) ? res.data : []));
    } catch (e) {
      console.error("Failed to fetch wards", e);
      setAssignWards([]);
    } finally {
      setLoadingAssignWards(false);
    }
  };

  // Reset child dropdowns whenever a parent changes
  const handleAssignDistrictChange = (districtId) => {
    setAssignDistrictId(districtId);
    setAssignTalukaId("");
    setAssignWardId("");
    setAssignTalukas([]);
    setAssignWards([]);
    if (districtId) loadAssignTalukas(districtId);
  };

  const handleAssignTalukaChange = (talukaId) => {
    setAssignTalukaId(talukaId);
    setAssignWardId("");
    setAssignWards([]);
    if (talukaId) loadAssignWards(talukaId);
  };

  const handleAssignWardChange = (wardId) => setAssignWardId(wardId);

  // ── Which roles the logged-in user is allowed to assign ─────────────────────
  // Mirrors the "Who can call what" table in ROLE_ASSIGNMENT_API.md
  const visibleRoleTypes = ROLE_TYPES.filter((r) => {
    if (isSuperAdmin) return true;
    if (isDistrictHead) return r.type === "taluka_head";
    if (isTalukaHead) return r.type === "ward_chairman";
    if (isWardChairman) return CIRCLE_TIER_TYPES.includes(r.type);
    return false;
  });

  // ── Which cascade steps to show for the selected role type ──────────────────
  // district_head        → District only
  // taluka_head          → District → Taluka
  // ward_chairman        → District → Taluka → Ward
  // circle-tier roles    → District → Taluka → Ward
  // (District/Taluka are shown for navigation even when the API doc doesn't
  // require them in the payload for that type — see REQUIRED_FIELDS_BY_TYPE.)
  const showDistrict = !!newRoleType;
  const showTaluka = !!newRoleType && newRoleType !== "district_head";
  const showWard = !!newRoleType && newRoleType !== "district_head" && newRoleType !== "taluka_head";

  // Lock (pre-fill, read-only) a cascade step to the caller's own jurisdiction
  // when their role means it can only ever be that value.
  const districtLocked =
    (newRoleType === "taluka_head" && isDistrictHead) ||
    (newRoleType === "ward_chairman" && isTalukaHead) ||
    (CIRCLE_TIER_TYPES.includes(newRoleType) && isWardChairman);

  const talukaLocked =
    (newRoleType === "ward_chairman" && isTalukaHead) ||
    (CIRCLE_TIER_TYPES.includes(newRoleType) && isWardChairman);

  const wardLocked = CIRCLE_TIER_TYPES.includes(newRoleType) && isWardChairman;

  const handleRoleTypeChange = (e) => {
    const type = e.target.value;
    setNewRoleType(type);
    resetRowState();
    if (!type) return;

    if (type === "taluka_head" && isDistrictHead && loggedInDistrictId) {
      setAssignDistrictId(loggedInDistrictId);
      loadAssignTalukas(loggedInDistrictId);
    } else if (type === "ward_chairman" && isTalukaHead && loggedInTalukaId) {
      if (loggedInDistrictId) setAssignDistrictId(loggedInDistrictId);
      setAssignTalukaId(loggedInTalukaId);
      loadAssignWards(loggedInTalukaId);
    } else if (CIRCLE_TIER_TYPES.includes(type) && isWardChairman && loggedInWardId) {
      if (loggedInDistrictId) setAssignDistrictId(loggedInDistrictId);
      if (loggedInTalukaId) setAssignTalukaId(loggedInTalukaId);
      setAssignWardId(loggedInWardId);
    }
  };

  const resetRowState = () => {
    setAssignDistrictId("");
    setAssignTalukaId("");
    setAssignWardId("");
    setAssignTalukas([]);
    setAssignWards([]);
  };

  const openEdit = (u) => { setSelectedUser(u); setNewRoleType(""); resetRowState(); };
  const cancelEdit = () => { setSelectedUser(null); setNewRoleType(""); resetRowState(); };

  const canAssign = (() => {
    if (!selectedUser || !newRoleType) return false;
    const fields = REQUIRED_FIELDS_BY_TYPE[newRoleType] || [];
    if (fields.includes("districtId") && !assignDistrictId) return false;
    if (fields.includes("talukaId") && !assignTalukaId) return false;
    if (fields.includes("wardId") && !assignWardId) return false;
    return true;
  })();

  // ── Assign — POST /roles/assign-role ─────────────────────────────────────────
  // Body only ever contains: userId, type, and the geography id(s) that type
  // actually needs (see REQUIRED_FIELDS_BY_TYPE). No roleId, no assignedBy,
  // no districtHeadId/talukaHeadId/wardHeadId, no talukaIds array.
  const handleAssign = () => {
    if (!selectedUser || !newRoleType) return;

    const payload = { userId: selectedUser.userId, type: newRoleType };
    const fields = REQUIRED_FIELDS_BY_TYPE[newRoleType] || [];
    if (fields.includes("districtId")) payload.districtId = assignDistrictId;
    if (fields.includes("talukaId")) payload.talukaId = assignTalukaId;
    if (fields.includes("wardId")) payload.wardId = assignWardId;

    dispatch(assignRole(payload)).then((res) => {
      if (res.meta.requestStatus === "fulfilled") cancelEdit();
    });
  };

  // ── Change Person — PUT /roles/change-role ───────────────────────────────────
  // Best-effort lookup of the seat (position) id already assigned to this row,
  // so it can be pre-filled into the modal without the user typing it in.
  const getPositionId = (u) =>
    u?.positions?.[0]?.positionId ||
    u?.userRoles?.[0]?.positionId ||
    u?.userRoles?.[0]?.position?.positionId ||
    u?.currentPositionId ||
    u?.positionId ||
    "";

  const openChangeModal = (u) => {
    setChangeModalUser(u);
    setChangeModalPositionId(getPositionId(u));
    setNewUserId("");
    setUserSearchQuery("");
    dispatch(clearChangeError());
  };

  const closeChangeModal = () => {
    setChangeModalUser(null);
    setChangeModalPositionId("");
    setNewUserId("");
    setUserSearchQuery("");
  };

  const userSearchResults = useMemo(() => {
    const q = userSearchQuery.trim().toLowerCase();
    if (!q || newUserId) return [];
    return allUsers
      .filter((u) => u.userId !== changeModalUser?.userId)
      .filter((u) =>
        u.name?.toLowerCase().includes(q) ||
        u.mobileNumber?.includes(q) ||
        u.email?.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [allUsers, userSearchQuery, newUserId, changeModalUser]);

  const handleChangeRole = () => {
    if (!changeModalPositionId || !newUserId) return;
    dispatch(changeRole({ positionId: changeModalPositionId, newUserId })).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        closeChangeModal();
        // Refresh the full user list so the change is reflected immediately —
        // no page/limit args needed now that fetchDashboard fetches everything.
        dispatch(fetchDashboard());
      }
    });
  };

  // ── Multi-level User Filtering ───────────────────────────────────────────────
  const selectedDistrictObj = districts.find((d) => d.districtId === filterDistrict);
  const selectedTalukaObj = filterTalukas.find((t) => t.talukaId === filterTaluka);
  const selectedWardObj = filterWards.find((w) => w.wardId === filterWard);

  const filterDistrictName = selectedDistrictObj?.districtName || "";
  const filterTalukaName = selectedTalukaObj?.talukaName || "";
  const filterWardName = selectedWardObj?.wardName || "";

  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      const searchLower = search.trim().toLowerCase();
      const matchSearch = !searchLower ||
        u.name?.toLowerCase().includes(searchLower) ||
        u.mobileNumber?.includes(searchLower) ||
        u.email?.toLowerCase().includes(searchLower);

      if (!matchSearch) return false;

      const positions = u.positions || [];
      const loc = u.location || {};

      // 1. District Matching
      let matchDist = !filterDistrict;
      if (filterDistrict) {
        const locDistId = loc.district?.districtId;
        const locDistName = loc.district?.districtName;

        if (locDistId || locDistName) {
          matchDist = locDistId === filterDistrict ||
            (filterDistrictName && locDistName?.toLowerCase() === filterDistrictName.toLowerCase());
        }

        if (!matchDist && positions.length > 0) {
          matchDist = positions.some(
            (p) => p.district?.districtId === filterDistrict ||
              (filterDistrictName && p.district?.districtName?.toLowerCase() === filterDistrictName.toLowerCase())
          );
        } else if (!matchDist && !locDistId && !locDistName) {
          const locStr = (u.businessLocation || u.officeLocation || u.districtName || u.district || "").toLowerCase();
          matchDist = (filterDistrictName && locStr.includes(filterDistrictName.toLowerCase())) || u.districtId === filterDistrict;
        }
      }
      if (!matchDist) return false;

      // 2. Taluka Matching
      let matchTal = !filterTaluka;
      if (filterTaluka) {
        const locTalId = loc.taluka?.talukaId;
        const locTalName = loc.taluka?.talukaName;

        if (locTalId || locTalName) {
          matchTal = locTalId === filterTaluka ||
            (filterTalukaName && locTalName?.toLowerCase() === filterTalukaName.toLowerCase());
        }

        if (!matchTal && positions.length > 0) {
          matchTal = positions.some(
            (p) => p.taluka?.talukaId === filterTaluka ||
              (filterTalukaName && p.taluka?.talukaName?.toLowerCase() === filterTalukaName.toLowerCase())
          );
        } else if (!matchTal && !locTalId && !locTalName) {
          const locStr = (u.businessLocation || u.officeLocation || u.talukaName || u.taluka || "").toLowerCase();
          matchTal = (filterTalukaName && locStr.includes(filterTalukaName.toLowerCase())) || u.talukaId === filterTaluka;
        }
      }
      if (!matchTal) return false;

      // 3. Ward Matching
      let matchWd = !filterWard;
      if (filterWard) {
        const locWdId = loc.ward?.wardId;
        const locWdName = loc.ward?.wardName;

        if (locWdId || locWdName) {
          matchWd = locWdId === filterWard ||
            (filterWardName && locWdName?.toLowerCase() === filterWardName.toLowerCase());
        }

        if (!matchWd && positions.length > 0) {
          matchWd = positions.some(
            (p) => p.ward?.wardId === filterWard ||
              (filterWardName && p.ward?.wardName?.toLowerCase() === filterWardName.toLowerCase())
          );
        } else if (!matchWd && !locWdId && !locWdName) {
          const locStr = (u.wardName || u.ward || "").toLowerCase();
          matchWd = (filterWardName && locStr.includes(filterWardName.toLowerCase())) || u.wardId === filterWard;
        }
      }

      return matchWd;
    });
  }, [allUsers, search, filterDistrict, filterDistrictName, filterTaluka, filterTalukaName, filterWard, filterWardName]);

  // ── Pagination Calculation ───────────────────────────────────────────────────
  // `users` is now exactly the server's current page (see the fetchDashboard
  // effect above), so there is nothing left to re-slice client-side. The
  // backend's own `pagination` object — total/totalPages across the caller's
  // FULL scoped set, per GetAllUsersDto/getAllAllUsers — is the source of
  // truth for the total count, not `filteredUsers.length`, which only ever
  // reflects the one page currently loaded.
  //
  // NOTE: search/district/taluka/ward filters below still apply only within
  // this loaded page — GET /auth/getAllUsers doesn't accept a text search or
  // arbitrary geography filter param today, so filtering across the caller's
  // entire user base (not just the visible page) would need that added on
  // the backend first.
  const totalUsersCount = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredUsers.length);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const getRoleBadge = (userRoles = []) => userRoles[0]?.role?.role || null;

  const hasActiveFilters = search ||
    (isSuperAdmin && (filterDistrict || filterTaluka || filterWard)) ||
    (isDistrictHead && (filterTaluka || filterWard)) ||
    (isTalukaHead && filterWard);

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-[14px] font-bold text-gray-900 flex items-center gap-2">
            <Shield size={16} className="text-blue-600" />
            Assign & Manage Roles
          </h2>
          <p className="text-[12px] text-gray-400 mt-0.5">
            Search or filter users by district, taluka, and ward to assign roles
          </p>
        </div>

        {/* Role Scope Badges */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11.5px]">
          {isDistrictHead && loggedInDistrictName && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-medium">
              <MapPin size={12} /> District: {loggedInDistrictName}
            </span>
          )}
          {isTalukaHead && (
            <>
              {loggedInDistrictName && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-medium">
                  <MapPin size={12} /> {loggedInDistrictName}
                </span>
              )}
              {loggedInTalukaName && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 font-medium">
                  Taluka: {loggedInTalukaName}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-xl bg-white border border-gray-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search box */}
          <div className="flex items-center gap-2 h-8 border border-gray-200 rounded-lg px-3 bg-gray-50/50 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 focus-within:bg-white transition-all min-w-[200px]">
            <Search size={13} className="text-gray-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone or email..."
              className="w-full text-[12px] text-gray-700 placeholder:text-gray-400 focus:outline-none bg-transparent"
            />
          </div>

          {/* District Filter (SuperAdmin only) */}
          {isSuperAdmin && (
            <div className="relative">
              <select
                value={filterDistrict}
                onChange={(e) => handleFilterDistrictChange(e.target.value)}
                disabled={loadingDistricts}
                className="h-8 appearance-none pl-3 pr-7 text-[12px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer disabled:opacity-50 min-w-[140px]"
              >
                <option value="">All Districts</option>
                {districts.map((d) => (
                  <option key={d.districtId} value={d.districtId}>{d.districtName}</option>
                ))}
              </select>
              {loadingDistricts
                ? <Loader2 size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
                : <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />}
            </div>
          )}

          {/* Taluka Filter (SuperAdmin & DistrictHead) */}
          {(isSuperAdmin || isDistrictHead) && (
            <div className="relative">
              <select
                value={filterTaluka}
                onChange={(e) => handleFilterTalukaChange(e.target.value)}
                disabled={loadingFilterTalukas || (isSuperAdmin && !filterDistrict)}
                className="h-8 appearance-none pl-3 pr-7 text-[12px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer disabled:opacity-50 min-w-[140px]"
              >
                <option value="">All Talukas</option>
                {filterTalukas.map((t) => (
                  <option key={t.talukaId || t.talukaName} value={t.talukaId}>{t.talukaName}</option>
                ))}
              </select>
              {loadingFilterTalukas
                ? <Loader2 size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
                : <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />}
            </div>
          )}

          {/* Ward Filter (SuperAdmin, DistrictHead & TalukaHead) */}
          <div className="relative">
            <select
              value={filterWard}
              onChange={(e) => handleFilterWardChange(e.target.value)}
              disabled={loadingFilterWards || (isSuperAdmin && !filterTaluka) || (isDistrictHead && !filterTaluka)}
              className="h-8 appearance-none pl-3 pr-7 text-[12px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer disabled:opacity-50 min-w-[140px]"
            >
              <option value="">All Wards</option>
              {filterWards.map((w) => (
                <option key={w.wardId || w.wardName} value={w.wardId}>{w.wardName}</option>
              ))}
            </select>
            {loadingFilterWards
              ? <Loader2 size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
              : <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />}
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="h-8 px-2.5 text-[11.5px] font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg border border-gray-200 hover:border-red-200 transition-all flex items-center gap-1"
            >
              <X size={11} /> Clear
            </button>
          )}
        </div>

        {/* Limit Per Page dropdown in filter bar */}
        <div className="flex items-center gap-1.5 text-[12px] text-gray-500 shrink-0">
          <Filter size={12} className="text-gray-400" />
          <span>Show:</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="h-8 pl-2 pr-6 appearance-none border border-gray-200 rounded-lg text-[12px] font-medium bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
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
      {changeSuccessId && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[12.5px] font-medium rounded-lg px-4 py-2.5">
          <Check size={14} /> Position holder changed successfully.
        </div>
      )}

      {/* Main Table Container */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                {["User", "Phone", "Current Role", "District / Taluka / Ward", "Status", "Action"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10.5px] font-semibold tracking-wider uppercase text-gray-400 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <UserCheck size={28} className="text-gray-300 stroke-[1.5]" />
                      <p className="text-[13px] font-medium text-gray-600">No users found</p>
                      <p className="text-[11.5px] text-gray-400">Try adjusting your search or area filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => {
                  const badge = getRoleBadge(u.userRoles);
                  const isEditing = selectedUser?.userId === u.userId;
                  const loc = u.location || {};
                  const primaryPos = u.positions?.[0];

                  const distName = loc.district?.districtName || primaryPos?.district?.districtName || u.districtName || u.district || "";
                  const talName = loc.taluka?.talukaName || primaryPos?.taluka?.talukaName || u.talukaName || u.taluka || "";
                  const wardName = loc.ward?.wardName || primaryPos?.ward?.wardName || u.wardName || u.ward || "";

                  return (
                    <tr key={u.userId} className={`transition-colors ${isEditing ? "bg-blue-50/40" : "hover:bg-gray-50/60"}`}>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{u.name}</div>
                        {u.email && <div className="text-[11px] text-gray-400 truncate max-w-[180px]">{u.email}</div>}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap font-medium">{u.mobileNumber || "—"}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {badge ? (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold border bg-blue-50 border-blue-200 text-blue-700">
                              {badge}
                            </span>
                            {badge.toLowerCase() !== "member" && (
                              <button
                                onClick={() => openChangeModal(u)}
                                title="Change Person"
                                className="inline-flex items-center gap-1 h-5 px-1.5 text-[10px] font-semibold text-gray-500 bg-white border border-gray-200 rounded hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300 transition-all"
                              >
                                <Repeat size={10} /> Change Person
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* District / Taluka / Ward Location Column */}
                      <td className="px-4 py-3">
                        {wardName || talName || distName ? (
                          <div className="flex flex-col text-[11.5px] max-w-[210px]">
                            {wardName && (
                              <span className="font-semibold text-gray-800 truncate" title={`Ward: ${wardName}`}>
                                📍 {wardName}
                              </span>
                            )}
                            {(talName || distName) && (
                              <span className="text-gray-500 text-[10.5px] truncate" title={[talName, distName].filter(Boolean).join(", ")}>
                                {[talName, distName].filter(Boolean).join(", ")}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-[11px] truncate block max-w-[180px]" title={u.businessLocation || "—"}>
                            {u.businessLocation || "—"}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold border ${u.isActive ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-gray-100 border-gray-200 text-gray-500"}`}>
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Action Cell */}
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <div className="flex flex-wrap items-start gap-2">
                            <RowSelect
                              value={newRoleType}
                              onChange={handleRoleTypeChange}
                              placeholder="Select role…"
                              options={visibleRoleTypes.map((r) => ({ value: r.type, label: r.label }))}
                              minWidth="140px"
                            />

                            {/* District step */}
                            {showDistrict && (
                              districtLocked ? (
                                <span className="h-7 px-2.5 flex items-center text-[11.5px] font-medium bg-blue-50 border border-blue-200 text-blue-700 rounded-lg">
                                  📍 {loggedInDistrictName || "Your District"}
                                </span>
                              ) : (
                                <RowSelect
                                  value={assignDistrictId}
                                  onChange={(e) => handleAssignDistrictChange(e.target.value)}
                                  placeholder="District…"
                                  options={districts.map((d) => ({ value: d.districtId, label: d.districtName }))}
                                  loading={loadingDistricts}
                                  minWidth="140px"
                                />
                              )
                            )}

                            {/* Taluka step */}
                            {showTaluka && (districtLocked || assignDistrictId) && (
                              talukaLocked ? (
                                <span className="h-7 px-2.5 flex items-center text-[11.5px] font-medium bg-purple-50 border border-purple-200 text-purple-700 rounded-lg">
                                  Taluka: {loggedInTalukaName || "Your Taluka"}
                                </span>
                              ) : (
                                <RowSelect
                                  value={assignTalukaId}
                                  onChange={(e) => handleAssignTalukaChange(e.target.value)}
                                  placeholder="Taluka…"
                                  options={assignTalukas.map((t) => ({ value: t.talukaId, label: t.talukaName }))}
                                  loading={loadingAssignTalukas}
                                  minWidth="140px"
                                />
                              )
                            )}

                            {/* Ward step */}
                            {showWard && (talukaLocked || assignTalukaId) && (
                              wardLocked ? (
                                <span className="h-7 px-2.5 flex items-center text-[11.5px] font-medium bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg">
                                  Ward: {loggedInWardName || "Your Ward"}
                                </span>
                              ) : (
                                <RowSelect
                                  value={assignWardId}
                                  onChange={(e) => handleAssignWardChange(e.target.value)}
                                  placeholder="Ward…"
                                  options={assignWards.map((w) => ({
                                    value: w.wardId,
                                    label: `${w.wardNumber ? w.wardNumber + " — " : ""}${w.wardName}`,
                                  }))}
                                  loading={loadingAssignWards}
                                  minWidth="160px"
                                />
                              )
                            )}

                            <button
                              onClick={handleAssign}
                              disabled={!canAssign || assigning}
                              className="h-7 px-3 text-[11.5px] font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-40 flex items-center gap-1 self-start"
                            >
                              {assigning ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                              Assign
                            </button>

                            <button
                              onClick={cancelEdit}
                              className="h-7 w-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors self-start"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => openEdit(u)}
                            className="inline-flex items-center gap-1 h-7 px-3 text-[11.5px] font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300 transition-all whitespace-nowrap"
                          >
                            <UserCheck size={12} /> Change Role
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Summary Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 bg-gray-50/80">
          <div className="text-[12px] text-gray-500">
            Showing <span className="font-semibold text-gray-700">{totalUsersCount > 0 ? startIndex + 1 : 0}</span> to{" "}
            <span className="font-semibold text-gray-700">{endIndex}</span> of{" "}
            <span className="font-semibold text-gray-700">{totalUsersCount}</span> users
            {filteredUsers.length !== allUsers.length && (
              <span className="text-gray-400 font-normal">
                (filtered {filteredUsers.length} of {allUsers.length} users)
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[12px] text-gray-500">
              <span>Page {currentPage} of {totalPages}</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-white hover:border-gray-300 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-gray-200 transition-all"
                title="First Page"
              >
                <ChevronsLeft size={14} />
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded-lg border border-gray-200 text-[11.5px] font-medium text-gray-600 hover:bg-white hover:border-gray-300 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-gray-200 transition-all flex items-center gap-1"
              >
                <ChevronLeft size={13} /> Prev
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded-lg border border-gray-200 text-[11.5px] font-medium text-gray-600 hover:bg-white hover:border-gray-300 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-gray-200 transition-all flex items-center gap-1"
              >
                Next <ChevronRight size={13} />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-white hover:border-gray-300 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-gray-200 transition-all"
                title="Last Page"
              >
                <ChevronsRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Available Roles Legend */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-[12.5px] font-semibold text-gray-700 mb-2.5">Available Roles</p>
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

      {/* ── Change Person modal ── PUT /roles/change-role ─────────────────────── */}
      {changeModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-[14px] font-bold text-gray-900">Change Person</h3>
                <p className="text-[11.5px] text-gray-400 mt-0.5">Replace the current holder of this position</p>
              </div>
              <button
                onClick={closeChangeModal}
                className="h-7 w-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="px-5 py-4 space-y-3.5">
              <div>
                <p className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wide">Position</p>
                <p className="text-[13px] font-semibold text-gray-800 mt-0.5">
                  {getRoleBadge(changeModalUser.userRoles) || "—"} · {changeModalUser.name}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Position ID: {changeModalPositionId || "Not available — enter it manually below"}
                </p>
                {!changeModalPositionId && (
                  <input
                    value={changeModalPositionId}
                    onChange={(e) => setChangeModalPositionId(e.target.value)}
                    placeholder="Paste positionId (UUID)…"
                    className="mt-1.5 w-full h-8 px-2.5 text-[12px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                )}
              </div>

              <div>
                <p className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wide">New Person</p>
                <div className="relative mt-1">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={userSearchQuery}
                    onChange={(e) => { setUserSearchQuery(e.target.value); setNewUserId(""); }}
                    placeholder="Search by name, phone or email…"
                    className="w-full h-9 pl-8 pr-3 text-[12.5px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>

                {userSearchQuery && !newUserId && (
                  <div className="mt-1 max-h-40 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-50">
                    {userSearchResults.length === 0 ? (
                      <div className="px-3 py-2 text-[11.5px] text-gray-400">No matching users</div>
                    ) : (
                      userSearchResults.map((u) => (
                        <button
                          key={u.userId}
                          onClick={() => { setNewUserId(u.userId); setUserSearchQuery(u.name); }}
                          className="w-full text-left px-3 py-2 text-[12px] hover:bg-blue-50 transition-colors"
                        >
                          <div className="font-medium text-gray-800">{u.name}</div>
                          <div className="text-[10.5px] text-gray-400">{u.mobileNumber || u.email || "—"}</div>
                        </button>
                      ))
                    )}
                  </div>
                )}

                {newUserId && (
                  <div className="mt-1.5 inline-flex items-center gap-1 text-[11.5px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
                    <Check size={11} /> Selected: {userSearchQuery}
                  </div>
                )}
              </div>

              {changeError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-[11.5px] font-medium rounded-lg px-3 py-2">
                  <AlertCircle size={13} /> {changeError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-gray-100 bg-gray-50/60">
              <button
                onClick={closeChangeModal}
                className="h-8 px-3 text-[12px] font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleChangeRole}
                disabled={!newUserId || !changeModalPositionId || changing}
                className="h-8 px-4 text-[12px] font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40 flex items-center gap-1.5"
              >
                {changing ? <Loader2 size={12} className="animate-spin" /> : <Repeat size={12} />}
                Change Person
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
