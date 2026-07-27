import React, { useMemo, useState } from "react";
import { UserPlus, Trash2, Phone, Mail, ChevronDown } from "lucide-react";
import SlideOver from "../../businessCircle/closedBusiness/Slideover.jsx";
import ConfirmDeleteModal from "../../businessCircle/closedBusiness/Confirmdeletemodal.jsx";

const STATUS_OPTIONS = ["invited", "declined", "converted", "attended"];

const STATUS_BADGE = {
  invited: "border border-hairline text-ink bg-white",
  declined: "border border-hairline text-muted bg-white",
  converted: "bg-forest/10 text-forest",
  attended: "bg-steel/10 text-steel",
};

const SAMPLE_GUESTS = [
  {
    id: "g1",
    name: "Spoorthi",
    company: "Queens",
    profession: "Dark store",
    phone: "987980808",
    email: "sp@gmail.com",
    status: "invited",
  },
  {
    id: "g2",
    name: "Spoorthi",
    company: "Queens",
    profession: "Dark store",
    phone: "987980808",
    email: "sp@gmail.com",
    status: "converted",
  },
  {
    id: "g3",
    name: "Truprthi",
    company: "KEA",
    profession: "Education",
    phone: "9980569111",
    email: "v.trupthigowda@gmail.com",
    status: "invited",
  },
  {
    id: "g4",
    name: "somshehkar",
    company: "FC",
    profession: "banking",
    phone: "9902672177",
    email: "",
    status: "invited",
  },
  {
    id: "g5",
    name: "Test Visitor QA",
    company: "",
    profession: "",
    phone: "9876500011",
    email: "",
    status: "declined",
  },
];

export default function Guests() {
  const [guests, setGuests] = useState(SAMPLE_GUESTS);
  const [panelOpen, setPanelOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ name: "", company: "", profession: "", phone: "", email: "" });

  const invitedCount = guests.length;
  const convertedCount = guests.filter((g) => g.status === "converted").length;

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSendInvite = () => {
    if (!form.name.trim()) return;
    setGuests((g) => [
      { id: `g${Date.now()}`, ...form, status: "invited" },
      ...g,
    ]);
    setForm({ name: "", company: "", profession: "", phone: "", email: "" });
    setPanelOpen(false);
  };

  const updateStatus = (id, status) =>
    setGuests((g) => g.map((guest) => (guest.id === id ? { ...guest, status } : guest)));

  const handleDeleteConfirm = () => {
    setGuests((g) => g.filter((guest) => guest.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-[19px] font-semibold text-ink">Guests</h2>
          <p className="text-[13px] text-muted mt-0.5">
            {invitedCount} invited · {convertedCount} converted
          </p>
        </div>
        <button
          onClick={() => setPanelOpen(true)}
          className="flex items-center gap-2 bg-ink text-white text-[13.5px] font-semibold px-4 py-2.5 rounded-xl hover:bg-ink/90 transition-colors shrink-0"
        >
          <UserPlus size={16} /> Invite Guest
        </button>
      </div>

      {guests.length === 0 ? (
        <p className="text-[13.5px] text-muted text-center py-10">No guests invited yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {guests.map((g) => (
            <GuestCard
              key={g.id}
              guest={g}
              onDelete={() => setDeleteTarget(g)}
              onStatusChange={(status) => updateStatus(g.id, status)}
            />
          ))}
        </div>
      )}

      <SlideOver open={panelOpen} onClose={() => setPanelOpen(false)} title="Invite a guest">
        <div className="space-y-4">
          <Field label="Name" value={form.name} onChange={update("name")} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Company" value={form.company} onChange={update("company")} />
            <Field label="Profession" value={form.profession} onChange={update("profession")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone" value={form.phone} onChange={update("phone")} />
            <Field label="Email" value={form.email} onChange={update("email")} />
          </div>

          <button
            onClick={handleSendInvite}
            disabled={!form.name.trim()}
            className="w-full bg-ink text-white text-[13.5px] font-semibold py-3 rounded-xl hover:bg-ink/90 disabled:bg-ink/30 disabled:cursor-not-allowed transition-colors mt-2"
          >
            Send invite
          </button>
        </div>
      </SlideOver>

      <ConfirmDeleteModal
        open={!!deleteTarget}
        title="Delete this guest?"
        description={
          deleteTarget && (
            <>
              <span className="font-medium text-ink">{deleteTarget.name}</span> will be permanently removed from the guest list.
            </>
          )
        }
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

function GuestCard({ guest, onDelete, onStatusChange }) {
  const subtitle = [guest.company, guest.profession].filter(Boolean).join(" · ");

  return (
    <div className="bg-white border border-hairline rounded-xl p-4">
      <div className="flex items-start justify-between gap-2 mb-1">
        <h4 className="text-[14.5px] font-semibold text-ink leading-tight truncate">{guest.name}</h4>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_BADGE[guest.status]}`}>
            {guest.status}
          </span>
          <button onClick={onDelete} className="text-muted hover:text-brick transition-colors" aria-label="Delete guest">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {subtitle && <p className="text-[12.5px] text-amber-700 mb-2 truncate">{subtitle}</p>}

      <div className="flex flex-col gap-1 mb-3">
        {guest.phone && (
          <div className="flex items-center gap-1.5 text-[12.5px] text-muted">
            <Phone size={12} className="shrink-0" /> {guest.phone}
          </div>
        )}
        {guest.email && (
          <div className="flex items-center gap-1.5 text-[12.5px] text-muted truncate">
            <Mail size={12} className="shrink-0" /> {guest.email}
          </div>
        )}
      </div>

      <div className="relative">
        <select
          value={guest.status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-full appearance-none border border-hairline rounded-lg pl-3 pr-8 py-2 text-[13px] font-medium text-ink bg-white capitalize focus:outline-none focus:ring-2 focus:ring-amber/30"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
      </div>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="text-[13px] font-medium text-ink mb-1.5 block">{label}</label>
      <input
        value={value}
        onChange={onChange}
        className="w-full border border-hairline rounded-xl px-3.5 py-2.5 text-[13.5px] text-ink focus:outline-none focus:ring-2 focus:ring-amber/30"
      />
    </div>
  );
}