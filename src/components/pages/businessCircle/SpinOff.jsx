import React, { useState } from "react";
import { ChevronDown, Check, ArrowLeft, ArrowRight, Users, MapPin, Crown, ShieldCheck } from "lucide-react";

const SOURCE_WARDS = ["G5.48 Mathikere", "G5.49 Aramane Nagara"];
const CHAIRMEN     = ["Pavithra (Ward 4)", "Suresh Rao (Ward 4)", "Anita Kumar (Ward 4)"];

const STEPS = [
  { id: 1, label: "Scope",      icon: MapPin      },
  { id: 2, label: "Members",    icon: Users       },
  { id: 3, label: "Leadership", icon: Crown       },
  { id: 4, label: "Confirm",    icon: ShieldCheck },
];

// ── Stepper ───────────────────────────────────────────────────────────────────
function Stepper({ current }) {
  return (
    <div className="flex items-center w-full">
      {STEPS.map((s, i) => {
        const done   = s.id < current;
        const active = s.id === current;
        const Icon   = s.icon;
        return (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                done   ? "bg-[#1B4332] text-white" :
                active ? "bg-white border-2 border-[#1B4332] text-[#1B4332]" :
                         "bg-white border-2 border-[#E5E7EB] text-[#D1D5DB]"
              }`}>
                {done
                  ? <Check size={16} strokeWidth={3} />
                  : <Icon size={16} />
                }
              </div>
              <span className={`text-[11.5px] font-semibold whitespace-nowrap ${
                done   ? "text-[#1B4332]" :
                active ? "text-[#1B4332]" :
                         "text-[#9CA3AF]"
              }`}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 mx-2 mb-5">
                <div className="h-0.5 w-full bg-[#E5E7EB] relative overflow-hidden rounded-full">
                  <div className={`absolute inset-y-0 left-0 bg-[#1B4332] transition-all duration-500 rounded-full ${
                    s.id < current ? "w-full" : "w-0"
                  }`} />
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Custom Select ─────────────────────────────────────────────────────────────
function Select({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className={`w-full flex items-center justify-between rounded-xl px-4 py-3.5 text-[13.5px] transition-all ${
          open
            ? "border-2 border-[#1B4332] bg-white shadow-sm"
            : "border border-[#E5E7EB] bg-[#F9FAFB] hover:border-[#1B4332] hover:bg-white"
        }`}
      >
        <span className={value ? "text-[#111827] font-medium" : "text-[#9CA3AF]"}>
          {value || placeholder}
        </span>
        <ChevronDown size={15} className={`text-[#6B7280] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-20 mt-1.5 w-full bg-white border border-[#E5E7EB] rounded-xl shadow-xl overflow-hidden">
          {options.map((o) => (
            <button
              key={o}
              onClick={() => { onChange(o); setOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 text-[13.5px] transition-colors ${
                value === o
                  ? "bg-[#F0FDF4] text-[#1B4332] font-semibold"
                  : "text-[#374151] hover:bg-[#F9FAFB]"
              }`}
            >
              <span>{o}</span>
              {value === o && <Check size={14} strokeWidth={3} className="text-[#1B4332]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11.5px] font-bold text-[#6B7280] uppercase tracking-widest">
        {label}
      </label>
      {children}
    </div>
  );
}

// ── ReadonlyField ─────────────────────────────────────────────────────────────
function ReadonlyField({ value }) {
  return (
    <div className="border border-[#E5E7EB] rounded-xl px-4 py-3.5 text-[13.5px] text-[#6B7280] bg-[#F9FAFB]">
      {value}
    </div>
  );
}

// ── Stat row in Members step ──────────────────────────────────────────────────
function StatRow({ label, value, highlight, last }) {
  return (
    <div className={`flex items-center justify-between py-4 px-5 ${!last ? "border-b border-[#F3F4F6]" : ""}`}>
      <span className="text-[13.5px] text-[#374151]">{label}</span>
      <span className={`text-[16px] font-bold ${highlight ? "text-[#1B4332]" : "text-[#111827]"}`}>
        {value}
      </span>
    </div>
  );
}

// ── Steps ─────────────────────────────────────────────────────────────────────
function StepScope({ form, setForm }) {
  return (
    <div className="space-y-5">
      <Field label="Source ward">
        <Select
          value={form.ward}
          onChange={(v) => setForm((p) => ({ ...p, ward: v }))}
          options={SOURCE_WARDS}
          placeholder="Select ward"
        />
      </Field>
      <Field label="Members moving">
        <ReadonlyField value="28 matched by ward" />
      </Field>
    </div>
  );
}

function StepMembers() {
  return (
    <div className="rounded-xl border border-[#E5E7EB] overflow-hidden bg-white">
      <StatRow label="Matched by ward tag"     value={28} highlight />
      <StatRow label="Cross-circle leads kept" value={14} />
      <StatRow label="Opt-outs"                value={0}  last />
    </div>
  );
}

function StepLeadership({ form, setForm }) {
  return (
    <div className="space-y-5">
      <Field label="New chairman">
        <Select
          value={form.chairman}
          onChange={(v) => setForm((p) => ({ ...p, chairman: v }))}
          options={CHAIRMEN}
          placeholder="Select chairman"
        />
      </Field>
      <Field label="Carry sector heads">
        <ReadonlyField value="Yes — 12 of 18" />
      </Field>
    </div>
  );
}

function StepConfirm({ onCreateCircle, created }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 bg-[#F0FDF4] border border-[#6EE7B7] rounded-xl px-4 py-4">
        <span className="w-6 h-6 rounded-full bg-[#1B4332] flex items-center justify-center shrink-0 mt-0.5">
          <Check size={12} className="text-white" strokeWidth={3} />
        </span>
        <p className="text-[13.5px] text-[#065F46] leading-relaxed">
          Lead history, scorecards & Gratitude Slips move with each member
        </p>
      </div>

      <div className="flex items-start gap-3 bg-[#FFFBEB] border border-[#FCD34D] rounded-xl px-4 py-4">
        <span className="w-6 h-6 rounded-full bg-[#F59E0B] flex items-center justify-center shrink-0 mt-0.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
        </span>
        <p className="text-[13.5px] text-[#92400E] leading-relaxed">
          Ward-4 category locks release from the constituency circle
        </p>
      </div>

      {!created ? (
        <button
          onClick={onCreateCircle}
          className="w-full mt-2 flex items-center justify-center gap-2 bg-[#1B4332] hover:bg-[#14532D] active:scale-[0.98] text-white text-[14px] font-bold py-3.5 rounded-xl transition-all shadow-sm"
        >
          <ShieldCheck size={16} />
          Create Ward 4 circle
        </button>
      ) : (
        <div className="flex items-center gap-3 bg-[#F0FDF4] border border-[#6EE7B7] rounded-xl px-4 py-4 mt-2">
          <span className="w-8 h-8 bg-[#1B4332] rounded-full flex items-center justify-center shrink-0">
            <Check size={16} className="text-white" strokeWidth={3} />
          </span>
          <div>
            <p className="text-[14px] font-bold text-[#065F46]">Ward 4 circle created!</p>
            <p className="text-[12.5px] text-[#16A34A]">28 members have been moved successfully.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
const STEP_META = [
  { title: "What splits out",   subtitle: "Choose the ward that will form a new circle" },
  { title: "Confirm members",   subtitle: "Review which members move to the new circle"  },
  { title: "New leadership",    subtitle: "Assign the chairman for the new ward circle"  },
  { title: "Final confirmation",subtitle: "Review the impact before creating the circle" },
];

export default function SpinOff() {
  const [step,    setStep]    = useState(1);
  const [form,    setForm]    = useState({ ward: "G5.48 Mathikere", chairman: "" });
  const [created, setCreated] = useState(false);

  const canNext = () => {
    if (step === 1) return !!form.ward;
    if (step === 3) return !!form.chairman;
    return true;
  };

  const handleNext = () => { if (step < 4 && canNext()) setStep((p) => p + 1); };
  const handleBack = () => { if (step > 1) { setStep((p) => p - 1); setCreated(false); } };

  const meta = STEP_META[step - 1];

  return (
    <div className="max-w-xl space-y-7">

      {/* Breadcrumb + Title */}
      <div>
        <p className="text-[12px] text-[#9CA3AF] font-medium mb-1">Circles / spin-off</p>
        <h2 className="text-[24px] font-extrabold text-[#111827] tracking-tight">Spin off a ward circle</h2>
      </div>

      {/* Stepper */}
      <Stepper current={step} />

      {/* Card */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="px-6 py-4 border-b border-[#F3F4F6] bg-[#FAFAFA]">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#1B4332] text-white text-[11px] font-bold flex items-center justify-center">
              {step}
            </span>
            <p className="text-[14.5px] font-bold text-[#111827]">{meta.title}</p>
          </div>
          <p className="text-[12.5px] text-[#6B7280] mt-0.5 ml-8">{meta.subtitle}</p>
        </div>

        {/* Card body */}
        <div className="p-6">
          {step === 1 && <StepScope    form={form} setForm={setForm} />}
          {step === 2 && <StepMembers />}
          {step === 3 && <StepLeadership form={form} setForm={setForm} />}
          {step === 4 && <StepConfirm onCreateCircle={() => setCreated(true)} created={created} />}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleBack}
          disabled={step === 1}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#D1D5DB] text-[13.5px] font-semibold text-[#374151] hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ArrowLeft size={14} /> Back
        </button>

        {step < 4 && (
          <button
            onClick={handleNext}
            disabled={!canNext()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#14532D] text-white text-[13.5px] font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-[0.98]"
          >
            Next <ArrowRight size={14} />
          </button>
        )}

        {/* Progress hint */}
        <span className="ml-auto text-[12px] text-[#9CA3AF]">
          Step {step} of {STEPS.length}
        </span>
      </div>
    </div>
  );
}