import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchJobs,
    createJob,
    updateJob,
    deleteJob,
    selectJobs,
    selectJobsTotal,
    selectJobsStatus,
    selectJobsError,
    selectJobActionStatus,
    selectJobActionError,
    clearJobError,
} from "../../redux/slices/Jobslice.js";

// ─── Helpers & Enums ──────────────────────────────────────────────────────────
const JOB_TYPES = ["Full time", "Part time", "Contract", "Internship", "Freelance"];
const CATEGORIES = ["Sales", "Accounting", "Marketing", "IT", "Operations", "HR", "Finance", "Design"];
const STATUSES = ["Draft", "Open", "Closed"];

const UI_TO_BACKEND_JOB_TYPE = {
    "Full time": "FULL_TIME",
    "Part time": "PART_TIME",
    "Contract": "CONTRACT",
    "Internship": "INTERNSHIP",
    "Freelance": "FREELANCE",
};

const BACKEND_TO_UI_JOB_TYPE = {
    FULL_TIME: "Full time",
    PART_TIME: "Part time",
    CONTRACT: "Contract",
    INTERNSHIP: "Internship",
    FREELANCE: "Freelance",
};

const UI_TO_BACKEND_STATUS = {
    Draft: "DRAFT",
    Open: "OPEN",
    Closed: "CLOSED",
};

const BACKEND_TO_UI_STATUS = {
    DRAFT: "Draft",
    OPEN: "Open",
    CLOSED: "Closed",
};

const STATUS_STYLES = {
    Draft: { pill: "bg-gray-100 text-gray-600 border-gray-200", dot: "bg-gray-400" },
    Open: { pill: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
    Closed: { pill: "bg-red-50 text-red-600 border-red-200", dot: "bg-red-400" },
};

function formatStatus(rawStatus) {
    if (!rawStatus) return "Draft";
    return BACKEND_TO_UI_STATUS[rawStatus.toUpperCase()] || rawStatus;
}

function formatJobType(rawJobType) {
    if (!rawJobType) return "Full time";
    return BACKEND_TO_UI_JOB_TYPE[rawJobType.toUpperCase()] || rawJobType;
}

function timeAgo(dateStr) {
    if (!dateStr) return "Just now";
    const diff = Date.now() - new Date(dateStr).getTime();
    if (isNaN(diff)) return "Recently";
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
}

const emptyJob = () => ({
    title: "", companyName: "", category: "Sales", location: "",
    city: "", ward: "", salaryRange: "", jobType: "Full time",
    openings: 1, experience: "", requirements: "",
    postedBy: "", status: "Draft", active: false, apps: 0,
});

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, color }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-1 min-w-0">
            <span className="text-xs font-semibold tracking-widest text-gray-400 uppercase">{label}</span>
            <span className={`text-3xl font-bold ${color}`}>{value}</span>
        </div>
    );
}

// ─── Active Toggle Button ─────────────────────────────────────────────────────
function ActiveBtn({ active, onClick, disabled }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border disabled:opacity-50 ${active
                    ? "bg-[#1a1f3c] text-white border-[#1a1f3c] hover:bg-[#2a2f5c]"
                    : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"
                }`}
        >
            {active ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
            )}
            {active ? "Active" : "Hidden"}
        </button>
    );
}

// ─── Job Modal ────────────────────────────────────────────────────────────────
function JobModal({ job, onClose, onSave, isSaving, actionError }) {
    const isEdit = !!(job?.id || job?._id || job?.jobId);
    const [form, setForm] = useState(() => {
        if (!job) return emptyJob();
        return {
            ...job,
            companyName: job.companyName || job.company || "",
            status: formatStatus(job.status),
            jobType: formatJobType(job.jobType),
        };
    });

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const valid = form.title?.trim() && form.companyName?.trim();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
                    <h2 className="text-lg font-bold text-gray-900">{isEdit ? "Edit Job" : "Post New Job"}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="px-6 py-5 space-y-5">
                    {actionError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600">
                            {actionError}
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Title *</label>
                        <input value={form.title || ""} onChange={e => set("title", e.target.value)}
                            placeholder="Job title" className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition" />
                    </div>

                    {/* Company + Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Company Name *</label>
                            <input value={form.companyName || ""} onChange={e => set("companyName", e.target.value)}
                                placeholder="Company name" className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Category</label>
                            <select value={form.category || "Sales"} onChange={e => set("category", e.target.value)}
                                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white transition">
                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Location + City */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Location</label>
                            <input value={form.location || ""} onChange={e => set("location", e.target.value)}
                                placeholder="e.g. Kharadi IT Park" className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">City</label>
                            <input value={form.city || ""} onChange={e => set("city", e.target.value)}
                                placeholder="e.g. Pune" className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition" />
                        </div>
                    </div>

                    {/* Ward + Salary */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Ward</label>
                            <input value={form.ward || ""} onChange={e => set("ward", e.target.value)}
                                placeholder="e.g. Ward 12" className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Salary Range</label>
                            <input value={form.salaryRange || ""} onChange={e => set("salaryRange", e.target.value)}
                                placeholder="e.g. ₹3,00,000 - ₹5,00,000 Per Year" className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition" />
                        </div>
                    </div>

                    {/* Job type + Openings */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Job Type</label>
                            <select value={form.jobType || "Full time"} onChange={e => set("jobType", e.target.value)}
                                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white transition">
                                {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Openings</label>
                            <input type="number" min={1} value={form.openings || 1} onChange={e => set("openings", e.target.value)}
                                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition" />
                        </div>
                    </div>

                    {/* Experience */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Experience Required</label>
                        <input value={form.experience || ""} onChange={e => set("experience", e.target.value)}
                            placeholder="e.g. 2-4 Years" className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition" />
                    </div>

                    {/* Requirements */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Requirements</label>
                        <textarea value={form.requirements || ""} onChange={e => set("requirements", e.target.value)}
                            rows={4} placeholder="Describe job requirements…"
                            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition" />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Status</label>
                        <div className="flex gap-2 flex-wrap">
                            {STATUSES.map(s => (
                                <button key={s} type="button" onClick={() => set("status", s)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${form.status === s
                                            ? s === "Open" ? "bg-emerald-600 text-white border-emerald-600"
                                                : s === "Closed" ? "bg-red-500 text-white border-red-500"
                                                    : "bg-gray-600 text-white border-gray-600"
                                            : "bg-white text-gray-500 border-gray-200 hover:border-violet-300 hover:text-violet-600"
                                        }`}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white rounded-b-2xl">
                    <button onClick={onClose} disabled={isSaving}
                        className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition disabled:opacity-50">
                        Cancel
                    </button>
                    <button onClick={() => valid && onSave(form)} disabled={!valid || isSaving}
                        className="px-5 py-2.5 text-sm font-semibold text-white bg-violet-600 rounded-xl hover:bg-violet-700 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-violet-200 flex items-center gap-2">
                        {isSaving && (
                            <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                        )}
                        {isEdit ? (isSaving ? "Saving…" : "Save Changes") : (isSaving ? "Posting…" : "Post Job")}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────
function DeleteModal({ title, onClose, onConfirm, isDeleting, actionError }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7 text-center">
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Remove job?</h3>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                    <span className="font-semibold text-gray-700">"{title}"</span> will be permanently removed.
                </p>
                {actionError && (
                    <div className="p-2.5 mb-4 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600">
                        {actionError}
                    </div>
                )}
                <div className="flex gap-3">
                    <button onClick={onClose} disabled={isDeleting} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition disabled:opacity-50">Cancel</button>
                    <button onClick={onConfirm} disabled={isDeleting} className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-1.5">
                        {isDeleting ? "Removing…" : "Remove"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Table Row (desktop) ──────────────────────────────────────────────────────
function JobRow({ job, onEdit, onToggleActive, onDelete, onStatusChange, isActionLoading }) {
    const jobStatusUI = formatStatus(job.status);
    const company = job.companyName || job.company || "—";
    const jobId = job.jobId || job.id || job._id;

    return (
        <tr className="border-b border-gray-50 hover:bg-violet-50/30 transition-colors group">
            {/* Title / Company */}
            <td className="py-3.5 px-4">
                <p className="text-sm font-bold text-gray-900 leading-tight">{job.title || "—"}</p>
                <p className="text-xs text-gray-400 mt-0.5">{company}</p>
            </td>
            {/* Posted by */}
            <td className="py-3.5 px-4">
                <span className="text-xs font-semibold text-violet-600">{job.postedBy || "Admin"}</span>
                <p className="text-xs text-gray-400 mt-0.5">{timeAgo(job.postedAt || job.createdAt)}</p>
            </td>
            {/* Location */}
            <td className="py-3.5 px-4">
                <span className="text-sm text-gray-600">{job.city || job.ward || job.location || "—"}</span>
            </td>
            {/* Status dropdown */}
            <td className="py-3.5 px-4">
                <div className="relative inline-block">
                    <select
                        value={jobStatusUI}
                        onChange={e => onStatusChange(jobId, e.target.value)}
                        disabled={isActionLoading}
                        className={`appearance-none pl-7 pr-6 py-1.5 rounded-full text-[11px] font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-400 transition disabled:opacity-50 ${STATUS_STYLES[jobStatusUI]?.pill || STATUS_STYLES.Draft.pill}`}
                    >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full pointer-events-none ${STATUS_STYLES[jobStatusUI]?.dot || STATUS_STYLES.Draft.dot}`} />
                    <svg className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-current opacity-60" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </td>
            {/* Apps */}
            <td className="py-3.5 px-4 text-center">
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${(job.apps || job.applicationsCount || 0) > 0 ? "bg-violet-600 text-white" : "bg-[#1a1f3c] text-white"
                    }`}>{job.apps || job.applicationsCount || 0}</span>
            </td>
            {/* Active */}
            <td className="py-3.5 px-4">
                <ActiveBtn active={job.active} onClick={() => onToggleActive(jobId)} disabled={isActionLoading} />
            </td>
            {/* Actions */}
            <td className="py-3.5 px-4">
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(job)} disabled={isActionLoading}
                        className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition disabled:opacity-50">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button onClick={() => onDelete(job)} disabled={isActionLoading}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    );
}

// ─── Mobile Card ──────────────────────────────────────────────────────────────
function JobCard({ job, onEdit, onToggleActive, onDelete, onStatusChange, isActionLoading }) {
    const jobStatusUI = formatStatus(job.status);
    const company = job.companyName || job.company || "—";
    const jobId = job.jobId || job.id || job._id;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="text-sm font-bold text-gray-900">{job.title || "—"}</p>
                    <p className="text-xs text-gray-400">{company}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border flex-shrink-0 ${STATUS_STYLES[jobStatusUI]?.pill || STATUS_STYLES.Draft.pill}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_STYLES[jobStatusUI]?.dot || STATUS_STYLES.Draft.dot}`} />
                    {jobStatusUI}
                </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                <span>📍 {job.city || job.ward || job.location || "—"}</span>
                <span>👤 {job.postedBy || "Admin"}</span>
                <span>📅 {timeAgo(job.postedAt || job.createdAt)}</span>
                <span>🧑‍💼 {job.apps || job.applicationsCount || 0} applicants</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                <ActiveBtn active={job.active} onClick={() => onToggleActive(jobId)} disabled={isActionLoading} />
                <div className="flex gap-2">
                    <select value={jobStatusUI} onChange={e => onStatusChange(jobId, e.target.value)} disabled={isActionLoading}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white disabled:opacity-50">
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={() => onEdit(job)} disabled={isActionLoading} className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition disabled:opacity-50">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button onClick={() => onDelete(job)} disabled={isActionLoading} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function JobManagement() {
    const dispatch = useDispatch();
    const jobs = useSelector(selectJobs);
    const totalJobs = useSelector(selectJobsTotal);
    const status = useSelector(selectJobsStatus);
    const error = useSelector(selectJobsError);
    const actionStatus = useSelector(selectJobActionStatus);
    const actionError = useSelector(selectJobActionError);

    const [search, setSearch] = useState("");
    const [cityFilter, setCityFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [page, setPage] = useState(1);
    const limit = 10;
    const [modal, setModal] = useState(null);

    // Refresh function to reload jobs from backend
    const refreshList = (currentPage = page) => {
        dispatch(fetchJobs({ page: currentPage, limit, search, city: cityFilter }));
    };

    useEffect(() => {
        refreshList(page);
    }, [dispatch, page, search, cityFilter]);

    const stats = {
        total: totalJobs || jobs.length,
        open: jobs.filter(j => formatStatus(j.status) === "Open").length,
        closed: jobs.filter(j => formatStatus(j.status) === "Closed").length,
        draft: jobs.filter(j => formatStatus(j.status) === "Draft").length,
    };

    const filtered = jobs.filter(j => {
        const q = search.toLowerCase();
        const company = (j.companyName || j.company || "").toLowerCase();
        const matchQ = !q
            || (j.title && j.title.toLowerCase().includes(q))
            || company.includes(q)
            || (j.postedBy && j.postedBy.toLowerCase().includes(q))
            || (j.city && j.city.toLowerCase().includes(q))
            || (j.ward && j.ward.toLowerCase().includes(q));
        const matchS = statusFilter === "All" || formatStatus(j.status) === statusFilter;
        return matchQ && matchS;
    });

    const isActionLoading = actionStatus === "loading";
    const isLoading = status === "loading";

    const handleSave = async (form) => {
        const payload = {
            title: form.title,
            companyName: form.companyName || form.company,
            category: form.category || "Sales",
            location: form.location || "",
            city: form.city || "",
            ward: form.ward || "",
            salaryRange: form.salaryRange || "",
            jobType: UI_TO_BACKEND_JOB_TYPE[form.jobType] || "FULL_TIME",
            openings: parseInt(form.openings, 10) || 1,
            experience: form.experience || "",
            requirements: form.requirements || "",
            status: UI_TO_BACKEND_STATUS[form.status] || "DRAFT",
        };

        const targetId = form.jobId || form.id || form._id;

        if (targetId) {
            const res = await dispatch(updateJob({ jobId: targetId, id: targetId, ...payload }));
            if (updateJob.fulfilled.match(res)) {
                setModal(null);
                refreshList(page);
            }
        } else {
            const res = await dispatch(createJob(payload));
            if (createJob.fulfilled.match(res)) {
                setModal(null);
                refreshList(1);
            }
        }
    };

    const handleToggleActive = async (id) => {
        const target = jobs.find(j => (j.jobId || j.id || j._id) === id);
        if (target) {
            const res = await dispatch(updateJob({ jobId: id, id, active: !target.active }));
            if (updateJob.fulfilled.match(res)) {
                refreshList(page);
            }
        }
    };

    const handleStatusChange = async (id, newStatusUI) => {
        const backendStatus = UI_TO_BACKEND_STATUS[newStatusUI] || "DRAFT";
        const res = await dispatch(updateJob({ jobId: id, id, status: backendStatus }));
        if (updateJob.fulfilled.match(res)) {
            refreshList(page);
        }
    };

    const handleDelete = async () => {
        const targetId = modal?.data?.jobId || modal?.data?.id || modal?.data?._id;
        if (targetId) {
            const res = await dispatch(deleteJob(targetId));
            if (deleteJob.fulfilled.match(res)) {
                setModal(null);
                refreshList(page);
            }
        }
    };

    const totalPages = Math.ceil((totalJobs || jobs.length) / limit) || 1;

    return (
        <div className="min-h-screen bg-[#F7F8FC] font-sans">
            {/* ── Sticky Header ── */}
            <div className="sticky top-0 z-30 bg-[#F7F8FC]/90 backdrop-blur border-b border-gray-100 px-4 sm:px-8 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center shadow-sm shadow-violet-200">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 leading-tight">Job Management</h1>
                            <p className="text-xs text-gray-400 hidden sm:block">Review, moderate and remove jobs posted across the platform.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            dispatch(clearJobError());
                            setModal({ type: "new" });
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition shadow-sm shadow-violet-200 whitespace-nowrap"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Post Job
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 space-y-6">
                {/* Error Banner */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between gap-3 text-sm text-red-600 font-medium">
                        <span>{error}</span>
                        <button onClick={() => dispatch(clearJobError())} className="text-red-400 hover:text-red-700 font-bold">
                            Dismiss
                        </button>
                    </div>
                )}

                {/* ── Stats ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <StatCard label="Total Jobs" value={stats.total} color="text-gray-900" />
                    <StatCard label="Open" value={stats.open} color="text-emerald-600" />
                    <StatCard label="Closed" value={stats.closed} color="text-red-500" />
                    <StatCard label="Draft" value={stats.draft} color="text-amber-500" />
                </div>

                {/* ── Search + City + Status Filters ── */}
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px]">
                        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search title, company, ward…"
                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm transition" />
                    </div>

                    {/* City filter */}
                    <div className="relative w-full sm:w-48">
                        <input value={cityFilter} onChange={e => { setCityFilter(e.target.value); setPage(1); }}
                            placeholder="Filter by city…"
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm transition" />
                    </div>

                    {/* Status dropdown */}
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm transition">
                        <option value="All">All statuses</option>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                {/* ── Desktop Table ── */}
                <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="text-center py-20">
                            <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                            <p className="text-sm font-semibold text-gray-500">Loading jobs from API…</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-sm font-semibold text-gray-400">No jobs found</p>
                            <p className="text-xs text-gray-300 mt-1">Try a different search, city, or status filter</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    {["Title / Company", "Posted by", "Location", "Status", "Apps", "Active", "Actions"].map(h => (
                                        <th key={h} className="text-left text-xs font-semibold text-violet-500 uppercase tracking-wide py-3.5 px-4">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(j => (
                                    <JobRow key={j.jobId || j.id || j._id} job={j}
                                        onEdit={j => {
                                            dispatch(clearJobError());
                                            setModal({ type: "edit", data: j });
                                        }}
                                        onToggleActive={handleToggleActive}
                                        onDelete={j => {
                                            dispatch(clearJobError());
                                            setModal({ type: "delete", data: j });
                                        }}
                                        onStatusChange={handleStatusChange}
                                        isActionLoading={isActionLoading}
                                    />
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* ── Mobile Cards ── */}
                <div className="md:hidden space-y-3">
                    {isLoading ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                            <div className="w-7 h-7 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            <p className="text-xs font-semibold text-gray-400">Loading jobs from API…</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                            <p className="text-sm font-semibold text-gray-400">No jobs found</p>
                        </div>
                    ) : filtered.map(j => (
                        <JobCard key={j.jobId || j.id || j._id} job={j}
                            onEdit={j => {
                                dispatch(clearJobError());
                                setModal({ type: "edit", data: j });
                            }}
                            onToggleActive={handleToggleActive}
                            onDelete={j => {
                                dispatch(clearJobError());
                                setModal({ type: "delete", data: j });
                            }}
                            onStatusChange={handleStatusChange}
                            isActionLoading={isActionLoading}
                        />
                    ))}
                </div>

                {/* ── Pagination Bar ── */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3">
                        <span className="text-xs font-semibold text-gray-500">
                            Page {page} of {totalPages} ({totalJobs} total jobs)
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1 || isLoading}
                                className="px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || isLoading}
                                className="px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Modals ── */}
            {modal?.type === "new" && (
                <JobModal
                    onClose={() => setModal(null)}
                    onSave={handleSave}
                    isSaving={isActionLoading}
                    actionError={actionError}
                />
            )}
            {modal?.type === "edit" && (
                <JobModal
                    job={modal.data}
                    onClose={() => setModal(null)}
                    onSave={handleSave}
                    isSaving={isActionLoading}
                    actionError={actionError}
                />
            )}
            {modal?.type === "delete" && (
                <DeleteModal
                    title={modal.data.title}
                    onClose={() => setModal(null)}
                    onConfirm={handleDelete}
                    isDeleting={isActionLoading}
                    actionError={actionError}
                />
            )}
        </div>
    );
}