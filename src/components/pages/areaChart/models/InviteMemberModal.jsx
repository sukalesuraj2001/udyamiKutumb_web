import React, { useState } from "react";
import { X, Send, CheckCircle2, AlertTriangle } from "lucide-react";
import api from "../../../service/api.js";

const formatDateTime = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
};

/**
 * Invite a registered member to a ward by SMS.
 *
 * Flow:
 *  1. User enters name + 10-digit mobile and submits.
 *  2. Backend checks the number exists in the DB and sends the Twilio SMS
 *     (ward name + Play Store link). On success `smsSent` becomes true.
 *  3. If that number was already invited, backend answers 409
 *     (INVITE_ALREADY_SENT); we ask for confirmation and, on "Send again",
 *     repeat the request with confirmResend: true.
 */
export default function InviteMemberModal({ ward, onClose }) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [sending, setSending] = useState(false);
  const [smsSent, setSmsSent] = useState(false); // true once the SMS has been sent
  const [duplicate, setDuplicate] = useState(null); // previous invite info (409)
  const [error, setError] = useState("");

  const wardLabel = ward?.ward_name || "this ward";

  const submit = async (confirmResend = false) => {
    setError("");

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Enter the member's name.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    setSending(true);
    try {
      await api.post("/ward-chart/inviteMember", {
        wardId: ward.id,
        name: trimmedName,
        mobileNumber: mobile,
        ...(confirmResend ? { confirmResend: true } : {}),
      });
      setDuplicate(null);
      setSmsSent(true);
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;

      if (status === 409 && data?.code === "INVITE_ALREADY_SENT") {
        setDuplicate(data.data || {});
      } else {
        const msg = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message || err?.message || "Could not send the invitation.";
        setError(msg);
      }
    } finally {
      setSending(false);
    }
  };

  const inputCls =
    "w-full h-10 px-3 text-[13px] text-gray-900 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all disabled:bg-gray-50";

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={sending ? undefined : onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Invite member"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-[16px] font-bold text-gray-900 leading-tight">Invite Member</h3>
            <p className="text-[12px] text-gray-500 mt-0.5">
              Send an SMS invite for <span className="font-semibold text-gray-700">{wardLabel}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={sending}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-colors disabled:opacity-40"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {smsSent ? (
            /* ── Success ── */
            <div className="text-center py-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={26} className="text-emerald-600" />
              </div>
              <p className="text-[14px] font-semibold text-gray-900">Invitation SMS sent</p>
              <p className="text-[12.5px] text-gray-500 mt-1">
                {name.trim()} (+91 {mobile}) will receive the {wardLabel} invite with the app download link.
              </p>
              <div className="mt-5 flex flex-col-reverse sm:flex-row gap-2 sm:justify-center">
                <button
                  onClick={() => {
                    setSmsSent(false);
                    setName("");
                    setMobile("");
                  }}
                  className="h-9 px-4 text-[12.5px] font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Invite another
                </button>
                <button
                  onClick={onClose}
                  className="h-9 px-4 text-[12.5px] font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : duplicate ? (
            /* ── Already invited: confirm resend ── */
            <div>
              <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[12.5px] text-amber-900 leading-relaxed">
                  <p className="font-semibold">You have already sent an invite to this number.</p>
                  <p className="mt-1">
                    +91 {mobile}
                    {duplicate.inviteeName ? ` · ${duplicate.inviteeName}` : ""}
                    {duplicate.wardName ? ` · ${duplicate.wardName}` : ""}
                    {duplicate.sentAt ? ` · ${formatDateTime(duplicate.sentAt)}` : ""}
                  </p>
                  <p className="mt-1">Do you want to send it again?</p>
                </div>
              </div>

              {error && <p className="text-[12px] text-red-600 font-medium mt-3">{error}</p>}

              <div className="mt-5 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                <button
                  onClick={() => setDuplicate(null)}
                  disabled={sending}
                  className="h-9 px-4 text-[12.5px] font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  No, cancel
                </button>
                <button
                  onClick={() => submit(true)}
                  disabled={sending}
                  className="h-9 px-4 inline-flex items-center justify-center gap-2 text-[12.5px] font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                  <Send size={13} />
                  {sending ? "Sending…" : "Yes, send again"}
                </button>
              </div>
            </div>
          ) : (
            /* ── Form ── */
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1" htmlFor="invite-name">
                  Name
                </label>
                <input
                  id="invite-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={150}
                  placeholder="Member name"
                  disabled={sending}
                  autoFocus
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1" htmlFor="invite-mobile">
                  Mobile number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-[13px] text-gray-500 bg-gray-50 border border-r-0 border-gray-200 rounded-l-lg">
                    +91
                  </span>
                  <input
                    id="invite-mobile"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    inputMode="numeric"
                    placeholder="10-digit mobile number"
                    disabled={sending}
                    className={`${inputCls} rounded-l-none`}
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  The number must already be registered. An SMS with the ward name and app download link will be sent.
                </p>
              </div>

              {error && <p className="text-[12px] text-red-600 font-medium">{error}</p>}

              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={sending}
                  className="h-9 px-4 text-[12.5px] font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="h-9 px-4 inline-flex items-center justify-center gap-2 text-[12.5px] font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                  <Send size={13} />
                  {sending ? "Sending…" : "Send Invite"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
