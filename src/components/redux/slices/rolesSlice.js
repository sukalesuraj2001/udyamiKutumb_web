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

// ── Register a new employee — POST /auth/createUser ─────────────────────────
// Body: { name, email, mobileNumber, password }
// Returns { success, message, data: user } where `data.userId` is the new
// user's UUID — that's what gets fed straight into assignRole below.
// The backend also creates an empty profile and grants the default `member`
// role; the hierarchy role is layered on top by POST /roles/assign-role.
export const registerEmployee = createAsyncThunk(
  "roles/registerEmployee",
  async (payload, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const res = await api.post(
        "/auth/createUser",
        {
          name: payload.name?.trim(),
          email: payload.email?.trim(),
          mobileNumber: payload.mobileNumber?.trim(),
          password: payload.password,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(getApiErrorMessage(err));
    }
  }
);

// ── Every position system-wide — GET /roles/all-positions (super_admin only) ─
// Each row: { positionId, role, district, taluka, ward, currentHolder }
// with currentHolder === null when the seat is vacant. This is the only
// place the backend exposes "is this district/taluka/ward already taken",
// so the Register Employee dropdowns cross-reference it rather than looking
// for a holder field on the geography list endpoints (they don't have one).
export const fetchAllPositions = createAsyncThunk(
  "roles/fetchAllPositions",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const res = await api.get("/roles/all-positions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data || [];
    } catch (err) {
      return thunkAPI.rejectWithValue(getApiErrorMessage(err));
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

    // ── Register Employee ──
    registering: false,
    registeredUser: null,
    registerError: null,

    // ── Position occupancy (vacancy lookup) ──
    positions: [],
    loadingPositions: false,
    positionsError: null,
  },
  reducers: {
    clearAssignSuccess(state) { state.assignSuccessId = null; },
    clearChangeSuccess(state) { state.changeSuccessId = null; },
    clearChangeError(state) { state.changeError = null; },
    clearRegisterState(state) {
      state.registering = false;
      state.registeredUser = null;
      state.registerError = null;
    },
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
      .addCase(changeRole.rejected, (state, action) => { state.changing = false; state.changeError = action.payload; })

      .addCase(registerEmployee.pending, (state) => { state.registering = true; state.registerError = null; state.registeredUser = null; })
      .addCase(registerEmployee.fulfilled, (state, action) => { state.registering = false; state.registeredUser = action.payload; })
      .addCase(registerEmployee.rejected, (state, action) => { state.registering = false; state.registerError = action.payload; })

      .addCase(fetchAllPositions.pending, (state) => { state.loadingPositions = true; state.positionsError = null; })
      .addCase(fetchAllPositions.fulfilled, (state, action) => { state.loadingPositions = false; state.positions = action.payload; })
      .addCase(fetchAllPositions.rejected, (state, action) => { state.loadingPositions = false; state.positionsError = action.payload; });
  },
});

export const { clearAssignSuccess, clearChangeSuccess, clearChangeError, clearRegisterState } = rolesSlice.actions;
export default rolesSlice.reducer;
