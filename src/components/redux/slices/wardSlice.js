import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE = "https://backend.udyamikutumba.com";
// const API_BASE = "http://192.168.0.70:3000";

// ─── Helpers ────────────────────────────────────────────────────────────────

const authHeader = (token) => ({
  Authorization: `Bearer ${token}`,
});

// ─── Thunks ─────────────────────────────────────────────────────────────────

/** Fetch all districts */
export const fetchDistricts = createAsyncThunk(
  "ward/fetchDistricts",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const res = await fetch(`${API_BASE}/district/getAllDistricts`, {
        headers: authHeader(token),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to fetch districts");
      return data.data || [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** Fetch talukas under a specific district */
export const fetchTalukasByDistrict = createAsyncThunk(
  "ward/fetchTalukasByDistrict",
  async (districtId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const res = await fetch(
        `${API_BASE}/district/getAllDistricts?districtId=${districtId}`,
        { headers: authHeader(token) }
      );
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to fetch talukas");
      return data.data || [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** Create a new ward (multipart/form-data) */
export const createWard = createAsyncThunk(
  "ward/createWard",
  async (wardData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;

      // wardData = { wardName, wardNumber, districtId, talukaId, geoJsonFile }
      const formData = new FormData();
      formData.append("wardName", wardData.wardName);
      formData.append("wardNumber", wardData.wardNumber);
      formData.append("districtId", wardData.districtId);
      formData.append("talukaId", wardData.talukaId);
      if (wardData.geoJsonFile) {
        formData.append("geoJsonFile", wardData.geoJsonFile);
      }

      const res = await fetch(`${API_BASE}/ward/create`, {
        method: "POST",
        headers: authHeader(token), // NOTE: don't set Content-Type — browser sets boundary automatically
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to create ward");
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const initialState = {
  // District & Taluka lists
  districts: [],
  talukas: [],

  // Loading states (granular — each action has its own flag)
  loadingDistricts: false,
  loadingTalukas: false,
  creating: false,

  // Errors
  districtError: null,
  talukaError: null,
  createError: null,

  // Success flag — component can watch this to show toast / redirect
  createSuccess: false,

  // The newly created ward returned from API
  createdWard: null,
};

const wardSlice = createSlice({
  name: "ward",
  initialState,
  reducers: {
    /** Call this when you leave the Create Ward page to reset form-related state */
    resetWardForm(state) {
      state.talukas = [];
      state.creating = false;
      state.createError = null;
      state.createSuccess = false;
      state.createdWard = null;
    },
    clearWardErrors(state) {
      state.districtError = null;
      state.talukaError = null;
      state.createError = null;
    },
  },
  extraReducers: (builder) => {
    // ── fetchDistricts ──────────────────────────────────────────────────────
    builder
      .addCase(fetchDistricts.pending, (state) => {
        state.loadingDistricts = true;
        state.districtError = null;
      })
      .addCase(fetchDistricts.fulfilled, (state, action) => {
        state.loadingDistricts = false;
        state.districts = action.payload;
      })
      .addCase(fetchDistricts.rejected, (state, action) => {
        state.loadingDistricts = false;
        state.districtError = action.payload || "Failed to load districts";
      });

    // ── fetchTalukasByDistrict ──────────────────────────────────────────────
    builder
      .addCase(fetchTalukasByDistrict.pending, (state) => {
        state.loadingTalukas = true;
        state.talukaError = null;
        state.talukas = []; // clear previous talukas when district changes
      })
      .addCase(fetchTalukasByDistrict.fulfilled, (state, action) => {
        state.loadingTalukas = false;
        state.talukas = action.payload;
      })
      .addCase(fetchTalukasByDistrict.rejected, (state, action) => {
        state.loadingTalukas = false;
        state.talukaError = action.payload || "Failed to load talukas";
      });

    // ── createWard ──────────────────────────────────────────────────────────
    builder
      .addCase(createWard.pending, (state) => {
        state.creating = true;
        state.createError = null;
        state.createSuccess = false;
      })
      .addCase(createWard.fulfilled, (state, action) => {
        state.creating = false;
        state.createSuccess = true;
        state.createdWard = action.payload;
      })
      .addCase(createWard.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload || "Failed to create ward";
      });
  },
});

// ─── Selectors ───────────────────────────────────────────────────────────────

export const selectDistricts       = (state) => state.ward.districts;
export const selectTalukas         = (state) => state.ward.talukas;
export const selectLoadingDistricts = (state) => state.ward.loadingDistricts;
export const selectLoadingTalukas  = (state) => state.ward.loadingTalukas;
export const selectCreating        = (state) => state.ward.creating;
export const selectCreateSuccess   = (state) => state.ward.createSuccess;
export const selectCreateError     = (state) => state.ward.createError;
export const selectCreatedWard     = (state) => state.ward.createdWard;

export const { resetWardForm, clearWardErrors } = wardSlice.actions;
export default wardSlice.reducer;