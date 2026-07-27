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
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        const counts = action.payload.counts;
        const free = counts.totalUsers - counts.basicUsers - counts.primeUsers;

        state.stats = {
          totalUsers:              counts.totalUsers,
          freeUsers:               free,
          basicUsers:              counts.basicUsers,
          primeUsers:              counts.primeUsers,
          totalChannelPartners:    counts.totalChannelPartners,
          activeChannelPartners:   counts.activeChannelPartners,
          inactiveChannelPartners: counts.inactiveChannelPartners,
        };

        state.users = action.payload.data;

        state.userDistribution = [
          { name: "Free Users",  value: free },
          { name: "Basic Users", value: counts.basicUsers },
          { name: "Prime Users", value: counts.primeUsers },
        ];
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;