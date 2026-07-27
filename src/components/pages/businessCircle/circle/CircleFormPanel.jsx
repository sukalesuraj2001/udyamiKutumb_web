import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const STATES = ["Karnataka", "Tamil Nadu", "Kerala"];
const DISTRICTS_BY_STATE = { Karnataka: ["Bangalore Urban", "Bangalore Rural"], "Tamil Nadu": ["Chennai", "Coimbatore"], Kerala: ["Kochi", "Kozhikode"] };
const ASSEMBLIES_BY_DISTRICT = {
  "Bangalore Urban": ["Malleshwaram", "Yeshwanthapura", "Shivajinagar"],
  "Bangalore Rural": ["Nelamangala", "C.V. Raman Nagar"],
};

const OFFICER_OPTIONS = ["Unassigned", "Priya Sharma", "Rohit Patil", "Anita Deshmukh"];

const EMPTY_FORM = {
  name: "", state: "Karnataka", district: "", assembly: "",
  meetingDay: "", meetingTime: "", location: "", description: "",
  status: "Active", president: "Unassigned", vicePresident: "Unassigned", secretary: "Unassigned",
};

const INPUT = "w-full min-w-0 border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-[13.5px] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 placeholder:text-[#9CA3AF]";
const LABEL = "text-[13px] font-medium text-[#374151] mb-1.5 block";

export default function CircleFormPanel({ mode, circle, onClose, onSubmit }) {
  const isEdit = mode === "edit";
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState(() =>
    isEdit && circle
      ? {
          name: circle.name, state: "Karnataka", district: "", assembly: circle.location,
          meetingDay: circle.meetingDay, meetingTime: circle.meetingTime, location: circle.location,
          description: "", status: circle.status,
          president: circle.president || "Unassigned",
          vicePresident: circle.vicePresident || "Unassigned",
          secretary: circle.secretary || "Unassigned",
        }
      : EMPTY_FORM
  );

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 250);
  };

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = () => {
    onSubmit({ ...form, id: circle?.id });
    handleClose();
  };

  const districtOptions = DISTRICTS_BY_STATE[form.state] || [];
  const assemblyOptions = ASSEMBLIES_BY_DISTRICT[form.district] || [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity duration-250 ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={handleClose}
      />

      <div
        className={`relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto transition-transform duration-300 ease-out ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-6 py-5 flex items-start justify-between z-10">
          <h2 className="text-[18px] font-semibold text-[#111827]">
            {isEdit ? "Edit circle" : "Create circle"}
          </h2>
          <button onClick={handleClose} className="text-[#9CA3AF] hover:text-[#374151] transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Circle name */}
          <div>
            <label className={LABEL}>Circle name</label>
            <input
              value={form.name}
              onChange={(e) => update({ name: e.target.value })}
              className={INPUT}
            />
          </div>

          {/* Assembly */}
          {isEdit ? (
            <div>
              <label className={LABEL}>Assembly</label>
              <input
                value={form.assembly}
                onChange={(e) => update({ assembly: e.target.value })}
                className={INPUT}
              />
            </div>
          ) : (
            <div>
              <p className="text-[13px] font-medium text-[#374151] mb-2">Assembly</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-[11px] font-semibold tracking-wide uppercase text-[#6B7280] mb-1.5 block">State</label>
                  <select
                    value={form.state}
                    onChange={(e) => update({ state: e.target.value, district: "", assembly: "" })}
                    className={INPUT}
                  >
                    {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold tracking-wide uppercase text-[#6B7280] mb-1.5 block">District</label>
                  <select
                    value={form.district}
                    onChange={(e) => update({ district: e.target.value, assembly: "" })}
                    className={INPUT}
                  >
                    <option value="">Select district</option>
                    {districtOptions.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <select
                value={form.assembly}
                onChange={(e) => update({ assembly: e.target.value })}
                disabled={!form.district}
                className={`${INPUT} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <option value="">Select assembly</option>
                {assemblyOptions.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          )}

          {/* Meeting day + time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Meeting day</label>
              <input
                value={form.meetingDay}
                onChange={(e) => update({ meetingDay: e.target.value })}
                placeholder="e.g. Tuesday"
                className={INPUT}
              />
            </div>
            <div>
              <label className={LABEL}>Meeting time</label>
              <input
                value={form.meetingTime}
                onChange={(e) => update({ meetingTime: e.target.value })}
                placeholder="e.g. 7:00 AM"
                className={INPUT}
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className={LABEL}>Location</label>
            <input
              value={form.location}
              onChange={(e) => update({ location: e.target.value })}
              className={INPUT}
            />
          </div>

          {/* Status / Description */}
          {isEdit ? (
            <div>
              <label className={LABEL}>Status</label>
              <select
                value={form.status}
                onChange={(e) => update({ status: e.target.value })}
                className={INPUT}
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          ) : (
            <div>
              <label className={LABEL}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => update({ description: e.target.value })}
                rows={3}
                className={`${INPUT} resize-y`}
              />
            </div>
          )}

          {/* Officers */}
          {isEdit && (
            <div>
              <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#6B7280] mb-3">
                Officers
              </p>
              <div className="space-y-3">
                {[
                  { key: "president", label: "President" },
                  { key: "vicePresident", label: "Vice president" },
                  { key: "secretary", label: "Secretary" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className={LABEL}>{label}</label>
                    <select
                      value={form[key]}
                      onChange={(e) => update({ [key]: e.target.value })}
                      className={INPUT}
                    >
                      {OFFICER_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!form.name.trim()}
            className="w-full bg-[#3B5BDB] text-white text-[13.5px] font-semibold py-3 rounded-xl hover:bg-[#3451C7] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isEdit ? "Save changes" : "Create circle"}
          </button>
        </div>
      </div>
    </div>
  );
}