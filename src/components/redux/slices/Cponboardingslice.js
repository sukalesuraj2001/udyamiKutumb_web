import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE = "https://udyami-circle-db.onrender.com";

// ─── Reusable authenticated request helper ───────────────────────────────────
const authRequest = async (path, { method = "GET", token, body } = {}) => {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${path}`, options);
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Request failed");
  }
  return data;
};

// ─── API 4 : Get all submissions for Ward Chairman ────────────────────────────
export const fetchCpSubmissions = createAsyncThunk(
  "cpOnboarding/fetchCpSubmissions",
  async (userId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      return await authRequest(
        `/cp-on-boarding/getAllCPSubmittedDataCreatedBYWardChairman/${userId}`,
        { token }
      );
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ─── API 6 : Approve / Reject submission ─────────────────────────────────────
export const updateSubmissionStatus = createAsyncThunk(
  "cpOnboarding/updateSubmissionStatus",
  async ({ submissionId, userId, status }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      return await authRequest("/cp-on-boarding/update-status", {
        method: "PATCH",
        token,
        body: { submissionId, userId, status },
      });
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────
const cpOnboardingSlice = createSlice({
  name: "cpOnboarding",
  initialState: {
    submissions: [],       // API 4 list
    fetchStatus: "idle",   // idle | loading | succeeded | failed
    fetchError: null,

    updateStatus: "idle",  // idle | loading | succeeded | failed
    updateError: null,
  },
  reducers: {
    // Reset update state after modal close
    resetUpdateStatus(state) {
      state.updateStatus = "idle";
      state.updateError = null;
    },
  },
  extraReducers: (builder) => {
    // ── Fetch submissions ──────────────────────────────────────────
    builder
      .addCase(fetchCpSubmissions.pending, (state) => {
        state.fetchStatus = "loading";
        state.fetchError = null;
      })
      .addCase(fetchCpSubmissions.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        // API may return data inside action.payload.data or action.payload.submissions
        state.submissions = action.payload.data ?? action.payload.submissions ?? [];
      })
      .addCase(fetchCpSubmissions.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.fetchError = action.payload || "Failed to fetch submissions";
      });

    // ── Update status ──────────────────────────────────────────────
    builder
      .addCase(updateSubmissionStatus.pending, (state) => {
        state.updateStatus = "loading";
        state.updateError = null;
      })
      .addCase(updateSubmissionStatus.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";

        // Optimistically update the submission in local list
        const updated = action.meta.arg; // { submissionId, status }
        state.submissions = state.submissions.map((sub) =>
          sub._id === updated.submissionId || sub.submissionId === updated.submissionId
            ? { ...sub, status: updated.status }
            : sub
        );
      })
      .addCase(updateSubmissionStatus.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.updateError = action.payload || "Failed to update status";
      });
  },
});

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectSubmissions   = (state) => state.cpOnboarding.submissions;
export const selectFetchStatus   = (state) => state.cpOnboarding.fetchStatus;
export const selectFetchError    = (state) => state.cpOnboarding.fetchError;
export const selectUpdateStatus  = (state) => state.cpOnboarding.updateStatus;
export const selectUpdateError   = (state) => state.cpOnboarding.updateError;

export const { resetUpdateStatus } = cpOnboardingSlice.actions;
export default cpOnboardingSlice.reducer;