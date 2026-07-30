import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE = "https://udyami-circle-db.onrender.com";
// const API_BASE = "http://192.168.0.70:3000";

const authHeaders = (getState) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getState().auth.token}`,
});

export const fetchSectors = createAsyncThunk(
  "taxonomy/fetchSectors",
  async (_, { getState, rejectWithValue }) => {
    try {
      const res  = await fetch(`${API_BASE}/sector/getAllSectors`, {
        headers: authHeaders(getState),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Fetch failed");
      return data; // { counts, data: sectors[] }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const taxonomySlice = createSlice({
  name: "taxonomy",
  initialState: {
    sectors:     [],
    counts:      { totalSectorCount: 0, totalSubSectorCount: 0, totalTagCount: 0 },
    fetchStatus: "idle",
    error:       null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSectors.pending,   (state)         => { state.fetchStatus = "loading"; state.error = null; })
      .addCase(fetchSectors.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        state.sectors     = action.payload.data   ?? [];
        state.counts      = action.payload.counts ?? state.counts;
      })
      .addCase(fetchSectors.rejected,  (state, action) => { state.fetchStatus = "failed"; state.error = action.payload; });
  },
});

export default taxonomySlice.reducer;

export const selectSectors     = (s) => s.taxonomy.sectors;
export const selectCounts      = (s) => s.taxonomy.counts;
export const selectFetchStatus = (s) => s.taxonomy.fetchStatus;
export const selectTaxonomyError = (s) => s.taxonomy.error;