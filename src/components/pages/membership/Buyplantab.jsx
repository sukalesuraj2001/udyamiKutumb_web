import { CreditCard, Crown, CheckCircle2 } from "lucide-react";

const PLANS = [
  {
    id: "basic",
    name: "Basic",
    subtitle: "Essential membership for new entrepreneurs",
    price: 10000,
    period: "12m",
    gstRate: 18,
    gstAmount: 1800,
    recommended: false,
    type: "basic",
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
    id: "prime",
    name: "Prime",
    subtitle: "Premium membership with full benefits",
    price: 25000,
    period: "12m",
    gstRate: 18,
    gstAmount: 4500,
    recommended: true,
    type: "prime",
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
    id: "basic-monthly",
    name: "Basic Member Monthly",
    subtitle: "Essential membership billed monthly",
    price: 999,
    period: "1 month",
    gstRate: 18,
    gstAmount: 179.82,
    recommended: false,
    type: "basic",
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
    id: "prime-monthly",
    name: "Prime Member Monthly",
    subtitle: "Premium membership billed monthly with full benefits",
    price: 2499,
    period: "1 month",
    gstRate: 18,
    gstAmount: 449.82,
    recommended: true,
    type: "prime",
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

function PlanCard({ plan, onBuy }) {
  const isPrime = plan.type === "prime";

  return (
    <div className={`relative flex flex-col rounded-2xl border bg-white p-6
      ${isPrime ? "border-amber-300 border-[1.5px]" : "border-gray-200"}`}
    >
      {/* Recommended badge */}
      {plan.recommended && (
        <span className="absolute right-4 top-4 rounded-full bg-amber-500 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          Recommended
        </span>
      )}

      {/* Header */}
      <div className="mb-1 flex items-center gap-2">
        {isPrime
          ? <Crown size={18} className="text-amber-500 shrink-0" />
          : <CreditCard size={18} className="text-blue-600 shrink-0" />
        }
        <h3 className="text-[16px] font-bold text-gray-900">{plan.name}</h3>
      </div>
      <p className="mb-4 text-[12px] text-gray-500">{plan.subtitle}</p>

      {/* Price */}
      <div className="mb-1">
        <span className="text-[28px] font-extrabold text-gray-900">
          ₹{plan.price.toLocaleString("en-IN")}
        </span>
        <span className="ml-1 text-[13px] text-gray-400">/{plan.period}</span>
      </div>
      <p className="mb-5 text-[12px] text-gray-400">
        + ₹{plan.gstAmount.toLocaleString("en-IN")} GST ({plan.gstRate}%)
      </p>

      {/* Features */}
      <ul className="mb-6 flex-1 space-y-2">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-[13px] text-gray-700">
            <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-green-500" />
            {f}
          </li>
        ))}
      </ul>

      {/* Buy Button */}
      <button
        onClick={() => onBuy(plan)}
        className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-semibold transition-colors
          ${isPrime
            ? "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800"
            : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
          }`}
      >
        <CreditCard size={15} />
        Buy {plan.name.split(" ")[0]}
      </button>
    </div>
  );
}

export default function BuyPlanTab() {
  const handleBuy = (plan) => {
    // Hook up to Razorpay or your payment gateway here
    alert(`Proceeding to pay ₹${plan.price.toLocaleString("en-IN")} for ${plan.name} via Razorpay`);
  };

  return (
    <div className="space-y-5 pt-4">
      {/* Header */}
      <div>
        <h2 className="text-[18px] font-bold text-gray-900">Choose a Membership Plan</h2>
        <p className="mt-0.5 text-[13px] text-gray-500">
          Side-by-side comparison · Pay securely via Razorpay (UPI / Card / NetBanking)
        </p>
      </div>

      {/* Plan grid — 2 columns */}
      <div className="grid grid-cols-2 gap-5">
        {PLANS.map((plan) => (
          <PlanCard key={plan.id} plan={plan} onBuy={handleBuy} />
        ))}
      </div>
    </div>
  );
}