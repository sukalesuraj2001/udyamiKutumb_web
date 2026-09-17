import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Upload, Loader2, MapPin } from "lucide-react";
import {
  fetchDistricts,
  fetchTalukasByDistrict,
  createWard,
  updateWard,
  selectDistricts,
  selectTalukas,
  selectLoadingTalukas,
  selectCreating,
  selectUpdating,
} from "../../redux/slices/wardSlice.js";

const EMPTY = {
  wardName: "",
  wardNumber: "",
  districtId: "",
  talukaId: "",
  district: "",
  taluka: "",
  whatsappGroup: "",
  geofencingLat: "",
  geofencingLang: "",
};

/**
 * Create / Edit ward form.
 *
 * mode = "create" -> POST /ward/create (multipart, GeoJSON optional)
 * mode = "edit"   -> PATCH /ward/:wardId
 */
export default function WardFormModal({ open, mode = "create", ward, onClose, onSaved }) {
  if (!open) return null;

  // Keyed remount gives every open a fresh, correctly seeded form
  // without resetting state from inside an effect.
  return (
    <WardForm
      key={`${mode}:${ward?.wardId || "new"}`}
      mode={mode}
      ward={ward}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}

function WardForm({ mode, ward, onClose, onSaved }) {
  const dispatch = useDispatch();

  const districts = useSelector(selectDistricts) || [];
  const talukas = useSelector(selectTalukas) || [];
  const loadingTalukas = useSelector(selectLoadingTalukas);
  const creating = useSelector(selectCreating);
  const updating = useSelector(selectUpdating);

  const isEdit = mode === "edit";
  const saving = isEdit ? updating : creating;

  const [form, setForm] = useState(() =>
    isEdit && ward
      ? {
          wardName: ward.wardName ?? "",
          wardNumber: ward.wardNumber ?? "",
          districtId: "",
          talukaId: ward.talukaId ?? "",
          district: ward.district ?? "",
          taluka: ward.taluka ?? "",
          whatsappGroup: ward.whatsappGroup ?? "",
          geofencingLat: ward.geofencingLat ?? "",
          geofencingLang: ward.geofencingLang ?? "",
        }
      : EMPTY
  );
  const [geoJsonFile, setGeoJsonFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const districtsLoaded = districts.length > 0;

  // District list is only needed for Create (Edit keeps the existing taluka link)
  useEffect(() => {
    if (!isEdit && !districtsLoaded) {
      dispatch(fetchDistricts());
    }
  }, [isEdit, districtsLoaded, dispatch]);

  // Load talukas whenever a district is picked
  useEffect(() => {
    if (form.districtId) {
      dispatch(fetchTalukasByDistrict(form.districtId));
    }
  }, [form.districtId, dispatch]);

  const selectedDistrict = districts.find(
    (d) => d.districtId === form.districtId
  );

  const set = (key) => (e) => {
    const value = e.target.value;
    setForm((prev) => {
      if (key === "districtId") {
        return { ...prev, districtId: value, talukaId: "" };
      }
      return { ...prev, [key]: value };
    });
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const e = {};

    if (!form.wardName.trim()) e.wardName = "Ward code is required";
    if (!String(form.wardNumber).trim()) e.wardNumber = "Ward number is required";

    if (!isEdit) {
      if (!form.districtId) e.districtId = "Select a district";
      if (!form.talukaId) e.talukaId = "Select a taluka";
    } else {
      if (!form.district.trim()) e.district = "District is required";
      if (!form.taluka.trim()) e.taluka = "Taluka is required";
    }

    if (form.geofencingLat !== "" && form.geofencingLat !== null) {
      const lat = Number(form.geofencingLat);
      if (Number.isNaN(lat) || lat < -90 || lat > 90) {
        e.geofencingLat = "Latitude must be between -90 and 90";
      }
    }

    if (form.geofencingLang !== "" && form.geofencingLang !== null) {
      const lng = Number(form.geofencingLang);
      if (Number.isNaN(lng) || lng < -180 || lng > 180) {
        e.geofencingLang = "Longitude must be between -180 and 180";
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setServerError("");
    if (!validate()) return;

    try {
      if (isEdit) {
        await dispatch(
          updateWard({ wardId: ward.wardId, values: form })
        ).unwrap();
      } else {
        await dispatch(createWard({ ...form, geoJsonFile })).unwrap();
      }
      onSaved?.();
      onClose?.();
    } catch (err) {
      setServerError(typeof err === "string" ? err : err?.message || "Something went wrong");
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-hairline">
          <div>
            <h2 className="text-[16px] font-semibold text-ink">
              {isEdit ? "Edit Ward" : "Create Ward"}
            </h2>
            <p className="text-[12px] text-muted mt-0.5">
              {isEdit
                ? "Update this ward's details and geofencing point."
                : "Add a new ward to the member map."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-ink hover:bg-ink/5 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">

            <Field label="Ward Code" required error={errors.wardName}>
              <input
                value={form.wardName}
                onChange={set("wardName")}
                placeholder="e.g. Kudlu"
                className={inputCls(errors.wardName)}
              />
            </Field>

            <Field label="Ward Number" required error={errors.wardNumber}>
              <input
                value={form.wardNumber}
                onChange={set("wardNumber")}
                placeholder="e.g. 12"
                className={inputCls(errors.wardNumber)}
              />
            </Field>

            {isEdit ? (
              <>
                <Field label="District" required error={errors.district}>
                  <input
                    value={form.district}
                    onChange={set("district")}
                    className={inputCls(errors.district)}
                  />
                </Field>

                <Field label="Taluka" required error={errors.taluka}>
                  <input
                    value={form.taluka}
                    onChange={set("taluka")}
                    className={inputCls(errors.taluka)}
                  />
                </Field>
              </>
            ) : (
              <>
                <Field label="District" required error={errors.districtId}>
                  <select
                    value={form.districtId}
                    onChange={set("districtId")}
                    className={inputCls(errors.districtId)}
                  >
                    <option value="">Select district</option>
                    {districts.map((d) => (
                      <option key={d.districtId} value={d.districtId}>
                        {d.districtName}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Taluka" required error={errors.talukaId}>
                  <select
                    value={form.talukaId}
                    onChange={set("talukaId")}
                    disabled={!form.districtId || loadingTalukas}
                    className={inputCls(errors.talukaId)}
                  >
                    <option value="">
                      {loadingTalukas
                        ? "Loading talukas…"
                        : form.districtId
                          ? "Select taluka"
                          : "Select a district first"}
                    </option>
                    {talukas.map((t) => (
                      <option key={t.talukaId} value={t.talukaId}>
                        {t.talukaName}
                      </option>
                    ))}
                  </select>
                </Field>
              </>
            )}

            <div className="sm:col-span-2">
              <Field label="WhatsApp Group" error={errors.whatsappGroup}>
                <input
                  value={form.whatsappGroup}
                  onChange={set("whatsappGroup")}
                  placeholder="Group name or https://chat.whatsapp.com/…"
                  className={inputCls(errors.whatsappGroup)}
                />
              </Field>
            </div>

            <Field label="Geofencing Lat" error={errors.geofencingLat}>
              <input
                value={form.geofencingLat}
                onChange={set("geofencingLat")}
                inputMode="decimal"
                placeholder="12.8934"
                className={inputCls(errors.geofencingLat)}
              />
            </Field>

            <Field label="Geofencing Lang" error={errors.geofencingLang}>
              <input
                value={form.geofencingLang}
                onChange={set("geofencingLang")}
                inputMode="decimal"
                placeholder="77.6234"
                className={inputCls(errors.geofencingLang)}
              />
            </Field>

            {!isEdit && (
              <div className="sm:col-span-2">
                <Field label="Ward Boundary GeoJSON (optional)">
                  <label className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-dashed border-hairline cursor-pointer hover:bg-ink/[0.02] transition-colors">
                    <Upload size={15} className="text-muted shrink-0" />
                    <span className="text-[12.5px] text-muted truncate">
                      {geoJsonFile ? geoJsonFile.name : "Upload a .geojson / .json boundary file"}
                    </span>
                    <input
                      type="file"
                      accept=".json,.geojson,application/json"
                      className="hidden"
                      onChange={(e) => setGeoJsonFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </Field>
              </div>
            )}

            {selectedDistrict && !isEdit && (
              <div className="sm:col-span-2 flex items-center gap-2 text-[12px] text-muted">
                <MapPin size={13} />
                State will be set to <span className="text-ink font-medium">{selectedDistrict.state}</span> from the selected district.
              </div>
            )}

            {serverError && (
              <div className="sm:col-span-2 rounded-xl bg-brick/10 text-brick text-[12.5px] px-3.5 py-2.5">
                {serverError}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-hairline bg-paper/60 sticky bottom-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-[13px] font-medium text-ink border border-hairline hover:bg-ink/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-ink hover:bg-ink/90 disabled:opacity-60 transition-colors inline-flex items-center gap-2"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? "Save Changes" : "Create Ward"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Sub-components ──

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold tracking-wide uppercase text-muted mb-1.5">
        {label}
        {required && <span className="text-brick ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-[11.5px] text-brick mt-1">{error}</p>}
    </div>
  );
}

function inputCls(error) {
  return `w-full px-3.5 py-2.5 rounded-xl border text-[13px] text-ink bg-white outline-none transition-colors disabled:bg-ink/[0.03] disabled:text-muted ${
    error
      ? "border-brick focus:border-brick"
      : "border-hairline focus:border-ink/40"
  }`;
}
