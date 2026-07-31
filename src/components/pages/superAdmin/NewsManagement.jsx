import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllNews,
  getFeaturedNews,
  createNews,
  updateNews,
  deleteNews,
  selectNews,
  selectFeaturedNews,
  selectNewsTotal,
  selectNewsStatus,
  selectNewsError,
  selectNewsActionStatus,
  selectNewsActionError,
  clearNewsError,
} from "../../redux/slices/newsSlice.js";

// ─── Constants & Helpers ──────────────────────────────────────────────────────
const SECTORS = [
  "Business", "Technology", "Policy", "Agriculture",
  "Finance", "Health", "Education", "Infrastructure",
];

const SECTOR_COLORS = {
  Business:       { bg: "bg-indigo-100 text-indigo-700",  dot: "bg-indigo-500" },
  Technology:     { bg: "bg-violet-100 text-violet-700",  dot: "bg-violet-500" },
  Policy:         { bg: "bg-amber-100  text-amber-700",   dot: "bg-amber-500"  },
  Agriculture:    { bg: "bg-emerald-100 text-emerald-700",dot: "bg-emerald-500"},
  Finance:        { bg: "bg-blue-100   text-blue-700",    dot: "bg-blue-500"   },
  Health:         { bg: "bg-rose-100   text-rose-700",    dot: "bg-rose-500"   },
  Education:      { bg: "bg-cyan-100   text-cyan-700",    dot: "bg-cyan-500"   },
  Infrastructure: { bg: "bg-orange-100 text-orange-700",  dot: "bg-orange-500" },
};

function sectorStyle(s) {
  return SECTOR_COLORS[s] || { bg: "bg-gray-100 text-gray-600", dot: "bg-gray-400" };
}

function timeAgo(dateStr) {
  if (!dateStr) return "Recently";
  const diff = Date.now() - new Date(dateStr).getTime();
  if (isNaN(diff)) return "Recently";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? "s" : ""} ago`;
}

function nowLocalInput() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

const emptyArticle = () => ({
  title: "", summary: "", body: "", category: "Business",
  source: "", sourceUrl: "", imageUrl: "",
  publishedAt: nowLocalInput(), isFeatured: false,
});

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-1 min-w-0">
      <span className="text-xs font-semibold tracking-widest text-gray-400 uppercase">{label}</span>
      <span className={`text-3xl font-bold ${color}`}>{value}</span>
      {sub && <span className="text-xs text-gray-400 mt-0.5">{sub}</span>}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function SectorBadge({ sector }) {
  const s = sectorStyle(sector);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${s.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {sector}
    </span>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function ArticleModal({ article, onClose, onSave, isSaving, actionError }) {
  const isEdit = !!(article?.newsId || article?.id || article?._id);
  const [form, setForm] = useState(() => {
    if (!article) return emptyArticle();
    return {
      ...article,
      category: article.category || article.sector || "Business",
      imageUrl: article.imageUrl || article.image || "",
      isFeatured: article.isFeatured ?? article.featured ?? false,
      publishedAt: article.publishedAt ? new Date(article.publishedAt).toISOString().slice(0, 16) : nowLocalInput(),
    };
  });
  const fileRef = useRef();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    set("imageUrl", url);
  };

  const valid = form.title?.trim() && form.summary?.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? "Edit Article" : "New Article"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
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
            <input
              value={form.title || ""}
              onChange={e => set("title", e.target.value)}
              placeholder="Headline"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
            />
          </div>

          {/* Summary */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Summary *</label>
            <textarea
              value={form.summary || ""}
              onChange={e => set("summary", e.target.value)}
              placeholder="Short summary"
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Body</label>
            <textarea
              value={form.body || ""}
              onChange={e => set("body", e.target.value)}
              placeholder="Full article content…"
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
            />
          </div>

          {/* Category + Source */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Category</label>
              <select
                value={form.category || "Business"}
                onChange={e => set("category", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white transition"
              >
                {SECTORS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Source</label>
              <input
                value={form.source || ""}
                onChange={e => set("source", e.target.value)}
                placeholder="Source name"
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Image URL</label>
            <div className="flex gap-2">
              <input
                value={form.imageUrl || ""}
                onChange={e => set("imageUrl", e.target.value)}
                placeholder="Paste image URL or upload…"
                className="flex-1 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="px-3.5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-gray-500"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0L8 8m4-4l4 4"/>
                </svg>
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile}/>
            </div>
          </div>

          {/* Source URL */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Source URL</label>
            <input
              value={form.sourceUrl || ""}
              onChange={e => set("sourceUrl", e.target.value)}
              placeholder="https://..."
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
            />
          </div>

          {/* Published at */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Published at</label>
            <input
              type="datetime-local"
              value={form.publishedAt || ""}
              onChange={e => set("publishedAt", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
            />
          </div>

          {/* Featured toggle */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-semibold text-gray-700">Featured article</p>
              <p className="text-xs text-gray-400">Pin to top of news feed</p>
            </div>
            <button
              type="button"
              onClick={() => set("isFeatured", !form.isFeatured)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${form.isFeatured ? "bg-violet-600" : "bg-gray-200"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${form.isFeatured ? "translate-x-6" : ""}`}/>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => valid && onSave(form)}
            disabled={!valid || isSaving}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-violet-600 rounded-xl hover:bg-violet-700 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-violet-200 flex items-center gap-2"
          >
            {isSaving && (
              <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {isEdit ? (isSaving ? "Saving…" : "Save Changes") : (isSaving ? "Publishing…" : "Publish")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ title, onClose, onConfirm, isDeleting, actionError }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7 text-center">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1">Remove article?</h3>
        <p className="text-sm text-gray-500 mb-4 leading-relaxed">
          <span className="font-semibold text-gray-700">"{title}"</span> will be permanently removed from the news feed.
        </p>
        {actionError && (
          <div className="p-2.5 mb-4 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600">
            {actionError}
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={onClose} disabled={isDeleting} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={isDeleting} className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-1.5">
            {isDeleting ? "Removing…" : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Article Row ──────────────────────────────────────────────────────────────
function ArticleRow({ article, onEdit, onToggleFeature, onDelete, isActionLoading }) {
  const category = article.category || article.sector || "Business";
  const imageUrl = article.imageUrl || article.image;
  const isFeatured = article.isFeatured ?? article.featured ?? false;
  const newsId = article.newsId || article.id || article._id;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-violet-100 transition-all duration-200 p-4 flex items-start gap-4">
      {/* Thumbnail */}
      <div className="relative flex-shrink-0">
        <img
          src={imageUrl || `https://placehold.co/72x72/7C3AED/ffffff?text=${category[0]}`}
          alt={article.title}
          className="w-[72px] h-[72px] rounded-xl object-cover border border-gray-100"
          onError={e => { e.target.src = `https://placehold.co/72x72/7C3AED/ffffff?text=${category[0]}`; }}
        />
        {isFeatured && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center shadow">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <SectorBadge sector={category} />
          <span className="text-xs text-gray-400">{timeAgo(article.publishedAt || article.createdAt)}</span>
          {article.source && (
            <span className="text-xs text-gray-400">· {article.source}</span>
          )}
        </div>
        <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-1">{article.title}</h3>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{article.summary}</p>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(article)}
          disabled={isActionLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
          Edit
        </button>
        <button
          onClick={() => onToggleFeature(article)}
          disabled={isActionLoading}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition border disabled:opacity-50 ${
            isFeatured
              ? "text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100"
              : "text-gray-500 bg-gray-50 border-gray-200 hover:bg-gray-100"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill={isFeatured ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
          </svg>
          {isFeatured ? "Featured" : "Feature"}
        </button>
        <button
          onClick={() => onDelete(article)}
          disabled={isActionLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-500 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
          Remove
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function NewsManagement() {
  const dispatch = useDispatch();
  const articles = useSelector(selectNews);
  const totalArticles = useSelector(selectNewsTotal);
  const status = useSelector(selectNewsStatus);
  const error = useSelector(selectNewsError);
  const actionStatus = useSelector(selectNewsActionStatus);
  const actionError = useSelector(selectNewsActionError);

  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("All");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [modal, setModal] = useState(null);

  // Reload news list from backend
  const refreshList = (currentPage = page) => {
    dispatch(getAllNews({
      page: currentPage,
      limit,
      category: sectorFilter,
      search,
      isFeatured: featuredOnly ? true : "",
    }));
  };

  useEffect(() => {
    refreshList(page);
    dispatch(getFeaturedNews());
  }, [dispatch, page, search, sectorFilter, featuredOnly]);

  const stats = {
    total: totalArticles || articles.length,
    featured: articles.filter(a => a.isFeatured ?? a.featured).length,
    withMedia: articles.filter(a => a.imageUrl || a.image).length,
  };

  const isActionLoading = actionStatus === "loading";
  const isLoading = status === "loading";

  const handleSave = async (form) => {
    const payload = {
      title: form.title,
      summary: form.summary,
      body: form.body || "",
      category: form.category || form.sector || "Business",
      source: form.source || "",
      imageUrl: form.imageUrl || form.image || "",
      sourceUrl: form.sourceUrl || "",
      publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : new Date().toISOString(),
      isFeatured: !!form.isFeatured,
    };

    const targetId = form.newsId || form.id || form._id;

    if (targetId) {
      const res = await dispatch(updateNews({ newsId: targetId, id: targetId, ...payload }));
      if (updateNews.fulfilled.match(res)) {
        setModal(null);
        refreshList(page);
      }
    } else {
      const res = await dispatch(createNews(payload));
      if (createNews.fulfilled.match(res)) {
        setModal(null);
        refreshList(1);
      }
    }
  };

  const handleToggleFeature = async (article) => {
    const targetId = article.newsId || article.id || article._id;
    const currentFeatured = article.isFeatured ?? article.featured ?? false;
    const res = await dispatch(updateNews({
      newsId: targetId,
      id: targetId,
      isFeatured: !currentFeatured,
    }));
    if (updateNews.fulfilled.match(res)) {
      refreshList(page);
    }
  };

  const handleDelete = async () => {
    const targetId = modal?.data?.newsId || modal?.data?.id || modal?.data?._id;
    if (targetId) {
      const res = await dispatch(deleteNews(targetId));
      if (deleteNews.fulfilled.match(res)) {
        setModal(null);
        refreshList(page);
      }
    }
  };

  const totalPages = Math.ceil((totalArticles || articles.length) / limit) || 1;
  const activeSectors = ["All", ...SECTORS];

  return (
    <div className="min-h-screen bg-[#F7F8FC] font-sans">
      {/* ── Page Header ── */}
      <div className="sticky top-0 z-30 bg-[#F7F8FC]/90 backdrop-blur border-b border-gray-100 px-4 sm:px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center shadow-sm shadow-violet-200">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">News Management</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Create, edit, feature and remove news articles shown to members.</p>
            </div>
          </div>
          <button
            onClick={() => {
              dispatch(clearNewsError());
              setModal({ type: "new" });
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition shadow-sm shadow-violet-200 whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            New Article
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Error Banner */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between gap-3 text-sm text-red-600 font-medium">
            <span>{error}</span>
            <button onClick={() => dispatch(clearNewsError())} className="text-red-400 hover:text-red-700 font-bold">
              Dismiss
            </button>
          </div>
        )}

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <StatCard label="Total" value={stats.total} sub="All articles" color="text-gray-900"/>
          <StatCard label="Featured" value={stats.featured} sub="Pinned to feed" color="text-violet-600"/>
          <StatCard label="With Media" value={stats.withMedia} sub="Have image" color="text-sky-600"/>
        </div>

        {/* ── Search + Sector + Featured Filters ── */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search input */}
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search title, category, source…"
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm transition"
              />
            </div>

            {/* Featured toggle button */}
            <button
              onClick={() => { setFeaturedOnly(f => !f); setPage(1); }}
              className={`px-4 py-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 ${
                featuredOnly
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-white text-gray-500 border-gray-200 hover:border-violet-300"
              }`}
            >
              <svg className="w-4 h-4" fill={featuredOnly ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
              </svg>
              {featuredOnly ? "Featured Only" : "All Articles"}
            </button>
          </div>

          {/* Sector pills */}
          <div className="flex gap-2 flex-wrap">
            {activeSectors.map(s => (
              <button
                key={s}
                onClick={() => { setSectorFilter(s); setPage(1); }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition border ${
                  sectorFilter === s
                    ? "bg-violet-600 text-white border-violet-600 shadow-sm shadow-violet-200"
                    : "bg-white text-gray-500 border-gray-200 hover:border-violet-300 hover:text-violet-600"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ── Article List ── */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-500">Loading articles from API…</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-400">No articles found</p>
              <p className="text-xs text-gray-300 mt-1">Try a different search, category, or featured filter</p>
            </div>
          ) : (
            articles.map(a => (
              <ArticleRow
                key={a.newsId || a.id || a._id}
                article={a}
                onEdit={art => {
                  dispatch(clearNewsError());
                  setModal({ type: "edit", data: art });
                }}
                onToggleFeature={handleToggleFeature}
                onDelete={art => {
                  dispatch(clearNewsError());
                  setModal({ type: "delete", data: art });
                }}
                isActionLoading={isActionLoading}
              />
            ))
          )}
        </div>

        {/* ── Pagination Bar ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3">
            <span className="text-xs font-semibold text-gray-500">
              Page {page} of {totalPages} ({totalArticles} total articles)
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
        <ArticleModal
          onClose={() => setModal(null)}
          onSave={handleSave}
          isSaving={isActionLoading}
          actionError={actionError}
        />
      )}
      {modal?.type === "edit" && (
        <ArticleModal
          article={modal.data}
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