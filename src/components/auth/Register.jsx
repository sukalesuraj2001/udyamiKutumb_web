import React, { useState,useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { EyeIcon } from "../common/Icons.jsx";
import { registerUser, clearAuthError } from "../redux/slices/authSlice.js";

const inputClass = (hasError) =>
  `w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition focus:ring-4 focus:ring-[#1B2430]/10 focus:border-[#1B2430] ${hasError ? "border-red-400" : "border-[#E2DDD1]"
  }`;

function Field({ label, error, children }) {
  return (
    <div className="mb-4">
      <label className="block text-[12.5px] font-medium mb-1.5 text-[#1B2430]">{label}</label>
      {children}
      {error && <p className="text-xs font-mono text-red-600 mt-1">{error}</p>}
    </div>
  );
}


export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((s) => s.auth);
  const loading = status === "loading";

  const [showPw, setShowPw] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    mobileNumber: "",
    businessLocation: "",
    officeLocation: "",
    latitude: 0,
    longitude: 0,
  });
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }));
      },
      () => { } 
    );
  }, []);
  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";

    if (!form.email.trim()) {
      e.email = "Email is required";
    } else if (
      !/^[a-zA-Z0-9._%+-]+@gmail\.(com|in)$/i.test(form.email)
    ) {
      e.email = "Enter a valid Gmail address";
    }

    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "At least 6 characters";

    if (!form.mobileNumber.trim()) {
      e.mobileNumber = "Mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(form.mobileNumber)) {
      e.mobileNumber = "Enter a valid 10-digit mobile number";
    } else if (!/^\d{10}$/.test(form.mobileNumber)) e.mobileNumber = "Enter a valid 10-digit number";

    if (!form.businessLocation.trim()) e.businessLocation = "Business location is required";
    if (!form.officeLocation.trim()) e.officeLocation = "Office location is required";
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    dispatch(clearAuthError());
    if (!validate()) return;
    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) {
      const role = result.payload?.user?.role;
      navigate(role === "admin" ? "/admin-dashboard" : "/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F4FF] px-4 py-10">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-[#E2E8F4] shadow-sm p-8 md:p-10">

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

        {/* Badge */}
        <div className="flex justify-center mb-3">
          <span className="text-[11px] font-semibold tracking-widest uppercase text-[#1a56db] bg-[#EEF3FF] border border-[#C7D7FA] rounded-full px-3 py-1">
            New Account
          </span>
        </div>

        <h1 className="text-[22px] font-bold text-[#1a2b4a] text-center mb-1">Create your account</h1>
        <p className="text-[13px] text-slate-500 text-center mb-5">Join the Udyami Bharat Admin Platform</p>

        {error && (
          <div className="rounded-lg px-3.5 py-2.5 text-[13px] mb-4 bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={submit} noValidate>

          {/* Row 1 — Name + Mobile */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Full name" error={fieldErrors.name}>
              <input
                className={inputClass(fieldErrors.name)}
                placeholder="Your full name"
                value={form.name}
                onChange={update("name")}
              />
            </Field>
            <Field label="Mobile number" error={fieldErrors.mobileNumber}>
              <input
                type="tel"
                inputMode="numeric"
                className={inputClass(fieldErrors.mobileNumber)}
                placeholder="10-digit number"
                value={form.mobileNumber}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    mobileNumber: e.target.value.replace(/\D/g, "").slice(0, 10),
                  }))
                }
              />
            </Field>
          </div>

          {/* Email */}
          <Field label="Email address" error={fieldErrors.email}>
            <input
              type="email"
              className={inputClass(fieldErrors.email)}
              placeholder="you@example.com"
              value={form.email}
              onChange={update("email")}
            />
          </Field>

          {/* Password */}
          <Field label="Password" error={fieldErrors.password}>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                className={inputClass(fieldErrors.password)}
                placeholder="At least 6 characters"
                value={form.password}
                onChange={update("password")}
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
          </Field>

          {/* Row 2 — Business + Office location */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Business location" error={fieldErrors.businessLocation}>
              <input
                className={inputClass(fieldErrors.businessLocation)}
                placeholder="e.g. Chennai"
                value={form.businessLocation}
                onChange={update("businessLocation")}
              />
            </Field>
            <Field label="Office location" error={fieldErrors.officeLocation}>
              <input
                className={inputClass(fieldErrors.officeLocation)}
                placeholder="e.g. Anna Nagar"
                value={form.officeLocation}
                onChange={update("officeLocation")}
              />
            </Field>
          </div>

          {/* Location detect button */}
          {form.latitude !== 0 && (
            <p className="text-[11.5px] text-green-600 mb-3 text-center">
            </p>
          )}

          {/* Hidden lat/lng — set via geolocation or map picker later */}
          {/* form.latitude and form.longitude are in state, update them separately */}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-lg bg-[#1a56db] text-white font-semibold text-[14px] py-3 hover:bg-[#1547c0] disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-[11.5px] text-slate-400 mt-3">
          By signing up, you agree to our{" "}
          <Link to="/terms" className="text-[#1a56db]">Terms</Link> and{" "}
          <Link to="/privacy" className="text-[#1a56db]">Privacy Policy</Link>
        </p>

        <p className="text-center mt-4 text-[13px] text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="text-[#1a56db] font-semibold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}