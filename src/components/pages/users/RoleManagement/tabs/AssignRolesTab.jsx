import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  UserCheck, Search, Check, X, ChevronDown,
  AlertCircle, Loader2, MapPin, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, Filter, Shield
} from "lucide-react";
import { fetchRoles, assignRole, clearAssignSuccess } from "../../../../redux/slices/rolesSlice";
import { fetchDashboard } from "../../../../redux/slices/dashboardSlice";
import api from "../../../../service/api.js";
import {
  fetchWardsByTalukaId,
  selectTalukaWards,
  selectTalukaWardsStatus,
} from "../../../../redux/slices/areaChartSlice";

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
  const authUser = useSelector((s) => s.auth.user);
  const currentUserId = authUser?.userId;

  // Role detection for logged in user
  const currentUserRoleRaw = authUser?.role || authUser?.roleName || authUser?.userRoles?.[0]?.role?.role || "";
  const roleLower = currentUserRoleRaw.toLowerCase();

  const isSuperAdmin = roleLower.includes("superadmin") || roleLower.includes("super_admin") || roleLower === "admin";
  const isDistrictHead = roleLower.includes("districthead") || roleLower.includes("district_head") || roleLower === "district head";
  const isTalukaHead = roleLower.includes("talukhead") || roleLower.includes("taluka_head") || roleLower.includes("talukahead") || roleLower === "taluk head" || roleLower === "taluka head";

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
  const [newRoleId, setNewRoleId] = useState("");

  // ── DistrictHead flow ────────────────────────────────────────────────────────
  const [rowDistrict, setRowDistrict] = useState("");

  // ── TalukaHead flow ──────────────────────────────────────────────────────────
  const [dhUsersList, setDhUsersList] = useState([]);
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [selectedDHDistrict, setSelectedDHDistrict] = useState("");
  const [selectedDistrictHeadId, setSelectedDistrictHeadId] = useState("");
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

  const authHeader = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  const talukaWards = useSelector(selectTalukaWards);
  const talukaWardsStatus = useSelector(selectTalukaWardsStatus);

  const HIDDEN_ROLES_BY_LOGIN = {
    SuperAdmin: [],
    DistrictHead: ["SuperAdmin", "DistrictHead"],
    TalukHead: ["SuperAdmin", "DistrictHead", "TalukHead"],
    WardChairman: ["SuperAdmin", "DistrictHead", "TalukHead", "WardChairman"],
  };

  const visibleRoles = roles.filter(
    (r) => !(HIDDEN_ROLES_BY_LOGIN[currentUserRoleRaw] ?? []).includes(r.role)
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

      users.forEach((u) => {
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

      users.forEach((u) => {
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

      users.forEach((u) => {
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

  // ── Role detection for row assignment ─────────────────────────────────────────
  const selectedRoleObj = roles.find((r) => r.roleId === Number(newRoleId));
  const roleName = selectedRoleObj?.role || "";
  const isDistrictHeadAssign = roleName === "DistrictHead";
  const isTalukaHeadAssign = roleName === "TalukHead";
  const isWardChairmanAssign = roleName === "WardChairman" || roleName === "WardHead";

  // Step 1 for TalukaHead assign:
  const loadTalukaHeadDropdowns = async () => {
    try {
      setLoadingRoleUsers(true);
      const roleUsersRes = await api.get("/roles/getAllRoleUsers", authHeader);
      const allUsers = roleUsersRes.data.data || [];
      const dhUsers = allUsers.filter((u) =>
        u.roles?.some((r) => r.roleName === "district_head")
      );
      setDhUsersList(dhUsers);

      const districtRes = await api.get("/district/getAllDistricts", authHeader);
      const allDistricts = districtRes.data.data || [];

      const dhDistrictMap = {};
      dhUsers.forEach((dh) => {
        if (dh.districtId) dhDistrictMap[dh.districtId] = dh.userId;
      });

      const filtered = allDistricts.filter((d) => dhDistrictMap[d.districtId]);
      setAvailableDistricts(filtered);
      setDhUsersList(dhUsers.map((dh) => ({ ...dh, _districtId: dh.districtId })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRoleUsers(false);
    }
  };

  const handleDHDistrictSelect = async (districtId) => {
    setSelectedDHDistrict(districtId);
    setSelectedDistrictHeadId("");
    setSelectedTalukaIds([]);
    setRowTalukas([]);
    if (!districtId) return;

    const matchedDH = dhUsersList.find((dh) => dh._districtId === districtId || dh.districtId === districtId);
    if (matchedDH) setSelectedDistrictHeadId(matchedDH.userId);

    try {
      setLoadingRowTalukas(true);
      const res = await api.get(`/district/getAllDistricts?districtId=${districtId}`, authHeader);
      setRowTalukas(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRowTalukas(false);
    }
  };

  const handleRowDistrictChange = (id) => setRowDistrict(id);

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
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingWcTalukas(false);
    }
  };

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
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTalukaHeads(false);
    }

    try {
      setLoadingWards(true);
      const res = await api.get(`/ward/getWardBy?talukaId=${id}`, authHeader);
      setWards(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingWards(false);
    }
  };

  const handleRoleChange = (e) => {
    const roleId = e.target.value;
    setNewRoleId(roleId);
    resetRowState();

    const roleObj = roles.find((r) => r.roleId === Number(roleId));

    if (roleObj?.role === "TalukHead") {
      if (currentUserRoleRaw === "DistrictHead") {
        const { districtId } = locationData;
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

    if (roleObj?.role === "WardChairman" && currentUserRoleRaw === "TalukHead") {
      const { talukaId } = locationData;
      if (talukaId) {
        setWcTaluka(talukaId);
        setSelectedTalukaHeadId(currentUserId);
        dispatch(fetchWardsByTalukaId(talukaId));
      }
    }
  };

  const resetRowState = () => {
    setRowDistrict("");
    setDhUsersList([]);
    setAvailableDistricts([]);
    setSelectedDHDistrict("");
    setSelectedDistrictHeadId("");
    setSelectedTalukaIds([]);
    setRowTalukas([]);
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

  const canAssign = (() => {
    if (!newRoleId) return false;
    if (isDistrictHeadAssign) return !!rowDistrict;
    if (isTalukaHeadAssign) return !!selectedDistrictHeadId && selectedTalukaIds.length > 0;
    if (isWardChairmanAssign) {
      if (currentUserRoleRaw === "TalukHead") return !!selectedWardId;
      return !!wcTaluka && !!selectedTalukaHeadId && !!selectedWardId;
    }
    return true;
  })();

  const handleAssign = () => {
    if (!selectedUser || !newRoleId) return;
    const base = { userId: selectedUser.userId, roleId: Number(newRoleId), assignedBy: currentUserId };
    let payload;

    if (isDistrictHeadAssign) {
      payload = { ...base, type: "district_head", districtId: rowDistrict };
    } else if (isTalukaHeadAssign) {
      payload = {
        ...base,
        type: "taluka_head",
        districtHeadId: selectedDistrictHeadId,
        talukaIds: selectedTalukaIds,
      };
    } else if (isWardChairmanAssign) {
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

  // ── Multi-level User Filtering ───────────────────────────────────────────────
  const selectedDistrictObj = districts.find((d) => d.districtId === filterDistrict);
  const selectedTalukaObj = filterTalukas.find((t) => t.talukaId === filterTaluka);
  const selectedWardObj = filterWards.find((w) => w.wardId === filterWard);

  const filterDistrictName = selectedDistrictObj?.districtName || "";
  const filterTalukaName = selectedTalukaObj?.talukaName || "";
  const filterWardName = selectedWardObj?.wardName || "";

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
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
  }, [users, search, filterDistrict, filterDistrictName, filterTaluka, filterTalukaName, filterWard, filterWardName]);

  // ── Pagination Calculation ───────────────────────────────────────────────────
  const totalUsersCount = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalUsersCount / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalUsersCount);

  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, startIndex, endIndex]);

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
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold border bg-blue-50 border-blue-200 text-blue-700">
                            {badge}
                          </span>
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
                              value={newRoleId}
                              onChange={handleRoleChange}
                              placeholder="Select role…"
                              options={visibleRoles.map((r) => ({ value: r.roleId, label: r.role }))}
                              loading={loadingRoles}
                              minWidth="120px"
                            />

                            {/* District Head Assign Flow */}
                            {isDistrictHeadAssign && (
                              <RowSelect
                                value={rowDistrict}
                                onChange={(e) => handleRowDistrictChange(e.target.value)}
                                placeholder="District…"
                                options={districts.map((d) => ({ value: d.districtId, label: d.districtName }))}
                                minWidth="130px"
                              />
                            )}

                            {/* Taluka Head Assign Flow */}
                            {isTalukaHeadAssign && (
                              <>
                                {currentUserRoleRaw !== "DistrictHead" && (
                                  <RowSelect
                                    value={selectedDHDistrict}
                                    onChange={(e) => handleDHDistrictSelect(e.target.value)}
                                    placeholder={loadingRoleUsers ? "Loading…" : "Select District…"}
                                    options={availableDistricts.map((d) => ({ value: d.districtId, label: d.districtName }))}
                                    loading={loadingRoleUsers}
                                    minWidth="140px"
                                  />
                                )}

                                {currentUserRoleRaw === "DistrictHead" && locationData.districtName && (
                                  <span className="h-7 px-2.5 flex items-center text-[11.5px] font-medium bg-blue-50 border border-blue-200 text-blue-700 rounded-lg">
                                    📍 {locationData.districtName}
                                  </span>
                                )}

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

                            {/* Ward Chairman Assign Flow */}
                            {isWardChairmanAssign && (
                              <>
                                {currentUserRoleRaw !== "TalukHead" && (
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

                                {currentUserRoleRaw === "TalukHead" && locationData.talukaName && (
                                  <span className="h-7 px-2.5 flex items-center text-[11.5px] font-medium bg-blue-50 border border-blue-200 text-blue-700 rounded-lg">
                                    📍 {locationData.talukaName}
                                  </span>
                                )}

                                {(currentUserRoleRaw === "TalukHead" || selectedTalukaHeadId) && (
                                  <RowSelect
                                    value={selectedWardId}
                                    onChange={(e) => setSelectedWardId(e.target.value)}
                                    placeholder="Ward…"
                                    options={
                                      currentUserRoleRaw === "TalukHead"
                                        ? talukaWards.map((w) => ({
                                          value: w.wardId,
                                          label: `${w.wardNumber ? w.wardNumber + ' — ' : ''}${w.wardName}`,
                                        }))
                                        : wards.map((w) => ({
                                          value: w.wardId,
                                          label: `${w.wardNumber ? w.wardNumber + ' — ' : ''}${w.wardName}`,
                                        }))
                                    }
                                    loading={currentUserRoleRaw === "TalukHead" ? talukaWardsStatus === "loading" : loadingWards}
                                    minWidth="160px"
                                  />
                                )}
                              </>
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
            {filteredUsers.length !== users.length && (
              <span className="text-gray-400 font-normal"> (filtered from {users.length} total)</span>
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
    </div>
  );
}