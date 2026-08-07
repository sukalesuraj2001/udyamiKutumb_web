// src/redux/slices/globalLoaderSlice.js
import { createSlice } from "@reduxjs/toolkit";

const globalLoaderSlice = createSlice({
  name: "globalLoader",
  initialState: {
    isLoading: false,
    activeRequests: 0,
    requestStartTime: null,
  },
  reducers: {
    showLoader(state) {
      if (state.activeRequests === 0 || state.requestStartTime === null) {
        state.requestStartTime = Date.now();
      }
      state.activeRequests += 1;
      state.isLoading = true;
    },
    hideLoader(state) {
      state.activeRequests = Math.max(0, state.activeRequests - 1);
      state.isLoading = state.activeRequests > 0;
      if (state.activeRequests === 0) {
        state.requestStartTime = null;
      }
    },
  },
});

export const { showLoader, hideLoader } = globalLoaderSlice.actions;
export default globalLoaderSlice.reducer;