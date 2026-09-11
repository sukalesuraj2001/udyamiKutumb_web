import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../service/api.js";

// ── adminSlice ────────────────────────────────────────────────────────────
// Backs the SuperAdmin-only backend endpoints added alongside this slice:
//   GET /admin/stats             → fetchAdminStats
//   GET /admin/dashboard         → fetchAdminDashboard (stats + recentAssignments + activePositionsSummary, one call)
//   GET /roles/position-history  → fetchPositionHistory
//   GET /roles/all-positions     → fetchAllPositions
// All four are guarded server-side to super_admin only; nothing here sends
// a district/taluka/ward filter, since a super_admin has no jurisdiction to
// scope by — these are always system-wide reads.

export const fetchAdminStats = createAsyncThunk(
  "admin/fetchAdminStats",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const res = await api.get("/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch admin stats"
      );
    }
  }
);

export const fetchAdminDashboard = createAsyncThunk(
  "admin/fetchAdminDashboard",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const res = await api.get("/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch admin dashboard"
      );
    }
  }
);

export const fetchPositionHistory = createAsyncThunk(
  "admin/fetchPositionHistory",
  async (positionId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const res = await api.get("/roles/position-history", {
        headers: { Authorization: `Bearer ${token}` },
        params: { positionId },
      });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch position history"
      );
    }
  }
);

export const fetchAllPositions = createAsyncThunk(
  "admin/fetchAllPositions",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const res = await api.get("/roles/all-positions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch all positions"
      );
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    // GET /admin/stats
    stats: null,
    loadingStats: false,
    statsError: null,

    // GET /admin/dashboard — superset of stats, plus recentAssignments +
    // activePositionsSummary. Kept separate from `stats` above so a
    // dashboard fetch doesn't silently overwrite a more targeted stats-only
    // fetch (or vice versa).
    dashboard: null,
    recentAssignments: [],
    activePositionsSummary: [],
    loadingDashboard: false,
    dashboardError: null,

    // GET /roles/position-history?positionId=
    positionHistory: [],
    loadingPositionHistory: false,
    positionHistoryError: null,

    // GET /roles/all-positions
    allPositions: [],
    loadingAllPositions: false,
    allPositionsError: null,
  },
  reducers: {
    clearPositionHistory(state) {
      state.positionHistory = [];
      state.positionHistoryError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── fetchAdminStats ──────────────────────────────────────
      .addCase(fetchAdminStats.pending, (state) => {
        state.loadingStats = true;
        state.statsError = null;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.loadingStats = false;
        state.stats = action.payload;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.loadingStats = false;
        state.statsError = action.payload;
      })

      // ── fetchAdminDashboard ──────────────────────────────────
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.loadingDashboard = true;
        state.dashboardError = null;
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.loadingDashboard = false;
        state.dashboard = action.payload;
        state.recentAssignments = action.payload?.recentAssignments || [];
        state.activePositionsSummary =
          action.payload?.activePositionsSummary || [];
        // The dashboard payload is a superset of /admin/stats, so keep
        // `stats` in sync too — components that only read `stats` still
        // get fresh numbers after a dashboard fetch.
        state.stats = action.payload;
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.loadingDashboard = false;
        state.dashboardError = action.payload;
      })

      // ── fetchPositionHistory ─────────────────────────────────
      .addCase(fetchPositionHistory.pending, (state) => {
        state.loadingPositionHistory = true;
        state.positionHistoryError = null;
      })
      .addCase(fetchPositionHistory.fulfilled, (state, action) => {
        state.loadingPositionHistory = false;
        state.positionHistory = action.payload?.data || action.payload || [];
      })
      .addCase(fetchPositionHistory.rejected, (state, action) => {
        state.loadingPositionHistory = false;
        state.positionHistoryError = action.payload;
      })

      // ── fetchAllPositions ────────────────────────────────────
      .addCase(fetchAllPositions.pending, (state) => {
        state.loadingAllPositions = true;
        state.allPositionsError = null;
      })
      .addCase(fetchAllPositions.fulfilled, (state, action) => {
        state.loadingAllPositions = false;
        state.allPositions = action.payload?.data || action.payload || [];
      })
      .addCase(fetchAllPositions.rejected, (state, action) => {
        state.loadingAllPositions = false;
        state.allPositionsError = action.payload;
      });
  },
});

export const { clearPositionHistory } = adminSlice.actions;
export default adminSlice.reducer;
