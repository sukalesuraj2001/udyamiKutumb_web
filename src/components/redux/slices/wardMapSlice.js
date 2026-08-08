import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../service/api.js";

// ─────────────────────────────────────────────
// Helper — parse features by level
// ─────────────────────────────────────────────
const separateLayers = (featureCollection) => {
  const features = featureCollection?.features || [];

  const districtFeatures = features.filter(
    (f) => f.properties?.level === "district"
  );
  const talukaFeatures = features.filter(
    (f) => f.properties?.level === "taluka"
  );
  const wardFeatures = features.filter(
    (f) => f.properties?.level === "ward"
  );

  // 1) Standalone business features in top-level features array
  const topLevelBusinesses = features.filter(
    (f) =>
      f.geometry?.type === "Point" &&
      (f.properties?.level === "business" ||
        f.properties?.businessName ||
        f.properties?.ownerName)
  );

  // 2) Businesses nested inside ward / taluka / district feature properties
  const nestedBusinesses = [];
  features.forEach((f) => {
    const bizList = f.properties?.businesses || f.businesses;
    if (Array.isArray(bizList)) {
      bizList.forEach((b) => {
        const geom = b.geometry || (b.latitude && b.longitude ? { type: "Point", coordinates: [Number(b.longitude), Number(b.latitude)] } : null);
        if (geom && geom.type === "Point" && Array.isArray(geom.coordinates)) {
          const props = b.properties ? { ...b.properties } : { ...b };
          delete props.geometry;
          nestedBusinesses.push({
            type: "Feature",
            geometry: geom,
            properties: props,
          });
        }
      });
    }
  });

  // Combine and deduplicate businesses
  const combined = [...topLevelBusinesses, ...nestedBusinesses];
  const seen = new Set();
  const businessFeatures = combined.filter((b) => {
    const props = b.properties || {};
    const key = props.profileId || props._id || props.registrationNumber || (b.geometry?.coordinates ? `${b.geometry.coordinates[0]}_${b.geometry.coordinates[1]}_${props.businessName}` : Math.random());
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const toFC = (arr) => ({ type: "FeatureCollection", features: arr });

  return {
    districtGeo: toFC(districtFeatures),
    talukaGeos: toFC(talukaFeatures),
    wardGeos: toFC(wardFeatures),
    businesses: businessFeatures,
    raw: featureCollection,
  };
};

// ─────────────────────────────────────────────
// Thunk — single fetch, handles all roles
// payload: { name: string, type: "district" | "taluka" | "ward" }
// ─────────────────────────────────────────────
export const fetchWardMap = createAsyncThunk(
  "wardMap/fetchWardMap",
  async (payload, { getState, rejectWithValue }) => {
    try {
      let name = "";
      let type = "ward";

      if (typeof payload === "string") {
        name = payload;
      } else if (payload && typeof payload === "object") {
        name = payload.name || "";
        type = payload.type || "ward";
      }

      name = name.trim();
      if (!name) return rejectWithValue("Location name is required");

      const token = getState().auth.token;
      const res = await api.get(`/ward/map/${encodeURIComponent(name)}`, {
        params: { type },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.data.success) throw new Error(res.data.message || "Failed");

      const layers = separateLayers(res.data.data);
      return { ...layers, type };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Network error"
      );
    }
  }
);

// ─────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────
const wardMapSlice = createSlice({
  name: "wardMap",
  initialState: {
    // Raw single-layer (ward head legacy)
    geoJson: null,

    // Parsed layers
    districtGeo: null,   // FeatureCollection — district polygon
    talukaGeos: null,    // FeatureCollection — all taluka polygons
    wardGeos: null,      // FeatureCollection — all ward polygons
    businesses: [],      // Point features array

    fetchType: null,     // "district" | "taluka" | "ward"
    loading: false,
    error: null,
  },
  reducers: {
    clearWardMap(state) {
      state.geoJson = null;
      state.districtGeo = null;
      state.talukaGeos = null;
      state.wardGeos = null;
      state.businesses = [];
      state.fetchType = null;
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
        state.districtGeo = null;
        state.talukaGeos = null;
        state.wardGeos = null;
        state.businesses = [];
      })
      .addCase(fetchWardMap.fulfilled, (state, action) => {
        state.loading = false;
        state.fetchType = action.payload.type;
        state.geoJson = action.payload.raw;
        state.districtGeo = action.payload.districtGeo;
        state.talukaGeos = action.payload.talukaGeos;
        state.wardGeos = action.payload.wardGeos;
        state.businesses = action.payload.businesses;
      })
      .addCase(fetchWardMap.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearWardMap } = wardMapSlice.actions;

// ── Selectors ──
export const selectWardGeoJson   = (state) => state.wardMap.geoJson;
export const selectDistrictGeo   = (state) => state.wardMap.districtGeo;
export const selectTalukaGeos    = (state) => state.wardMap.talukaGeos;
export const selectWardGeos      = (state) => state.wardMap.wardGeos;
export const selectBusinesses    = (state) => state.wardMap.businesses;
export const selectFetchType     = (state) => state.wardMap.fetchType;
export const selectWardLoading   = (state) => state.wardMap.loading;
export const selectWardError     = (state) => state.wardMap.error;

export default wardMapSlice.reducer;