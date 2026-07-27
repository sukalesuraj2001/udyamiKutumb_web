import React, { useEffect, useMemo, useState } from "react";
import { Sparkles, Plus, Trash2, ChevronDown, X, Share2, Phone } from "lucide-react";
import SlideOver from "../businessCircle/closedBusiness/SlideOver.jsx";
import ConfirmDeleteModal from "../businessCircle/closedBusiness/ConfirmDeleteModal.jsx";

const STATUS_COLUMNS = ["New", "Contacted", "Meeting Done", "Deal Closed", "Not Converted"];
const SCOPE_TABS = [
  { key: "circle", label: "My Circle" },
  { key: "inter", label: "Inter-Circle" },
  { key: "all", label: "All" },
];

// Replace with real data (API/Redux) once wired up
const SAMPLE_LEADS = [
  { id: "l1", name: "Nikel", referredBy: "9538205978", phone: "879879797", value: 25000, category: "Designer", status: "New" },
  { id: "l2", name: "somu", referredBy: "9980569111", phone: "98098090", value: null, category: "education", status: "New" },
  { id: "l3", name: "Digital marketing", referredBy: "Yogesh Achar", phone: "9591990546", value: 10000, category: "Advertising", status: "New" },
  { id: "l4", name: "Priya Sharma", referredBy: "Member Test", phone: "9886054321", value: 50000, category: "Chartered Accountant", status: "Deal Closed" },
];

export default function BusinessLeads() {
  const [leads, setLeads] = useState(SAMPLE_LEADS);
  const [scope, setScope] = useState("all");
  const [panelOpen, setPanelOpen] = useState(false);
  const [aiMatchOpen, setAiMatchOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState({
    referTo: "",
    contactName: "",
    contactPhone: "",
    category: "",
    value: "",
    type: "Internal",
    area: "",
    description: "",
  });

  const grouped = useMemo(() => {
    const map = {};
    STATUS_COLUMNS.forEach((s) => (map[s] = []));
    leads.forEach((l) => map[l.status]?.push(l));
    return map;
  }, [leads]);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmitLead = () => {
    if (!form.contactName.trim() || !form.category.trim()) return;
    setLeads((l) => [
      {
        id: `l${Date.now()}`,
        name: form.contactName,
        referredBy: form.referTo || "—",
        phone: form.contactPhone,
        value: form.value ? Number(form.value) : null,
        category: form.category,
        status: "New",
      },
      ...l,
    ]);
    setForm({ referTo: "", contactName: "", contactPhone: "", category: "", value: "", type: "Internal", area: "", description: "" });
    setPanelOpen(false);
  };

  const updateStatus = (id, status) => setLeads((l) => l.map((lead) => (lead.id === id ? { ...lead, status } : lead)));

  const handleDeleteConfirm = () => {
    setLeads((l) => l.filter((lead) => lead.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div>
      {/* Scope tabs + actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-[19px] font-semibold text-ink">Leads</h2>

        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-xl border border-hairline bg-white p-1">
            {SCOPE_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setScope(t.key)}
                className={`px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-colors ${
                  scope === t.key ? "bg-ink text-white" : "text-muted hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setAiMatchOpen(true)}
            className="flex items-center gap-2 border border-hairline bg-white text-[13.5px] font-semibold text-ink px-4 py-2.5 rounded-xl hover:bg-ink/5 transition-colors"
          >
            <Sparkles size={15} /> AI Match
          </button>
          <button
            onClick={() => setPanelOpen(true)}
            className="flex items-center gap-2 bg-ink text-white text-[13.5px] font-semibold px-4 py-2.5 rounded-xl hover:bg-ink/90 transition-colors"
          >
            <Plus size={16} /> Submit Lead
          </button>
        </div>
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
        {STATUS_COLUMNS.map((status) => (
          <div key={status}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted">{status}</p>
              <span className="w-6 h-6 rounded-full bg-ink/5 text-ink text-[11.5px] font-semibold flex items-center justify-center">
                {grouped[status].length}
              </span>
            </div>
            <div className="space-y-3">
              {grouped[status].map((lead) => (
                <LeadCard key={lead.id} lead={lead} onDelete={() => setDeleteTarget(lead)} onStatusChange={(s) => updateStatus(lead.id, s)} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Submit lead — slide-over */}
      <SlideOver open={panelOpen} onClose={() => setPanelOpen(false)} title="Submit a lead">
        <div className="space-y-4">
          <Field label="Refer to (member)" type="select" value={form.referTo} onChange={update("referTo")} placeholder="Select a circle member" options={["Member Test", "Ward Leader Test"]} />

          <div className="grid grid-cols-2 gap-3">
            <Field label="Contact name" value={form.contactName} onChange={update("contactName")} />
            <Field label="Contact phone" value={form.contactPhone} onChange={update("contactPhone")} />
          </div>

          <Field
            label="Business Category"
            required
            type="select"
            value={form.category}
            onChange={update("category")}
            placeholder="Search business category…"
            options={["Designer", "Education", "Advertising", "Chartered Accountant", "Photography"]}
          />

          <Field label="Est. value (₹)" value={form.value} onChange={update("value")} />

          <Field label="Type" type="select" value={form.type} onChange={update("type")} options={["Internal", "External"]} />

          <Field
            label="Area / Constituency"
            type="select"
            value={form.area}
            onChange={update("area")}
            placeholder="Select constituency"
            options={["Bengluru north", "Mahadevapura", "B.T.M Layout"]}
          />

          <div>
            <label className="text-[13px] font-medium text-ink mb-1.5 block">Description</label>
            <textarea
              value={form.description}
              onChange={update("description")}
              rows={4}
              className="w-full border border-hairline rounded-xl px-3.5 py-2.5 text-[13.5px] text-ink focus:outline-none focus:ring-2 focus:ring-amber/30 resize-y"
            />
          </div>

          <button
            onClick={handleSubmitLead}
            disabled={!form.contactName.trim() || !form.category.trim()}
            className="w-full bg-ink text-white text-[13.5px] font-semibold py-3 rounded-xl hover:bg-ink/90 disabled:bg-ink/30 disabled:cursor-not-allowed transition-colors mt-2"
          >
            Submit lead
          </button>
        </div>
      </SlideOver>

      {/* AI matchmaking — centered popup */}
      <AiMatchModal open={aiMatchOpen} onClose={() => setAiMatchOpen(false)} />

      <ConfirmDeleteModal
        open={!!deleteTarget}
        title="Delete this lead?"
        description={
          deleteTarget && (
            <>
              <span className="font-medium text-ink">{deleteTarget.name}</span> will be permanently removed from the pipeline.
            </>
          )
        }
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

function LeadCard({ lead, onDelete, onStatusChange }) {
  return (
    <div className="bg-white border border-hairline rounded-xl p-4">
      <h4 className="text-[14px] font-semibold text-ink leading-tight">{lead.name}</h4>
      <p className="text-[12.5px] text-amber-700 mt-0.5">→ {lead.referredBy}</p>

      <div className="flex items-center gap-3 mt-1.5 text-[12.5px] text-muted">
        {lead.phone && (
          <span className="flex items-center gap-1">
            <Phone size={12} /> {lead.phone}
          </span>
        )}
        {lead.value != null && <span className="font-medium text-ink">₹ {lead.value.toLocaleString("en-IN")}</span>}
      </div>
      {lead.category && <p className="text-[12px] text-muted mt-1">{lead.category}</p>}

      <button className="w-full flex items-center justify-center gap-2 border border-hairline rounded-lg py-2 text-[12.5px] font-semibold text-ink mt-3 hover:bg-ink/5 transition-colors">
        <Share2 size={13} /> Share to Lead Pipeline
      </button>

      <div className="flex items-center gap-2 mt-2.5">
        <div className="relative flex-1">
          <select
            value={lead.status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full appearance-none border border-hairline rounded-lg pl-3 pr-8 py-2 text-[13px] font-medium text-ink bg-white focus:outline-none focus:ring-2 focus:ring-amber/30"
          >
            {STATUS_COLUMNS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        </div>
        <button onClick={onDelete} className="text-muted hover:text-brick transition-colors shrink-0" aria-label="Delete lead">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

function AiMatchModal({ open, onClose }) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);
  const [need, setNeed] = useState("");

  useEffect(() => {
    if (open) {
      setMounted(true);
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    setVisible(false);
    const t = setTimeout(() => setMounted(false), 200);
    return () => clearTimeout(t);
  }, [open]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className={`absolute inset-0 bg-ink/40 transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`} onClick={onClose} />
      <div
        className={`relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 transition-all duration-200 ${
          visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-[17px] font-semibold text-ink">AI Matchmaking</h2>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <label className="text-[13px] font-medium text-ink mb-1.5 block">Describe the lead need</label>
        <div className="relative">
          <textarea
            value={need}
            onChange={(e) => setNeed(e.target.value)}
            rows={3}
            placeholder="e.g. Need a wedding photographer in Indiranagar"
            className="w-full border border-hairline rounded-xl px-3.5 py-2.5 text-[13.5px] text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-amber/30 resize-y"
          />
        </div>

        <button className="w-full flex items-center justify-center gap-2 bg-ink text-white text-[13.5px] font-semibold py-3 rounded-xl hover:bg-ink/90 transition-colors mt-4">
          <Sparkles size={15} /> Suggest matches
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, required, type = "text", placeholder, options }) {
  if (type === "select") {
    return (
      <div>
        <label className="text-[13px] font-medium text-ink mb-1.5 block">
          {label}
          {required && <span className="text-brick"> *</span>}
        </label>
        <div className="relative">
          <select
            value={value}
            onChange={onChange}
            className="w-full appearance-none border border-hairline rounded-xl pl-3.5 pr-9 py-2.5 text-[13.5px] text-ink bg-white focus:outline-none focus:ring-2 focus:ring-amber/30"
          >
            <option value="">{placeholder || "Select…"}</option>
            {options.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="text-[13px] font-medium text-ink mb-1.5 block">
        {label}
        {required && <span className="text-brick"> *</span>}
      </label>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-hairline rounded-xl px-3.5 py-2.5 text-[13.5px] text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-amber/30"
      />
    </div>
  );
}