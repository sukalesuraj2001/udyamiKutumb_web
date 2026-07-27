import React, { useState, useCallback, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Send, Wallet, Users, TrendingDown,
  MessageSquare, MessagesSquare, Phone, Mail,
  Loader2, CheckCircle2,
} from "lucide-react";
import EmailComposer from "./EmailComposer.jsx";

// ── Redux
import { selectUser } from "../../redux/slices/authSlice";
import {
  uploadCsvCampaign,
  fetchUploadedCsvData,
  clearUploadError,
  clearCsv,
  selectIsUploading,
  selectUploadStatus,
  selectUploadError,
} from "../../redux/slices/sendMessageSlice.js";

// ── SuperAdmin section
import AdminCsvSection from "./Admincsvsection";
import Statscards from './Statscards.jsx'
// ── Sub-components
import AudienceSummary from "./sendCampaign/AudienceSummary.jsx";
import AudienceTable from "./sendCampaign/AudienceTable.jsx";
import SchedulePanel from "./sendCampaign/SchedulePanel.jsx";
import { isCampaignValid } from "./sendCampaign/CampaignValidation.jsx";
import RecentCampaigns from "./sendCampaign/CampaignCard.jsx";
import BulkCsvUpload from "./sendCampaign/BulkCsvUpload.jsx";
import CsvDataTable from "./sendCampaign/CsvDataTable.jsx";
import UploadResultBanner from "./sendCampaign/UploadResultBanner.jsx";
import {
  selectUploadResult,
} from "../../redux/slices/sendMessageSlice.js"
// ── Mock data
import { MOCK_MEMBERS, MOCK_AUDIENCE_SUMMARY, MOCK_RECENT_CAMPAIGNS } from "./mockData.js";

// ─────────────────────────────────────────────────────────────────────────────
const CHANNELS = [
  { key: "sms", label: "SMS", icon: MessageSquare },
  { key: "whatsapp", label: "WhatsApp", icon: MessagesSquare },
  { key: "ivr", label: "IVR Call", icon: Phone },
  { key: "email", label: "Email", icon: Mail },
];

const CREDIT_COST = { sms: 1, whatsapp: 2, ivr: 5, email: 1 };

const INITIAL_FILTERS = {
  state: "", district: "", taluk: "", ward: "",
  chapter: [], membershipType: [], businessCategory: [],
  sector: "", plan: "", tags: [], businessType: "",
  memberSearch: "",
};

const INITIAL_SCHEDULE = {
  mode: "now",
  date: "",
  time: "",
  repeatFrequency: "weekly",
  repeatUntil: "",
};

const inputCls =
  "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13.5px] " +
  "text-gray-800 placeholder:text-gray-400 bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-blue-200";

// Helper: build ISO scheduledAt
function buildScheduledAt(schedule) {
  if (schedule?.mode === "now" || !schedule?.date || !schedule?.time) return null;
  try { return new Date(`${schedule.date}T${schedule.time}:00`).toISOString(); }
  catch { return null; }
}

// ─────────────────────────────────────────────────────────────────────────────
export default function SendCampaign() {
  const dispatch = useDispatch();

  // ── Auth
  const user = useSelector(selectUser);
  const isSuperAdmin = user?.role === "SuperAdmin";
  const isMember = user?.role === "Member";

  // ── Redux upload state
  const isUploading = useSelector(selectIsUploading);
  const uploadStatus = useSelector(selectUploadStatus);
  const uploadError = useSelector(selectUploadError);
  const uploadResult = useSelector(selectUploadResult);
  // ── Campaign fields
  const [channel, setChannel] = useState("sms");
  const [campaignName, setCampaignName] = useState("");
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [sendType, setSendType] = useState("single");

  // ── Bulk file state (controlled in parent)
  const [csvFile, setCsvFile] = useState(null);
  const [csvLocalError, setCsvLocalError] = useState(null);

  // ── Track previous upload status to detect success transition
  const prevUploadStatus = useRef(uploadStatus);

  // ── Audience state
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [isResolving, setIsResolving] = useState(false);
  const [isResolved, setIsResolved] = useState(false);
  const [audienceSummary, setAudienceSummary] = useState(null);
  const [members, setMembers] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // ── Schedule state
  const [schedule, setSchedule] = useState(INITIAL_SCHEDULE);

  // ── Credits
  const [balance] = useState(2500);

  // ── Recent campaigns
  const [recentCampaigns, setRecentCampaigns] = useState(MOCK_RECENT_CAMPAIGNS);

  // ─────────────────────────────────────────────────────────────────
  // 1. Fetch previous CSV data on mount (always show history)
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isMember && user?.userId) {
      dispatch(fetchUploadedCsvData(user.userId));
    }
  }, [isMember, user?.userId]);

  // ─────────────────────────────────────────────────────────────────
  // 2. On upload success → reset form + re-fetch table
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (
      prevUploadStatus.current !== "succeeded" &&
      uploadStatus === "succeeded"
    ) {
      // Reset bulk form
      setCsvFile(null);
      setCsvLocalError(null);
      setSchedule(INITIAL_SCHEDULE);

      if (user?.userId) {
        dispatch(fetchUploadedCsvData(user.userId));
      }
    }
    prevUploadStatus.current = uploadStatus;
  }, [uploadStatus, user?.userId]);

  // ── Derived
  const segments = Math.max(1, Math.ceil(message.length / 160));
  const eligible = audienceSummary?.eligible ?? 0;
  const estCost = eligible * (CREDIT_COST[channel] || 1);
  const counterClass =
    message.length === 0 ? "text-gray-400" :
      segments === 1 ? "text-green-600" :
        segments <= 3 ? "text-amber-500" : "text-red-500";

  // ── Handlers
  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setIsResolved(false);
    setAudienceSummary(null);
    setMembers([]);
    setSelectedIds(new Set());
  }, []);

  const handleResolveAudience = useCallback(() => {
    setIsResolving(true);
    setTimeout(() => {
      setAudienceSummary(MOCK_AUDIENCE_SUMMARY);
      setMembers(MOCK_MEMBERS);
      setIsResolving(false);
      setIsResolved(true);
    }, 900);
  }, []);

  const handleScheduleChange = useCallback((key, value) => {
    setSchedule((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSendTypeChange = (type) => {
    setSendType(type);
    if (type !== "bulk") {
      setCsvFile(null);
      setCsvLocalError(null);
    }
  };

  // File picker callback — just store, don't upload
  const handleFileSelect = (file, err) => {
    setCsvFile(file);
    setCsvLocalError(err);
    if (uploadError) dispatch(clearUploadError());
  };

  // Single send
  const handleSend = () => {
    alert("Campaign queued! (integrate backend here)");
  };

  // Bulk submit — only triggered by button click
  const handleBulkSubmit = () => {
    if (!csvFile || isUploading) return;
    dispatch(
      uploadCsvCampaign({
        file: csvFile,
        userId: user?.userId,
        channel: channel.toUpperCase(),
        scheduledAt: buildScheduledAt(schedule) ?? undefined,
      })
    );
  };

  const handleView = (id) => alert(`View campaign ${id}`);
  const handleDuplicate = (id) => alert(`Duplicate campaign ${id}`);
  const handleCancel = (id) => {
    setRecentCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "cancelled" } : c))
    );
  };

  const validationProps = {
    campaignName, channel, message,
    audienceCount: eligible,
    schedule, balance, estimatedCost: estCost,
  };
  const canSend = isCampaignValid(validationProps);
  const canBulkSubmit = Boolean(csvFile) && !isUploading && uploadStatus !== "succeeded";
  console.log({
    csvFile,
    isUploading,
    uploadStatus,
    canBulkSubmit,
  });

  return (
    <div className="space-y-6">
      {isSuperAdmin && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <AdminCsvSection />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_280px] gap-6 items-start">

        {/* ── MAIN COLUMN ── */}
        <div className="space-y-6 min-w-0">
          {isMember && (
          <Statscards />
          )}

          {isMember && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-5">
              <h2 className="text-[17px] font-bold text-gray-800">New Campaign</h2>

              {/* Channel selector */}
              <div>
                <p className="text-[13px] font-semibold text-gray-700 mb-2">Channel</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {CHANNELS.map((c) => {
                    const CIcon = c.icon;
                    return (
                      <button
                        key={c.key}
                        onClick={() => setChannel(c.key)}
                        className={`flex items-center justify-center gap-2 text-[13px] font-semibold
                          py-2.5 rounded-xl border transition-colors ${channel === c.key
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                          }`}
                      >
                        <CIcon size={14} /> {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Single / Bulk toggle */}
              <div>
                <p className="text-[13px] font-semibold text-gray-700 mb-2">Send type</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "single", label: "Single", desc: "One recipient" },
                    { key: "bulk", label: "Bulk", desc: "Upload CSV" },
                  ].map((t) => (
                    <button
                      key={t.key}
                      onClick={() => handleSendTypeChange(t.key)}
                      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-left
                        transition-colors ${sendType === t.key
                          ? "bg-blue-50 border-blue-300 text-blue-700"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${sendType === t.key ? "border-blue-600" : "border-gray-300"
                        }`}>
                        {sendType === t.key && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 block" />
                        )}
                      </span>
                      <span>
                        <span className="text-[13px] font-semibold block">{t.label}</span>
                        <span className="text-[11.5px] text-gray-400">{t.desc}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ════ SINGLE MODE ════ */}
              {sendType === "single" && (
                <>
                  <div>
                    <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">
                      Campaign name
                    </label>
                    <input
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      placeholder="e.g. Diwali Greetings 2025"
                      className={inputCls}
                    />
                  </div>

                  {channel === "email" ? (
                    <EmailComposer
                      subject={subject}
                      onSubjectChange={setSubject}
                      body={message}
                      onBodyChange={setMessage}
                    />
                  ) : (
                    <div>
                      <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">
                        Message
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message. Use {first_name}, {ward} for personalization."
                        rows={5}
                        className={`${inputCls} resize-y`}
                      />
                      {channel === "sms" && (
                        <p className={`text-[11.5px] font-medium mt-1.5 ${counterClass}`}>
                          {message.length} / 160 chars — {segments} segment{segments !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-5">
                    <SchedulePanel schedule={schedule} onChange={handleScheduleChange} />
                  </div>
                </>
              )}

              {/* ════ BULK MODE ════ */}
              {sendType === "bulk" && (
                <>
                  {/* Step 1 — CSV */}
                  <div>
                    <p className="text-[13px] font-semibold text-gray-700 mb-2">
                      Step 1 — Select CSV file
                    </p>
                    <BulkCsvUpload
                      file={csvFile}
                      onFileSelect={handleFileSelect}
                      error={csvLocalError || uploadError}
                      onClearError={() => {
                        setCsvLocalError(null);
                        dispatch(clearUploadError());
                      }}
                    />
                  </div>

                  {/* Step 2 — Schedule */}
                  <div className="border-t border-gray-100 pt-5">
                    <p className="text-[13px] font-semibold text-gray-700 mb-3">
                      Step 2 — Choose schedule
                    </p>
                    <SchedulePanel schedule={schedule} onChange={handleScheduleChange} />
                  </div>

                  {/* Step 3 — Submit */}
                  <div className="border-t border-gray-100 pt-5 space-y-3">
                    <p className="text-[13px] font-semibold text-gray-700">
                      Step 3 — Submit campaign
                    </p>

                    <button
                      onClick={handleBulkSubmit}
                      disabled={!canBulkSubmit}
                      className="w-full flex items-center justify-center gap-2
                                 bg-blue-600 hover:bg-blue-700 active:scale-[0.98]
                                 disabled:opacity-40 disabled:cursor-not-allowed
                                 text-white text-[13.5px] font-semibold
                                 py-3 rounded-xl transition-all shadow-sm shadow-blue-200"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          Submitting…
                        </>
                      ) : (
                        <>
                          <Send size={15} />
                          {schedule.mode === "now" ? "Submit Campaign" : "Schedule Campaign"}
                        </>
                      )}
                    </button>

                    {!csvFile && (
                      <p className="text-[11.5px] text-gray-400 text-center">
                        Select a CSV file above to enable submit
                      </p>
                    )}
                  </div>
                  {/* Upload Result Banner */}
                  {(uploadStatus === "succeeded" || uploadStatus === "failed") && (
                    <UploadResultBanner
                      result={uploadResult}
                      onDismiss={() => dispatch(clearCsv())}
                      autoClose={uploadResult?.failedCount === 0}
                    />
                  )}

                  {/* ── CSV Data Table — always visible in bulk mode ── */}
                  {/* <div className="border-t border-gray-100 pt-2"> */}
                  {/* </div> */}
                </>
              )}
            </div>
          )}

          {/* Audience Summary */}
          <CsvDataTable />

          <AudienceSummary summary={audienceSummary} isResolved={isResolved} />

          {/* Audience Table */}
          <AudienceTable
            members={members}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            isResolved={isResolved}
          />

          {/* Recent Campaigns */}
          {/* {isMember && (
            <RecentCampaigns
              campaigns={recentCampaigns}
              onView={handleView}
              onDuplicate={handleDuplicate}
              onCancel={handleCancel}
            />
          )} */}
        </div>

        {/* ── SIDEBAR ── */}
        {isMember && (
          <div className="hidden xl:flex flex-col gap-4 sticky top-6 min-w-0">
            {/* <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 space-y-4">
              <SummaryRow icon={Wallet} label="Balance" value={`${balance.toLocaleString()} cr`} valueClass="text-green-600" />
              <SummaryRow icon={Users} label="Eligible" value={eligible.toLocaleString()} valueClass="text-gray-800" />
              <SummaryRow icon={TrendingDown} label="Est. cost" value={`${estCost.toLocaleString()} cr`} valueClass="text-amber-500" />

              {balance > 0 && (
                <div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${estCost > balance ? "bg-red-400" : "bg-blue-500"
                        }`}
                      style={{ width: `${Math.min(100, (estCost / balance) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {estCost > balance
                      ? "Insufficient credits"
                      : `${(((balance - estCost) / balance) * 100).toFixed(0)}% balance remaining after send`}
                  </p>
                </div>
              )}

              <div className="border-t border-gray-100 pt-4">
                {sendType === "single" ? (
                  <>
                    <button
                      onClick={handleSend}
                      disabled={!canSend}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white
                                 text-[13.5px] font-semibold py-3 rounded-xl
                                 hover:bg-blue-700 active:scale-[0.98]
                                 disabled:opacity-40 disabled:cursor-not-allowed
                                 transition-all shadow-sm shadow-blue-200"
                    >
                      <Send size={15} />
                      {schedule.mode === "now" ? "Send Campaign" : "Schedule Campaign"}
                    </button>
                    <p className="text-[11px] text-gray-400 text-center mt-2.5">
                      Charged on send · failed messages auto-refunded
                    </p>
                  </>
                ) : (
                  <p className="text-[12px] text-gray-400 text-center leading-relaxed">
                    Fill all steps and click{" "}
                    <span className="font-semibold text-blue-600">Submit Campaign</span>{" "}
                    in the form below.
                  </p>
                )}
              </div>
            </div> */}

            <QuickChecklist
              hasChannel={Boolean(channel)}
              hasFile={sendType === "bulk" ? Boolean(csvFile) : true}
              hasMessage={sendType === "single" ? message.trim().length > 0 : true}
              hasName={sendType === "single" ? campaignName.trim().length >= 3 : true}
              hasSchedule={
                schedule.mode === "now" ||
                (Boolean(schedule.date) && Boolean(schedule.time))
              }
              hasCredits={balance >= estCost}
              sendType={sendType}
            />
          </div>
        )}
      </div>

    </div>
  );
}

function SummaryRow({ icon: Icon, label, value, valueClass }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-[13px] text-gray-400">
        <Icon size={14} /> {label}
      </span>
      <span className={`text-[14px] font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}

function QuickChecklist({ hasChannel, hasFile, hasName, hasMessage, hasSchedule, hasCredits, sendType }) {
  const items =
    sendType === "bulk"
      ? [
        { label: "Channel", done: hasChannel },
        { label: "CSV file", done: hasFile },
        { label: "Schedule", done: hasSchedule },
        { label: "Credits", done: hasCredits },
      ]
      : [
        { label: "Channel", done: hasChannel },
        { label: "Name", done: hasName },
        { label: "Message", done: hasMessage },
        { label: "Schedule", done: hasSchedule },
        { label: "Credits", done: hasCredits },
      ];

  const doneCount = items.filter((i) => i.done).length;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-bold text-gray-700">Launch Checklist</p>
        <span className="text-[12px] font-semibold text-blue-600">{doneCount}/{items.length}</span>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${item.done ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
              }`}>
              {item.done ? "✓" : "○"}
            </span>
            <span className={`text-[12.5px] ${item.done ? "text-gray-600" : "text-gray-400"}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}