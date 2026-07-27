import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../service/api.js";

export const fetchProfile = createAsyncThunk(
  "profile/fetchProfile",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/userprofile/getUserProfileById/${userId}`);
      // API returns { success, message, data: { user, profile } }
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch profile");
    }
  }
);

export const updateProfile = createAsyncThunk(
  "profile/updateProfile",
  async ({ userId, payload }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/userprofile/updateUserProfile/${userId}`, payload);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update profile");
    }
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    profile: null,   
    loading: false,
    error: null,
  },
  reducers: {
    clearProfileError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending,   (state)          => { state.loading = true;  state.error = null; })
      .addCase(fetchProfile.fulfilled, (state, action)  => { state.loading = false; state.profile = action.payload; })
      .addCase(fetchProfile.rejected,  (state, action)  => { state.loading = false; state.error = action.payload; })
      .addCase(updateProfile.pending,  (state)          => { state.loading = true;  state.error = null; })
      .addCase(updateProfile.fulfilled,(state, action)  => { state.loading = false; state.profile = action.payload; })
      .addCase(updateProfile.rejected, (state, action)  => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearProfileError } = profileSlice.actions;
export default profileSlice.reducer;