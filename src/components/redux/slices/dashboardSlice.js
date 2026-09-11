import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../service/api.js";

// ── fetchDashboard ────────────────────────────────────────────
// GET /auth/getAllUsers — fetches the caller's FULL scoped user list in a
// single call (no ?page=/&limit= query params). District/taluka/ward are
// NOT sent from here — the backend resolves the caller's own jurisdiction
// from the JWT (req.user.userId) instead of trusting anything the client
// passes, which closes an authorization gap the old endpoint had (any
// logged-in user could previously pass ?districtId=... for a district they
// don't head). The JWT already carries "the logged-in user's data"; there
// is nothing further to read from Redux auth state for this call.
//
// The full array is stored as `users` in state. Any search/filter UI is
// expected to filter that array locally (client-side) instead of asking
// the backend for another page — see AssignRolesTab for the pattern.
export const fetchDashboard = createAsyncThunk(
  "dashboard/fetchDashboard",
  async (_arg, thunkAPI) => {
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

    // scope + pagination of the current `users` page — mirrors the
    // getAllUsers response's `scope`/`pagination` objects. `scope` shows
    // which district/taluka/ward (if any) the backend resolved for the
    // caller server-side; it is informational only, never sent back.
    scope: { districtId: null, talukaId: null, wardId: null },
    pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },

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
        // `scope` is whatever jurisdiction the backend resolved for the
        // caller (null district/taluka/ward for super_admin); `pagination`
        // describes just the `users` page above — `stats`/`userDistribution`
        // above are already counted across the caller's FULL scoped set,
        // not just this page.
        if (action.payload.scope) {
          state.scope = action.payload.scope;
        }
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
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