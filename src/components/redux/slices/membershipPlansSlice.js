import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../service/api.js";

// ── Fetch all plans ──────────────────────────────────────────────────────────
export const fetchMembershipPlans = createAsyncThunk(
  "membershipPlans/fetchAll",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const res = await api.get("/membership-purchase/membershipAllPlans", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data; // array of plans
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch plans");
    }
  }
);

// ── Create new plan ──────────────────────────────────────────────────────────
export const createMembershipPlan = createAsyncThunk(
  "membershipPlans/create",
  async (payload, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const res = await api.post("/membership-purchase/createMembershipPlans", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to create plan");
    }
  }
);

const membershipPlansSlice = createSlice({
  name: "membershipPlans",
  initialState: {
    list: [],
    loading: false,
    creating: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchMembershipPlans.pending,  (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchMembershipPlans.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchMembershipPlans.rejected,  (state, action) => { state.loading = false; state.error = action.payload; })

      // create
      .addCase(createMembershipPlan.pending,  (state) => { state.creating = true;  state.error = null; })
      .addCase(createMembershipPlan.fulfilled, (state, action) => { state.creating = false; state.list.push(action.payload); })
      .addCase(createMembershipPlan.rejected,  (state, action) => { state.creating = false; state.error = action.payload; });
  },
});

export default membershipPlansSlice.reducer;