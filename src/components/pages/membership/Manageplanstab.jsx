import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMembershipPlans, createMembershipPlan } from "../../redux/slices/membershipPlansSlice.js";
import { CreditCard, Crown, CheckCircle2, Pencil, PowerOff, Trash2, Plus } from "lucide-react";

// ── New Plan Modal ──────────────────────────────────────────────────────────
function NewPlanModal({ onClose, onSave, creating }) {
  const [form, setForm] = useState({
    planName: "", membershipType: "BASIC", subtitle: "",
    price: "", durationDays: 365, badge: "", isPopular: false, features: "",
  });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.planName || !form.price) return;
    onSave({
      planName:       form.planName,
      membershipType: form.membershipType,
      price:          Number(form.price),
      durationDays:   Number(form.durationDays),
      badge:          form.badge,
      isPopular:      form.isPopular,
      features:       form.features
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean)
        .map((f) => ({ featureName: f })),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
        <h2 className="mb-5 text-[16px] font-bold text-gray-900">New Membership Plan</h2>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Plan Name</label>
              <input value={form.planName} onChange={(e) => set("planName", e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] outline-none focus:border-blue-500"
                placeholder="e.g. Prime Plan" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Type</label>
              <select value={form.membershipType} onChange={(e) => set("membershipType", e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] outline-none cursor-pointer">
                <option value="BASIC">Basic</option>
                <option value="PRIME">Prime</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Price (₹)</label>
              <input type="number" value={form.price} onChange={(e) => set("price", e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] outline-none focus:border-blue-500"
                placeholder="25000" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Duration (days)</label>
              <select value={form.durationDays} onChange={(e) => set("durationDays", e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] outline-none cursor-pointer">
                <option value={30}>Monthly (30)</option>
                <option value={365}>Annual (365)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Badge</label>
              <input value={form.badge} onChange={(e) => set("badge", e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] outline-none focus:border-blue-500"
                placeholder="Most Popular" />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer text-[13px] text-gray-700">
                <input type="checkbox" checked={form.isPopular} onChange={(e) => set("isPopular", e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-600" />
                Mark as Popular
              </label>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Features (one per line)
            </label>
            <textarea value={form.features} onChange={(e) => set("features", e.target.value)} rows={4}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] outline-none focus:border-blue-500 resize-none"
              placeholder={"Business Directory\nNetworking Events\nPriority Mentorship"} />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2.5">
          <button onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-[13px] font-medium text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSave} disabled={creating}
            className="rounded-lg bg-blue-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            {creating ? "Creating..." : "Create Plan"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Plan Card ───────────────────────────────────────────────────────────────
function PlanCard({ plan }) {
  const isPrime = plan.membershipType === "PRIME";
  const features = plan.features ?? [];

  return (
    <div className={`relative flex flex-col rounded-2xl border bg-white p-5
      ${isPrime ? "border-amber-300 border-[1.5px]" : "border-gray-200"}`}
    >
      {plan.isPopular && (
        <span className="absolute right-3 top-3 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          {plan.badge || "Popular"}
        </span>
      )}

      <div className="mb-0.5 flex items-center gap-2">
        {isPrime
          ? <Crown size={16} className="text-amber-500 shrink-0" />
          : <CreditCard size={16} className="text-blue-600 shrink-0" />
        }
        <h3 className="text-[14px] font-bold text-gray-900">{plan.planName}</h3>
      </div>
      <p className="mb-3 text-[12px] text-gray-400">
        {plan.durationDays >= 365 ? "Annual" : "Monthly"} plan
      </p>

      <p className="mb-4 text-[22px] font-extrabold text-gray-900">
        ₹{plan.price.toLocaleString("en-IN")}
        <span className="text-[12px] font-normal text-gray-400 ml-1">
          /{plan.durationDays >= 365 ? "12m" : "1m"}
        </span>
      </p>

      <ul className="mb-5 flex-1 space-y-1.5">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-1.5 text-[12px] text-gray-600">
            <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-green-500" />
            {f.featureName ?? f}
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-2 border-t border-gray-100 pt-4">
        {/* <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-[12px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
          <Pencil size={13} /> Edit
        </button>
        <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-[12px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
          <PowerOff size={13} /> Deactivate
        </button>
        <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
          <Trash2 size={13} />
        </button> */}
      </div>
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────
export default function ManagePlansTab() {
  const dispatch  = useDispatch();
  const { list: plans, loading, creating } = useSelector((s) => s.membershipPlans);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchMembershipPlans());
  }, [dispatch]);

  const handleSave = async (payload) => {
    const result = await dispatch(createMembershipPlan(payload));
    if (!result.error) setShowModal(false);
  };

  return (
    <div className="space-y-5 pt-4">
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

      {loading ? (
        <div className="flex items-center justify-center py-20 text-[13px] text-gray-400">
          Loading plans...
        </div>
      ) : plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 rounded-2xl border border-gray-200 bg-white">
          <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center">
            <CreditCard size={19} className="text-gray-400" />
          </div>
          <p className="text-[13px] font-semibold text-gray-400">No plans yet</p>
          <p className="text-[12px] text-gray-300">Click "New Plan" to create your first membership plan</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {plans.map((plan) => (
            <PlanCard key={plan.id ?? plan.planId} plan={plan} />
          ))}
        </div>
      )}

      {showModal && (
        <NewPlanModal
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          creating={creating}
        />
      )}
    </div>
  );
}