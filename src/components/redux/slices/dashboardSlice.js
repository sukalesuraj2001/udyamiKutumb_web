import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../service/api.js";

export const fetchDashboard = createAsyncThunk(
  "dashboard/fetchDashboard",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await api.get("/auth/getAllUsers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch");
    }
  }
);

export const fetchUsersByDistrict = createAsyncThunk(
  "dashboard/fetchUsersByDistrict",
  async (districtName, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await api.get(
        `/district/users-by-district?district=${encodeURIComponent(districtName)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data; // { district, totalUsers, users: [...] }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch district users");
    }
  }
);

export const fetchUsersByTaluka = createAsyncThunk(
  "dashboard/fetchUsersByTaluka",
  async (talukaName, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await api.get(
        `/talukas/users-by-taluka?taluka=${encodeURIComponent(talukaName)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data; // { taluka, totalUsers, users: [...] }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch taluka users");
    }
  }
);

// ── NEW ───────────────────────────────────────────────────────
export const fetchUsersByWard = createAsyncThunk(
  "dashboard/fetchUsersByWard",
  async (wardName, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await api.get(
        `/ward/users-by-ward?ward=${encodeURIComponent(wardName)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data; // { total, users: [...] }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch ward users");
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    stats: {
      totalUsers: 0,
      freeUsers: 0,
      basicUsers: 0,
      primeUsers: 0,
      totalChannelPartners: 0,
      activeChannelPartners: 0,
      inactiveChannelPartners: 0,
    },
    userDistribution: [],
    users: [],
    loading: false,
    error: null,

    // ward users
    wardUsers: [],
    wardUsersTotal: 0,
    wardUsersLoading: false,
    wardUsersError: null,

    districtUsers: [],
    districtUsersTotal: 0,
    districtUsersLoading: false,
    districtUsersError: null,

    talukaUsers: [],
    talukaUsersTotal: 0,
    talukaUsersLoading: false,
    talukaUsersError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ── fetchDashboard ──────────────────────────────────────
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        const counts = action.payload.counts;
        const free = counts.totalUsers - counts.basicUsers - counts.primeUsers;
        state.stats = {
          totalUsers: counts.totalUsers,
          freeUsers: free,
          basicUsers: counts.basicUsers,
          primeUsers: counts.primeUsers,
          totalChannelPartners: counts.totalChannelPartners,
          activeChannelPartners: counts.activeChannelPartners,
          inactiveChannelPartners: counts.inactiveChannelPartners,
        };
        state.users = action.payload.data;
        state.userDistribution = [
          { name: "Free Users", value: free },
          { name: "Basic Users", value: counts.basicUsers },
          { name: "Prime Users", value: counts.primeUsers },
        ];
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── fetchUsersByWard ────────────────────────────────────
      .addCase(fetchUsersByWard.pending, (state) => {
        state.wardUsersLoading = true;
        state.wardUsersError = null;
      })
      .addCase(fetchUsersByWard.fulfilled, (state, action) => {
        state.wardUsersLoading = false;
        state.wardUsers = action.payload.users;
        state.wardUsersTotal = action.payload.total;
      })
      .addCase(fetchUsersByWard.rejected, (state, action) => {
        state.wardUsersLoading = false;
        state.wardUsersError = action.payload;
      })

      .addCase(fetchUsersByDistrict.pending, (state) => {
        state.districtUsersLoading = true;
        state.districtUsersError = null;
      })
      .addCase(fetchUsersByDistrict.fulfilled, (state, action) => {
        state.districtUsersLoading = false;
        state.districtUsers = action.payload.users;
        state.districtUsersTotal = action.payload.totalUsers;
      })
      .addCase(fetchUsersByDistrict.rejected, (state, action) => {
        state.districtUsersLoading = false;
        state.districtUsersError = action.payload;
      })

      .addCase(fetchUsersByTaluka.pending, (state) => {
        state.talukaUsersLoading = true;
        state.talukaUsersError = null;
      })
      .addCase(fetchUsersByTaluka.fulfilled, (state, action) => {
        state.talukaUsersLoading = false;
        state.talukaUsers = action.payload.users;
        state.talukaUsersTotal = action.payload.totalUsers;
      })
      .addCase(fetchUsersByTaluka.rejected, (state, action) => {
        state.talukaUsersLoading = false;
        state.talukaUsersError = action.payload;
      })
  },
});

export default dashboardSlice.reducer;