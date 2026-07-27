import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile, fetchProfile } from "../../redux/slices/profileSlice.js";
import { X } from "lucide-react";

const inputCls = "w-full border border-[#D1D9EC] rounded-lg px-3.5 py-2.5 text-[13.5px] bg-[#F8FAFF] text-[#1a2b4a] placeholder:text-slate-300 outline-none focus:border-[#1a56db] focus:bg-white focus:ring-2 focus:ring-[#1a56db]/10 transition";
const readonlyCls = "w-full border border-[#E2E8F4] rounded-lg px-3.5 py-2.5 text-[13.5px] bg-[#F1F5F9] text-slate-400 outline-none cursor-not-allowed";

function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label className="block text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function EditProfileModal({ profile, userId, onClose }) {
  const dispatch = useDispatch();
  const { loading } = useSelector((s) => s.profile);

  const [form, setForm] = useState({
    alternateMobile: "",
    gender: "",
    state: "",
    district: "",
    assembly: "",
    ward: "",
    pincode: "",
    homeAddress: "",
    officeAddress: "",
    hasBusiness: false,
    businessDetails: {},
  });

  const [toast, setToast] = useState(false);

useEffect(() => {
  if (profile) {
    const pd = profile.profile || {};   // ← KEY FIX
    setForm({
      alternateMobile: pd.alternateMobile || "",
      gender:          pd.gender          || "",
      state:           pd.state           || "",
      district:        pd.district        || "",
      assembly:        pd.assembly        || "",
      ward:            pd.ward            || "",
      pincode:         pd.pincode         || "",
      homeAddress:     pd.homeAddress     || "",
      officeAddress:   pd.officeAddress   || "",
      hasBusiness:     pd.hasBusiness     || false,
      businessDetails: pd.businessDetails || {},
    });
  }
}, [profile]);

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const updateBusiness = (key) => (e) =>
    setForm((f) => ({
      ...f,
      businessDetails: { ...f.businessDetails, [key]: e.target.value },
    }));

  const handleSave = async () => {
    const result = await dispatch(updateProfile({ userId, payload: form }));
    if (updateProfile.fulfilled.match(result)) {
      setToast(true);
      setTimeout(() => setToast(false), 3000);
      await dispatch(fetchProfile(userId));
      onClose();
    }
  };

  const b = form.businessDetails;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="bg-white rounded-2xl border border-[#E2E8F4] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F4] shrink-0">
          <h2 className="text-[15px] font-bold text-[#1a2b4a]">Edit Profile</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 flex-1">

          {/* Read-only */}
          <div className="grid grid-cols-2 gap-3 mb-2">
            <Field label="Name">
              <input className={readonlyCls} value={profile?.user?.name || ""} readOnly />
            </Field>
            <Field label="Email">
              <input className={readonlyCls} value={profile?.user?.email || ""} readOnly />
            </Field>
            <Field label="Mobile">
              <input className={readonlyCls} value={profile?.user?.mobileNumber || ""} readOnly />
            </Field>
            <Field label="Role">
              <input className={readonlyCls} value={profile?.user?.role || ""} readOnly />
            </Field>
          </div>

          {/* Editable — Personal */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Alternate Mobile">
              <input className={inputCls} placeholder="Alternate mobile" value={form.alternateMobile} onChange={update("alternateMobile")} />
            </Field>
            <Field label="Gender">
              <select className={inputCls} value={form.gender} onChange={update("gender")}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </Field>
            <Field label="State">
              <input className={inputCls} placeholder="State" value={form.state} onChange={update("state")} />
            </Field>
            <Field label="District">
              <input className={inputCls} placeholder="District" value={form.district} onChange={update("district")} />
            </Field>
            <Field label="Assembly">
              <input className={inputCls} placeholder="Assembly" value={form.assembly} onChange={update("assembly")} />
            </Field>
            <Field label="Ward">
              <input className={inputCls} placeholder="Ward" value={form.ward} onChange={update("ward")} />
            </Field>
            <Field label="Pincode">
              <input className={inputCls} placeholder="Pincode" value={form.pincode} onChange={update("pincode")} maxLength={6} />
            </Field>
          </div>

          <Field label="Home Address">
            <textarea className={inputCls} rows={2} placeholder="Home address" value={form.homeAddress} onChange={update("homeAddress")} />
          </Field>
          <Field label="Office Address">
            <textarea className={inputCls} rows={2} placeholder="Office address" value={form.officeAddress} onChange={update("officeAddress")} />
          </Field>

          {/* Has Business toggle */}
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="hasBusiness"
              checked={form.hasBusiness}
              onChange={(e) => setForm((f) => ({ ...f, hasBusiness: e.target.checked }))}
              className="w-4 h-4 accent-[#1a56db]"
            />
            <label htmlFor="hasBusiness" className="text-[13px] font-semibold text-slate-600">
              I have a business
            </label>
          </div>

          {/* Business Details */}
          {form.hasBusiness && (
            <div className="bg-[#F8FAFF] rounded-xl border border-[#E2E8F4] p-4 mb-2">
              <p className="text-[12px] font-bold uppercase tracking-wider text-slate-400 mb-3">Business Details</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Business Name">
                  <input className={inputCls} placeholder="Business name" value={b.businessName || ""} onChange={updateBusiness("businessName")} />
                </Field>
                <Field label="Business Type">
                  <input className={inputCls} placeholder="Type" value={b.businessType || ""} onChange={updateBusiness("businessType")} />
                </Field>
                <Field label="Sector">
                  <input className={inputCls} placeholder="Sector" value={b.sector || ""} onChange={updateBusiness("sector")} />
                </Field>
                <Field label="Owner">
                  <input className={inputCls} placeholder="Owner name" value={b.owner || ""} onChange={updateBusiness("owner")} />
                </Field>
                <Field label="GST">
                  <input className={inputCls} placeholder="GST number" value={b.gst || ""} onChange={updateBusiness("gst")} />
                </Field>
                <Field label="Employees">
                  <input className={inputCls} placeholder="No. of employees" value={b.employees || ""} onChange={updateBusiness("employees")} />
                </Field>
                <Field label="Working Hours">
                  <input className={inputCls} placeholder="e.g. 9AM - 6PM" value={b.workingHours || ""} onChange={updateBusiness("workingHours")} />
                </Field>
                <Field label="Turnover">
                  <input className={inputCls} placeholder="Annual turnover" value={b.turnover || ""} onChange={updateBusiness("turnover")} />
                </Field>
                <Field label="Established Year">
                  <input className={inputCls} placeholder="e.g. 2010" value={b.establishedYear || ""} onChange={updateBusiness("establishedYear")} maxLength={4} />
                </Field>
                <Field label="License Number">
                  <input className={inputCls} placeholder="License number" value={b.licenseNumber || ""} onChange={updateBusiness("licenseNumber")} />
                </Field>
              </div>
              <Field label="Business Address">
                <textarea className={inputCls} rows={2} placeholder="Business address" value={b.businessAddress || ""} onChange={updateBusiness("businessAddress")} />
              </Field>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E2E8F4] flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-[#D1D9EC] text-[13.5px] font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-[#1a56db] text-white text-[13.5px] font-semibold hover:bg-[#1547c0] disabled:opacity-50 transition"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white text-[13px] font-medium px-5 py-3 rounded-xl shadow-lg z-50">
          ✓ Profile updated successfully
        </div>
      )}
    </div>
  );
}