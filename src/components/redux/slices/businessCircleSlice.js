import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../service/api.js";

// Async thunk to fetch Business Circle dashboard data
// Endpoint: GET /business-circle/:id/dashboard?type=:type
export const fetchBusinessCircleDashboard = createAsyncThunk(
  "businessCircle/fetchDashboard",
  async ({ id, type }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/business-circle/${id}/dashboard?type=${type}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch Business Circle dashboard"
      );
    }
  }
);

const initialState = {
  dashboardData: null,
  loading: false,
  error: null,
};

const businessCircleSlice = createSlice({
  name: "businessCircle",
  initialState,
  reducers: {
    clearBusinessCircleData: (state) => {
      state.dashboardData = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBusinessCircleDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBusinessCircleDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardData = action.payload;
        state.error = null;
      })
      .addCase(fetchBusinessCircleDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearBusinessCircleData } = businessCircleSlice.actions;

export const selectBusinessCircleData = (state) => state.businessCircle?.dashboardData;
export const selectBusinessCircleLoading = (state) => state.businessCircle?.loading;
export const selectBusinessCircleError = (state) => state.businessCircle?.error;

export default businessCircleSlice.reducer;
