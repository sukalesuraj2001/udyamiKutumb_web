import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// ─────────────────────────────────────────────
// Async Thunk — API call here, not in component
// ─────────────────────────────────────────────
export const fetchWardMap = createAsyncThunk(
  "wardMap/fetchWardMap",
  async (wardNumber, { getState, rejectWithValue }) => {
    try {
      // Token — from your existing auth slice in Redux
      const token = getState().auth.token;

      // const wardStr = wardNumber.toLowerCase().startsWith("ward")
      //   ? wardNumber
      //   : `ward ${wardNumber}`;

      // const url = `/ward/map/${encodeURIComponent(wardStr)}`;

      const url = `/ward/map/${encodeURIComponent(wardNumber.trim())}`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const json = await res.json();

      if (!res.ok) {
        return rejectWithValue(json.message || `Server error ${res.status}`);
      }
      if (!json.success) {
        return rejectWithValue(json.message || "Failed to load ward");
      }

      return json.data; // GeoJSON FeatureCollection
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

// ─────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────
const wardMapSlice = createSlice({
  name: "wardMap",
  initialState: {
    geoJson: null,       // Full GeoJSON FeatureCollection from API
    loading: false,
    error: null,
  },
  reducers: {
    // Call this when user clicks "Clear & Reset"
    clearWardMap(state) {
      state.geoJson = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWardMap.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.geoJson = null;
      })
      .addCase(fetchWardMap.fulfilled, (state, action) => {
        state.loading = false;
        state.geoJson = action.payload;
      })
      .addCase(fetchWardMap.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearWardMap } = wardMapSlice.actions;

// Selectors
export const selectWardGeoJson  = (state) => state.wardMap.geoJson;
export const selectWardLoading  = (state) => state.wardMap.loading;
export const selectWardError    = (state) => state.wardMap.error;

export default wardMapSlice.reducer;