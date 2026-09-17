import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  UserPlus, Loader2, Check, X, AlertCircle, MapPin, Eye, EyeOff,
} from "lucide-react";
import api from "../../service/api.js";
import {
  registerEmployee,
  assignRole,
  fetchAllPositions,
  clearRegisterState,
} from "../../redux/slices/rolesSlice.js";

// ── Role types accepted by POST /roles/assign-role ──────────────────────────
// `type` strings must match ASSIGNABLE_ROLE_TYPES in assign-role-new.dto.ts.
// `scope` drives which geography dropdown is shown and which extra ids are
// derived for the payload (see REQUIRED_FIELDS below).
const ROLE_TYPES = [
  { type: "district_head", label: "District Head", scope: "district" },
  { type: "taluka_head", label: "Taluka Head", scope: "taluka" },
  { type: "ward_chairman", label: "Ward Chairman", scope: "ward" },
];

// Geography ids actually sent in the assign body, per the API doc table:
//   district_head → { districtId }
//   taluka_head   → { districtId, talukaId }   (districtId derived from taluka)
//   ward_chairman → { talukaId, wardId }       (talukaId derived from ward)
const SCOPE_LABEL = {
  district: "District",
  taluka: "Taluka",
  ward: "Ward / Hobli",
};

const EMPTY = {
  name: "",
  email: "",
  mobileNumber: "",
  password: "",
  roleType: "",
  geographyId: "",
};

export default function RegisterEmployee() {
  const dispatch = useDispatch();

  const {
    registering, registerError,
    assigning, error: assignError,
    positions, loadingPositions,
  } = useSelector((s) => s.roles);

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null); // { kind: "success" | "error", text }

  // Geography lists — fetched once each, filtered client-side by vacancy
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingGeo, setLoadingGeo] = useState(false);

  const submitting = registering || assigning;
  const selectedRole = ROLE_TYPES.find((r) => r.type === form.roleType) || null;
  const scope = selectedRole?.scope || null;

  // ── Mount: positions (vacancy source) + all three geography lists ─────────
  useEffect(() => {
    let cancelled = false;

    const loadGeographies = async () => {
      setLoadingGeo(true);
      try {
        // /ward/getAllWards is paginated (default limit 10) — ask for the
        // whole set so the dropdown isn't silently truncated.
        const [dRes, tRes, wRes] = await Promise.all([
          api.get("/district/getAllDistricts"),
          api.get("/talukas/getAllTalukas"),
          api.get("/ward/getAllWards?page=1&limit=1000"),
        ]);
        if (cancelled) return;
        setDistricts(dRes.data?.data || []);
        setTalukas(tRes.data?.data || []);
        setWards(wRes.data?.data || []);
      } catch (e) {
        console.error("Failed to load geographies", e);
        if (!cancelled) {
          setToast({ kind: "error", text: "Could not load districts / talukas / wards." });
        }
      } finally {
        if (!cancelled) setLoadingGeo(false);
      }
    };

    dispatch(fetchAllPositions());
    loadGeographies();

    return () => {
      cancelled = true;
      dispatch(clearRegisterState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // ── Occupied geography ids, per role type ────────────────────────────────
  // A seat counts as taken only when a position for THAT role names THAT
  // geography and still has a current holder. Positions with a null holder
  // are vacant seats and stay selectable.
  const occupied = useMemo(() => {
    const taken = { district_head: new Set(), taluka_head: new Set(), ward_chairman: new Set() };

    (positions || []).forEach((p) => {
      if (!p?.currentHolder) return;
      if (p.role === "district_head" && p.district?.districtId) {
        taken.district_head.add(p.district.districtId);
      } else if (p.role === "taluka_head" && p.taluka?.talukaId) {
        taken.taluka_head.add(p.taluka.talukaId);
      } else if (p.role === "ward_chairman" && p.ward?.wardId) {
        taken.ward_chairman.add(p.ward.wardId);
      }
    });

    return taken;
  }, [positions]);

  // ── Options for the visible geography dropdown ───────────────────────────
  const geographyOptions = useMemo(() => {
    if (!scope) return [];

    if (scope === "district") {
      return districts
        .filter((d) => d.districtId && !occupied.district_head.has(d.districtId))
        .map((d) => ({
          value: d.districtId,
          label: d.districtName,
          sub: d.state || "",
        }));
    }

    if (scope === "taluka") {
      return talukas
        .filter((t) => t.talukaId && !occupied.taluka_head.has(t.talukaId))
        .map((t) => ({
          value: t.talukaId,
          label: t.talukaName,
          sub: t.district?.districtName || "",
        }));
    }

    return wards
      .filter((w) => w.wardId && !occupied.ward_chairman.has(w.wardId))
      .map((w) => ({
        value: w.wardId,
        label: w.wardNumber ? `${w.wardName} (Ward ${w.wardNumber})` : w.wardName,
        sub: [w.taluka, w.district].filter(Boolean).join(", "),
      }));
  }, [scope, districts, talukas, wards, occupied]);

  const totalForScope =
    scope === "district" ? districts.length
      : scope === "taluka" ? talukas.length
        : scope === "ward" ? wards.length
          : 0;

  // ── Field handlers ───────────────────────────────────────────────────────
  const set = (key) => (e) => {
    const value = e.target.value;
    setForm((prev) =>
      key === "roleType"
        ? { ...prev, roleType: value, geographyId: "" } // role change invalidates the pick
        : { ...prev, [key]: value }
    );
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const e = {};

    if (!form.name.trim()) e.name = "Name is required";

    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Enter a valid email";

    if (!form.mobileNumber.trim()) e.mobileNumber = "Phone number is required";
    else if (!/^\d{10}$/.test(form.mobileNumber.trim())) e.mobileNumber = "Enter a 10-digit mobile number";

    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Use at least 6 characters";

    if (!form.roleType) e.roleType = "Select a role";
    if (form.roleType && !form.geographyId) e.geographyId = `Select a ${SCOPE_LABEL[scope].toLowerCase()}`;

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Build the POST /roles/assign-role body for the chosen role ───────────
  // districtId for taluka_head and talukaId for ward_chairman are derived
  // from the selected record rather than asked for again in the UI.
  const buildAssignPayload = (userId) => {
    if (scope === "district") {
      return { userId, type: form.roleType, districtId: form.geographyId };
    }

    if (scope === "taluka") {
      const taluka = talukas.find((t) => t.talukaId === form.geographyId);
      return {
        userId,
        type: form.roleType,
        districtId: taluka?.districtId || taluka?.district?.districtId,
        talukaId: form.geographyId,
      };
    }

    const ward = wards.find((w) => w.wardId === form.geographyId);
    return {
      userId,
      type: form.roleType,
      talukaId: ward?.talukaId,
      wardId: form.geographyId,
    };
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (!validate()) return;

    let newUser;

    // Step 1 — create the user
    try {
      newUser = await dispatch(registerEmployee(form)).unwrap();
    } catch (err) {
      setToast({ kind: "error", text: typeof err === "string" ? err : "Failed to register employee." });
      return;
    }

    const userId = newUser?.userId;

    if (!userId) {
      setToast({
        kind: "error",
        text: "Employee was created but the server returned no user id, so the role was not assigned.",
      });
      return;
    }

    // Step 2 — assign the hierarchy role to the brand-new user.
    // The account already exists at this point, so a failure here is
    // reported as a partial success rather than a blanket error.
    try {
      await dispatch(assignRole(buildAssignPayload(userId))).unwrap();
    } catch (err) {
      setToast({
        kind: "error",
        text: `${form.name.trim()} was registered, but the role could not be assigned: ${
          typeof err === "string" ? err : "unknown error"
        }. Assign it from Manage Roles.`,
      });
      setForm(EMPTY);
      dispatch(fetchAllPositions());
      return;
    }

    const geoLabel = geographyOptions.find((o) => o.value === form.geographyId)?.label || "";

    setToast({
      kind: "success",
      text: `${newUser.name} registered as ${selectedRole.label}${geoLabel ? ` for ${geoLabel}` : ""}.`,
    });

    setForm(EMPTY);
    setErrors({});
    dispatch(fetchAllPositions()); // the seat just filled is now unavailable
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-full bg-[#f4f5f7] -m-6 p-6 space-y-5">

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-bold text-gray-900 leading-tight tracking-tight">
            Register Employee
          </h1>
          <p className="text-[12.5px] text-gray-500 mt-0.5">
            Create a user account and assign them a hierarchy role in one step
          </p>
        </div>
      </div>

      {toast && (
        <div
          className={`flex items-start gap-2.5 rounded-xl px-4 py-3 text-[13px] ${
            toast.kind === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {toast.kind === "success" ? (
            <Check size={16} className="mt-0.5 shrink-0" />
          ) : (
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
          )}
          <span className="flex-1">{toast.text}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="shrink-0 opacity-60 hover:opacity-100"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 bg-white overflow-hidden"
      >
        {/* Account details */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <UserPlus size={15} className="text-blue-600" />
          </span>
          <div>
            <h2 className="text-[14px] font-semibold text-gray-900 leading-tight">Account Details</h2>
            <p className="text-[11.5px] text-gray-500">The employee signs in with this email and password</p>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name" required error={errors.name}>
            <input
              value={form.name}
              onChange={set("name")}
              placeholder="Ramesh Kumar"
              className={inputCls(errors.name)}
            />
          </Field>

          <Field label="Email" required error={errors.email}>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="ramesh.kumar@gmail.com"
              className={inputCls(errors.email)}
            />
          </Field>

          <Field label="Phone Number" required error={errors.mobileNumber}>
            <input
              value={form.mobileNumber}
              onChange={set("mobileNumber")}
              inputMode="numeric"
              maxLength={10}
              placeholder="9876543210"
              className={inputCls(errors.mobileNumber)}
            />
          </Field>

          <Field label="Password" required error={errors.password}>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={set("password")}
                placeholder="Minimum 6 characters"
                className={`${inputCls(errors.password)} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Field>
        </div>

        {/* Role assignment */}
        <div className="px-5 py-4 border-y border-gray-200 bg-gray-50/60 flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
            <MapPin size={15} className="text-violet-600" />
          </span>
          <div>
            <h2 className="text-[14px] font-semibold text-gray-900 leading-tight">Role Assignment</h2>
            <p className="text-[11.5px] text-gray-500">
              Only vacant seats are listed — a district, taluka or ward that already has a head is hidden
            </p>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Role" required error={errors.roleType}>
            <select
              value={form.roleType}
              onChange={set("roleType")}
              className={inputCls(errors.roleType)}
            >
              <option value="">Select a role</option>
              {ROLE_TYPES.map((r) => (
                <option key={r.type} value={r.type}>{r.label}</option>
              ))}
            </select>
          </Field>

          {scope && (
            <Field
              label={`Available ${SCOPE_LABEL[scope]}`}
              required
              error={errors.geographyId}
            >
              <select
                value={form.geographyId}
                onChange={set("geographyId")}
                disabled={loadingGeo || loadingPositions || geographyOptions.length === 0}
                className={inputCls(errors.geographyId)}
              >
                <option value="">
                  {loadingGeo || loadingPositions
                    ? "Loading…"
                    : geographyOptions.length === 0
                      ? `No unassigned ${SCOPE_LABEL[scope].toLowerCase()} left`
                      : `Select a ${SCOPE_LABEL[scope].toLowerCase()}`}
                </option>
                {geographyOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.sub ? `${o.label} — ${o.sub}` : o.label}
                  </option>
                ))}
              </select>
            </Field>
          )}

          {scope && !loadingGeo && !loadingPositions && (
            <p className="sm:col-span-2 text-[11.5px] text-gray-500 -mt-1">
              {geographyOptions.length} of {totalForScope}{" "}
              {SCOPE_LABEL[scope].toLowerCase()}
              {totalForScope === 1 ? "" : "s"} available
              {totalForScope - geographyOptions.length > 0 &&
                ` · ${totalForScope - geographyOptions.length} already assigned`}
            </p>
          )}

          {(registerError || assignError) && (
            <div className="sm:col-span-2 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-[12.5px] text-red-700">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{registerError || assignError}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-200 bg-gray-50/60">
          <button
            type="button"
            onClick={() => { setForm(EMPTY); setErrors({}); }}
            disabled={submitting}
            className="px-4 py-2 rounded-lg text-[13px] font-medium text-gray-700 border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-60 transition-colors"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors inline-flex items-center gap-2"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {registering ? "Registering…" : assigning ? "Assigning role…" : "Register Employee"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Sub-components ──

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold tracking-wide uppercase text-gray-500 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-[11.5px] text-red-600 mt-1">{error}</p>}
    </div>
  );
}

function inputCls(error) {
  return `w-full px-3.5 py-2.5 rounded-lg border text-[13px] text-gray-800 bg-white outline-none transition-colors disabled:bg-gray-50 disabled:text-gray-400 ${
    error
      ? "border-red-400 focus:border-red-500"
      : "border-gray-300 focus:border-blue-500"
  }`;
}
