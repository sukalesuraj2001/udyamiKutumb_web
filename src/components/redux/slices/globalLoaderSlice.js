// src/redux/slices/globalLoaderSlice.js
import { createSlice } from "@reduxjs/toolkit";

const globalLoaderSlice = createSlice({
  name: "globalLoader",
  initialState: {
    isLoading: false,
    activeRequests: 0, // counter — multiple APIs same time la call aidhalum safe
  },
  reducers: {
    showLoader(state) {
      state.activeRequests += 1;
      state.isLoading = true;
    },
    hideLoader(state) {
      state.activeRequests = Math.max(0, state.activeRequests - 1);
      state.isLoading = state.activeRequests > 0;
    },
  },
});

export const { showLoader, hideLoader } = globalLoaderSlice.actions;
export default globalLoaderSlice.reducer;