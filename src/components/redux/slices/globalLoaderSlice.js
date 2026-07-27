// globalLoaderSlice.js
import { createSlice } from "@reduxjs/toolkit";

const globalLoaderSlice = createSlice({
  name: "globalLoader",
  initialState: { isLoading: false, activeRequests: 0 },
  reducers: {
    startLoading(state) {
      state.activeRequests += 1;
      state.isLoading = true;
    },
    stopLoading(state) {
      state.activeRequests = Math.max(0, state.activeRequests - 1);
      state.isLoading = state.activeRequests > 0;
    },
  },
});

export const { startLoading, stopLoading } = globalLoaderSlice.actions;
export default globalLoaderSlice.reducer;