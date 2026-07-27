import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// const BASE_URL = "http://192.168.0.70:3000";
const BASE_URL = "https://udyami-circle-db.onrender.com";

const mapToWardShape = (entry) => ({
  id: entry.ward?.wardId ?? null,           // ✅ ward.wardId இருக்கு
  ward_name: entry.ward?.wardName ?? "",    // ✅
  ward_number: entry.ward?.wardNumber ?? "",// ✅
  constituency: entry.taluka?.talukaName ?? "",  // ✅
  district: entry.district?.districtName ?? "",  // ✅
  state: entry.district?.state ?? "",            // ✅
  totalWardChartMembers: entry.totalWardChartMembers ?? 0,  // ✅
  booths_built: entry.totalWardChartMembers ?? 0,
  is_active: true,
});

// ─── GET wards by talukaId ────────────────────────────────────────
export const fetchWardsByTalukaId = createAsyncThunk(
  "areaChart/fetchWardsByTalukaId",
  async (talukaId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const { data } = await axios.get(
        `${BASE_URL}/ward/getWardBy/${talukaId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!data.success) throw new Error(data.message || "Fetch failed");
      return data.data; // ward array
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Something went wrong"
      );
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

export const getLocationByWardHeadId = createAsyncThunk(
  "areaChart/getLocationByWardHeadId",
  async (userId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const role = getState().auth.user?.role;

      const { data } = await axios.get(
        `${BASE_URL}/ward-chart/hierarchy/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!data.success) throw new Error(data.message || "Fetch failed");

      // ── localStorage store (role-based) ──────────────────────────
      const extractor = ROLE_LOCATION_EXTRACTOR[role];
      if (extractor) {
        const locationPayload = extractor(data.data);
        const serialised = JSON.stringify(locationPayload);
        localStorage.setItem("locationData", serialised);
        sessionStorage.setItem("locationData", serialised);
      }

      // ── existing mapping logic (unchanged) ───────────────────────
      let entries;
      if (data.data?.wards) {
        entries = data.data.wards;
      } else {
        entries = [data.data];
      }

      return entries.map(mapToWardShape);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Something went wrong"
      );
    }
  }
);

// ─── POST thunk ───────────────────────────────────────────────────
export const createWardChartData = createAsyncThunk(
  "areaChart/createWardChartData",
  async (payload, { getState, dispatch, rejectWithValue }) => {
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
    }
  }
);

// ─── GET thunk ────────────────────────────────────────────────────
export const getWardChartData = createAsyncThunk(
  "areaChart/getWardChartData",
  async ({ userId, wardId }, { getState, rejectWithValue }) => {
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
    }
  }
)

// ─── DELETE thunk ─────────────────────────────────────────────────
export const deleteWardChartMember = createAsyncThunk(
  "areaChart/deleteWardChartMember",
  async (memberId, { getState, dispatch, rejectWithValue }) => {
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
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────
const initialState = {
  // POST
  status: "idle",
  data: null,
  error: null,

  // GET ward chart
  fetchStatus: "idle",
  fetchedData: null,
  fetchError: null,

  // DELETE
  deleteStatus: "idle",
  deleteError: null,

  // GET location / ward list
  locationStatus: "idle",
  wards: [],
  locationError: null,

  // GET wards by taluka
  talukaWards: [],
  talukaWardsStatus: "idle",
  talukaWardsError: null,
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
        state.wards = action.payload;  // already mapped array
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
      .addCase(deleteWardChartMember.fulfilled, (state, action) => {
        state.deleteStatus = "succeeded";
        state.deleteError = null;
      })
      .addCase(deleteWardChartMember.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.deleteError = action.payload || "Something went wrong";
      })

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
  },
});

// ─── Selectors ────────────────────────────────────────────────────
// POST
export const selectAreaChartStatus = (state) => state.areaChart.status;
export const selectAreaChartData = (state) => state.areaChart.data;
export const selectAreaChartError = (state) => state.areaChart.error;

// GET ward chart
export const selectFetchStatus = (state) => state.areaChart.fetchStatus;
export const selectFetchedData = (state) => state.areaChart.fetchedData;
export const selectFetchError = (state) => state.areaChart.fetchError;

// DELETE
export const selectDeleteStatus = (state) => state.areaChart.deleteStatus;
export const selectDeleteError = (state) => state.areaChart.deleteError;

// Location / ward list
export const selectLocationStatus = (state) => state.areaChart.locationStatus;
export const selectWards = (state) => state.areaChart.wards;
export const selectLocationError = (state) => state.areaChart.locationError;

export const selectTalukaWards = (s) => s.areaChart.talukaWards;
export const selectTalukaWardsStatus = (s) => s.areaChart.talukaWardsStatus;
export const selectTalukaWardsError = (s) => s.areaChart.talukaWardsError;

export const { clearAreaChartState, clearLocationState } = areaChartSlice.actions;
export default areaChartSlice.reducer;