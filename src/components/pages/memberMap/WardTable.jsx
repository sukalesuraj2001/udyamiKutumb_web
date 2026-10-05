import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Search, Eye, Pencil, MessageCircle, Table2 } from "lucide-react";
import Pagination from "../../common/Pagination.jsx";
import WardFormModal from "./WardFormModal.jsx";
import WardViewModal from "./WardViewModal.jsx";
import {
  fetchWards,
  fetchWardById,
  clearSelectedWard,
  selectWards,
  selectWardsTotalRecords,
  selectWardsTotalPages,
  selectLoadingWards,
  selectWardsError,
  selectSelectedWard,
  selectLoadingWard,
} from "../../redux/slices/wardSlice.js";

const PAGE_SIZE = 10;

const COLUMNS = [
  "Ward Code",
  "Ward Number",
  "District",
  "Taluka",
  "WhatsApp Group",
  "Geofencing Lat",
  "Geofencing Lang",
  "Actions",
];

export default function WardTable() {
  const dispatch = useDispatch();

  const wards = useSelector(selectWards) || [];
  const totalRecords = useSelector(selectWardsTotalRecords);
  const totalPages = useSelector(selectWardsTotalPages);
  const loading = useSelector(selectLoadingWards);
  const error = useSelector(selectWardsError);
  const selectedWard = useSelector(selectSelectedWard);
  const loadingWard = useSelector(selectLoadingWard);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingWard, setEditingWard] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);

  // Debounce the search box so typing doesn't fire a request per keystroke
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(() => {
    dispatch(fetchWards({ page, limit: PAGE_SIZE, search: debouncedSearch }));
  }, [dispatch, page, debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = () => {
    setFormMode("create");
    setEditingWard(null);
    setFormOpen(true);
  };

  const handleView = (ward) => {
    dispatch(fetchWardById(ward.wardId));
    setViewOpen(true);
  };

  const handleEdit = (ward) => {
    setFormMode("edit");
    setEditingWard(ward);
    setViewOpen(false);
    setFormOpen(true);
  };

  const closeView = () => {
    setViewOpen(false);
    dispatch(clearSelectedWard());
  };

  return (
    <section className="bg-white border border-hairline rounded-2xl shadow-sm overflow-hidden">

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-hairline">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-ink/[0.05] flex items-center justify-center">
            <Table2 size={15} className="text-muted" />
          </span>
          <div>
            <h3 className="text-[14px] font-semibold text-ink leading-tight">Wards</h3>
            <p className="text-[11.5px] text-muted">
              {totalRecords} ward{totalRecords === 1 ? "" : "s"} registered
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search wards…"
              className="w-full sm:w-56 pl-9 pr-3 py-2 rounded-xl border border-hairline text-[13px] text-ink outline-none focus:border-ink/40 transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={handleCreate}
            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-ink hover:bg-ink/90 transition-colors"
          >
            <Plus size={15} />
            Create
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[900px]">
          <thead className="bg-paper/70 border-b border-hairline">
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col}
                  className="px-5 py-3 text-[10.5px] font-semibold tracking-[0.08em] uppercase text-muted whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading && wards.length === 0 ? (
              <StateRow>Loading wards…</StateRow>
            ) : error ? (
              <StateRow tone="error">{error}</StateRow>
            ) : wards.length === 0 ? (
              <StateRow>
                {debouncedSearch
                  ? `No wards match “${debouncedSearch}”.`
                  : "No wards yet — use Create to add the first one."}
              </StateRow>
            ) : (
              wards.map((w) => (
                <tr
                  key={w.wardId}
                  className="border-b border-hairline/70 last:border-0 hover:bg-ink/[0.02] transition-colors"
                >
                  <td className="px-5 py-3.5 text-[13px] font-medium text-ink whitespace-nowrap">
                    {w.wardName || "—"}
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-muted whitespace-nowrap">
                    {w.wardNumber || "—"}
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-muted whitespace-nowrap">
                    {w.district || "—"}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    {w.taluka ? (
                      <span className="text-[10.5px] font-medium bg-steel/10 text-steel px-2 py-0.5 rounded-full">
                        {w.taluka}
                      </span>
                    ) : (
                      <span className="text-[13px] text-muted">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-[13px] max-w-[220px]">
                    <WhatsAppCell value={w.whatsappGroup} />
                  </td>
                  <td className="px-5 py-3.5 text-[12px] font-mono text-muted whitespace-nowrap">
                    {w.geofencingLat ?? "—"}
                  </td>
                  <td className="px-5 py-3.5 text-[12px] font-mono text-muted whitespace-nowrap">
                    {w.geofencingLang ?? "—"}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <ActionButton
                        icon={Eye}
                        label="View"
                        onClick={() => handleView(w)}
                        tone="steel"
                      />
                      <ActionButton
                        icon={Pencil}
                        label="Edit"
                        onClick={() => handleEdit(w)}
                        tone="forest"
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {totalPages > 1 && (
        <div className="px-5 py-4 border-t border-hairline">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Modals */}
      <WardFormModal
        open={formOpen}
        mode={formMode}
        ward={editingWard}
        onClose={() => setFormOpen(false)}
        onSaved={load}
      />

      <WardViewModal
        open={viewOpen}
        ward={selectedWard}
        loading={loadingWard}
        onClose={closeView}
        onEdit={handleEdit}
      />
    </section>
  );
}

// ── Sub-components ──

function StateRow({ children, tone }) {
  return (
    <tr>
      <td
        colSpan={COLUMNS.length}
        className={`px-5 py-10 text-center text-[13px] ${
          tone === "error" ? "text-brick" : "text-muted"
        }`}
      >
        {children}
      </td>
    </tr>
  );
}

function WhatsAppCell({ value }) {
  if (!value) return <span className="text-muted">—</span>;

  const isLink = /^https?:\/\//i.test(value.trim());

  if (!isLink) {
    return <span className="text-muted truncate block">{value}</span>;
  }

  return (
    <a
      href={value}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 text-forest hover:underline truncate max-w-full"
    >
      <MessageCircle size={13} className="shrink-0" />
      <span className="truncate">Group link</span>
    </a>
  );
}

function ActionButton({ icon, label, onClick, tone }) {
  const tones = {
    steel: "text-steel bg-steel/10 hover:bg-steel/20",
    forest: "text-forest bg-forest/10 hover:bg-forest/20",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11.5px] font-semibold transition-colors ${tones[tone]}`}
    >
      {React.createElement(icon, { size: 13 })}
      {label}
    </button>
  );
}
