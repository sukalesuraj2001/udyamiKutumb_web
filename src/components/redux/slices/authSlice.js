import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// const API_BASE = "http://192.168.0.70:3000";
const API_BASE = "https://udyami-circle-db.onrender.com";

const loadFromStorage = () => {
  try {
    return {
      user: JSON.parse(localStorage.getItem("user")) || null,
      token: localStorage.getItem("token") || null,
    };
  } catch {
    return { user: null, token: null };
  }
};

const request = async (path, body) => {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Request failed");
  }
  return data;
};

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (payload, { rejectWithValue }) => {
    try {
      return await request("/auth/createUser", payload);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (payload, { rejectWithValue }) => {
    try {
      return await request("/auth/loginUser", payload);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async (googleToken, { rejectWithValue }) => {
    try {
      return await request("/google", { token: googleToken });
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  ...loadFromStorage(),
  status: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = "idle";
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("locationData");   
      sessionStorage.removeItem("locationData"); 
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.status = "loading";
      state.error = null;
    };
    const rejected = (state, action) => {
      state.status = "failed";
      state.error = action.payload || "Something went wrong";
    };
    const fulfilled = (state, action) => {
      state.status = "succeeded";
      state.user = action.payload.user;
      state.token = action.payload.accessToken;
      state.error = null;

      localStorage.setItem("token", action.payload.accessToken);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    };

    builder
      .addCase(registerUser.pending, pending)
      .addCase(registerUser.fulfilled, fulfilled)
      .addCase(registerUser.rejected, rejected)
      .addCase(loginUser.pending, pending)
      .addCase(loginUser.fulfilled, fulfilled)
      .addCase(loginUser.rejected, rejected)
      .addCase(googleLogin.pending, pending)
      .addCase(googleLogin.fulfilled, fulfilled)
      .addCase(googleLogin.rejected, rejected);
  },
});
export const selectToken = (state) => state.auth.token;
export const selectUser = (state) => state.auth.user;
export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;