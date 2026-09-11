import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../service/api.js";

// ── Shared API error → user-facing message mapping ──────────────────────────
// Prefers the server's own message when the backend sends one; otherwise
// falls back to a generic message per HTTP status code.
const getApiErrorMessage = (err) => {
  const status = err?.response?.status;
  const serverMessage = err?.response?.data?.message;
  if (serverMessage) return serverMessage;

  switch (status) {
    case 400:
      return "Required fields missing";
    case 403:
      return "You don't have permission";
    case 404:
      return "User or Position not found";
    case 409:
      return "Already assigned — use Change Person instead";
    default:
      return "Something went wrong. Please try again.";
  }
};

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

// ── Full payload objects — POST /roles/assign-role ───────────────────────────
// district_head                                    → { userId, type, districtId }
// taluka_head                                      → { userId, type, districtId, talukaId }
// ward_chairman                                    → { userId, type, talukaId, wardId }
// circle_leader / circle_president / vice_president
// / general_secretary / treasurer                  → { userId, type, wardId }
//
// NOTE: assignedBy is never sent from the frontend — the backend reads the
// caller's identity from the JWT (req.user) automatically.
export const assignRole = createAsyncThunk(
  "roles/assignRole",
  async (payload, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const res = await api.post("/roles/assign-role", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { userId: payload.userId, message: res.data.message };
    } catch (err) {
      return thunkAPI.rejectWithValue(getApiErrorMessage(err));
    }
  }
);

// ── Change who holds an existing seat — PUT /roles/change-role ──────────────
// Body: { positionId, newUserId }
export const changeRole = createAsyncThunk(
  "roles/changeRole",
  async (payload, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const res = await api.put("/roles/change-role", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { positionId: payload.positionId, message: res.data.message, data: res.data.data };
    } catch (err) {
      return thunkAPI.rejectWithValue(getApiErrorMessage(err));
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

    changing: false,
    changeSuccessId: null,
    changeError: null,
  },
  reducers: {
    clearAssignSuccess(state) { state.assignSuccessId = null; },
    clearChangeSuccess(state) { state.changeSuccessId = null; },
    clearChangeError(state) { state.changeError = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => { state.loadingRoles = true; state.error = null; })
      .addCase(fetchRoles.fulfilled, (state, action) => { state.loadingRoles = false; state.roles = action.payload; })
      .addCase(fetchRoles.rejected, (state, action) => { state.loadingRoles = false; state.error = action.payload; })

      .addCase(assignRole.pending, (state) => { state.assigning = true; state.error = null; })
      .addCase(assignRole.fulfilled, (state, action) => { state.assigning = false; state.assignSuccessId = action.payload.userId; })
      .addCase(assignRole.rejected, (state, action) => { state.assigning = false; state.error = action.payload; })

      .addCase(changeRole.pending, (state) => { state.changing = true; state.changeError = null; })
      .addCase(changeRole.fulfilled, (state, action) => { state.changing = false; state.changeSuccessId = action.payload.positionId; })
      .addCase(changeRole.rejected, (state, action) => { state.changing = false; state.changeError = action.payload; });
  },
});

export const { clearAssignSuccess, clearChangeSuccess, clearChangeError } = rolesSlice.actions;
export default rolesSlice.reducer;
