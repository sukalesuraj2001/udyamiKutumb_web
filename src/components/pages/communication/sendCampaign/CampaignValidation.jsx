import React from "react";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

/**
 * CampaignValidation
 *
 * Validates campaign readiness before send.
 * Returns { isValid, checks } for external use as well.
 *
 * Props:
 *   campaignName   – string
 *   channel        – string
 *   message        – string
 *   audienceCount  – number
 *   schedule       – { mode, date, time }
 *   balance        – number
 *   estimatedCost  – number
 *
 * Reusable across: BulkSmsEmail, WhatsApp Outreach, Auto Dialer, AI IVR
 */
export function buildValidationChecks({ campaignName, channel, message, audienceCount, schedule, balance, estimatedCost }) {
  const checks = [
    {
      key: "channel",
      label: "Channel selected",
      pass: Boolean(channel),
      errorMsg: "Select a delivery channel (SMS, WhatsApp, IVR, or Email).",
    },
    {
      key: "campaignName",
      label: "Campaign name",
      pass: campaignName.trim().length >= 3,
      errorMsg: "Campaign name must be at least 3 characters.",
    },
    {
      key: "message",
      label: "Message body",
      pass: message.trim().length > 0,
      errorMsg: "Add a message before sending.",
    },
    {
      key: "audience",
      label: "Audience resolved",
      pass: audienceCount > 0,
      errorMsg: "Resolve your audience first — no eligible members found.",
    },
    {
      key: "schedule",
      label: "Schedule set",
      pass:
        schedule.mode === "now" ||
        (schedule.mode === "scheduled" && Boolean(schedule.date) && Boolean(schedule.time)) ||
        (schedule.mode === "recurring" && Boolean(schedule.date) && Boolean(schedule.time)),
      errorMsg: "Set a valid send date and time.",
    },
    {
      key: "credits",
      label: "Sufficient credits",
      pass: balance >= estimatedCost,
      errorMsg: `Insufficient credits. Need ${estimatedCost} cr, have ${balance} cr.`,
      warn: balance > 0 && balance < estimatedCost * 1.2 && balance >= estimatedCost,
      warnMsg: "Credit balance is running low. Consider topping up.",
    },
  ];

  return checks;
}

export default function CampaignValidation(props) {
  const checks = buildValidationChecks(props);
  const failedChecks = checks.filter((c) => !c.pass);
  const isValid = failedChecks.length === 0;

  if (isValid) {
    return (
      <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <CheckCircle2 size={16} className="text-green-500 shrink-0" />
        <p className="text-[13px] font-semibold text-green-700">
          All checks passed — ready to send.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-red-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3.5 bg-red-50 border-b border-red-100">
        <AlertCircle size={15} className="text-red-500" />
        <p className="text-[13px] font-semibold text-red-600">
          {failedChecks.length} issue{failedChecks.length !== 1 ? "s" : ""} to fix before sending
        </p>
      </div>
      <div className="divide-y divide-gray-50">
        {checks.map((check) => (
          <div key={check.key} className="flex items-start gap-3 px-5 py-3">
            {check.pass ? (
              <CheckCircle2 size={15} className="text-green-500 mt-0.5 shrink-0" />
            ) : (
              <XCircle size={15} className="text-red-400 mt-0.5 shrink-0" />
            )}
            <div>
              <p className={`text-[13px] font-semibold ${check.pass ? "text-gray-600" : "text-gray-800"}`}>
                {check.label}
              </p>
              {!check.pass && (
                <p className="text-[12px] text-red-500 mt-0.5">{check.errorMsg}</p>
              )}
              {check.pass && check.warn && (
                <p className="text-[12px] text-amber-500 mt-0.5">{check.warnMsg}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Named export for external validity check
export function isCampaignValid(props) {
  return buildValidationChecks(props).every((c) => c.pass);
}
