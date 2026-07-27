import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../service/api.js";

// ─── Thunk 1: Upload CSV ──────────────────────────────────────────────────────
// Payload: file, userId, channel, templateId?, scheduledAt?

export const uploadCsvCampaign = createAsyncThunk(
    "sendMessage/uploadCsvCampaign",
    async ({ file, userId, channel, templateId, scheduledAt }, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.token;

            const formData = new FormData();
            formData.append("file", file);
            formData.append("userId", userId);

            // ── New required fields ──────────────────────────────────────
            if (channel) formData.append("channel", channel);          // e.g. "EMAIL"
            if (templateId) formData.append("templateId", templateId);       // UUID
            if (scheduledAt) formData.append("scheduledAt", scheduledAt);      // ISO 8601
            // ─────────────────────────────────────────────────────────────

            const response = await api.post("/bulk-campagin/upload", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            return response.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(
                err.response?.data?.message || "CSV upload failed"
            );
        }
    }
);

// ─── Thunk 2: Fetch uploaded CSV rows by userId ───────────────────────────────

export const fetchUploadedCsvData = createAsyncThunk(
    "sendMessage/fetchUploadedCsvData",
    async (userId, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.token;
            const response = await api.get(
                `/bulk-campagin/getUploadedCsvDat/${userId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(
                err.response?.data?.message || "Failed to fetch CSV data"
            );
        }
    }
);

export const fetchCampaignCounts = createAsyncThunk(
    "sendMessage/fetchCampaignCounts",
    async (userId, thunkAPI) => {
        const token = thunkAPI.getState().auth.token;
        const get = (status) =>
            api.get(
                `/bulk-campagin/getAllCampaigns?adminStatus=${status}&page=1&limit=1`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
        const [pend, inProg, comp] = await Promise.all([
            get("PENDING"),
            get("IN_PROGRESS"),
            get("COMPLETED"),
        ]);
        return {
            pendingCount: pend.data?.totalRecords ?? 0,
            inProgressCount: inProg.data?.totalRecords ?? 0,
            completedCount: comp.data?.totalRecords ?? 0,
        };
    }
);

// ─── Thunk 3: Admin – fetch all CSV uploads (with status filter + pagination) ─

export const fetchAllCsvUploads = createAsyncThunk(
    "sendMessage/fetchAllCsvUploads",
    async ({ status = "PENDING", page = 1, limit = 10 } = {}, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.token;
            const response = await api.get(
                `/bulk-campagin/getAllUploadedCsvData?status=${status}&page=${page}&limit=${limit}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return { ...response.data, requestedStatus: status };
        } catch (err) {
            return thunkAPI.rejectWithValue(
                err.response?.data?.message || "Failed to fetch all CSV uploads"
            );
        }
    }
);

// ─── Thunk 5: SuperAdmin – fetch counts per status for a userId ───────────────

// export const fetchUserCsvStats = createAsyncThunk(
//     "sendMessage/fetchUserCsvStats",
//     async (userId, thunkAPI) => {
//         try {
//             const token = thunkAPI.getState().auth.token;
//             const get = (status) =>
//                 api.get(
//                     `/bulk-campagin/getAllUploadedCsvData?status=${status}&page=1&limit=1`,
//                     { headers: { Authorization: `Bearer ${token}` } }
//                 );

//             const [pendRes, schedRes, successRes] = await Promise.all([
//                 get("PENDING"),
//                 // get("SCHEDULED"),
//                 get("APPROVED"),
//             ]);

//             return {
//                 pendingCount: pendRes.data?.totalRecords ?? 0,
//                 scheduledCount: schedRes.data?.totalRecords ?? 0,
//                 successCount: successRes.data?.totalRecords ?? 0,
//             };
//         } catch (err) {
//             return thunkAPI.rejectWithValue(
//                 err.response?.data?.message || "Failed to fetch CSV stats"
//             );
//         }
//     }
// );

// ─── Thunk 6: SuperAdmin – fetch table rows for a userId (paginated) ──────────

export const fetchUserCsvTable = createAsyncThunk(
    "sendMessage/fetchUserCsvTable",
    async ({ userId, adminStatus = "PENDING", page = 1, limit = 10 } = {}, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.token;
            const response = await api.get(
                `/bulk-campagin/getAllCampaigns?adminStatus=${adminStatus}&page=${page}&limit=${limit}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("RAW API response:", JSON.stringify(response.data, null, 2));
            return { ...response.data, requestedStatus: adminStatus };
        } catch (err) {
            return thunkAPI.rejectWithValue(
                err.response?.data?.message || "Failed to fetch CSV table"
            );
        }
    }
);

// ─── Thunk 4: Admin – review (approve / reject) CSV upload records ────────────

export const reviewCsvUploads = createAsyncThunk(
    "sendMessage/reviewCsvUploads",
    async ({ campaignId, status, remark }, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.token;
            const adminUserId = thunkAPI.getState().auth.user?.userId;

            const payload = { campaignId, adminUserId, status, remark };
            console.log("📦 Review Payload:", payload);   // ← இதை பாரு
            console.log("adminUserId:", adminUserId);
            const response = await api.patch(
                "/bulk-campagin/reviewMemberCampagin",
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return { ...response.data, reviewedId: campaignId, reviewedStatus: status };
        } catch (err) {
            console.error("❌ API Error:", err.response?.data); // ← actual error பாரு
            return thunkAPI.rejectWithValue(
                err.response?.data?.message || "Review submission failed"
            );
        }
    }
);
// ─── Initial State ────────────────────────────────────────────────────────────

const initialState = {
    // Upload
    uploadResult: {
        totalRecords: 0,
        successCount: 0,
        failedCount: 0,
        failedEmailCount: 0,
        failedMobileCount: 0,
        dataInserted: 0,
        failedRecords: [],
        message: "",
    },
    csvFile: null,
    uploadStatus: "idle",
    uploadError: null,

    // CSV table data (member view)
    csvRows: [],
    csvTotal: 0,
    csvDataStatus: "idle",
    csvDataError: null,

    // Admin – all uploads list
    adminRows: [],
    adminTotal: 0,
    adminCurrentPage: 1,
    adminTotalPages: 1,
    adminStatus: "idle",
    adminError: null,

    // Admin – pending count for badge
    pendingCount: 0,
    approvedCount: 0,

    // SuperAdmin – SendCampaign section stat cards
    userCsvStats: { pendingCount: 0, scheduledCount: 0, successCount: 0 },
    userCsvStatsStatus: "idle",

    // SuperAdmin – SendCampaign section table
    userCsvRows: [],
    userCsvTotal: 0,
    userCsvCurrentPage: 1,
    userCsvTotalPages: 1,
    userCsvTableStatus: "idle",
    userCsvTableError: null,

    // Admin – review action
    reviewStatus: "idle",
    reviewError: null,
    lastReviewedIds: [],
    lastReviewedStatus: null,
    userCsvStats: { pendingCount: 0, inProgressCount: 0, completedCount: 0 },
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const sendMessageSlice = createSlice({
    name: "sendMessage",
    initialState,
    reducers: {
        setCsvFile(state, action) {
            state.csvFile = action.payload;
            state.uploadResult = initialState.uploadResult;
            state.uploadStatus = "idle";
            state.uploadError = null;
            state.csvDataError = null;
        },
        clearCsv(state) {
            state.csvFile = null;
            state.uploadResult = initialState.uploadResult;
            state.uploadStatus = "idle";
            state.uploadError = null;
            state.csvDataError = null;
        },
        clearUploadError(state) {
            state.uploadError = null;
        },
        clearCsvDataError(state) {
            state.csvDataError = null;
        },
        clearReviewState(state) {
            state.reviewStatus = "idle";
            state.reviewError = null;
            state.lastReviewedIds = [];
            state.lastReviewedStatus = null;
        },
        setPendingCount(state, action) {
            state.pendingCount = action.payload;
        },
        setApprovedCount(state, action) {
            state.approvedCount = action.payload;
        },
    },

    extraReducers: (builder) => {

        // ── Upload ──
        builder
            .addCase(uploadCsvCampaign.pending, (state) => {
                state.uploadStatus = "loading";
                state.uploadError = null;
            })
            .addCase(uploadCsvCampaign.fulfilled, (state, action) => {
                state.uploadStatus = "succeeded";
                const {
                    message, totalRecords = 0, successCount = 0,
                    failedCount = 0, failedEmailCount = 0,
                    failedMobileCount = 0, dataInserted = 0, failedRecords = [],
                } = action.payload;
                state.uploadResult = {
                    message, totalRecords, successCount, failedCount,
                    failedEmailCount, failedMobileCount, dataInserted, failedRecords,
                };
            })
            .addCase(uploadCsvCampaign.rejected, (state, action) => {
                state.uploadStatus = "failed";
                state.uploadError = action.payload || "Something went wrong";
            });

        // ── Fetch CSV rows (member) ──
        builder
            .addCase(fetchUploadedCsvData.pending, (state) => {
                state.csvDataStatus = "loading";
                state.csvDataError = null;
            })
            .addCase(fetchUploadedCsvData.fulfilled, (state, action) => {
                state.csvDataStatus = "succeeded";
                state.csvRows = action.payload.data || [];
                state.csvTotal = action.payload.totalRecords || 0;
            })
            .addCase(fetchUploadedCsvData.rejected, (state, action) => {
                state.csvDataStatus = "failed";
                state.csvDataError = action.payload || "Failed to load CSV data";
            });

        // ── Fetch all uploads (admin) ──
        builder
            .addCase(fetchAllCsvUploads.pending, (state) => {
                state.adminStatus = "loading";
                state.adminError = null;
            })
            .addCase(fetchAllCsvUploads.fulfilled, (state, action) => {
                state.adminStatus = "succeeded";
                state.adminRows = action.payload.data || [];
                state.adminTotal = action.payload.totalRecords || 0;
                state.adminCurrentPage = action.payload.currentPage || 1;
                state.adminTotalPages = action.payload.totalPages || 1;

                if (action.payload.requestedStatus === "PENDING") {
                    state.pendingCount = action.payload.totalRecords || 0;
                }
                if (action.payload.requestedStatus === "APPROVED") {
                    state.approvedCount = action.payload.totalRecords || 0;
                }
            })
            .addCase(fetchAllCsvUploads.rejected, (state, action) => {
                state.adminStatus = "failed";
                state.adminError = action.payload || "Failed to load admin uploads";
            });

        // ── User CSV stats (SuperAdmin SendCampaign cards) ──
        builder
        // .addCase(fetchUserCsvStats.pending, (state) => {
        //     state.userCsvStatsStatus = "loading";
        // })
        // .addCase(fetchUserCsvStats.fulfilled, (state, action) => {
        //     state.userCsvStatsStatus = "succeeded";
        //     state.userCsvStats = action.payload;
        //     state.pendingCount = action.payload.pendingCount;
        //     state.approvedCount = action.payload.successCount;
        // })
        // .addCase(fetchUserCsvStats.rejected, (state) => {
        //     state.userCsvStatsStatus = "failed";
        // });

        // ── User CSV table (SuperAdmin SendCampaign table) ──
        builder
            .addCase(fetchUserCsvTable.pending, (state) => {
                state.userCsvTableStatus = "loading";
                state.userCsvTableError = null;
            })
            .addCase(fetchUserCsvTable.fulfilled, (state, action) => {
                state.userCsvTableStatus = "succeeded";
                state.userCsvRows = action.payload.data || [];
                state.userCsvTotal = action.payload.totalRecords || 0;
                state.userCsvCurrentPage = action.payload.currentPage || 1;
                state.userCsvTotalPages = action.payload.totalPages || 1;

                // Update stat count for the requested tab
                const count = action.payload.totalRecords || 0;
                const status = action.payload.requestedStatus;
                if (status === "PENDING") state.userCsvStats.pendingCount = count;
                if (status === "IN_PROGRESS") state.userCsvStats.inProgressCount = count;
                if (status === "COMPLETED") state.userCsvStats.completedCount = count;
            })
            .addCase(fetchUserCsvTable.rejected, (state, action) => {
                state.userCsvTableStatus = "failed";
                state.userCsvTableError = action.payload || "Failed to load table";
            });

        // ── Review uploads (admin) ──
        builder
            .addCase(reviewCsvUploads.pending, (state) => {
                state.reviewStatus = "loading";
                state.reviewError = null;
            })
            .addCase(reviewCsvUploads.fulfilled, (state, action) => {
                state.reviewStatus = "succeeded";
                state.lastReviewedIds = action.payload.reviewedIds || [];
                state.lastReviewedStatus = action.payload.reviewedStatus || null;

                const reviewed = new Set(action.payload.reviewedIds || []);
                state.adminRows = state.adminRows.filter((r) => !reviewed.has(r.uploadId));
                state.adminTotal = Math.max(0, state.adminTotal - reviewed.size);

                if (
                    action.payload.reviewedStatus === "APPROVED" ||
                    action.payload.reviewedStatus === "REJECTED"
                ) {
                    state.pendingCount = Math.max(0, state.pendingCount - reviewed.size);
                }
                if (action.payload.reviewedStatus === "APPROVED") {
                    state.approvedCount = state.approvedCount + reviewed.size;
                }
            })
            .addCase(reviewCsvUploads.rejected, (state, action) => {
                state.reviewStatus = "failed";
                state.reviewError = action.payload || "Review failed";
            });
        builder
            .addCase(fetchCampaignCounts.pending, (state) => {
                state.userCsvStatsStatus = "loading";
            })
            .addCase(fetchCampaignCounts.fulfilled, (state, action) => {
                state.userCsvStatsStatus = "succeeded";
                state.userCsvStats = action.payload;
            })
            .addCase(fetchCampaignCounts.rejected, (state) => {
                state.userCsvStatsStatus = "failed";
            });
    },
});

// ─── Actions ──────────────────────────────────────────────────────────────────

export const {
    setCsvFile, clearCsv, clearUploadError, clearCsvDataError,
    clearReviewState, setPendingCount, setApprovedCount,
} = sendMessageSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

// Member upload selectors
export const selectUploadResult = (state) => state.sendMessage.uploadResult;
export const selectUploadStatus = (state) => state.sendMessage.uploadStatus;
export const selectUploadError = (state) => state.sendMessage.uploadError;
export const selectCsvFile = (state) => state.sendMessage.csvFile;
export const selectIsUploading = (state) => state.sendMessage.uploadStatus === "loading";
export const selectCsvRows = (state) => state.sendMessage.csvRows;
export const selectCsvTotal = (state) => state.sendMessage.csvTotal;
export const selectCsvDataStatus = (state) => state.sendMessage.csvDataStatus;
export const selectCsvDataError = (state) => state.sendMessage.csvDataError;
export const selectIsFetchingCsv = (state) => state.sendMessage.csvDataStatus === "loading";

// Admin selectors
export const selectAdminRows = (state) => state.sendMessage.adminRows;
export const selectAdminTotal = (state) => state.sendMessage.adminTotal;
export const selectAdminCurrentPage = (state) => state.sendMessage.adminCurrentPage;
export const selectAdminTotalPages = (state) => state.sendMessage.adminTotalPages;
export const selectAdminStatus = (state) => state.sendMessage.adminStatus;
export const selectAdminError = (state) => state.sendMessage.adminError;
export const selectIsAdminLoading = (state) => state.sendMessage.adminStatus === "loading";
export const selectPendingCount = (state) => state.sendMessage.pendingCount;
export const selectApprovedCount = (state) => state.sendMessage.approvedCount;

// SuperAdmin SendCampaign section selectors
export const selectUserCsvStats = (state) => state.sendMessage.userCsvStats;
export const selectUserCsvStatsStatus = (state) => state.sendMessage.userCsvStatsStatus;
export const selectUserCsvRows = (state) => state.sendMessage.userCsvRows;
export const selectUserCsvTotal = (state) => state.sendMessage.userCsvTotal;
export const selectUserCsvCurrentPage = (state) => state.sendMessage.userCsvCurrentPage;
export const selectUserCsvTotalPages = (state) => state.sendMessage.userCsvTotalPages;
export const selectUserCsvTableStatus = (state) => state.sendMessage.userCsvTableStatus;
export const selectUserCsvTableError = (state) => state.sendMessage.userCsvTableError;
export const selectIsUserCsvTableLoading = (state) => state.sendMessage.userCsvTableStatus === "loading";

// Review selectors
export const selectReviewStatus = (state) => state.sendMessage.reviewStatus;
export const selectReviewError = (state) => state.sendMessage.reviewError;
export const selectLastReviewedIds = (state) => state.sendMessage.lastReviewedIds;
export const selectLastReviewedStatus = (state) => state.sendMessage.lastReviewedStatus;
export const selectIsReviewing = (state) => state.sendMessage.reviewStatus === "loading";

// ─── Reducer ──────────────────────────────────────────────────────────────────

export default sendMessageSlice.reducer;