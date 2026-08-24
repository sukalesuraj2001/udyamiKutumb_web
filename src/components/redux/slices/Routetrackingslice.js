import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE = "https://backend.udyamikutumba.com";

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
  if (!res.ok || data.success === false) {
    throw new Error(data.message || "Request failed");
  }
  return data;
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const createRoute = createAsyncThunk(
  "routeTracking/createRoute",
  async ({ payload, token }, { rejectWithValue }) => {
    try {
      return await authRequest("/create-route/createRoute", "POST", payload, token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateRoute = createAsyncThunk(
  "routeTracking/updateRoute",
  async ({ payload, token }, { rejectWithValue }) => {
    try {
      return await authRequest("/create-route/updateRoute", "PATCH", payload, token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const getAllRoutesByChairman = createAsyncThunk(
  "routeTracking/getAllRoutes",
  async ({ wardChairmanId, token }, { rejectWithValue }) => {
    try {
      return await authRequest(
        `/create-route/getAllRoutesCreatedBy/${wardChairmanId}`,
        "GET",
        null,
        token
      );
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const getAssignedRoute = createAsyncThunk(
  "routeTracking/getAssignedRoute",
  async ({ channelPartnerId, token }, { rejectWithValue }) => {
    try {
      return await authRequest(
        `/create-route/getAssignedRoute/${channelPartnerId}`,
        "GET",
        null,
        token
      );
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const trackCPRoute = createAsyncThunk(
  "routeTracking/trackCPRoute",
  async ({ routeId, channelPartnerId, token }, { rejectWithValue }) => {
    try {
      const targetId = routeId || channelPartnerId;
      const data = await authRequest(
        `/create-route/trackCPRoute/${targetId}`,
        "GET",
        null,
        token
      );
      return { routeId: targetId, channelPartnerId, ...data.data };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateLiveLocation = createAsyncThunk(
  "routeTracking/updateLiveLocation",
  async ({ payload, token }, { rejectWithValue }) => {
    try {
      return await authRequest("/create-route/updateLiveLocation", "POST", payload, token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const completeJourney = createAsyncThunk(
  "routeTracking/completeJourney",
  async ({ routeId, token }, { rejectWithValue }) => {
    try {
      return await authRequest(
        `/create-route/complete-journey/${routeId}`,
        "PATCH",
        null,
        token
      );
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchChannelPartners = createAsyncThunk(
  "routeTracking/fetchChannelPartners",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const data = await authRequest("/roles/getAllRoleUsers", "GET", null, token);
      const channelPartners = (data.data || []).filter((user) =>
        user.roles?.some((role) => role.roleName === "channel_partner")
      );
      return channelPartners;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── NEW: Journey Reports for a specific Channel Partner ───────────────────────
export const fetchCPJourneyReports = createAsyncThunk(
  "routeTracking/fetchCPJourneyReports",
  async ({ channelPartnerId, token }, { rejectWithValue }) => {
    try {
      const data = await authRequest(
        `/create-route/journey-reports/channel_partner/${channelPartnerId}`,
        "GET",
        null,
        token
      );
      return {
        channelPartnerId,
        reports: data.data || data.reports || [],
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const routeTrackingSlice = createSlice({
  name: "routeTracking",
  initialState: {
    routes: [],
    assignedRoute: null,
    liveLocations: {},
    journeyReports: [],          // all reports merged
    cpJourneyReports: {},        // keyed by channelPartnerId
    journeyReportsStatus: "idle",
    channelPartners: [],
    channelPartnersStatus: "idle",
    status: "idle",
    error: null,
    createStatus: "idle",
    updateStatus: "idle",
    completeStatus: "idle",
    trackingData: null,
    trackingStatus: "idle",
    trackingError: null,
  },
  reducers: {
    clearRouteError(state) { state.error = null; },
    resetCreateStatus(state) { state.createStatus = "idle"; },
    resetUpdateStatus(state) { state.updateStatus = "idle"; },
    clearTrackingData(state) {
      state.trackingData = null;
      state.trackingStatus = "idle";
      state.trackingError = null;
    },
    setLiveLocation(state, action) {
      const { channelPartnerId, lat, lng, coverage, deviation } = action.payload;
      state.liveLocations[channelPartnerId] = { lat, lng, coverage, deviation, updatedAt: Date.now() };
    },
    updateTrackingLocation(state, action) {
      const { lat, lng, timestamp } = action.payload;
      if (state.trackingData) {
        state.trackingData.currentLocation = { lat, lng, timestamp };
      }
    },
  },
  extraReducers: (builder) => {
    // getAllRoutesByChairman
    builder
      .addCase(getAllRoutesByChairman.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getAllRoutesByChairman.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.routes = action.payload.routes || action.payload.data || [];
      })
      .addCase(getAllRoutesByChairman.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    // createRoute
    builder
      .addCase(createRoute.pending, (state) => {
        state.createStatus = "loading";
        state.error = null;
      })
      .addCase(createRoute.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        const newRoute = action.payload.route || action.payload.data;
        if (newRoute) state.routes.unshift(newRoute);
      })
      .addCase(createRoute.rejected, (state, action) => {
        state.createStatus = "failed";
        state.error = action.payload;
      });

    // updateRoute
    builder
      .addCase(updateRoute.pending, (state) => {
        state.updateStatus = "loading";
        state.error = null;
      })
      .addCase(updateRoute.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        const updatedRoute = action.payload.route || action.payload.data;
        if (updatedRoute) {
          const routeId = updatedRoute._id || updatedRoute.id || updatedRoute.routeId;
          const idx = state.routes.findIndex(
            (r) => (r._id || r.id || r.routeId) === routeId
          );
          if (idx !== -1) state.routes[idx] = { ...state.routes[idx], ...updatedRoute };
        }
      })
      .addCase(updateRoute.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.error = action.payload;
      });

    // trackCPRoute
    builder
      .addCase(trackCPRoute.pending, (state) => {
        state.trackingStatus = "loading";
        state.trackingError = null;
      })
      .addCase(trackCPRoute.fulfilled, (state, action) => {
        state.trackingStatus = "succeeded";
        state.trackingData = action.payload;
        const payload = action.payload;
        if (!payload) return;

        const cpId = payload.channelPartnerId;
        const curLoc = payload.currentLocation;
        const history = payload.trackingHistory || [];
        const routeData = payload.route;

        const lat = curLoc?.latitude ?? curLoc?.lat;
        const lng = curLoc?.longitude ?? curLoc?.lng;

        if (cpId && lat != null && lng != null) {
          state.liveLocations[cpId] = {
            lat: Number(lat),
            lng: Number(lng),
            updatedAt: Date.now(),
            coverage: curLoc?.coverage || payload?.coveragePercent || 0,
            deviation: curLoc?.deviationDistance || curLoc?.deviation || 0,
            speed: curLoc?.speed,
            battery: curLoc?.battery,
            isOnRoute: curLoc?.isOnRoute,
          };
        }

        // Update matching route in state.routes array so activeRoutes subscribers re-render
        if (state.routes && state.routes.length > 0) {
          const routeId = routeData?.routeId || routeData?._id || routeData?.id;
          const idx = state.routes.findIndex((r) => {
            const rId = r._id || r.routeId || r.id;
            const rCpId =
              r.channelPartnerId ||
              r.assignedTo ||
              r.channelPartner?._id ||
              (typeof r.channelPartner === "string" ? r.channelPartner : null);
            return (
              (routeId && (r._id === routeId || r.routeId === routeId || r.id === routeId)) ||
              (cpId && rCpId === cpId)
            );
          });

          if (idx !== -1) {
            const existingRoute = state.routes[idx];
            const newCoords = routeData?.routePath?.coordinates || [];
            const mergedRoutePath =
              newCoords.length >= 2 ? routeData.routePath : existingRoute.routePath;

            state.routes[idx] = {
              ...existingRoute,
              ...(routeData || {}),
              routePath: mergedRoutePath,
              status: routeData?.status || existingRoute.status || "STARTED",
              channelPartnerName:
                existingRoute.channelPartnerName ||
                routeData?.channelPartnerName ||
                "Channel Partner",
              channelPartnerId:
                existingRoute.channelPartnerId ||
                cpId ||
                routeData?.channelPartnerId,
              currentLocation: curLoc || existingRoute.currentLocation,
              trackingHistory:
                history && history.length > 0
                  ? history
                  : existingRoute.trackingHistory || [],
              livePoints:
                history && history.length > 0
                  ? history
                  : existingRoute.livePoints || [],
              deviation: curLoc?.deviationDistance || existingRoute.deviation,
            };
          }
        }
      })
      .addCase(trackCPRoute.rejected, (state, action) => {
        state.trackingStatus = "failed";
        state.trackingError = action.payload;
      });

    // getAssignedRoute
    builder.addCase(getAssignedRoute.fulfilled, (state, action) => {
      state.assignedRoute = action.payload.route || action.payload.data || null;
    });

    // completeJourney
    builder
      .addCase(completeJourney.pending, (state) => { state.completeStatus = "loading"; })
      .addCase(completeJourney.fulfilled, (state, action) => {
        state.completeStatus = "succeeded";
        const report = action.payload.report || action.payload.data;
        if (report) state.journeyReports.unshift(report);
        const routeId = action.meta.arg.routeId;
        const idx = state.routes.findIndex((r) => r._id === routeId || r.id === routeId);
        if (idx !== -1) state.routes[idx].status = "COMPLETED";
      })
      .addCase(completeJourney.rejected, (state, action) => {
        state.completeStatus = "failed";
        state.error = action.payload;
      });

    // fetchChannelPartners
    builder
      .addCase(fetchChannelPartners.pending, (state) => { state.channelPartnersStatus = "loading"; })
      .addCase(fetchChannelPartners.fulfilled, (state, action) => {
        state.channelPartnersStatus = "succeeded";
        state.channelPartners = action.payload;
      })
      .addCase(fetchChannelPartners.rejected, (state, action) => {
        state.channelPartnersStatus = "failed";
        state.error = action.payload;
      });

    // fetchCPJourneyReports ← NEW
    builder
      .addCase(fetchCPJourneyReports.pending, (state) => {
        state.journeyReportsStatus = "loading";
      })
      .addCase(fetchCPJourneyReports.fulfilled, (state, action) => {
        state.journeyReportsStatus = "succeeded";
        const { channelPartnerId, reports } = action.payload;
        // Store per-CP
        state.cpJourneyReports[channelPartnerId] = reports;
        // Merge into global journeyReports (deduplicate by id)
        const existingIds = new Set(
          state.journeyReports.map((r) => r._id || r.id || r.reportId)
        );
        reports.forEach((r) => {
          const rid = r._id || r.id || r.reportId;
          if (!existingIds.has(rid)) {
            state.journeyReports.push(r);
            existingIds.add(rid);
          }
        });
      })
      .addCase(fetchCPJourneyReports.rejected, (state, action) => {
        state.journeyReportsStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const {
  clearRouteError,
  resetCreateStatus,
  resetUpdateStatus,
  clearTrackingData,
  setLiveLocation,
  updateTrackingLocation,
} = routeTrackingSlice.actions;

// Selectors
export const selectAllRoutes = (state) => state.routeTracking.routes;
export const selectAssignedRoute = (state) => state.routeTracking.assignedRoute;
export const selectLiveLocations = (state) => state.routeTracking.liveLocations;
export const selectRouteStatus = (state) => state.routeTracking.status;
export const selectCreateStatus = (state) => state.routeTracking.createStatus;
export const selectUpdateStatus = (state) => state.routeTracking.updateStatus;
export const selectRouteError = (state) => state.routeTracking.error;
export const selectChannelPartners = (state) => state.routeTracking.channelPartners;
export const selectChannelPartnersStatus = (state) => state.routeTracking.channelPartnersStatus;
export const selectTrackingData = (state) => state.routeTracking.trackingData;
export const selectTrackingStatus = (state) => state.routeTracking.trackingStatus;
export const selectTrackingError = (state) => state.routeTracking.trackingError;
// NEW selectors
export const selectJourneyReports = (state) => state.routeTracking.journeyReports;
export const selectCPJourneyReports = (cpId) => (state) =>
  state.routeTracking.cpJourneyReports[cpId] || [];
export const selectJourneyReportsStatus = (state) => state.routeTracking.journeyReportsStatus;

export default routeTrackingSlice.reducer;