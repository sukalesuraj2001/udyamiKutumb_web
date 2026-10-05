import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { showLoader, hideLoader } from "./globalLoaderSlice";

// const BASE_URL = "http://192.168.0.70:3000";
const BASE_URL = "http://localhost:3000";

const mapToWardShape = (entry, constituencyWardCount = 9) => {
  const rawTotalMembers =
    entry?.wardChart?.totalMembers ??
    entry?.totalMembers ??
    entry?.totalWardChartMembers ??
    entry?.wardDetails?.totalMembers ??
    0;

  const rawLayoutCount =
    entry?.wardChart?.layoutConfig?.layoutCount ??
    entry?.wardChart?.layoutCount ??
    entry?.layoutCount ??
    entry?.layoutConfig?.layoutCount ??
    entry?.taluka?.layoutCount ??
    entry?.wardDetails?.layoutCount ??
    entry?.ward?.layoutCount ??
    entry?.taluka?.layoutConfig?.layoutCount ??
    103;

  const totalCards = Number(rawLayoutCount) || 103;
  const totalMembersCount = Number(rawTotalMembers) || 0;

  return {
    id: entry.ward?.wardId ?? entry.wardId ?? null,
    ward_name: entry.ward?.wardName ?? entry.ward ?? "",
    ward_number: entry.ward?.wardNumber ?? "",
    g_code: entry.ward?.g_code || entry.ward?.wardNumber || "",
    constituency: entry.taluka?.talukaName ?? "",
    district: entry.district?.districtName ?? "",
    state: entry.district?.state ?? "",
    totalMembers: totalMembersCount,
    totalWardChartMembers: totalMembersCount,
    booths_built: totalMembersCount,
    booths_total: totalCards,
    constituencyWardCount: constituencyWardCount,
    wardsCount: constituencyWardCount,
    layoutCount: String(totalCards),
    is_active: true,
    wardChairman: entry.wardChairman ?? null,
    wardChairmanUserId: entry.wardChairman?.userId ?? entry.wardChairmanId ?? entry.wardHeadId ?? null,
    wardHeadId: entry.wardChairman?.userId ?? entry.wardChairmanId ?? entry.wardHeadId ?? null,
  };
};

// ─── GET wards by talukaId ────────────────────────────────────────
export const fetchWardsByTalukaId = createAsyncThunk(
  "areaChart/fetchWardsByTalukaId",
  async (talukaId, { getState, dispatch, rejectWithValue }) => {
    dispatch(showLoader());
    try {
      const token = getState().auth.token;
      const { data } = await axios.get(
        `${BASE_URL}/ward/getWardBy/${talukaId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!data.success) throw new Error(data.message || "Fetch failed");
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Something went wrong"
      );
    } finally {
      dispatch(hideLoader());
    }
  }
);

// ─── GET /ward-chart/getLocationByWardHeadId/:userId ──────────────
const ROLE_LOCATION_EXTRACTOR = {
  DistrictHead: (d) => ({
    districtId: d.district?.districtId,
    districtName: d.district?.districtName,
  }),
  TalukHead: (d) => ({
    districtId: d.district?.districtId,
    districtName: d.district?.districtName,
    talukaId: d.taluka?.talukaId,
    talukaName: d.taluka?.talukaName,
  }),
  WardChairman: (d) => ({
    districtId: d.district?.districtId,
    districtName: d.district?.districtName,
    talukaId: d.taluka?.talukaId,
    talukaName: d.taluka?.talukaName,
    wardId: d.ward?.wardId,
    wardName: d.ward?.wardName,
  }),
};

export const getWardName = () => {
  try {
    const locationData = JSON.parse(localStorage.getItem("locationData"));
    return locationData?.wardName || "";
  } catch (error) {
    console.error("Error reading ward name:", error);
    return "";
  }
};

export const getLocationByWardHeadId = createAsyncThunk(
  "areaChart/getLocationByWardHeadId",
  async (inputParam, { getState, dispatch, rejectWithValue }) => {
    dispatch(showLoader());
    try {
      const token = getState().auth.token;
      const role = getState().auth.user?.role;
      const user = getState().auth.user;

      const positionId =
        user?.position?.positionId ||
        localStorage.getItem("positionId") ||
        sessionStorage.getItem("positionId") ||
        inputParam;

      const { data } = await axios.get(
        `${BASE_URL}/ward-chart/hierarchy/${positionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!data.success) throw new Error(data.message || "Fetch failed");

      const extractor = ROLE_LOCATION_EXTRACTOR[role];
      if (extractor) {
        const locationPayload = extractor(data.data);
        const serialised = JSON.stringify(locationPayload);
        localStorage.setItem("locationData", serialised);
        sessionStorage.setItem("locationData", serialised);
      }

      let entries;
      if (data.data?.wards) {
        entries = data.data.wards;
      } else {
        entries = [data.data];
      }

      // A ward can come back more than once (e.g. two WARD_CHAIRMAN position
      // assignments for the same ward, one of them stale). Every screen built on
      // this list - cards, counts, Print Preview pages - assumes one entry per
      // ward, so keep only one: the one with a current chairman if there is a
      // choice, otherwise the first.
      const seenWards = new Map();
      entries.forEach((e) => {
        const key =
          e?.ward?.wardId ??
          e?.wardId ??
          `${e?.taluka?.talukaName ?? ""}|${(e?.ward?.wardName ?? e?.ward ?? "").toString().trim().toLowerCase()}`;
        const existing = seenWards.get(key);
        if (!existing || (!existing.wardChairman && e?.wardChairman)) {
          seenWards.set(key, e);
        }
      });
      entries = Array.from(seenWards.values());

      const constituencyCounts = {};
      entries.forEach((e) => {
        const cName = e?.taluka?.talukaName || "default";
        constituencyCounts[cName] = (constituencyCounts[cName] || 0) + 1;
      });

      const wardInfo = data.data?.ward
        ? {
          wardId: data.data.ward.wardId,
          wardName: data.data.ward.wardName,
          wardNumber: data.data.ward.wardNumber,
          totalWardChartMembers: data.data.totalWardChartMembers ?? 0,
          wardChartMembers: data.data.wardChartMembers ?? [],
        }
        : null;

      return {
        wards: entries.map((e) => mapToWardShape(e, constituencyCounts[e?.taluka?.talukaName || "default"] || entries.length)),
        wardInfo,
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Something went wrong"
      );
    } finally {
      dispatch(hideLoader());
    }
  }
);

// ─── POST thunk ───────────────────────────────────────────────────
export const createWardChartData = createAsyncThunk(
  "areaChart/createWardChartData",
  async (payload, { getState, dispatch, rejectWithValue }) => {
    dispatch(showLoader());
    try {
      const token = getState().auth.token;
      const authUser = getState().auth.user;
      const assignerUserId = authUser?.userId || authUser?._id || authUser?.id || "";

      let finalPayload = payload;

      const processMembers = (membersArr = []) => {
        return membersArr.map((m) => ({
          ...m,
          userId: m.userId || m.memberId || "",
          isAssigned: m.isAssigned !== undefined ? m.isAssigned : true,
          assignedBy: m.assignedBy || assignerUserId,
        }));
      };

      if (payload instanceof FormData) {
        const dataStr = payload.get("data");
        if (dataStr) {
          try {
            const parsed = JSON.parse(dataStr);
            if (Array.isArray(parsed.members) && parsed.members.length > 0) {
              parsed.members = processMembers(parsed.members);
              payload.set("data", JSON.stringify(parsed));
            }
          } catch (e) {
            console.error("Error processing members in FormData:", e);
          }
        }
      } else if (payload && typeof payload === "object") {
        if (Array.isArray(payload.members) && payload.members.length > 0) {
          finalPayload = {
            ...payload,
            members: processMembers(payload.members),
          };
        }
      }

      const isFormData = finalPayload instanceof FormData;
      const headers = isFormData
        ? { Authorization: `Bearer ${token}` }
        : { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

      const { data } = await axios.post(
        `${BASE_URL}/ward-chart/createWardChartData`,
        finalPayload,
        { headers }
      );

      if (!data.success) throw new Error(data.message || "Request failed");

      let refetchWardHeadId, refetchWardId;

      if (isFormData) {
        try {
          const nested = JSON.parse(payload.get("data") || "{}");
          refetchWardHeadId = nested.wardHeadId;
          refetchWardId = nested.wardId;
        } catch {
          refetchWardHeadId = payload.get("wardHeadId");
          refetchWardId = payload.get("wardId");
        }
      } else {
        refetchWardHeadId = payload.wardHeadId;
        refetchWardId = payload.wardId;
      }

      dispatch(getWardChartData({ userId: refetchWardHeadId, wardId: refetchWardId }));

      return data;
    } catch (err) {
      console.error("createWardChartData", err);
      const resData = err.response?.data;
      if (resData && typeof resData === "object") {
        return rejectWithValue({
          message: resData.message || (typeof resData.error === "string" ? resData.error : null) || err.message || "An error occurred",
          error: resData.error || "Error",
          statusCode: resData.statusCode || err.response?.status || 400,
        });
      }
      return rejectWithValue(
        err.response?.data?.message || err.message || "Something went wrong"
      );
    } finally {
      dispatch(hideLoader());
    }
  }
);

// ─── SEARCH MEMBERS thunk ─────────────────────────────────────────
export const searchMembers = createAsyncThunk(
  "areaChart/searchMembers",
  async (payload, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getState().auth.token;

      let query = "";
      let wardName = "";
      let talukaId = "";
      let districtId = "";
      let role = "";

      if (typeof payload === "string") {
        query = payload;
      } else if (payload && typeof payload === "object") {
        query = payload.query || payload.name || "";
        wardName = payload.wardName || payload.ward || payload.ward_name || "";
        talukaId = payload.talukaId || payload.taluka_id || "";
        districtId = payload.districtId || payload.district_id || "";
        role = payload.role || payload.userRole || "";
      }

      const userRole = role || getState().auth.user?.role;
      let locationData = null;
      try {
        locationData = JSON.parse(localStorage.getItem("locationData") || "{}");
      } catch (e) {
        // ignore
      }

      if (!talukaId && (userRole === "TalukHead" || userRole === "TalukaHead" || userRole === "taluka_head")) {
        talukaId = locationData?.talukaId || "";
      }

      if (!districtId && (userRole === "DistrictHead" || userRole === "district_head")) {
        districtId = locationData?.districtId || "";
      }

      const requestPayload = {
        name: query || "",
      };

      if (wardName) {
        requestPayload.ward = wardName;
      }
      if (talukaId) {
        requestPayload.talukaId = talukaId;
      }
      if (districtId) {
        requestPayload.districtId = districtId;
      }

      const { data } = await axios.post(
        `${BASE_URL}/userprofile/search-users`,
        requestPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!data.success) throw new Error(data.message || "Search failed");
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Something went wrong"
      );
    }
  }
);

// ─── GET thunk ────────────────────────────────────────────────────
export const getWardChartData = createAsyncThunk(
  "areaChart/getWardChartData",
  async ({ userId, wardId }, { getState, dispatch, rejectWithValue }) => {
    dispatch(showLoader());
    try {
      const token = getState().auth.token;
      const { data } = await axios.get(
        `${BASE_URL}/ward-chart/getWardChartData/${userId}/${wardId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!data.success) throw new Error(data.message || "Fetch failed");
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Something went wrong"
      );
    } finally {
      dispatch(hideLoader());
    }
  }
);

// ─── DELETE thunk ─────────────────────────────────────────────────
export const deleteWardChartMember = createAsyncThunk(
  "areaChart/deleteWardChartMember",
  async (memberId, { getState, dispatch, rejectWithValue }) => {
    dispatch(showLoader());
    try {
      const token = getState().auth.token;
      const { data } = await axios.delete(
        `${BASE_URL}/ward-chart/deleteWardChartMember/${memberId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!data.success) throw new Error(data.message || "Delete failed");
      return { memberId, ...data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Something went wrong"
      );
    } finally {
      dispatch(hideLoader());
    }
  }
);

// ─── GET /talukas/getAllWardChaimansBy/:talukaId ─────────────────
export const getAllWardChaimansBy = createAsyncThunk(
  "areaChart/getAllWardChaimansBy",
  async (talukaId, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const { data } = await axios.get(
        `${BASE_URL}/talukas/getAllWardChaimansBy/${talukaId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!data.success) throw new Error(data.message || "Fetch failed");
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Something went wrong"
      );
    }
  }
);

// ─── GET /auth/ucn-members/:wardId ──────────────────────────────
export const fetchUcnMembers = createAsyncThunk(
  "areaChart/fetchUcnMembers",
  async (wardId, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const { data } = await axios.get(
        `${BASE_URL}/auth/ucn-members/${wardId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!data.success) throw new Error(data.message || "Fetch failed");
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Something went wrong"
      );
    }
  }
);

// ─── GET /auth/getAllChannelPartners ──────────────────────────────
export const fetchChannelPartners = createAsyncThunk(
  "areaChart/fetchChannelPartners",
  async (params, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      let wardId = "";
      let businessName = "";
      let page = 1;
      let limit = 50;

      if (typeof params === "string") {
        wardId = params;
      } else if (params && typeof params === "object") {
        wardId = params.wardId || "";
        businessName = params.businessName || "";
        if (params.page) page = params.page;
        if (params.limit) limit = params.limit;
      }

      let url = `${BASE_URL}/auth/getAllChannelPartners?page=${page}&limit=${limit}`;
      if (wardId) url += `&wardId=${wardId}`;
      if (businessName) url += `&businessName=${encodeURIComponent(businessName)}`;

      const { data } = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!data.success) throw new Error(data.message || "Fetch failed");
      return data.data || [];
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Something went wrong"
      );
    }
  }
);

// ─── GET /auth/getAllPatrons/:talukaId ──────────────────────────────
export const fetchPatrons = createAsyncThunk(
  "areaChart/fetchPatrons",
  async (talukaId, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const { data } = await axios.get(
        `${BASE_URL}/auth/getAllPatrons/${talukaId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!data.success) throw new Error(data.message || "Fetch failed");
      return data.data || [];
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Something went wrong"
      );
    }
  }
);

// ─── GET /udyamimngt/getMngtMembers/:wardId ──────────────────────────────
export const fetchUmsMembers = createAsyncThunk(
  "areaChart/fetchUmsMembers",
  async (wardId, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const { data } = await axios.get(
        `${BASE_URL}/udyamimngt/getMngtMembers/${wardId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!data.success) throw new Error(data.message || "Fetch failed");
      return data.data || [];
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Something went wrong"
      );
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────
const initialState = {
  status: "idle",
  data: null,
  error: null,

  fetchStatus: "idle",
  fetchedData: null,
  fetchError: null,
  // Which ward `fetchedData` actually belongs to. `fetchedData` is a single
  // slot, so without this the previous ward's payload stays readable while a
  // new ward's request is still in flight, and the page renders it as if it
  // were the new ward's data.
  fetchedWardId: null,

  deleteStatus: "idle",
  deleteError: null,

  locationStatus: "idle",
  wards: [],
  locationError: null,

  talukaWards: [],
  talukaWardsStatus: "idle",
  talukaWardsError: null,

  wardInfo: null,

  searchResults: [],
  searchStatus: "idle",
  searchError: null,

  wardChairmenList: [],
  wardChairmenStatus: "idle",
  wardChairmenError: null,
  // The taluka the roster was loaded for, and when. The roster carries every
  // ward's MLA/Patron members, so it goes stale for sibling wards as soon as a
  // common-page save syncs across the taluka.
  wardChairmenTalukaId: null,
  wardChairmenFetchedAt: null,

  ucnMembers: [],
  ucnMembersStatus: "idle",
  ucnMembersError: null,

  channelPartners: [],
  channelPartnersStatus: "idle",
  channelPartnersError: null,

  patrons: [],
  patronsStatus: "idle",
  patronsError: null,

  umsMembers: [],
  umsMembersStatus: "idle",
  umsMembersError: null,
};

const areaChartSlice = createSlice({
  name: "areaChart",
  initialState,
  reducers: {
    clearAreaChartError(state) {
      state.error = null;
    },
    clearAreaChartState(state) {
      state.status = "idle";
      state.data = null;
      state.error = null;
      state.fetchStatus = "idle";
      state.fetchedData = null;
      state.fetchedWardId = null;
      state.fetchError = null;
    },
    /**
     * Invalidate everything a common-page (MLA / Patron / slot-count) save
     * makes stale across the whole taluka. The backend writes those changes
     * into EVERY ward's chart, so this ward's cached payload and the taluka
     * roster (which carries the other wards' members) are both out of date
     * the moment such a save succeeds. Dropping the roster timestamp is what
     * makes the next ward that opens re-request it instead of rendering the
     * snapshot taken when the taluka was first loaded.
     */
    invalidateTalukaWardChartCache(state) {
      state.fetchedData = null;
      state.fetchedWardId = null;
      state.fetchStatus = "idle";
      state.wardChairmenFetchedAt = null;
      state.wardChairmenTalukaId = null;
    },
    clearLocationState(state) {
      state.locationStatus = "idle";
      state.wards = [];
      state.locationError = null;
    },
  },
  extraReducers: (builder) => {
    // ── getLocationByWardHeadId ──
    builder
      .addCase(getLocationByWardHeadId.pending, (state) => {
        state.locationStatus = "loading";
        state.locationError = null;
      })
      .addCase(getLocationByWardHeadId.fulfilled, (state, action) => {
        state.locationStatus = "succeeded";
        state.wards = action.payload.wards;
        state.wardInfo = action.payload.wardInfo;
        state.locationError = null;
      })
      .addCase(getLocationByWardHeadId.rejected, (state, action) => {
        state.locationStatus = "failed";
        state.locationError = action.payload || "Something went wrong";
        state.wards = [];
      });

    // ── POST ──
    builder
      .addCase(createWardChartData.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createWardChartData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
        state.error = null;
      })
      .addCase(createWardChartData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Something went wrong";
      });

    // ── GET ward chart ──
    builder
      .addCase(getWardChartData.pending, (state, action) => {
        state.fetchStatus = "loading";
        state.fetchError = null;
        // Drop the previous ward's payload as soon as a different ward is
        // requested, so nothing can render it against the new ward while the
        // request is in flight.
        if (state.fetchedWardId && state.fetchedWardId !== action.meta.arg?.wardId) {
          state.fetchedData = null;
          state.fetchedWardId = null;
        }
      })
      .addCase(getWardChartData.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        state.fetchedData = action.payload;
        state.fetchedWardId = action.meta.arg?.wardId ?? null;
        state.fetchError = null;

        const { wardChartId, wardHeadId, ward } = action.payload.data;
        localStorage.setItem(
          "wardChartMeta",
          JSON.stringify({ wardChartId, wardHeadId, ward })
        );
      })
      .addCase(getWardChartData.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.fetchError = action.payload || "Something went wrong";
      });

    // ── DELETE ──
    builder
      .addCase(deleteWardChartMember.pending, (state) => {
        state.deleteStatus = "loading";
        state.deleteError = null;
      })
      .addCase(deleteWardChartMember.fulfilled, (state) => {
        state.deleteStatus = "succeeded";
        state.deleteError = null;
      })
      .addCase(deleteWardChartMember.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.deleteError = action.payload || "Something went wrong";
      });

    // ── fetchWardsByTalukaId ──
    builder
      .addCase(fetchWardsByTalukaId.pending, (state) => {
        state.talukaWardsStatus = "loading";
        state.talukaWardsError = null;
      })
      .addCase(fetchWardsByTalukaId.fulfilled, (state, action) => {
        state.talukaWardsStatus = "succeeded";
        state.talukaWards = action.payload;
      })
      .addCase(fetchWardsByTalukaId.rejected, (state, action) => {
        state.talukaWardsStatus = "failed";
        state.talukaWardsError = action.payload || "Something went wrong";
        state.talukaWards = [];
      });

    // ── searchMembers ──
    builder
      .addCase(searchMembers.pending, (state) => {
        state.searchStatus = "loading";
        state.searchError = null;
      })
      .addCase(searchMembers.fulfilled, (state, action) => {
        state.searchStatus = "succeeded";
        state.searchResults = action.payload;
      })
      .addCase(searchMembers.rejected, (state, action) => {
        state.searchStatus = "failed";
        state.searchError = action.payload || "Something went wrong";
        state.searchResults = [];
      });

    // ── getAllWardChaimansBy ──
    builder
      .addCase(getAllWardChaimansBy.pending, (state) => {
        state.wardChairmenStatus = "loading";
        state.wardChairmenError = null;
      })
      .addCase(getAllWardChaimansBy.fulfilled, (state, action) => {
        state.wardChairmenStatus = "succeeded";
        state.wardChairmenList = action.payload;
        state.wardChairmenError = null;
        state.wardChairmenTalukaId = action.meta.arg ?? null;
        state.wardChairmenFetchedAt = Date.now();
      })
      .addCase(getAllWardChaimansBy.rejected, (state, action) => {
        state.wardChairmenStatus = "failed";
        state.wardChairmenError = action.payload || "Something went wrong";
        state.wardChairmenList = [];
      });

    // ── fetchUcnMembers ──
    builder
      .addCase(fetchUcnMembers.pending, (state) => {
        state.ucnMembersStatus = "loading";
        state.ucnMembersError = null;
      })
      .addCase(fetchUcnMembers.fulfilled, (state, action) => {
        state.ucnMembersStatus = "succeeded";
        state.ucnMembers = action.payload;
        state.ucnMembersError = null;
      })
      .addCase(fetchUcnMembers.rejected, (state, action) => {
        state.ucnMembersStatus = "failed";
        state.ucnMembersError = action.payload || "Something went wrong";
        state.ucnMembers = [];
      });

    // ── fetchChannelPartners ──
    builder
      .addCase(fetchChannelPartners.pending, (state) => {
        state.channelPartnersStatus = "loading";
        state.channelPartnersError = null;
      })
      .addCase(fetchChannelPartners.fulfilled, (state, action) => {
        state.channelPartnersStatus = "succeeded";
        state.channelPartners = action.payload;
        state.channelPartnersError = null;
      })
      .addCase(fetchChannelPartners.rejected, (state, action) => {
        state.channelPartnersStatus = "failed";
        state.channelPartnersError = action.payload || "Something went wrong";
        state.channelPartners = [];
      });

    // ── fetchPatrons ──
    builder
      .addCase(fetchPatrons.pending, (state) => {
        state.patronsStatus = "loading";
        state.patronsError = null;
      })
      .addCase(fetchPatrons.fulfilled, (state, action) => {
        state.patronsStatus = "succeeded";
        state.patrons = action.payload;
        state.patronsError = null;
      })
      .addCase(fetchPatrons.rejected, (state, action) => {
        state.patronsStatus = "failed";
        state.patronsError = action.payload || "Something went wrong";
        state.patrons = [];
      });

    // ── fetchUmsMembers ──
    builder
      .addCase(fetchUmsMembers.pending, (state) => {
        state.umsMembersStatus = "loading";
        state.umsMembersError = null;
      })
      .addCase(fetchUmsMembers.fulfilled, (state, action) => {
        state.umsMembersStatus = "succeeded";
        state.umsMembers = action.payload;
        state.umsMembersError = null;
      })
      .addCase(fetchUmsMembers.rejected, (state, action) => {
        state.umsMembersStatus = "failed";
        state.umsMembersError = action.payload || "Something went wrong";
        state.umsMembers = [];
      });
  },
});

// ─── Selectors ────────────────────────────────────────────────────
export const selectAreaChartStatus = (state) => state.areaChart.status;
export const selectAreaChartData = (state) => state.areaChart.data;
export const selectAreaChartError = (state) => state.areaChart.error;

export const selectFetchStatus = (state) => state.areaChart.fetchStatus;
export const selectFetchedData = (state) => state.areaChart.fetchedData;
export const selectFetchError = (state) => state.areaChart.fetchError;
export const selectFetchedWardId = (state) => state.areaChart.fetchedWardId;

export const selectDeleteStatus = (state) => state.areaChart.deleteStatus;
export const selectDeleteError = (state) => state.areaChart.deleteError;

export const selectLocationStatus = (state) => state.areaChart.locationStatus;
export const selectWards = (state) => state.areaChart.wards;
export const selectLocationError = (state) => state.areaChart.locationError;

export const selectTalukaWards = (s) => s.areaChart.talukaWards;
export const selectTalukaWardsStatus = (s) => s.areaChart.talukaWardsStatus;
export const selectTalukaWardsError = (s) => s.areaChart.talukaWardsError;

export const selectSearchResults = (s) => s.areaChart.searchResults;
export const selectSearchStatus = (s) => s.areaChart.searchStatus;
export const selectSearchError = (s) => s.areaChart.searchError;

export const selectWardChairmenList = (s) => s.areaChart.wardChairmenList;
export const selectWardChairmenStatus = (s) => s.areaChart.wardChairmenStatus;
export const selectWardChairmenError = (s) => s.areaChart.wardChairmenError;
export const selectWardChairmenTalukaId = (s) => s.areaChart.wardChairmenTalukaId;
export const selectWardChairmenFetchedAt = (s) => s.areaChart.wardChairmenFetchedAt;

export const selectUcnMembers = (s) => s.areaChart.ucnMembers;
export const selectUcnMembersStatus = (s) => s.areaChart.ucnMembersStatus;
export const selectUcnMembersError = (s) => s.areaChart.ucnMembersError;

export const selectChannelPartners = (s) => s.areaChart.channelPartners;
export const selectChannelPartnersStatus = (s) => s.areaChart.channelPartnersStatus;
export const selectChannelPartnersError = (s) => s.areaChart.channelPartnersError;

export const selectPatrons = (s) => s.areaChart.patrons;
export const selectPatronsStatus = (s) => s.areaChart.patronsStatus;
export const selectPatronsError = (s) => s.areaChart.patronsError;

export const selectUmsMembers = (s) => s.areaChart.umsMembers;
export const selectUmsMembersStatus = (s) => s.areaChart.umsMembersStatus;
export const selectUmsMembersError = (s) => s.areaChart.umsMembersError;

export const selectWardInfo = (s) => s.areaChart.wardInfo;
export const selectLayoutConfig = (s) => s.areaChart.fetchedData?.data?.layoutConfig ?? null;
export const {
  clearAreaChartError,
  clearAreaChartState,
  clearLocationState,
  invalidateTalukaWardChartCache,
} = areaChartSlice.actions;
export default areaChartSlice.reducer;
