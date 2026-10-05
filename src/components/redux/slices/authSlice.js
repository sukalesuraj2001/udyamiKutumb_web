import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// const API_BASE = "http://192.168.0.70:3000";
const API_BASE = "https://backend.udyamikutumba.com";

const loadFromStorage = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user")) || null;
    const positionHolderId =
      localStorage.getItem("positionHolderId") ||
      sessionStorage.getItem("positionHolderId") ||
      user?.position?.positionHolderId ||
      null;
    const positionId =
      localStorage.getItem("positionId") ||
      sessionStorage.getItem("positionId") ||
      user?.position?.positionId ||
      null;

    return {
      user,
      token: localStorage.getItem("token") || null,
      positionHolderId,
      positionId,
    };
  } catch {
    return { user: null, token: null, positionHolderId: null, positionId: null };
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
      state.positionHolderId = null;
      state.positionId = null;
      state.status = "idle";
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("positionHolderId");
      sessionStorage.removeItem("positionHolderId");
      localStorage.removeItem("positionId");
      sessionStorage.removeItem("positionId");
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

      const positionHolderId =
        action.payload.user?.position?.positionHolderId ||
        action.payload.user?.positionHolderId ||
        action.payload.positionHolderId ||
        "";
      const positionId =
        action.payload.user?.position?.positionId ||
        action.payload.user?.positionId ||
        action.payload.positionId ||
        "";

      state.positionHolderId = positionHolderId || null;
      state.positionId = positionId || null;

      localStorage.setItem("token", action.payload.accessToken);
      localStorage.setItem("user", JSON.stringify(action.payload.user));

      if (positionHolderId) {
        localStorage.setItem("positionHolderId", positionHolderId);
        sessionStorage.setItem("positionHolderId", positionHolderId);
      } else {
        localStorage.removeItem("positionHolderId");
        sessionStorage.removeItem("positionHolderId");
      }

      if (positionId) {
        localStorage.setItem("positionId", positionId);
        sessionStorage.setItem("positionId", positionId);
      } else {
        localStorage.removeItem("positionId");
        sessionStorage.removeItem("positionId");
      }
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
export const selectPositionHolderId = (state) => state.auth.positionHolderId;
export const selectPositionId = (state) => state.auth.positionId;
export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;