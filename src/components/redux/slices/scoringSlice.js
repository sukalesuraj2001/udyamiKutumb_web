import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE = "https://udyami-circle-db.onrender.com";
// const API_BASE = "http://192.168.0.70:3000";

const authHeaders = (getState) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getState().auth.token}`,
});

// ── GET ───────────────────────────────────────────────────────────
export const fetchScoringWeights = createAsyncThunk(
  "scoring/fetchAll",
  async (_, { getState, rejectWithValue }) => {
    try {
      const res  = await fetch(`${API_BASE}/socring-weights/getAllScoringWeights`, {
        headers: authHeaders(getState),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Fetch failed");
      return data.data; // { weights: [...], bands: [...] }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── UPDATE weights ────────────────────────────────────────────────
export const updateScoringWeights = createAsyncThunk(
  "scoring/updateWeights",
  async (weights, { getState, rejectWithValue }) => {
    try {
      const res  = await fetch(`${API_BASE}/socring-weights/updateScoringWeights`, {
        method:  "PUT",
        headers: authHeaders(getState),
        body:    JSON.stringify({ weights }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Update failed");
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── UPDATE bands ──────────────────────────────────────────────────
export const updateScoreBands = createAsyncThunk(
  "scoring/updateBands",
  async (bands, { getState, rejectWithValue }) => {
    try {
      const res  = await fetch(`${API_BASE}/socring-weights/updateScoreBands`, {
        method:  "PUT",
        headers: authHeaders(getState),
        body:    JSON.stringify({ bands }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Update failed");
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────
const scoringSlice = createSlice({
  name: "scoring",
  initialState: {
    weights:     [],
    bands:       [],
    fetchStatus: "idle",
    saveStatus:  "idle",
    error:       null,
  },
  reducers: {
    clearScoringError(state) { state.error = null; },
    resetSaveStatus(state)   { state.saveStatus = "idle"; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchScoringWeights.pending,   (state)         => { state.fetchStatus = "loading"; state.error = null; })
      .addCase(fetchScoringWeights.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        state.weights     = action.payload.weights ?? [];
        state.bands       = action.payload.bands   ?? [];
      })
      .addCase(fetchScoringWeights.rejected,  (state, action) => { state.fetchStatus = "failed"; state.error = action.payload; })

      .addCase(updateScoringWeights.pending,   (state)        => { state.saveStatus = "loading"; state.error = null; })
      .addCase(updateScoringWeights.fulfilled, (state)        => { state.saveStatus = "succeeded"; })
      .addCase(updateScoringWeights.rejected,  (state, action)=> { state.saveStatus = "failed"; state.error = action.payload; })

      .addCase(updateScoreBands.pending,   (state)            => { state.saveStatus = "loading"; state.error = null; })
      .addCase(updateScoreBands.fulfilled, (state)            => { state.saveStatus = "succeeded"; })
      .addCase(updateScoreBands.rejected,  (state, action)    => { state.saveStatus = "failed"; state.error = action.payload; });
  },
});

export const { clearScoringError, resetSaveStatus } = scoringSlice.actions;
export default scoringSlice.reducer;

export const selectWeights     = (s) => s.scoring.weights;
export const selectBands       = (s) => s.scoring.bands;
export const selectFetchStatus = (s) => s.scoring.fetchStatus;
export const selectSaveStatus  = (s) => s.scoring.saveStatus;
export const selectScoringError= (s) => s.scoring.error;