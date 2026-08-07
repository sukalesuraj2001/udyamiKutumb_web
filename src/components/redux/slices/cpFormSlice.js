// redux/slices/cpFormSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE = "https://udyami-circle-db.onrender.com";

// ── Thunks ────────────────────────────────────────────────────────────────────

export const createCpForm = createAsyncThunk(
    "cpForm/createForm",
    async (
        { token, userId, title, description, channelPartnerId, businessName, formSchema, isActive },
        { rejectWithValue }
    ) => {
        try {
            const res = await fetch(`${API_BASE}/cp-on-boarding/create-form`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    userId,
                    title,
                    description,
                    channelPartnerId,   // ← new
                    businessName,       // ← new
                    formSchema,
                    isActive,
                }),
            });
            const data = await res.json();
            if (!res.ok || data.success === false) throw new Error(data.message || "Failed to save form");
            return data;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

export const fetchChannelPartnersByWard = createAsyncThunk(
    "cpForm/fetchByWard",
    async ({ token, ward }, { rejectWithValue }) => {
        try {
            const res = await fetch(
                `${API_BASE}/cp-on-boarding/channel-partners/ward/${encodeURIComponent(ward)}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            if (!res.ok || data.success === false) throw new Error(data.message || "Failed to fetch partners");
            return data.data; // array of channel partners
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const cpFormSlice = createSlice({
    name: "cpForm",
    initialState: {
        // form save
        saveStatus: "idle",       // "idle" | "loading" | "success" | "error"
        saveError: null,

        // channel partners
        partners: [],
        partnersStatus: "idle",   // "idle" | "loading" | "success" | "error"
        partnersError: null,
    },
    reducers: {
        resetSaveStatus: (state) => {
            state.saveStatus = "idle";
            state.saveError = null;
        },
        resetPartners: (state) => {
            state.partners = [];
            state.partnersStatus = "idle";
            state.partnersError = null;
        },
    },
    extraReducers: (builder) => {
        // createCpForm
        builder
            .addCase(createCpForm.pending, (state) => { state.saveStatus = "loading"; state.saveError = null; })
            .addCase(createCpForm.fulfilled, (state) => { state.saveStatus = "success"; })
            .addCase(createCpForm.rejected, (state, action) => { state.saveStatus = "error"; state.saveError = action.payload; });

        // fetchChannelPartnersByWard
        builder
            .addCase(fetchChannelPartnersByWard.pending, (state) => { state.partnersStatus = "loading"; state.partnersError = null; })
            .addCase(fetchChannelPartnersByWard.fulfilled, (state, action) => { state.partnersStatus = "success"; state.partners = action.payload; })
            .addCase(fetchChannelPartnersByWard.rejected, (state, action) => { state.partnersStatus = "error"; state.partnersError = action.payload; });
    },
});

export const { resetSaveStatus, resetPartners } = cpFormSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectSaveStatus = (state) => state.cpForm.saveStatus;
export const selectSaveError = (state) => state.cpForm.saveError;
export const selectPartners = (state) => state.cpForm.partners;
export const selectPartnersStatus = (state) => state.cpForm.partnersStatus;
export const selectPartnersError = (state) => state.cpForm.partnersError;

export default cpFormSlice.reducer;