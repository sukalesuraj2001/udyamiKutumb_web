import { useState } from "react";
import { CreditCard, Crown, CheckCircle2, Pencil, PowerOff, Trash2, Plus } from "lucide-react";

const INITIAL_PLANS = [
  {
    id: 1,
    name: "Basic",
    type: "basic",
    subtitle: "Essential membership for new entrepreneurs",
    price: 10000,
    period: "12 months",
    gst: 1800,
    gstRate: 18,
    active: true,
    features: [
      "Udyami ID Card",
      "Access to networking events",
      "Business directory listing",
      "Monthly newsletter",
      "Basic training access",
      "Government scheme alerts",
    ],
  },
  {
    id: 2,
    name: "Prime",
    type: "prime",
    subtitle: "Premium membership with full benefits",
    price: 25000,
    period: "12 months",
    gst: 4500,
    gstRate: 18,
    active: true,
    features: [
      "Everything in Basic",
      "Priority mentorship access",
      "Premium training programs",
      "Business loan assistance",
      "Marketing support",
      "Exhibition & expo passes for 2 Person",
      "Dedicated relationship manager",
      "WhatsApp business group",
    ],
  },
  {
    id: 3,
    name: "Basic Member Monthly",
    type: "basic",
    subtitle: "Essential membership billed monthly",
    price: 999,
    period: "1 months",
    gst: 179.82,
    gstRate: 18,
    active: true,
    features: [
      "Udyami ID Card",
      "Access to networking events",
      "Business directory listing",
      "Monthly newsletter",
      "Basic training access",
      "Government scheme alerts",
    ],
  },
  {
    id: 4,
    name: "Prime Member Monthly",
    type: "prime",
    subtitle: "Premium membership billed monthly with full benefits",
    price: 2499,
    period: "1 months",
    gst: 449.82,
    gstRate: 18,
    active: true,
    features: [
      "Everything in Basic",
      "Priority mentorship access",
      "Premium training programs",
      "Business loan assistance",
      "Marketing support",
      "Exhibition & expo passes",
      "Dedicated relationship manager",
      "WhatsApp business group",
    ],
  },
];

// ── New Plan Modal ──────────────────────────────────────────────────────────
function NewPlanModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    name: "", type: "basic", subtitle: "", price: "", period: "12 months", gstRate: 18, features: "",
  });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.name || !form.price) return;
    onSave({
      id: Date.now(),
      ...form,
      price: Number(form.price),
      gst: Number(((form.price * form.gstRate) / 100).toFixed(2)),
      active: true,
      features: form.features.split("\n").map((f) => f.trim()).filter(Boolean),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
        <h2 className="mb-5 text-[16px] font-bold text-gray-900">New Membership Plan</h2>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Plan Name</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] outline-none focus:border-blue-500"
                placeholder="e.g. Gold Plan" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Type</label>
              <select value={form.type} onChange={(e) => set("type", e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] outline-none cursor-pointer">
                <option value="basic">Basic</option>
                <option value="prime">Prime</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Subtitle</label>
            <input value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] outline-none focus:border-blue-500"
              placeholder="Short description" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Price (₹)</label>
              <input type="number" value={form.price} onChange={(e) => set("price", e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] outline-none focus:border-blue-500"
                placeholder="10000" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Period</label>
              <select value={form.period} onChange={(e) => set("period", e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] outline-none cursor-pointer">
                <option value="1 months">Monthly</option>
                <option value="12 months">Annual</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">GST %</label>
              <input type="number" value={form.gstRate} onChange={(e) => set("gstRate", Number(e.target.value))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] outline-none focus:border-blue-500" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Features (one per line)
            </label>
            <textarea value={form.features} onChange={(e) => set("features", e.target.value)} rows={4}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] outline-none focus:border-blue-500 resize-none"
              placeholder={"Udyami ID Card\nNetworking events\nBasic training"} />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2.5">
          <button onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-[13px] font-medium text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSave}
            className="rounded-lg bg-blue-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-blue-700">
            Create Plan
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Plan Card ───────────────────────────────────────────────────────────────
function PlanCard({ plan, onEdit, onToggle, onDelete }) {
  const isPrime = plan.type === "prime";

  return (
    <div className={`relative flex flex-col rounded-2xl border bg-white p-5 transition-opacity
      ${!plan.active ? "opacity-50" : ""}
      ${isPrime ? "border-amber-300 border-[1.5px]" : "border-gray-200"}`}
    >
      {!plan.active && (
        <span className="absolute right-3 top-3 rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
          Inactive
        </span>
      )}

      {/* Header */}
      <div className="mb-0.5 flex items-center gap-2">
        {isPrime
          ? <Crown size={16} className="text-amber-500 shrink-0" />
          : <CreditCard size={16} className="text-blue-600 shrink-0" />
        }
        <h3 className="text-[14px] font-bold text-gray-900">{plan.name}</h3>
      </div>
      <p className="mb-3 text-[12px] text-gray-400">{plan.subtitle}</p>

      {/* Price */}
      <p className="mb-0.5 text-[22px] font-extrabold text-gray-900">
        ₹{plan.price.toLocaleString("en-IN")}
        <span className="text-[12px] font-normal text-gray-400 ml-1">/{plan.period}</span>
      </p>
      <p className="mb-4 text-[12px] text-gray-400">
        + ₹{plan.gst.toLocaleString("en-IN")} GST ({plan.gstRate}%)
      </p>

      {/* Features */}
      <ul className="mb-5 flex-1 space-y-1.5">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-1.5 text-[12px] text-gray-600">
            <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-green-500" />
            {f}
          </li>
        ))}
      </ul>

      {/* Actions */}
      <div className="flex items-center gap-2 border-t border-gray-100 pt-4">
        <button
          onClick={() => onEdit(plan)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-[12px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Pencil size={13} /> Edit
        </button>
        <button
          onClick={() => onToggle(plan.id)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-[12px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <PowerOff size={13} /> {plan.active ? "Deactivate" : "Activate"}
        </button>
        <button
          onClick={() => onDelete(plan.id)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function ManagePlansTab() {
  const [plans, setPlans]       = useState(INITIAL_PLANS);
  const [showModal, setShowModal] = useState(false);
  const [editPlan, setEditPlan]   = useState(null);

  const handleSave  = (newPlan) => setPlans((p) => [...p, newPlan]);
  const handleToggle = (id) => setPlans((p) => p.map((pl) => pl.id === id ? { ...pl, active: !pl.active } : pl));
  const handleDelete = (id) => setPlans((p) => p.filter((pl) => pl.id !== id));
  const handleEdit   = (plan) => setEditPlan(plan); // hook up to modal if needed

  return (
    <div className="space-y-5 pt-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-gray-900">Membership Plans</h2>
          <p className="mt-0.5 text-[13px] text-gray-500">Create and manage plan types, pricing, and benefits</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <Plus size={15} /> New Plan
        </button>
      </div>

      {/* Plan grid — 3 columns */}
      <div className="grid grid-cols-3 gap-4">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            onEdit={handleEdit}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <NewPlanModal onClose={() => setShowModal(false)} onSave={handleSave} />
      )}
    </div>
  );
}