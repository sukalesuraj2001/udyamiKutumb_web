import React, { useState } from "react";
import TemplateLibrary from "../communication/bulkSmsEmail/TemplateLibrary.jsx";
import CampaignComposer from "../communication/bulkSmsEmail/CampaignComposer.jsx";
import SelectAudience from "../communication/bulkSmsEmail/SelectAudience.jsx";
import ScheduleCard from "../communication/bulkSmsEmail/ScheduleCard.jsx";
import RecentCampaigns from "../communication/bulkSmsEmail/RecentCampaigns.jsx";
import { TEMPLATE_LIBRARY } from "../communication/bulkSmsEmail/TEMPLATE_LIBRARY.js";

export default function BulkSmsEmail() {
  // Composer
  const [campaignName, setCampaignName] = useState("");
  const [type, setType] = useState("email");
  const [templateId, setTemplateId] = useState(null);
  const [messageBody, setMessageBody] = useState("");
  const [previewMode, setPreviewMode] = useState("personalized");

  // Audience
  const [constituency, setConstituency] = useState("");
  const [ward, setWard] = useState("");
  const [plan, setPlan] = useState("");
  const [sector, setSector] = useState("");
  const [tag, setTag] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [estimatedReach, setEstimatedReach] = useState(1240);
  const [excludeDnd, setExcludeDnd] = useState(true);
  const [dndExcludedCount] = useState(43);

  // Schedule
  const [scheduleMode, setScheduleMode] = useState("now");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [frequency, setFrequency] = useState("Weekly");
  const [dayOfWeek, setDayOfWeek] = useState("Monday");
  const [recurringTime, setRecurringTime] = useState("09:00");

  const handleSelectTemplate = (template) => {
    setTemplateId(template.id);
    setType(template.type);
    setMessageBody(template.body);
    if (!campaignName) setCampaignName(template.name);
  };

  const handleNewCampaign = () => {
    setCampaignName("");
    setTemplateId(null);
    setMessageBody("");
    setType("email");
    setPreviewMode("personalized");
  };

  const handleCreateTemplate = () => {
    console.log("Open create-template flow");
  };

  const handleClearFilters = () => {
    setConstituency(""); setWard(""); setPlan(""); setSector(""); setTag(""); setBusinessType("");
  };

  const handleSendCampaign = () => {
    console.log({
      campaignName, type, messageBody, estimatedReach, excludeDnd,
      scheduleMode, scheduleDate, scheduleTime, frequency, dayOfWeek, recurringTime,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5 items-start min-w-0">
      <div className="min-w-0">
        <TemplateLibrary
          selectedTemplateId={templateId}
          onSelectTemplate={handleSelectTemplate}
          onNewCampaign={handleNewCampaign}
          onCreateTemplate={handleCreateTemplate}
        />
      </div>

      <div className="min-w-0 space-y-5">
        <CampaignComposer
          campaignName={campaignName}
          setCampaignName={setCampaignName}
          type={type}
          setType={setType}
          templateId={templateId}
          setTemplateId={(id) => {
            setTemplateId(id);
            const t = TEMPLATE_LIBRARY.find((tpl) => tpl.id === id);
            if (t) setMessageBody(t.body);
          }}
          messageBody={messageBody}
          setMessageBody={setMessageBody}
          previewMode={previewMode}
          setPreviewMode={setPreviewMode}
        />

        <SelectAudience
          constituency={constituency} setConstituency={setConstituency}
          ward={ward} setWard={setWard}
          plan={plan} setPlan={setPlan}
          sector={sector} setSector={setSector}
          tag={tag} setTag={setTag}
          businessType={businessType} setBusinessType={setBusinessType}
          estimatedReach={estimatedReach}
          excludeDnd={excludeDnd} setExcludeDnd={setExcludeDnd}
          dndExcludedCount={dndExcludedCount}
          onClearFilters={handleClearFilters}
        />

        <ScheduleCard
          mode={scheduleMode}
          setMode={setScheduleMode}
          scheduleDate={scheduleDate}
          setScheduleDate={setScheduleDate}
          scheduleTime={scheduleTime}
          setScheduleTime={setScheduleTime}
          frequency={frequency}
          setFrequency={setFrequency}
          dayOfWeek={dayOfWeek}
          setDayOfWeek={setDayOfWeek}
          recurringTime={recurringTime}
          setRecurringTime={setRecurringTime}
          onSend={handleSendCampaign}
          disabled={!messageBody.trim() || !campaignName.trim()}
        />

        <RecentCampaigns />
      </div>
    </div>
  );
}