import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../service/api.js";

/* ── Map API shape → HeadTable shape ───────────────────────── */
const mapUser = (u) => ({
  name:      u.name,
  email:     u.email,
  mobile:    u.mobileNumber,
  state:     u.state,
  district:  u.districtName,
  taluk:     u.talukaName,
  wardHobli: u.wardName,
  status:    u.status ?? "active",
});

/* ── Single thunk — role as argument ───────────────────────── */
export const fetchHeadsByRole = createAsyncThunk(
  "head/fetchByRole",
  async (role, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await api.get(`/ward/usersByRole?role=${role}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { role, users: response.data.data };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || `Failed to fetch ${role}`
      );
    }
  }
);

/* ── Single slice — role-keyed data ────────────────────────── */
const headSlice = createSlice({
  name: "head",
  initialState: {
    // { [role]: { data, loading, error } }
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHeadsByRole.pending, (state, action) => {
        const role = action.meta.arg;
        state[role] = { data: [], loading: true, error: null, ...state[role], loading: true, error: null };
      })
      .addCase(fetchHeadsByRole.fulfilled, (state, action) => {
        const { role, users } = action.payload;
        state[role] = { data: users.map(mapUser), loading: false, error: null };
      })
      .addCase(fetchHeadsByRole.rejected, (state, action) => {
        const role = action.meta.arg;
        state[role] = { data: [], loading: false, error: action.payload };
      });
  },
});

export default headSlice.reducer;