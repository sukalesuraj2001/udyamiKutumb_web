import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../service/api.js";
import { ROLES } from "../../utils/roles.js";

/* ── Map API shape → HeadTable shape ───────────────────────── */
const mapUser = (u) => ({
  name:     u.name,
  email:    u.email,
  mobile:   u.mobileNumber,
  state:    u.state,
  district: u.districtName,
  status:   u.status ?? "active",
});

/* ── Async Thunk ────────────────────────────────────────────── */
export const fetchDistrictHeads = createAsyncThunk(
  "districtHead/fetchDistrictHeads",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      console.log("TOKEN →", token);          
      console.log("AUTH STATE →", thunkAPI.getState().auth); 
      const response = await api.get(`/ward/usersByRole?role=${ROLES.DISTRICT_HEAD}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (err) {
      console.error("API ERROR →", err);    
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch district heads"
      );
    }
  }
);

/* ── Slice ──────────────────────────────────────────────────── */
const districtHeadSlice = createSlice({
  name: "districtHead",
  initialState: {
    data:    [],
    loading: false,
    error:   null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDistrictHeads.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchDistrictHeads.fulfilled, (state, action) => {
        state.loading = false;
        state.data    = action.payload.data.map(mapUser);
      })
      .addCase(fetchDistrictHeads.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });
  },
});

export default districtHeadSlice.reducer;