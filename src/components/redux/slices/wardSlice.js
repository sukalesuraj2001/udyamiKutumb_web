import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE = "http://localhost:3000";
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
        `${API_BASE}/talukas/district/${districtId}`,
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

/** Fetch the paginated ward list for the Member Map table */
export const fetchWards = createAsyncThunk(
  "ward/fetchWards",
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;

      const query = new URLSearchParams();
      query.set("page", params.page ?? 1);
      query.set("limit", params.limit ?? 10);
      if (params.search?.trim()) query.set("search", params.search.trim());
      if (params.district) query.set("district", params.district);
      if (params.taluka) query.set("taluka", params.taluka);

      const res = await fetch(`${API_BASE}/ward/getAllWards?${query.toString()}`, {
        headers: authHeader(token),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to fetch wards");

      return {
        rows: data.data || [],
        totalRecords: data.totalRecords || 0,
        totalPages: data.totalPages || 1,
        currentPage: data.currentPage || 1,
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** Fetch a single ward (View / Edit) */
export const fetchWardById = createAsyncThunk(
  "ward/fetchWardById",
  async (wardId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const res = await fetch(`${API_BASE}/ward/${wardId}`, {
        headers: authHeader(token),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to fetch ward");
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** Update an existing ward (PATCH /ward/:wardId) */
export const updateWard = createAsyncThunk(
  "ward/updateWard",
  async ({ wardId, values }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;

      const body = {
        wardName: values.wardName,
        wardNumber: values.wardNumber,
        district: values.district,
        taluka: values.taluka,
        whatsappGroup: values.whatsappGroup || null,
        geofencingLat:
          values.geofencingLat === "" || values.geofencingLat === null || values.geofencingLat === undefined
            ? null
            : Number(values.geofencingLat),
        geofencingLang:
          values.geofencingLang === "" || values.geofencingLang === null || values.geofencingLang === undefined
            ? null
            : Number(values.geofencingLang),
      };

      if (values.talukaId) body.talukaId = values.talukaId;

      const res = await fetch(`${API_BASE}/ward/${wardId}`, {
        method: "PATCH",
        headers: { ...authHeader(token), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to update ward");
      return data.data;
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

      // wardData = { wardName, wardNumber, districtId, talukaId,
      //              whatsappGroup, geofencingLat, geofencingLang, geoJsonFile }
      const formData = new FormData();
      formData.append("wardName", wardData.wardName);
      formData.append("wardNumber", wardData.wardNumber);
      formData.append("districtId", wardData.districtId);
      formData.append("talukaId", wardData.talukaId);

      if (wardData.whatsappGroup) {
        formData.append("whatsappGroup", wardData.whatsappGroup);
      }
      if (wardData.geofencingLat !== "" && wardData.geofencingLat != null) {
        formData.append("geofencingLat", wardData.geofencingLat);
      }
      if (wardData.geofencingLang !== "" && wardData.geofencingLang != null) {
        formData.append("geofencingLang", wardData.geofencingLang);
      }
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

  // ── Member Map ward table ──
  wards: [],
  wardsTotalRecords: 0,
  wardsTotalPages: 1,
  wardsPage: 1,
  loadingWards: false,
  wardsError: null,

  // Single ward (View / Edit)
  selectedWard: null,
  loadingWard: false,
  wardError: null,

  // Update
  updating: false,
  updateError: null,
  updateSuccess: false,
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
      state.updating = false;
      state.updateError = null;
      state.updateSuccess = false;
    },
    clearWardErrors(state) {
      state.districtError = null;
      state.talukaError = null;
      state.createError = null;
      state.wardsError = null;
      state.wardError = null;
      state.updateError = null;
    },
    clearSelectedWard(state) {
      state.selectedWard = null;
      state.wardError = null;
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

    // ── fetchWards (table) ──────────────────────────────────────────────────
    builder
      .addCase(fetchWards.pending, (state) => {
        state.loadingWards = true;
        state.wardsError = null;
      })
      .addCase(fetchWards.fulfilled, (state, action) => {
        state.loadingWards = false;
        state.wards = action.payload.rows;
        state.wardsTotalRecords = action.payload.totalRecords;
        state.wardsTotalPages = action.payload.totalPages;
        state.wardsPage = action.payload.currentPage;
      })
      .addCase(fetchWards.rejected, (state, action) => {
        state.loadingWards = false;
        state.wardsError = action.payload || "Failed to load wards";
      });

    // ── fetchWardById ───────────────────────────────────────────────────────
    builder
      .addCase(fetchWardById.pending, (state) => {
        state.loadingWard = true;
        state.wardError = null;
      })
      .addCase(fetchWardById.fulfilled, (state, action) => {
        state.loadingWard = false;
        state.selectedWard = action.payload;
      })
      .addCase(fetchWardById.rejected, (state, action) => {
        state.loadingWard = false;
        state.wardError = action.payload || "Failed to load ward";
      });

    // ── updateWard ──────────────────────────────────────────────────────────
    builder
      .addCase(updateWard.pending, (state) => {
        state.updating = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updateWard.fulfilled, (state, action) => {
        state.updating = false;
        state.updateSuccess = true;
        state.selectedWard = action.payload;
        state.wards = state.wards.map((w) =>
          w.wardId === action.payload.wardId ? { ...w, ...action.payload } : w
        );
      })
      .addCase(updateWard.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload || "Failed to update ward";
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

export const selectWards            = (state) => state.ward.wards;
export const selectWardsTotalRecords = (state) => state.ward.wardsTotalRecords;
export const selectWardsTotalPages  = (state) => state.ward.wardsTotalPages;
export const selectLoadingWards     = (state) => state.ward.loadingWards;
export const selectWardsError       = (state) => state.ward.wardsError;
export const selectSelectedWard     = (state) => state.ward.selectedWard;
export const selectLoadingWard      = (state) => state.ward.loadingWard;
export const selectUpdating         = (state) => state.ward.updating;
export const selectUpdateError      = (state) => state.ward.updateError;
export const selectUpdateSuccess    = (state) => state.ward.updateSuccess;

export const { resetWardForm, clearWardErrors, clearSelectedWard } = wardSlice.actions;
export default wardSlice.reducer;