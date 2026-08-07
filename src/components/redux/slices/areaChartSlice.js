import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { showLoader, hideLoader } from "./globalLoaderSlice";

// const BASE_URL = "http://192.168.0.70:3000";
const BASE_URL = "https://udyami-circle-db.onrender.com";

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
  async (userId, { getState, dispatch, rejectWithValue }) => {
    dispatch(showLoader());
    try {
      const token = getState().auth.token;
      const role = getState().auth.user?.role;

      const { data } = await axios.get(
        `${BASE_URL}/ward-chart/hierarchy/${userId}`,
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

      const isFormData = payload instanceof FormData;
      const headers = isFormData
        ? { Authorization: `Bearer ${token}` }
        : { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

      const { data } = await axios.post(
        `${BASE_URL}/ward-chart/createWardChartData`,
        payload,
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
    dispatch(showLoader());
    try {
      const token = getState().auth.token;

      let query = "";
      let wardName = "";

      if (typeof payload === "string") {
        query = payload;
      } else if (payload && typeof payload === "object") {
        query = payload.query || payload.name || "";
        wardName = payload.wardName || payload.ward || payload.ward_name || "";
      }

      const { data } = await axios.post(
        `${BASE_URL}/userprofile/search-users`,
        { name: query || "", ward: wardName || "" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!data.success) throw new Error(data.message || "Search failed");
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

// ─── Slice ────────────────────────────────────────────────────────
const initialState = {
  status: "idle",
  data: null,
  error: null,

  fetchStatus: "idle",
  fetchedData: null,
  fetchError: null,

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
};

const areaChartSlice = createSlice({
  name: "areaChart",
  initialState,
  reducers: {
    clearAreaChartState(state) {
      state.status = "idle";
      state.data = null;
      state.error = null;
      state.fetchStatus = "idle";
      state.fetchedData = null;
      state.fetchError = null;
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
      .addCase(getWardChartData.pending, (state) => {
        state.fetchStatus = "loading";
        state.fetchError = null;
      })
      .addCase(getWardChartData.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        state.fetchedData = action.payload;
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
  },
});

// ─── Selectors ────────────────────────────────────────────────────
export const selectAreaChartStatus = (state) => state.areaChart.status;
export const selectAreaChartData = (state) => state.areaChart.data;
export const selectAreaChartError = (state) => state.areaChart.error;

export const selectFetchStatus = (state) => state.areaChart.fetchStatus;
export const selectFetchedData = (state) => state.areaChart.fetchedData;
export const selectFetchError = (state) => state.areaChart.fetchError;

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
export const selectWardInfo = (s) => s.areaChart.wardInfo;
export const selectLayoutConfig = (s) => s.areaChart.fetchedData?.data?.layoutConfig ?? null;
export const { clearAreaChartState, clearLocationState } = areaChartSlice.actions;
export default areaChartSlice.reducer;