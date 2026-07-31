// import { useEffect, useState, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   fetchDistricts,
//   fetchTalukasByDistrict,
//   createWard,
//   resetWardForm,
//   selectDistricts,
//   selectTalukas,
//   selectLoadingDistricts,
//   selectLoadingTalukas,
//   selectCreating,
//   selectCreateSuccess,
//   selectCreateError,
// } from "../../redux/slices/wardSlice.js";

// // ─── Icon component (Tabler outline via CDN — add to index.html if not present)
// // <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />

// const S = {
//   page: {
//     minHeight: "100vh",
//     background: "#f8f9fb",
//     fontFamily: "'Inter','Segoe UI',sans-serif",
//     padding: "32px 36px",
//   },

//   // ── Right panel (now full page)
//   right: {
//     maxWidth: "720px",
//     display: "flex",
//     flexDirection: "column",
//   },
//   breadcrumb: {
//     display: "flex",
//     alignItems: "center",
//     gap: "6px",
//     fontSize: "12px",
//     color: "#94a3b8",
//     marginBottom: "6px",
//   },
//   breadSep: { color: "#cbd5e1" },
//   breadActive: { color: "#3b82f6", fontWeight: 500 },
//   pageTitle: { fontSize: "20px", fontWeight: 600, color: "#0f172a", margin: "0 0 24px 0" },

//   // Section label
//   sectionLabel: {
//     fontSize: "11px",
//     fontWeight: 600,
//     textTransform: "uppercase",
//     letterSpacing: "0.06em",
//     color: "#94a3b8",
//     marginBottom: "12px",
//     display: "flex",
//     alignItems: "center",
//     gap: "8px",
//   },
//   sectionLine: { flex: 1, height: "0.5px", background: "#e2e8f0" },

//   formSection: { marginBottom: "20px" },
//   fieldRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
//   fieldFull: { gridColumn: "1 / -1" },
//   field: { display: "flex", flexDirection: "column", gap: "5px" },
//   label: { fontSize: "12px", fontWeight: 600, color: "#475569" },
//   req: { color: "#ef4444", marginLeft: "2px" },
//   hint: { fontSize: "11px", color: "#94a3b8", marginTop: "2px" },
//   errText: { fontSize: "11px", color: "#ef4444", marginTop: "2px" },

//   // Input wrapper with leading icon
//   inputWrap: { position: "relative" },
//   leadIcon: {
//     position: "absolute",
//     left: "11px",
//     top: "50%",
//     transform: "translateY(-50%)",
//     fontSize: "15px",
//     color: "#94a3b8",
//     pointerEvents: "none",
//     lineHeight: 1,
//   },
//   input: (focused, hasErr) => ({
//     width: "100%",
//     height: "38px",
//     padding: "0 12px 0 34px",
//     borderRadius: "8px",
//     border: hasErr ? "0.5px solid #ef4444" : focused ? "0.5px solid #3b82f6" : "0.5px solid #e2e8f0",
//     boxShadow: focused && !hasErr ? "0 0 0 3px #eff6ff" : "none",
//     background: "#ffffff",
//     color: "#0f172a",
//     fontSize: "13.5px",
//     outline: "none",
//     transition: "border-color .15s, box-shadow .15s",
//     boxSizing: "border-box",
//   }),
//   select: (focused, hasErr) => ({
//     width: "100%",
//     height: "38px",
//     padding: "0 32px 0 34px",
//     borderRadius: "8px",
//     border: hasErr ? "0.5px solid #ef4444" : focused ? "0.5px solid #3b82f6" : "0.5px solid #e2e8f0",
//     boxShadow: focused && !hasErr ? "0 0 0 3px #eff6ff" : "none",
//     background: "#ffffff",
//     color: "#0f172a",
//     fontSize: "13.5px",
//     outline: "none",
//     appearance: "none",
//     backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
//     backgroundRepeat: "no-repeat",
//     backgroundPosition: "right 11px center",
//     cursor: "pointer",
//     transition: "border-color .15s, box-shadow .15s",
//     boxSizing: "border-box",
//   }),

//   // District chip
//   chip: {
//     display: "inline-flex",
//     alignItems: "center",
//     gap: "5px",
//     padding: "3px 10px",
//     background: "#eff6ff",
//     border: "0.5px solid #bfdbfe",
//     borderRadius: "100px",
//     fontSize: "11px",
//     color: "#2563eb",
//     fontWeight: 500,
//   },

//   // Drop zone
//   dropZone: (drag, hasFile) => ({
//     border: hasFile
//       ? "0.5px dashed #86efac"
//       : drag
//         ? "0.5px dashed #3b82f6"
//         : "0.5px dashed #cbd5e1",
//     borderRadius: "10px",
//     padding: "22px 16px",
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     gap: "5px",
//     cursor: "pointer",
//     background: hasFile ? "#f0fdf4" : drag ? "#eff6ff" : "#f8f9fb",
//     transition: "all .15s",
//   }),
//   dropIconBg: {
//     width: "40px",
//     height: "40px",
//     borderRadius: "10px",
//     background: "#ffffff",
//     border: "0.5px solid #e2e8f0",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: "4px",
//   },
//   dropTitle: { fontSize: "13px", color: "#1e293b", fontWeight: 500 },
//   dropTitleAccent: { color: "#3b82f6" },
//   dropSub: { fontSize: "11.5px", color: "#94a3b8" },
//   fileName: { fontSize: "12px", color: "#16a34a", fontWeight: 600, marginTop: "2px" },
//   removeFile: { fontSize: "11px", color: "#94a3b8", cursor: "pointer", textDecoration: "underline" },

//   // Alerts
//   alertErr: {
//     display: "flex",
//     alignItems: "center",
//     gap: "8px",
//     padding: "10px 14px",
//     background: "#fef2f2",
//     border: "0.5px solid #fecaca",
//     borderRadius: "8px",
//     fontSize: "13px",
//     color: "#dc2626",
//     marginBottom: "16px",
//   },
//   alertOk: {
//     display: "flex",
//     alignItems: "center",
//     gap: "8px",
//     padding: "10px 14px",
//     background: "#f0fdf4",
//     border: "0.5px solid #bbf7d0",
//     borderRadius: "8px",
//     fontSize: "13px",
//     color: "#16a34a",
//     marginBottom: "16px",
//   },

//   // Footer
//   footer: {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginTop: "28px",
//     paddingTop: "16px",
//     borderTop: "0.5px solid #e2e8f0",
//   },
//   statusBadge: {
//     display: "flex",
//     alignItems: "center",
//     gap: "5px",
//     fontSize: "12px",
//     color: "#64748b",
//     padding: "5px 10px",
//     background: "#f8f9fb",
//     border: "0.5px solid #e2e8f0",
//     borderRadius: "8px",
//   },
//   btnCancel: {
//     padding: "0 16px",
//     height: "36px",
//     borderRadius: "8px",
//     border: "0.5px solid #e2e8f0",
//     background: "transparent",
//     color: "#64748b",
//     fontSize: "13px",
//     cursor: "pointer",
//     fontFamily: "inherit",
//   },
//   btnPrimary: (disabled) => ({
//     padding: "0 20px",
//     height: "36px",
//     borderRadius: "8px",
//     border: "none",
//     background: disabled ? "#93c5fd" : "#3b82f6",
//     color: "#ffffff",
//     fontSize: "13px",
//     fontWeight: 600,
//     cursor: disabled ? "not-allowed" : "pointer",
//     display: "flex",
//     alignItems: "center",
//     gap: "6px",
//     fontFamily: "inherit",
//     transition: "background .15s",
//   }),
//   spinner: {
//     width: "13px",
//     height: "13px",
//     border: "2px solid rgba(255,255,255,0.35)",
//     borderTopColor: "#fff",
//     borderRadius: "50%",
//     animation: "spin .7s linear infinite",
//     flexShrink: 0,
//   },
// };


// export default function CreateWard({ onCancel }) {
//   const dispatch = useDispatch();

//   const districts = useSelector(selectDistricts);
//   const talukas = useSelector(selectTalukas);
//   const loadingDistricts = useSelector(selectLoadingDistricts);
//   const loadingTalukas = useSelector(selectLoadingTalukas);
//   const creating = useSelector(selectCreating);
//   const createSuccess = useSelector(selectCreateSuccess);
//   const createError = useSelector(selectCreateError);

//   const [form, setForm] = useState({
//     wardName: "", wardNumber: "", districtId: "", talukaId: "", geoJsonFile: null,
//   });
//   const [focused, setFocused] = useState(null);
//   const [errors, setErrors] = useState({});
//   const [dragging, setDragging] = useState(false);
//   const fileRef = useRef(null);

//   useEffect(() => {
//     if (!districts.length) dispatch(fetchDistricts());
//   }, [dispatch, districts.length]);

//   useEffect(() => {
//     if (form.districtId) {
//       dispatch(fetchTalukasByDistrict(form.districtId));
//       setForm((p) => ({ ...p, talukaId: "" }));
//     }
//   }, [form.districtId, dispatch]);

//   useEffect(() => {
//     if (createSuccess) {
//       const t = setTimeout(() => {
//         dispatch(resetWardForm());
//         setForm({ wardName: "", wardNumber: "", districtId: "", talukaId: "", geoJsonFile: null });
//       }, 2500);
//       return () => clearTimeout(t);
//     }
//   }, [createSuccess, dispatch]);

//   useEffect(() => () => dispatch(resetWardForm()), [dispatch]);

//   // ── How many required fields are filled
//   const filledCount = [form.wardName, form.wardNumber, form.districtId, form.talukaId]
//     .filter(Boolean).length;

//   const selectedDistrict = districts.find(
//     (d) => (d._id || d.districtId || d.id) === form.districtId
//   );

//   const validate = () => {
//     const e = {};
//     if (!form.wardName.trim()) e.wardName = "Required";
//     if (!form.wardNumber || Number(form.wardNumber) <= 0) e.wardNumber = "Enter a valid number";
//     if (!form.districtId) e.districtId = "Select a district";
//     if (!form.talukaId) e.talukaId = "Select a taluka";
//     return e;
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((p) => ({ ...p, [name]: value }));
//     if (errors[name]) setErrors((p) => ({ ...p, [name]: undefined }));
//   };

//   const handleFile = (file) => {
//     if (file) setForm((p) => ({ ...p, geoJsonFile: file }));
//   };

//   const handleSubmit = () => {
//     const e = validate();
//     if (Object.keys(e).length) { setErrors(e); return; }
//     dispatch(createWard(form));
//   };

//   const handleCancel = () => {
//     dispatch(resetWardForm());
//     onCancel?.();
//   };

//   return (
//     <div style={S.page}>
//       <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

//       <main style={S.right}>
//         <div style={S.breadcrumb}>
//           <span>Ward management</span>
//           <span style={S.breadSep}>›</span>
//           <span style={S.breadActive}>New ward</span>
//         </div>
//         <h1 style={S.pageTitle}>Create ward</h1>

//         {/* Alerts */}
//         {createError && (
//           <div style={S.alertErr}>
//             <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//               <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" />
//               <line x1="12" y1="16" x2="12.01" y2="16" />
//             </svg>
//             {createError}
//           </div>
//         )}
//         {createSuccess && (
//           <div style={S.alertOk}>
//             <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//               <polyline points="20 6 9 17 4 12" />
//             </svg>
//             Ward created successfully!
//           </div>
//         )}

//         {/* ── Section 2: Location */}
//         <div style={S.formSection}>
//           <div style={S.sectionLabel}>
//             Location <div style={S.sectionLine} />
//           </div>
//           <div style={S.fieldRow}>
//             <div style={S.field}>
//               <label style={S.label}>District <span style={S.req}>*</span></label>
//               <div style={S.inputWrap}>
//                 <span style={S.leadIcon}>
//                   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
//                 </span>
//                 <select
//                   style={S.select(focused === "districtId", !!errors.districtId)}
//                   name="districtId" value={form.districtId} onChange={handleChange}
//                   onFocus={() => setFocused("districtId")} onBlur={() => setFocused(null)}
//                   disabled={loadingDistricts}
//                 >
//                   <option value="">{loadingDistricts ? "Loading…" : "Select district"}</option>
//                   {districts.map((d) => (
//                     <option key={d._id || d.districtId || d.id} value={d._id || d.districtId || d.id}>
//                       {d.districtName || d.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               {errors.districtId && <span style={S.errText}>{errors.districtId}</span>}
//             </div>

//             <div style={S.field}>
//               <label style={S.label}>Taluka <span style={S.req}>*</span></label>
//               <div style={S.inputWrap}>
//                 <span style={S.leadIcon}>
//                   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>
//                 </span>
//                 <select
//                   style={S.select(focused === "talukaId", !!errors.talukaId)}
//                   name="talukaId" value={form.talukaId} onChange={handleChange}
//                   onFocus={() => setFocused("talukaId")} onBlur={() => setFocused(null)}
//                   disabled={!form.districtId || loadingTalukas}
//                 >
//                   <option value="">
//                     {!form.districtId ? "Select district first" : loadingTalukas ? "Loading…" : "Select taluka"}
//                   </option>
//                   {talukas.map((t) => (
//                     <option key={t._id || t.talukaId || t.id} value={t._id || t.talukaId || t.id}>
//                       {t.talukaName || t.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               {errors.talukaId && <span style={S.errText}>{errors.talukaId}</span>}
//             </div>

//             {/* District chip — shows after district selected */}
//             {selectedDistrict && talukas.length > 0 && (
//               <div style={{ ...S.fieldFull }}>
//                 <div style={S.chip}>
//                   <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
//                   {selectedDistrict.districtName || selectedDistrict.name} — {talukas.length} taluka{talukas.length !== 1 ? "s" : ""} available
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* ── Section 1: Identity */}
//         <div style={S.formSection}>
//           <div style={S.sectionLabel}>
//             Identity <div style={S.sectionLine} />
//           </div>
//           <div style={S.fieldRow}>
//             <div style={S.field}>
//               <label style={S.label}>Ward name <span style={S.req}>*</span></label>
//               <div style={S.inputWrap}>
//                 <span style={S.leadIcon}>
//                   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
//                 </span>
//                 <input
//                   style={S.input(focused === "wardName", !!errors.wardName)}
//                   name="wardName" value={form.wardName} onChange={handleChange}
//                   onFocus={() => setFocused("wardName")} onBlur={() => setFocused(null)}
//                   placeholder="North Ward" autoComplete="off"
//                 />
//               </div>
//               {errors.wardName && <span style={S.errText}>{errors.wardName}</span>}
//             </div>

//             <div style={S.field}>
//               <label style={S.label}>Ward number <span style={S.req}>*</span></label>
//               <div style={S.inputWrap}>
//                 <span style={S.leadIcon}>
//                   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" /></svg>
//                 </span>
//                 <input
//                   style={S.input(focused === "wardNumber", !!errors.wardNumber)}
//                   name="wardNumber" type="number" min="1" value={form.wardNumber}
//                   onChange={handleChange}
//                   onFocus={() => setFocused("wardNumber")} onBlur={() => setFocused(null)}
//                   placeholder="12"
//                 />
//               </div>
//               {errors.wardNumber
//                 ? <span style={S.errText}>{errors.wardNumber}</span>
//                 : <span style={S.hint}>Must be unique within the taluka</span>}
//             </div>
//           </div>
//         </div>



//         {/* ── Section 3: Boundary file */}
//         <div style={S.formSection}>
//           <div style={S.sectionLabel}>
//             Boundary file <div style={S.sectionLine} />
//           </div>
//           <div
//             style={S.dropZone(dragging, !!form.geoJsonFile)}
//             onClick={() => fileRef.current?.click()}
//             onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
//             onDragLeave={() => setDragging(false)}
//             onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0]); }}
//           >
//             <div style={S.dropIconBg}>
//               {form.geoJsonFile
//                 ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
//                 : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
//               }
//             </div>
//             {form.geoJsonFile ? (
//               <>
//                 <p style={S.fileName}>{form.geoJsonFile.name}</p>
//                 <span
//                   style={S.removeFile}
//                   onClick={(e) => { e.stopPropagation(); setForm((p) => ({ ...p, geoJsonFile: null })); }}
//                 >
//                   Remove file
//                 </span>
//               </>
//             ) : (
//               <>
//                 <p style={S.dropTitle}>
//                   <span style={S.dropTitleAccent}>Click to upload</span> or drag and drop
//                 </p>
//                 <p style={S.dropSub}>.geojson boundary file</p>
//               </>
//             )}
//           </div>
//           <input
//             ref={fileRef} type="file" accept=".geojson,.json,.png,image/*"
//             style={{ display: "none" }}
//             onChange={(e) => handleFile(e.target.files?.[0])}
//           />
//         </div>

//         {/* ── Footer */}
//         <div style={S.footer}>
//           <div style={S.statusBadge}>
//             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
//             {filledCount} of 4 fields filled
//           </div>
//           <div style={{ display: "flex", gap: "10px" }}>
//             <button style={S.btnCancel} onClick={handleCancel} disabled={creating}>
//               Cancel
//             </button>
//             <button
//               style={S.btnPrimary(creating || createSuccess)}
//               onClick={handleSubmit}
//               disabled={creating || createSuccess}
//             >
//               {creating
//                 ? <><div style={S.spinner} /> Creating…</>
//                 : <>
//                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
//                   Create ward
//                 </>
//               }
//             </button>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDistricts,
  fetchTalukasByDistrict,
  createWard,
  resetWardForm,
  selectDistricts,
  selectTalukas,
  selectLoadingDistricts,
  selectLoadingTalukas,
  selectCreating,
  selectCreateSuccess,
  selectCreateError,
} from "../../redux/slices/wardSlice.js";
import {
  fetchWardsByTalukaId,
  selectTalukaWards,
  selectTalukaWardsStatus,
} from "../../../redux/slices/areaChartSlice.js";

const S = {
  page: {
    minHeight: "100vh",
    background: "#f8f9fb",
    fontFamily: "'Inter','Segoe UI',sans-serif",
    padding: "32px 36px",
  },
  right: {
    maxWidth: "720px",
    display: "flex",
    flexDirection: "column",
  },
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    color: "#94a3b8",
    marginBottom: "6px",
  },
  breadSep: { color: "#cbd5e1" },
  breadActive: { color: "#3b82f6", fontWeight: 500 },
  pageTitle: { fontSize: "20px", fontWeight: 600, color: "#0f172a", margin: "0 0 24px 0" },
  sectionLabel: {
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#94a3b8",
    marginBottom: "12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  sectionLine: { flex: 1, height: "0.5px", background: "#e2e8f0" },
  formSection: { marginBottom: "20px" },
  fieldRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
  fieldFull: { gridColumn: "1 / -1" },
  field: { display: "flex", flexDirection: "column", gap: "5px" },
  label: { fontSize: "12px", fontWeight: 600, color: "#475569" },
  req: { color: "#ef4444", marginLeft: "2px" },
  hint: { fontSize: "11px", color: "#94a3b8", marginTop: "2px" },
  errText: { fontSize: "11px", color: "#ef4444", marginTop: "2px" },
  inputWrap: { position: "relative" },
  leadIcon: {
    position: "absolute",
    left: "11px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "15px",
    color: "#94a3b8",
    pointerEvents: "none",
    lineHeight: 1,
  },
  input: (focused, hasErr) => ({
    width: "100%",
    height: "38px",
    padding: "0 12px 0 34px",
    borderRadius: "8px",
    border: hasErr ? "0.5px solid #ef4444" : focused ? "0.5px solid #3b82f6" : "0.5px solid #e2e8f0",
    boxShadow: focused && !hasErr ? "0 0 0 3px #eff6ff" : "none",
    background: "#ffffff",
    color: "#0f172a",
    fontSize: "13.5px",
    outline: "none",
    transition: "border-color .15s, box-shadow .15s",
    boxSizing: "border-box",
  }),
  select: (focused, hasErr) => ({
    width: "100%",
    height: "38px",
    padding: "0 32px 0 34px",
    borderRadius: "8px",
    border: hasErr ? "0.5px solid #ef4444" : focused ? "0.5px solid #3b82f6" : "0.5px solid #e2e8f0",
    boxShadow: focused && !hasErr ? "0 0 0 3px #eff6ff" : "none",
    background: "#ffffff",
    color: "#0f172a",
    fontSize: "13.5px",
    outline: "none",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 11px center",
    cursor: "pointer",
    transition: "border-color .15s, box-shadow .15s",
    boxSizing: "border-box",
  }),
  chip: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "3px 10px",
    background: "#eff6ff",
    border: "0.5px solid #bfdbfe",
    borderRadius: "100px",
    fontSize: "11px",
    color: "#2563eb",
    fontWeight: 500,
  },
  // No wards found notice
  noWardNotice: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "7px 11px",
    background: "#fffbeb",
    border: "0.5px solid #fde68a",
    borderRadius: "7px",
    fontSize: "11.5px",
    color: "#92400e",
    marginTop: "5px",
  },
  // Others back button
  backToSelect: {
    padding: "0 10px",
    height: "38px",
    fontSize: "11px",
    fontWeight: 600,
    color: "#6366f1",
    background: "#eef2ff",
    border: "0.5px solid #c7d2fe",
    borderRadius: "7px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    flexShrink: 0,
    fontFamily: "inherit",
  },
  dropZone: (drag, hasFile) => ({
    border: hasFile
      ? "0.5px dashed #86efac"
      : drag
        ? "0.5px dashed #3b82f6"
        : "0.5px dashed #cbd5e1",
    borderRadius: "10px",
    padding: "22px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "5px",
    cursor: "pointer",
    background: hasFile ? "#f0fdf4" : drag ? "#eff6ff" : "#f8f9fb",
    transition: "all .15s",
  }),
  dropIconBg: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "#ffffff",
    border: "0.5px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "4px",
  },
  dropTitle: { fontSize: "13px", color: "#1e293b", fontWeight: 500 },
  dropTitleAccent: { color: "#3b82f6" },
  dropSub: { fontSize: "11.5px", color: "#94a3b8" },
  fileName: { fontSize: "12px", color: "#16a34a", fontWeight: 600, marginTop: "2px" },
  removeFile: { fontSize: "11px", color: "#94a3b8", cursor: "pointer", textDecoration: "underline" },
  alertErr: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 14px",
    background: "#fef2f2",
    border: "0.5px solid #fecaca",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#dc2626",
    marginBottom: "16px",
  },
  alertOk: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 14px",
    background: "#f0fdf4",
    border: "0.5px solid #bbf7d0",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#16a34a",
    marginBottom: "16px",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "28px",
    paddingTop: "16px",
    borderTop: "0.5px solid #e2e8f0",
  },
  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "12px",
    color: "#64748b",
    padding: "5px 10px",
    background: "#f8f9fb",
    border: "0.5px solid #e2e8f0",
    borderRadius: "8px",
  },
  btnCancel: {
    padding: "0 16px",
    height: "36px",
    borderRadius: "8px",
    border: "0.5px solid #e2e8f0",
    background: "transparent",
    color: "#64748b",
    fontSize: "13px",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  btnPrimary: (disabled) => ({
    padding: "0 20px",
    height: "36px",
    borderRadius: "8px",
    border: "none",
    background: disabled ? "#93c5fd" : "#3b82f6",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontFamily: "inherit",
    transition: "background .15s",
  }),
  spinner: {
    width: "13px",
    height: "13px",
    border: "2px solid rgba(255,255,255,0.35)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin .7s linear infinite",
    flexShrink: 0,
  },
};

export default function CreateWard({ onCancel }) {
  const dispatch = useDispatch();

  // ── Ward slice selectors
  const districts = useSelector(selectDistricts);
  const talukas = useSelector(selectTalukas);
  const loadingDistricts = useSelector(selectLoadingDistricts);
  const loadingTalukas = useSelector(selectLoadingTalukas);
  const creating = useSelector(selectCreating);
  const createSuccess = useSelector(selectCreateSuccess);
  const createError = useSelector(selectCreateError);

  // ── Area-chart slice — ward names from talukaId
  const talukaWards = useSelector(selectTalukaWards);       // array of ward objects
  const talukaWardsStatus = useSelector(selectTalukaWardsStatus); // "idle"|"loading"|"succeeded"|"failed"

  // ── Local state
  const [form, setForm] = useState({
    wardName: "", wardNumber: "", districtId: "", talukaId: "", geoJsonFile: null,
  });
  const [focused, setFocused] = useState(null);
  const [errors, setErrors] = useState({});
  const [dragging, setDragging] = useState(false);
  // "select" → show dropdown  |  "other" → show text input
  const [wardNameMode, setWardNameMode] = useState("select");

  const fileRef = useRef(null);

  // ── Fetch districts once
  useEffect(() => {
    if (!districts.length) dispatch(fetchDistricts());
  }, [dispatch, districts.length]);

  // ── Fetch talukas when district changes
  useEffect(() => {
    if (form.districtId) {
      dispatch(fetchTalukasByDistrict(form.districtId));
      setForm((p) => ({ ...p, talukaId: "" }));
    }
  }, [form.districtId, dispatch]);

  // ── Fetch ward names when taluka changes
  useEffect(() => {
    if (form.talukaId) {
      dispatch(fetchWardsByTalukaId(form.talukaId));
      // Reset ward name field whenever taluka changes
      setForm((p) => ({ ...p, wardName: "" }));
      setWardNameMode("select");
    }
  }, [form.talukaId, dispatch]);

  // ── Auto switch to "other" mode if API returns no wards
  useEffect(() => {
    if (talukaWardsStatus === "succeeded" && talukaWards.length === 0) {
      setWardNameMode("other");
    }
  }, [talukaWardsStatus, talukaWards.length]);

  // ── Success reset
  useEffect(() => {
    if (createSuccess) {
      const t = setTimeout(() => {
        dispatch(resetWardForm());
        setForm({ wardName: "", wardNumber: "", districtId: "", talukaId: "", geoJsonFile: null });
        setWardNameMode("select");
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [createSuccess, dispatch]);

  // ── Cleanup on unmount
  useEffect(() => () => dispatch(resetWardForm()), [dispatch]);

  // ── Helpers
  const filledCount = [form.wardName, form.wardNumber, form.districtId, form.talukaId]
    .filter(Boolean).length;

  const selectedDistrict = districts.find(
    (d) => (d._id || d.districtId || d.id) === form.districtId
  );

  const wardNameOptions = talukaWards.map(
    (w) => w.ward_name || w.wardName || w.name || ""
  ).filter(Boolean);

  const loadingWardNames = talukaWardsStatus === "loading";
  const hasWardOptions = wardNameOptions.length > 0;

  const validate = () => {
    const e = {};
    if (!form.wardName.trim()) e.wardName = "Required";
    if (!form.wardNumber || Number(form.wardNumber) <= 0) e.wardNumber = "Enter a valid number";
    if (!form.districtId) e.districtId = "Select a district";
    if (!form.talukaId) e.talukaId = "Select a taluka";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const handleFile = (file) => { if (file) setForm((p) => ({ ...p, geoJsonFile: file })); };
  const handleSubmit = () => { const e = validate(); if (Object.keys(e).length) { setErrors(e); return; } dispatch(createWard(form)); };
  const handleCancel = () => { dispatch(resetWardForm()); onCancel?.(); };

  // ── Ward name dropdown onChange
  const handleWardNameSelect = (e) => {
    const val = e.target.value;
    if (val === "__others__") {
      setWardNameMode("other");
      setForm((p) => ({ ...p, wardName: "" }));
    } else {
      setForm((p) => ({ ...p, wardName: val }));
      if (errors.wardName) setErrors((p) => ({ ...p, wardName: undefined }));
    }
  };

  // ── Ward name field — three possible states:
  //   1. No taluka selected → disabled placeholder
  //   2. select mode → dropdown (with Others option)
  //   3. other mode  → text input + back button (only if hasWardOptions)
  const renderWardNameField = () => {
    // 1. No taluka yet — show disabled placeholder
    if (!form.talukaId) {
      return (
        <div style={S.inputWrap}>
          <span style={S.leadIcon}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
          </span>
          <select
            style={S.select(false, false)}
            disabled
          >
            <option>Select taluka first</option>
          </select>
        </div>
      );
    }

    // 2. Dropdown mode
    if (wardNameMode === "select") {
      return (
        <>
          <div style={S.inputWrap}>
            <span style={S.leadIcon}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
            </span>
            <select
              style={S.select(focused === "wardName", !!errors.wardName)}
              name="wardName"
              value={form.wardName}
              onChange={handleWardNameSelect}
              onFocus={() => setFocused("wardName")}
              onBlur={() => setFocused(null)}
              disabled={loadingWardNames}
            >
              {/* Placeholder */}
              <option value="">
                {loadingWardNames ? "Loading wards…" : "Select ward name"}
              </option>

              {/* API ward options */}
              {wardNameOptions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}

              {/* Always present — Others */}
              {!loadingWardNames && (
                <option value="__others__">Others</option>
              )}
            </select>
          </div>

          {/* No wards found notice — still show Others hint */}
          {talukaWardsStatus === "succeeded" && !hasWardOptions && (
            <div style={S.noWardNotice}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              No wards found for this taluka — select "Others"
            </div>
          )}
        </>
      );
    }

    // 3. Others / text input mode
    return (
      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        <div style={{ ...S.inputWrap, flex: 1 }}>
          <span style={S.leadIcon}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
          </span>
          <input
            style={S.input(focused === "wardName", !!errors.wardName)}
            name="wardName"
            value={form.wardName}
            onChange={handleChange}
            onFocus={() => setFocused("wardName")}
            onBlur={() => setFocused(null)}
            placeholder="Type ward name…"
            autoComplete="off"
            autoFocus
          />
        </div>

        {/* Back to list — only if there are options to go back to */}
        {hasWardOptions && (
          <button
            type="button"
            style={S.backToSelect}
            onClick={() => {
              setWardNameMode("select");
              setForm((p) => ({ ...p, wardName: "" }));
            }}
          >
            ← List
          </button>
        )}
      </div>
    );
  };

  return (
    <div style={S.page}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <main style={S.right}>
        <div style={S.breadcrumb}>
          <span>Ward management</span>
          <span style={S.breadSep}>›</span>
          <span style={S.breadActive}>New ward / Hobli</span>
        </div>
        <h1 style={S.pageTitle}>Create ward / Hobli</h1>

        {/* Alerts */}
        {createError && (
          <div style={S.alertErr}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {createError}
          </div>
        )}
        {createSuccess && (
          <div style={S.alertOk}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Ward created successfully!
          </div>
        )}

        {/* ── Section: Location */}
        <div style={S.formSection}>
          <div style={S.sectionLabel}>
            Location <div style={S.sectionLine} />
          </div>
          <div style={S.fieldRow}>
            {/* District */}
            <div style={S.field}>
              <label style={S.label}>District <span style={S.req}>*</span></label>
              <div style={S.inputWrap}>
                <span style={S.leadIcon}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </span>
                <select
                  style={S.select(focused === "districtId", !!errors.districtId)}
                  name="districtId" value={form.districtId} onChange={handleChange}
                  onFocus={() => setFocused("districtId")} onBlur={() => setFocused(null)}
                  disabled={loadingDistricts}
                >
                  <option value="">{loadingDistricts ? "Loading…" : "Select district"}</option>
                  {districts.map((d) => (
                    <option key={d._id || d.districtId || d.id} value={d._id || d.districtId || d.id}>
                      {d.districtName || d.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.districtId && <span style={S.errText}>{errors.districtId}</span>}
            </div>

            {/* Taluka */}
            <div style={S.field}>
              <label style={S.label}>Taluka <span style={S.req}>*</span></label>
              <div style={S.inputWrap}>
                <span style={S.leadIcon}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="3 11 22 2 13 21 11 13 3 11" />
                  </svg>
                </span>
                <select
                  style={S.select(focused === "talukaId", !!errors.talukaId)}
                  name="talukaId" value={form.talukaId} onChange={handleChange}
                  onFocus={() => setFocused("talukaId")} onBlur={() => setFocused(null)}
                  disabled={!form.districtId || loadingTalukas}
                >
                  <option value="">
                    {!form.districtId ? "Select district first" : loadingTalukas ? "Loading…" : "Select taluka"}
                  </option>
                  {talukas.map((t) => (
                    <option key={t._id || t.talukaId || t.id} value={t._id || t.talukaId || t.id}>
                      {t.talukaName || t.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.talukaId && <span style={S.errText}>{errors.talukaId}</span>}
            </div>

            {/* District chip */}
            {selectedDistrict && talukas.length > 0 && (
              <div style={{ ...S.fieldFull }}>
                <div style={S.chip}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {selectedDistrict.districtName || selectedDistrict.name} — {talukas.length} taluka{talukas.length !== 1 ? "s" : ""} available
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Section: Identity */}
        <div style={S.formSection}>
          <div style={S.sectionLabel}>
            Identity <div style={S.sectionLine} />
          </div>
          <div style={S.fieldRow}>

            {/* Ward name — dynamic field */}
            <div style={S.field}>
              <label style={S.label}>Ward / Hobli Name <span style={S.req}>*</span></label>
              {renderWardNameField()}
              {errors.wardName && <span style={S.errText}>{errors.wardName}</span>}
            </div>

            {/* Ward number */}
            <div style={S.field}>
              <label style={S.label}>Ward / Hobli Number <span style={S.req}>*</span></label>
              <div style={S.inputWrap}>
                <span style={S.leadIcon}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" />
                    <line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" />
                  </svg>
                </span>
                <input
                  style={S.input(focused === "wardNumber", !!errors.wardNumber)}
                  name="wardNumber"
                  type="text"       
                  value={form.wardNumber}
                  onChange={handleChange}
                  onFocus={() => setFocused("wardNumber")}
                  onBlur={() => setFocused(null)}
                  placeholder="G.33.1"
                  autoComplete="off"
                />
              </div>
              {errors.wardNumber
                ? <span style={S.errText}>{errors.wardNumber}</span>
                : <span style={S.hint}>Must be unique within the taluka</span>}
            </div>
          </div>
        </div>

        {/* ── Section: Boundary file */}
        <div style={S.formSection}>
          <div style={S.sectionLabel}>
            Boundary file <div style={S.sectionLine} />
          </div>
          <div
            style={S.dropZone(dragging, !!form.geoJsonFile)}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0]); }}
          >
            <div style={S.dropIconBg}>
              {form.geoJsonFile
                ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
              }
            </div>
            {form.geoJsonFile ? (
              <>
                <p style={S.fileName}>{form.geoJsonFile.name}</p>
                <span
                  style={S.removeFile}
                  onClick={(e) => { e.stopPropagation(); setForm((p) => ({ ...p, geoJsonFile: null })); }}
                >
                  Remove file
                </span>
              </>
            ) : (
              <>
                <p style={S.dropTitle}>
                  <span style={S.dropTitleAccent}>Click to upload</span> or drag and drop
                </p>
                <p style={S.dropSub}>.geojson boundary file</p>
              </>
            )}
          </div>
          <input
            ref={fileRef} type="file" accept=".geojson,.json,.png,image/*"
            style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>

        {/* ── Footer */}
        <div style={S.footer}>
          <div style={S.statusBadge}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {filledCount} of 4 fields filled
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button style={S.btnCancel} onClick={handleCancel} disabled={creating}>Cancel</button>
            <button
              style={S.btnPrimary(creating || createSuccess)}
              onClick={handleSubmit}
              disabled={creating || createSuccess}
            >
              {creating
                ? <><div style={S.spinner} /> Creating…</>
                : <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Create Ward / Hobli
                </>
              }
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}