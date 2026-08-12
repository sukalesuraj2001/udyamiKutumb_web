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

// ═════════════════════════════════════════════════════════════════════════════
//  Cloud Patra Channel Partner APIs
// ═════════════════════════════════════════════════════════════════════════════

// ─── CP-1 : Get All Applications by Ward ─────────────────────────────────────
export const fetchCloudPatraApplicationsByWard = createAsyncThunk(
  "cpOnboarding/fetchCloudPatraApplicationsByWard",
  async (wardId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      return await authRequest(
        `/cloud-patra/getAllApplicationsByWard/${wardId}`,
        { token }
      );
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ─── CP-2 : Update Application Status (Ward Chairman) ────────────────────────
export const updateCloudPatraApplicationStatus = createAsyncThunk(
  "cpOnboarding/updateCloudPatraApplicationStatus",
  async ({ applicationId, userId, status, rejectionReason }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      return await authRequest(
        `/cloud-patra/updateStatusOfApplications/${applicationId}/status`,
        {
          method: "PATCH",
          token,
          body: { userId, status, rejectionReason },
        }
      );
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ─── CP-3 : Schedule Interview (Ward Chairman) ────────────────────────────────
export const scheduleCloudPatraInterview = createAsyncThunk(
  "cpOnboarding/scheduleCloudPatraInterview",
  async (interviewPayload, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      return await authRequest(
        `/cloud-patra/scheduleInterviewByWardChairman/interviews`,
        {
          method: "POST",
          token,
          body: interviewPayload,
        }
      );
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ─── CP-4 : Get All Interviews Scheduled by Ward Chairman ────────────────────
export const fetchCloudPatraInterviewsByWardChairman = createAsyncThunk(
  "cpOnboarding/fetchCloudPatraInterviewsByWardChairman",
  async (wardChairmanUserId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      return await authRequest(
        `/cloud-patra/getAllScheduleInterviewBy/${wardChairmanUserId}`,
        { token }
      );
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ─── CP-5 : Update Interview Status ──────────────────────────────────────────
export const updateCloudPatraInterviewStatus = createAsyncThunk(
  "cpOnboarding/updateCloudPatraInterviewStatus",
  async ({ interviewId, userId, status, ...rest }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      return await authRequest(
        `/cloud-patra/updateInterviewStatus/${interviewId}`,
        {
          method: "PATCH",
          token,
          body: { userId, status, ...rest },
        }
      );
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ─── CP-6 : Get All Channel Partners by Ward ─────────────────────────────────
// Ward la register aana CP list — CpTable top panel-ku use aagum
export const fetchChannelPartnersByWard = createAsyncThunk(
  "cpOnboarding/fetchChannelPartnersByWard",
  async (wardId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      return await authRequest(
        `/auth/getAllChannelPartners?wardId=${wardId}`,
        { token }
      );
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ─── CP-7 : Get CP Submitted Forms by CP User ID ─────────────────────────────
// Oru CP click panna avanga submit pannirukka ALL forms — multiple irukum
export const fetchCpSubmittedDataByUserId = createAsyncThunk(
  "cpOnboarding/fetchCpSubmittedDataByUserId",
  async (cpUserId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      return await authRequest(
        `/cp-on-boarding/getCPSubmittedData/${cpUserId}`,
        { token }
      );
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ─── CP-8 : Update Survey Status by Ward Chairman ───────────────────────────
export const updateSurveyStatusByWardChairman = createAsyncThunk(
  "cpOnboarding/updateSurveyStatusByWardChairman",
  async ({ surveyId, wardChairmanId, status, rejectionReason }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      return await authRequest(
        `/cp-on-boarding/updateSurveyStatusByWardChairman/${surveyId}`,
        {
          method: "PATCH",
          token,
          body: { wardChairmanId, status, rejectionReason },
        }
      );
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ═════════════════════════════════════════════════════════════════════════════
//  SLICE
// ═════════════════════════════════════════════════════════════════════════════
const cpOnboardingSlice = createSlice({
  name: "cpOnboarding",
  initialState: {
    // ── Existing ────────────────────────────────────────────────────────────
    submissions: [],
    fetchStatus: "idle",
    fetchError: null,
    updateStatus: "idle",
    updateError: null,

    // ── Cloud Patra Applications ─────────────────────────────────────────────
    cpApplications: [],
    cpApplicationsStatus: "idle",
    cpApplicationsError: null,

    cpAppUpdateStatus: "idle",
    cpAppUpdateError: null,

    // ── Cloud Patra Interviews ───────────────────────────────────────────────
    cpInterviews: [],
    cpInterviewsStatus: "idle",
    cpInterviewsError: null,

    cpScheduleStatus: "idle",
    cpScheduleError: null,

    cpInterviewUpdateStatus: "idle",
    cpInterviewUpdateError: null,

    // ── CP-6 : Channel Partners list by Ward ────────────────────────────────
    cpPartnerList: [],
    cpPartnerListStatus: "idle",   // idle | loading | succeeded | failed
    cpPartnerListError: null,

    // ── CP-7 : Submitted forms for a selected CP ────────────────────────────
    // Multiple forms — array of form objects
    selectedCpForms: [],
    selectedCpFormsStatus: "idle",
    selectedCpFormsError: null,
  },

  reducers: {
    // Existing reset
    resetUpdateStatus(state) {
      state.updateStatus = "idle";
      state.updateError = null;
    },
    // Cloud Patra resets
    resetCpAppUpdateStatus(state) {
      state.cpAppUpdateStatus = "idle";
      state.cpAppUpdateError = null;
    },
    resetCpScheduleStatus(state) {
      state.cpScheduleStatus = "idle";
      state.cpScheduleError = null;
    },
    resetCpInterviewUpdateStatus(state) {
      state.cpInterviewUpdateStatus = "idle";
      state.cpInterviewUpdateError = null;
    },
    // Clear selected CP forms when user deselects / unmounts CpTable
    clearSelectedCpForms(state) {
      state.selectedCpForms = [];
      state.selectedCpFormsStatus = "idle";
      state.selectedCpFormsError = null;
    },
  },

  extraReducers: (builder) => {

    // ── Existing: Fetch submissions ──────────────────────────────────────────
    builder
      .addCase(fetchCpSubmissions.pending, (state) => {
        state.fetchStatus = "loading";
        state.fetchError = null;
      })
      .addCase(fetchCpSubmissions.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        state.submissions =
          action.payload.data ?? action.payload.submissions ?? [];
      })
      .addCase(fetchCpSubmissions.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.fetchError = action.payload || "Failed to fetch submissions";
      });

    // ── Existing: Update submission status ───────────────────────────────────
    builder
      .addCase(updateSubmissionStatus.pending, (state) => {
        state.updateStatus = "loading";
        state.updateError = null;
      })
      .addCase(updateSubmissionStatus.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        const updated = action.meta.arg;
        state.submissions = state.submissions.map((sub) =>
          sub._id === updated.submissionId ||
          sub.submissionId === updated.submissionId
            ? { ...sub, status: updated.status }
            : sub
        );
      })
      .addCase(updateSubmissionStatus.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.updateError = action.payload || "Failed to update status";
      });

    // ── CP-1 : Fetch Cloud Patra Applications by Ward ────────────────────────
    builder
      .addCase(fetchCloudPatraApplicationsByWard.pending, (state) => {
        state.cpApplicationsStatus = "loading";
        state.cpApplicationsError = null;
      })
      .addCase(fetchCloudPatraApplicationsByWard.fulfilled, (state, action) => {
        state.cpApplicationsStatus = "succeeded";
        const res = action.payload;
        if (Array.isArray(res)) {
          state.cpApplications = res;
        } else if (Array.isArray(res?.data)) {
          state.cpApplications = res.data;
        } else if (Array.isArray(res?.applications)) {
          state.cpApplications = res.applications;
        } else if (Array.isArray(res?.data?.applications)) {
          state.cpApplications = res.data.applications;
        } else {
          state.cpApplications = res?.data ?? res?.applications ?? [];
        }
      })
      .addCase(fetchCloudPatraApplicationsByWard.rejected, (state, action) => {
        state.cpApplicationsStatus = "failed";
        state.cpApplicationsError =
          action.payload || "Failed to fetch applications";
      });

    // ── CP-2 : Update Application Status ─────────────────────────────────────
    builder
      .addCase(updateCloudPatraApplicationStatus.pending, (state) => {
        state.cpAppUpdateStatus = "loading";
        state.cpAppUpdateError = null;
      })
      .addCase(updateCloudPatraApplicationStatus.fulfilled, (state, action) => {
        state.cpAppUpdateStatus = "succeeded";
        const { applicationId, status } = action.meta.arg;
        state.cpApplications = state.cpApplications.map((app) =>
          app.applicationId === applicationId || app._id === applicationId
            ? { ...app, status }
            : app
        );
      })
      .addCase(updateCloudPatraApplicationStatus.rejected, (state, action) => {
        state.cpAppUpdateStatus = "failed";
        state.cpAppUpdateError =
          action.payload || "Failed to update application status";
      });

    // ── CP-3 : Schedule Interview ─────────────────────────────────────────────
    builder
      .addCase(scheduleCloudPatraInterview.pending, (state) => {
        state.cpScheduleStatus = "loading";
        state.cpScheduleError = null;
      })
      .addCase(scheduleCloudPatraInterview.fulfilled, (state, action) => {
        state.cpScheduleStatus = "succeeded";
        const newInterview =
          action.payload.data ?? action.payload.interview ?? null;
        if (newInterview) {
          state.cpInterviews.unshift(newInterview);
        }
      })
      .addCase(scheduleCloudPatraInterview.rejected, (state, action) => {
        state.cpScheduleStatus = "failed";
        state.cpScheduleError =
          action.payload || "Failed to schedule interview";
      });

    // ── CP-4 : Fetch Interviews by Ward Chairman ──────────────────────────────
    builder
      .addCase(fetchCloudPatraInterviewsByWardChairman.pending, (state) => {
        state.cpInterviewsStatus = "loading";
        state.cpInterviewsError = null;
      })
      .addCase(
        fetchCloudPatraInterviewsByWardChairman.fulfilled,
        (state, action) => {
          state.cpInterviewsStatus = "succeeded";
          state.cpInterviews =
            action.payload.data ?? action.payload.interviews ?? [];
        }
      )
      .addCase(
        fetchCloudPatraInterviewsByWardChairman.rejected,
        (state, action) => {
          state.cpInterviewsStatus = "failed";
          state.cpInterviewsError =
            action.payload || "Failed to fetch interviews";
        }
      );

    // ── CP-5 : Update Interview Status ────────────────────────────────────────
    builder
      .addCase(updateCloudPatraInterviewStatus.pending, (state) => {
        state.cpInterviewUpdateStatus = "loading";
        state.cpInterviewUpdateError = null;
      })
      .addCase(updateCloudPatraInterviewStatus.fulfilled, (state, action) => {
        state.cpInterviewUpdateStatus = "succeeded";
        const { interviewId, status } = action.meta.arg;
        state.cpInterviews = state.cpInterviews.map((iv) =>
          iv.interviewId === interviewId || iv._id === interviewId
            ? { ...iv, status }
            : iv
        );
      })
      .addCase(updateCloudPatraInterviewStatus.rejected, (state, action) => {
        state.cpInterviewUpdateStatus = "failed";
        state.cpInterviewUpdateError =
          action.payload || "Failed to update interview status";
      });

    // ── CP-6 : Fetch Channel Partners by Ward ─────────────────────────────────
    builder
      .addCase(fetchChannelPartnersByWard.pending, (state) => {
        state.cpPartnerListStatus = "loading";
        state.cpPartnerListError = null;
      })
      .addCase(fetchChannelPartnersByWard.fulfilled, (state, action) => {
        state.cpPartnerListStatus = "succeeded";
        const res = action.payload;
        // Backend response shape flexible-a handle pannrom
        if (Array.isArray(res)) {
          state.cpPartnerList = res;
        } else if (Array.isArray(res?.data)) {
          state.cpPartnerList = res.data;
        } else if (Array.isArray(res?.channelPartners)) {
          state.cpPartnerList = res.channelPartners;
        } else if (Array.isArray(res?.data?.channelPartners)) {
          state.cpPartnerList = res.data.channelPartners;
        } else {
          state.cpPartnerList = res?.data ?? res?.partners ?? [];
        }
      })
      .addCase(fetchChannelPartnersByWard.rejected, (state, action) => {
        state.cpPartnerListStatus = "failed";
        state.cpPartnerListError =
          action.payload || "Failed to fetch channel partners";
      });

    // ── CP-7 : Fetch Submitted Forms by CP User ID ────────────────────────────
    builder
      .addCase(fetchCpSubmittedDataByUserId.pending, (state) => {
        state.selectedCpFormsStatus = "loading";
        state.selectedCpFormsError = null;
        state.selectedCpForms = []; // Clear previous CP's forms
      })
      .addCase(fetchCpSubmittedDataByUserId.fulfilled, (state, action) => {
        state.selectedCpFormsStatus = "succeeded";
        const res = action.payload;
        // Multiple forms irukum — flexible shape handling
        if (Array.isArray(res)) {
          state.selectedCpForms = res;
        } else if (Array.isArray(res?.data)) {
          state.selectedCpForms = res.data;
        } else if (Array.isArray(res?.forms)) {
          state.selectedCpForms = res.forms;
        } else if (Array.isArray(res?.submissions)) {
          state.selectedCpForms = res.submissions;
        } else if (Array.isArray(res?.data?.forms)) {
          state.selectedCpForms = res.data.forms;
        } else {
          state.selectedCpForms = [];
        }
      })
      .addCase(fetchCpSubmittedDataByUserId.rejected, (state, action) => {
        state.selectedCpFormsStatus = "failed";
        state.selectedCpFormsError =
          action.payload || "Failed to fetch CP submitted forms";
      });

    // ── CP-8 : Update Survey Status by Ward Chairman ──────────────────────────
    builder
      .addCase(updateSurveyStatusByWardChairman.pending, (state) => {
        state.surveyUpdateStatus = "loading";
        state.surveyUpdateError = null;
      })
      .addCase(updateSurveyStatusByWardChairman.fulfilled, (state, action) => {
        state.surveyUpdateStatus = "succeeded";
        const { surveyId, status } = action.meta.arg;
        state.selectedCpForms = state.selectedCpForms.map((form) => {
          const id = form.surveyId ?? form._id ?? form.formId ?? form.submissionId;
          return id === surveyId ? { ...form, status } : form;
        });
      })
      .addCase(updateSurveyStatusByWardChairman.rejected, (state, action) => {
        state.surveyUpdateStatus = "failed";
        state.surveyUpdateError =
          action.payload || "Failed to update survey status";
      });
  },
});

// ═════════════════════════════════════════════════════════════════════════════
//  SELECTORS
// ═════════════════════════════════════════════════════════════════════════════

// Existing selectors
export const selectSubmissions  = (state) => state.cpOnboarding.submissions;
export const selectFetchStatus  = (state) => state.cpOnboarding.fetchStatus;
export const selectFetchError   = (state) => state.cpOnboarding.fetchError;
export const selectUpdateStatus = (state) => state.cpOnboarding.updateStatus;
export const selectUpdateError  = (state) => state.cpOnboarding.updateError;

// Cloud Patra Application selectors
export const selectCpApplications       = (state) => state.cpOnboarding.cpApplications;
export const selectCpApplicationsStatus = (state) => state.cpOnboarding.cpApplicationsStatus;
export const selectCpApplicationsError  = (state) => state.cpOnboarding.cpApplicationsError;
export const selectCpAppUpdateStatus    = (state) => state.cpOnboarding.cpAppUpdateStatus;
export const selectCpAppUpdateError     = (state) => state.cpOnboarding.cpAppUpdateError;

// Cloud Patra Interview selectors
export const selectCpInterviews            = (state) => state.cpOnboarding.cpInterviews;
export const selectCpInterviewsStatus      = (state) => state.cpOnboarding.cpInterviewsStatus;
export const selectCpInterviewsError       = (state) => state.cpOnboarding.cpInterviewsError;
export const selectCpScheduleStatus        = (state) => state.cpOnboarding.cpScheduleStatus;
export const selectCpScheduleError         = (state) => state.cpOnboarding.cpScheduleError;
export const selectCpInterviewUpdateStatus = (state) => state.cpOnboarding.cpInterviewUpdateStatus;
export const selectCpInterviewUpdateError  = (state) => state.cpOnboarding.cpInterviewUpdateError;

// CP-6 : Channel Partners list selectors
export const selectCpPartnerList       = (state) => state.cpOnboarding.cpPartnerList;
export const selectCpPartnerListStatus = (state) => state.cpOnboarding.cpPartnerListStatus;
export const selectCpPartnerListError  = (state) => state.cpOnboarding.cpPartnerListError;

// CP-7 : Selected CP's submitted forms selectors
export const selectSelectedCpForms       = (state) => state.cpOnboarding.selectedCpForms;
export const selectSelectedCpFormsStatus = (state) => state.cpOnboarding.selectedCpFormsStatus;
export const selectSelectedCpFormsError  = (state) => state.cpOnboarding.selectedCpFormsError;

// CP-8 : Survey update selectors
export const selectSurveyUpdateStatus    = (state) => state.cpOnboarding.surveyUpdateStatus;
export const selectSurveyUpdateError     = (state) => state.cpOnboarding.surveyUpdateError;

// ─── Actions ──────────────────────────────────────────────────────────────────
export const {
  resetUpdateStatus,
  resetCpAppUpdateStatus,
  resetCpScheduleStatus,
  resetCpInterviewUpdateStatus,
  resetSurveyUpdateStatus,
  clearSelectedCpForms,
} = cpOnboardingSlice.actions;

export default cpOnboardingSlice.reducer;