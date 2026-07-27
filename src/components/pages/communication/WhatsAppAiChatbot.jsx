import React, { useState } from "react";
import ConfigPanel from "../communication/whatsappBot/ConfigPanel.jsx";
import LivePreview from "../communication/whatsappBot/LivePreview.jsx";
import WhatsAppBotPerformance from "../communication/whatsappBot/WhatsAppBotPerformance.jsx";

const DEFAULT_CONFIG = {
  botName: "Udyami Saathi",
  avatarKey: "bot",
  welcomeMessage:
    "Namaste! Main Udyami Saathi hoon. Main aapki business growth mein madad karne ke liye yahan hoon. Aap mujhse kya jaanna chahte hain?",
  language: "Hinglish",
  tone: "Helpful & Friendly",
  responseLength: "Balanced",
  expertise: { compliance: true, schemes: true, leads: true, membership: true },
  quickReplies: [
    { id: "qr1", label: "View My Leads 📊" },
    { id: "qr2", label: "Upcoming Events 📅" },
    { id: "qr3", label: "Membership Renewal 💳" },
    { id: "qr4", label: "Talk to Ward Leader 👤" },
  ],
  escalationRules: { complaint: true },
  escalationContact: "Rohit Patil — Ward 14 Shivajinagar",
};

export default function WhatsAppAiChatbot() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  const handleSave = () => console.log("Saving config:", config);
  const handleDeploy = () => console.log("Deploying config to WhatsApp:", config);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start min-w-0">
        <div className="min-w-0">
          <ConfigPanel config={config} setConfig={setConfig} onSave={handleSave} onDeploy={handleDeploy} />
        </div>
        <div className="min-w-0 lg:sticky lg:top-6">
          <LivePreview config={config} />
        </div>
      </div>

      <WhatsAppBotPerformance />
    </div>
  );
}