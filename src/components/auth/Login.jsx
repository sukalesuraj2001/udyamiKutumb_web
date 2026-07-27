import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { EyeIcon } from "../common/Icons.jsx";
import { loginUser, clearAuthError } from "../redux/slices/authSlice.js";
import { getLocationByWardHeadId } from "../redux/slices/Areachartslice.js";

const inputClass = (hasError) =>
  `w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition focus:ring-4 focus:ring-[#1B2430]/10 focus:border-[#1B2430] ${hasError ? "border-red-400" : "border-[#E2DDD1]"
  }`;


// ─── Role → route ──────────────────────────────────────────────────────────
const ROLE_ROUTES = {
  SuperAdmin: "/super-admin-dashboard",
  StateHead: "/state-head-dashboard",
  DistrictHead: "/district-head-dashboard",
  TalukHead: "/taluk-head-dashboard",
  WardChairman: "/wardChairman-head-dashboard",
  ChannelPartner: "/channelPartner-dashboard",
  Admin: "/admin-dashboard",
  Member: "/member-dashboard",
};

// ───────────────────────────────────────────────────────────────────────────
export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((s) => s.auth);
  const loading = status === "loading";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Email is required";
    if (!form.password) e.password = "Password is required";
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    dispatch(clearAuthError());
    if (!validate()) return;

    const result = await dispatch(loginUser(form));
    if (!loginUser.fulfilled.match(result)) return;

    const { user, accessToken } = result.payload ?? {};
    const role = user?.role;
    const userId = user?.userId;

    // ── Hierarchy dispatch (localStorage storage thunk la நடக்கும்) ──
    if (userId && ["DistrictHead", "TalukHead", "WardChairman"].includes(role)) {
      await dispatch(getLocationByWardHeadId(userId));
    }

    navigate(ROLE_ROUTES[role] ?? "/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F4FF] px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#E2E8F4] shadow-sm p-8 md:p-10">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <img
            src="https://udyamicircle.in/assets/logo-BWGNLCfH.png"
            alt="Udyami Bharat"
            className="w-10 h-10 rounded-lg object-contain"
          />
          <span className="font-bold text-[18px] text-[#1a2b4a]">
            Udyami <span className="text-[#1a56db]">Bharat</span>
          </span>
        </div>

        <h1 className="text-[24px] font-bold text-[#1a2b4a] text-center mb-1">
          Welcome back
        </h1>
        <p className="text-[13.5px] text-slate-500 text-center mb-5">
          Sign in to access the admin dashboard
        </p>

        {error && (
          <div className="rounded-lg px-3.5 py-2.5 text-[13px] mb-4 bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={submit} noValidate className="space-y-4">
          <div>
            <label className="block text-[12.5px] font-semibold mb-1.5 text-[#374151]">
              Email address
            </label>
            <input
              type="email"
              placeholder="admin@udyamibharat.in"
              value={form.email}
              onChange={update("email")}
              className={inputClass(fieldErrors.email)}
            />
            {fieldErrors.email && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-[12.5px] font-semibold mb-1.5 text-[#374151]">
              Password
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                placeholder="Enter your password"
                value={form.password}
                onChange={update("password")}
                className={inputClass(fieldErrors.password)}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Toggle password"
              >
                <EyeIcon open={showPw} />
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>
            )}
          </div>

          <div className="text-right -mt-1">
            <Link
              to="/forgot-password"
              className="text-[12.5px] font-medium text-[#1a56db] hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#1a56db] text-white font-semibold text-[14px] py-3 hover:bg-[#1547c0] disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center mt-5 text-[13px] text-slate-500">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-[#1a56db] font-semibold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}