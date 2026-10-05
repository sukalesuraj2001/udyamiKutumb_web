import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE = "https://backend.udyamikutumba.com";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const authRequest = async (path, method = "GET", body = null, token) => {
  const opts = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

/** GET /jobs/getAllJobs?page=1&limit=10&search=&city= */
export const fetchJobs = createAsyncThunk(
  "jobs/fetchJobs",
  async ({ page = 1, limit = 20, search = "", city = "" } = {}, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const params = new URLSearchParams({ page, limit });
      if (search) params.set("search", search);
      if (city)   params.set("city", city);
      return await authRequest(`/jobs/getAllJobs?${params}`, "GET", null, token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** POST /jobs/createJob */
export const createJob = createAsyncThunk(
  "jobs/createJob",
  async (payload, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      return await authRequest("/jobs/createJob", "POST", payload, token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** PATCH /jobs/updateJob/:jobId */
export const updateJob = createAsyncThunk(
  "jobs/updateJob",
  async (payload, { getState, rejectWithValue }) => {
    try {
      const { id, jobId, ...body } = payload;
      const targetId = jobId || id;
      const token = getState().auth.token;
      return await authRequest(`/jobs/updateJob/${targetId}`, "PATCH", body, token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** DELETE /jobs/deleteJob/:jobId */
export const deleteJob = createAsyncThunk(
  "jobs/deleteJob",
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      await authRequest(`/jobs/deleteJob/${id}`, "DELETE", null, token);
      return id; // return id so we can remove from state
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const getAllJobs = fetchJobs;

// ─── Slice ────────────────────────────────────────────────────────────────────
const jobSlice = createSlice({
  name: "jobs",
  initialState: {
    items: [],
    total: 0,
    page: 1,
    status: "idle",   // idle | loading | succeeded | failed
    error: null,
    actionStatus: "idle", // for create/update/delete ops
    actionError: null,
  },
  reducers: {
    clearJobError(state) {
      state.error = null;
      state.actionError = null;
    },
    resetActionStatus(state) {
      state.actionStatus = "idle";
      state.actionError = null;
    },
  },
  extraReducers: (builder) => {
    // ── fetchJobs ──
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Support both { data: [...] } and { jobs: [...] } response shapes
        const payload = action.payload;
        state.items = payload?.data ?? payload?.jobs ?? payload?.result ?? [];
        state.total = payload?.total ?? state.items.length;
        state.page  = payload?.page  ?? 1;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to load jobs";
      });

    // ── createJob ──
    builder
      .addCase(createJob.pending, (state) => {
        state.actionStatus = "loading";
        state.actionError = null;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        const newJob = action.payload?.data ?? action.payload?.job ?? action.payload;
        if (newJob?.id) state.items.unshift(newJob);
        state.total += 1;
      })
      .addCase(createJob.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.actionError = action.payload || "Failed to create job";
      });

    // ── updateJob ──
    builder
      .addCase(updateJob.pending, (state) => {
        state.actionStatus = "loading";
        state.actionError = null;
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        const updated = action.payload?.data ?? action.payload?.job ?? action.payload;
        if (updated?.id) {
          const idx = state.items.findIndex((j) => j.id === updated.id);
          if (idx !== -1) state.items[idx] = updated;
        }
      })
      .addCase(updateJob.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.actionError = action.payload || "Failed to update job";
      });

    // ── deleteJob ──
    builder
      .addCase(deleteJob.pending, (state) => {
        state.actionStatus = "loading";
        state.actionError = null;
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        state.items = state.items.filter((j) => j.id !== action.payload);
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(deleteJob.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.actionError = action.payload || "Failed to delete job";
      });
  },
});

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectJobs          = (state) => state.jobs.items;
export const selectJobsTotal     = (state) => state.jobs.total;
export const selectJobsStatus    = (state) => state.jobs.status;
export const selectJobsError     = (state) => state.jobs.error;
export const selectJobActionStatus = (state) => state.jobs.actionStatus;
export const selectJobActionError  = (state) => state.jobs.actionError;

export const { clearJobError, resetActionStatus } = jobSlice.actions;
export default jobSlice.reducer;