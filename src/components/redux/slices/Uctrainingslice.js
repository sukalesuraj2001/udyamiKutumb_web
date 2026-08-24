import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE = "https://backend.udyamikutumba.com";
// const API_BASE = "http://192.168.0.70:3000";

// ── Auth header helper ────────────────────────────────────────────────────────
const authHeaders = (getState) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getState().auth.token}`,
});

// ── Async thunks ──────────────────────────────────────────────────────────────

export const fetchAllTrainings = createAsyncThunk(
  "ucTraining/fetchAll",
  async (_, { getState, rejectWithValue }) => {
    try {
      const res  = await fetch(`${API_BASE}/uc-training/getAllTrainings`, {
        headers: authHeaders(getState),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Fetch failed");
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createTraining = createAsyncThunk(
  "ucTraining/create",
  async ({ ytLink, createdUserId }, { getState, rejectWithValue }) => {
    try {
      const res  = await fetch(`${API_BASE}/uc-training/createUCTrainings`, {
        method:  "POST",
        headers: authHeaders(getState),
        body:    JSON.stringify({ ytLink, createdUserId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Create failed");
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteTraining = createAsyncThunk(
  "ucTraining/delete",
  async (id, { getState, rejectWithValue }) => {
    try {
      const res  = await fetch(`${API_BASE}/uc-training/deleteUCTRainings/${id}`, {
        method:  "DELETE",
        headers: authHeaders(getState),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Delete failed");
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────
const initialState = {
  trainings:    [],
  fetchStatus:  "idle",
  createStatus: "idle",
  deleteStatus: "idle",
  error:        null,
};

const ucTrainingSlice = createSlice({
  name: "ucTraining",
  initialState,
  reducers: {
    clearUCError(state)       { state.error = null; },
    resetCreateStatus(state)  { state.createStatus = "idle"; },
  },
  extraReducers: (builder) => {

    // fetchAll
    builder
      .addCase(fetchAllTrainings.pending,   (state)          => { state.fetchStatus = "loading";   state.error = null; })
      .addCase(fetchAllTrainings.fulfilled, (state, action)  => {
        state.fetchStatus = "succeeded";
        state.trainings   = action.payload.data ?? action.payload.trainings ?? [];
      })
      .addCase(fetchAllTrainings.rejected,  (state, action)  => { state.fetchStatus = "failed";    state.error = action.payload; });

    // create
    builder
      .addCase(createTraining.pending,   (state)         => { state.createStatus = "loading";  state.error = null; })
      .addCase(createTraining.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        const newItem = action.payload.data ?? action.payload.training;
        if (newItem) state.trainings.unshift(newItem);
      })
      .addCase(createTraining.rejected,  (state, action) => { state.createStatus = "failed";   state.error = action.payload; });

    // delete
    builder
      .addCase(deleteTraining.pending,   (state)         => { state.deleteStatus = "loading";  state.error = null; })
      .addCase(deleteTraining.fulfilled, (state, action) => {
        state.deleteStatus = "succeeded";
        state.trainings    = state.trainings.filter((t) => t.id !== action.payload);
      })
      .addCase(deleteTraining.rejected,  (state, action) => { state.deleteStatus = "failed";   state.error = action.payload; });
  },
});

export const { clearUCError, resetCreateStatus } = ucTrainingSlice.actions;
export default ucTrainingSlice.reducer;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectTrainings    = (state) => state.ucTraining.trainings;
export const selectFetchStatus  = (state) => state.ucTraining.fetchStatus;
export const selectCreateStatus = (state) => state.ucTraining.createStatus;
export const selectDeleteStatus = (state) => state.ucTraining.deleteStatus;
export const selectUCError      = (state) => state.ucTraining.error;