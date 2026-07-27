import React from "react";
import CpFormFeild from "../CpFormFeild.jsx";

const SOCIAL_PLATFORMS = ["Facebook", "Instagram", "LinkedIn", "Twitter/X", "YouTube", "WhatsApp"];
const PRIMARY_PLATFORM = ["Facebook", "Instagram", "LinkedIn", "Twitter/X", "YouTube", "WhatsApp"];
const DAILY_USAGE = ["Less than 1 hour", "1-3 hours", "3-5 hours", "5-8 hours", "More than 8 hours"];
const FOLLOWERS = ["Below 100", "100-500", "500-1000", "1000-5000", "5000-10000", "Above 10000"];
const POST_FREQUENCY = ["Daily", "Weekly", "Monthly", "Rarely"];

export default function Step6DigitalPresence({ data, update }) {
  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-gray-800">
        Digital presence and social media usage
      </h3>

      <div>
        <CpFormFeild 
          label="Social Platforms Used" 
          type="chips" 
          chips={SOCIAL_PLATFORMS} 
          value={data.socialPlatforms || []} 
          onChange={(v) => update({ socialPlatforms: v })} 
        />
      </div>

      {/* Row 2 - Primary Platform, Daily Usage, Followers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CpFormFeild 
          label="Primary Platform" 
          type="select" 
          options={PRIMARY_PLATFORM} 
          value={data.primaryPlatform} 
          onChange={(v) => update({ primaryPlatform: v })} 
        />
        <CpFormFeild 
          label="Daily Usage" 
          type="select" 
          options={DAILY_USAGE} 
          value={data.dailyUsage} 
          onChange={(v) => update({ dailyUsage: v })} 
        />
        <CpFormFeild 
          label="Followers" 
          type="select" 
          options={FOLLOWERS} 
          value={data.followers} 
          onChange={(v) => update({ followers: v })} 
        />
      </div>

      {/* Row 3 - Post Frequency, WhatsApp Business?, FB/Insta Page? */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CpFormFeild 
          label="Post Frequency" 
          type="select" 
          options={POST_FREQUENCY} 
          value={data.postFrequency} 
          onChange={(v) => update({ postFrequency: v })} 
        />
        <CpFormFeild 
          label="WhatsApp Business?" 
          type="select" 
          options={["Yes", "No"]} 
          value={data.whatsappBusiness} 
          onChange={(v) => update({ whatsappBusiness: v })} 
        />
        <CpFormFeild 
          label="FB/Insta Page?" 
          type="select" 
          options={["Yes", "No"]} 
          value={data.fbInstaPage} 
          onChange={(v) => update({ fbInstaPage: v })} 
        />
      </div>

      {/* Row 4 - Google My Business?, Digital Payments?, Procures Online? */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CpFormFeild 
          label="Google My Business?" 
          type="select" 
          options={["Yes", "No"]} 
          value={data.googleMyBusiness} 
          onChange={(v) => update({ googleMyBusiness: v })} 
        />
        <CpFormFeild 
          label="Digital Payments?" 
          type="select" 
          options={["Yes", "No"]} 
          value={data.digitalPayments} 
          onChange={(v) => update({ digitalPayments: v })} 
        />
        <CpFormFeild 
          label="Procures Online?" 
          type="select" 
          options={["Yes", "No"]} 
          value={data.procuresOnline} 
          onChange={(v) => update({ procuresOnline: v })} 
        />
      </div>

      {/* Row 5 - Create Content?, Business Software?, Smartphone Comfort */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CpFormFeild 
          label="Create Content?" 
          type="select" 
          options={["Yes", "No"]} 
          value={data.createContent} 
          onChange={(v) => update({ createContent: v })} 
        />
        <CpFormFeild 
          label="Business Software?" 
          type="select" 
          options={["Yes", "No"]} 
          value={data.businessSoftware} 
          onChange={(v) => update({ businessSoftware: v })} 
        />
        <CpFormFeild 
          label="Smartphone Comfort" 
          type="select" 
          options={["Beginner", "Intermediate", "Advanced"]} 
          value={data.smartphoneComfort} 
          onChange={(v) => update({ smartphoneComfort: v })} 
        />
      </div>

      {/* Row 6 - Want Digital Marketing Training? (Single field) */}
      <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
        <CpFormFeild 
          label="Want Digital Marketing Training?" 
          type="select" 
          options={["Yes", "No"]} 
          value={data.wantDigitalMarketingTraining} 
          onChange={(v) => update({ wantDigitalMarketingTraining: v })} 
        />
      </div>
    </div>
  );
}