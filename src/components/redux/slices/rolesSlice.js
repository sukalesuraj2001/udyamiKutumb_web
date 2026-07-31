import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../service/api.js";

export const fetchRoles = createAsyncThunk(
  "roles/fetchRoles",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const res = await api.get("/roles/getAllRoles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch roles");
    }
  }
);

// ── Full payload object- directly accept  ──────────────────────────
// district_head  → { userId, roleId, type, districtId, assignedBy }
// taluka_head    → { userId, roleId, type, districtHeadId, talukaIds[], assignedBy }
// ward_chairman  → { userId, roleId, type, talukaHeadId[], talukaId, wardId, assignedBy }
export const assignRole = createAsyncThunk(
  "roles/assignRole",
  async (payload, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const res = await api.post("/roles/assignRole", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { userId: payload.userId, message: res.data.message };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to assign role");
    }
  }
);

const rolesSlice = createSlice({
  name: "roles",
  initialState: {
    roles: [],
    loadingRoles: false,
    assigning: false,
    assignSuccessId: null,
    error: null,
  },
  reducers: {
    clearAssignSuccess(state) { state.assignSuccessId = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => { state.loadingRoles = true; state.error = null; })
      .addCase(fetchRoles.fulfilled, (state, action) => { state.loadingRoles = false; state.roles = action.payload; })
      .addCase(fetchRoles.rejected, (state, action) => { state.loadingRoles = false; state.error = action.payload; })

      .addCase(assignRole.pending, (state) => { state.assigning = true; state.error = null; })
      .addCase(assignRole.fulfilled, (state, action) => { state.assigning = false; state.assignSuccessId = action.payload.userId; })
      .addCase(assignRole.rejected, (state, action) => { state.assigning = false; state.error = action.payload; });
  },
});

export const { clearAssignSuccess } = rolesSlice.actions;
export default rolesSlice.reducer;