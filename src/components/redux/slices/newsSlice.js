import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE = "https://udyami-circle-db.onrender.com";

// ─── Helper ───────────────────────────────────────────────────────────────────
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

/** GET /news/getAllNews?page=1&limit=10&category=Business&search=government&isFeatured=true */
export const getAllNews = createAsyncThunk(
  "news/getAllNews",
  async ({ page = 1, limit = 10, category = "", search = "", isFeatured = "" } = {}, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const params = new URLSearchParams({ page, limit });
      if (category && category !== "All") params.set("category", category);
      if (search) params.set("search", search);
      if (isFeatured !== "" && isFeatured !== null && isFeatured !== undefined) {
        params.set("isFeatured", String(isFeatured));
      }
      return await authRequest(`/news/getAllNews?${params}`, "GET", null, token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** GET /news/getFeaturedNews */
export const getFeaturedNews = createAsyncThunk(
  "news/getFeaturedNews",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      return await authRequest("/news/getFeaturedNews", "GET", null, token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** POST /news/createNews */
export const createNews = createAsyncThunk(
  "news/createNews",
  async (payload, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      return await authRequest("/news/createNews", "POST", payload, token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** PATCH /news/updateNews/:newsId */
export const updateNews = createAsyncThunk(
  "news/updateNews",
  async (payload, { getState, rejectWithValue }) => {
    try {
      const { newsId, id, _id, ...body } = payload;
      const targetId = newsId || id || _id;
      const token = getState().auth.token;
      return await authRequest(`/news/updateNews/${targetId}`, "PATCH", body, token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** DELETE /news/deleteNews/:newsId */
export const deleteNews = createAsyncThunk(
  "news/deleteNews",
  async (newsId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      await authRequest(`/news/deleteNews/${newsId}`, "DELETE", null, token);
      return newsId;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────
const newsSlice = createSlice({
  name: "news",
  initialState: {
    items: [],
    featuredItems: [],
    total: 0,
    page: 1,
    status: "idle",       // idle | loading | succeeded | failed
    error: null,
    actionStatus: "idle", // for create/update/delete ops
    actionError: null,
  },
  reducers: {
    clearNewsError(state) {
      state.error = null;
      state.actionError = null;
    },
    resetActionStatus(state) {
      state.actionStatus = "idle";
      state.actionError = null;
    },
  },
  extraReducers: (builder) => {
    // ── getAllNews ──
    builder
      .addCase(getAllNews.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getAllNews.fulfilled, (state, action) => {
        state.status = "succeeded";
        const payload = action.payload;
        state.items = payload?.data ?? payload?.news ?? payload?.result ?? (Array.isArray(payload) ? payload : []);
        state.total = payload?.total ?? state.items.length;
        state.page = payload?.page ?? 1;
      })
      .addCase(getAllNews.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to load news";
      });

    // ── getFeaturedNews ──
    builder
      .addCase(getFeaturedNews.fulfilled, (state, action) => {
        const payload = action.payload;
        state.featuredItems = payload?.data ?? payload?.news ?? payload?.result ?? (Array.isArray(payload) ? payload : []);
      });

    // ── createNews ──
    builder
      .addCase(createNews.pending, (state) => {
        state.actionStatus = "loading";
        state.actionError = null;
      })
      .addCase(createNews.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        const newItem = action.payload?.data ?? action.payload?.news ?? action.payload;
        if (newItem) state.items.unshift(newItem);
        state.total += 1;
      })
      .addCase(createNews.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.actionError = action.payload || "Failed to create news";
      });

    // ── updateNews ──
    builder
      .addCase(updateNews.pending, (state) => {
        state.actionStatus = "loading";
        state.actionError = null;
      })
      .addCase(updateNews.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        const updated = action.payload?.data ?? action.payload?.news ?? action.payload;
        if (updated) {
          const targetId = updated.newsId || updated.id || updated._id;
          const idx = state.items.findIndex(
            (n) => (n.newsId || n.id || n._id) === targetId
          );
          if (idx !== -1) state.items[idx] = updated;
        }
      })
      .addCase(updateNews.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.actionError = action.payload || "Failed to update news";
      });

    // ── deleteNews ──
    builder
      .addCase(deleteNews.pending, (state) => {
        state.actionStatus = "loading";
        state.actionError = null;
      })
      .addCase(deleteNews.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        state.items = state.items.filter(
          (n) => (n.newsId || n.id || n._id) !== action.payload
        );
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(deleteNews.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.actionError = action.payload || "Failed to delete news";
      });
  },
});

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectNews             = (state) => state.news.items;
export const selectFeaturedNews     = (state) => state.news.featuredItems;
export const selectNewsTotal        = (state) => state.news.total;
export const selectNewsStatus       = (state) => state.news.status;
export const selectNewsError        = (state) => state.news.error;
export const selectNewsActionStatus = (state) => state.news.actionStatus;
export const selectNewsActionError  = (state) => state.news.actionError;

export const { clearNewsError, resetActionStatus } = newsSlice.actions;
export default newsSlice.reducer;
