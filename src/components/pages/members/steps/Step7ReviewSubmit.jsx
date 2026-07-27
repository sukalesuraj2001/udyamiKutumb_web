import React from "react";
import FormField from "../FormField.jsx";

const HOW_HEARD_ABOUT_US = [
  "Social Media",
  "Friend/Relative",
  "Newspaper",
  "Radio",
  "TV",
  "Udyami Event",
  "Government Scheme",
  "Bank",
  "Other"
];

const INFRASTRUCTURE_CHALLENGES = [
  "Roads",
  "Power",
  "Internet",
  "Water",
  "Market Access",
  "Transportation",
  "Skilled Labor"
];

export default function Step7ReviewSubmit({ data, update }) {
  return (
    <div className="space-y-5">
      {/* Section Title */}
      <h3 className="text-lg font-semibold text-gray-800">
        Community & ground intelligence questions
      </h3>

      {/* Row 1 - How Heard About Us, Referrer Name, Referrer Udyami ID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField 
          label="How Heard About Us?" 
          type="select" 
          options={HOW_HEARD_ABOUT_US} 
          value={data.howHeardAboutUs} 
          onChange={(v) => update({ howHeardAboutUs: v })} 
        />
        <FormField 
          label="Referrer Name" 
          value={data.referrerName} 
          onChange={(v) => update({ referrerName: v })} 
          placeholder="Full name"
        />
        <FormField 
          label="Referrer Udyami ID" 
          value={data.referrerUdyamiId} 
          onChange={(v) => update({ referrerUdyamiId: v })} 
          placeholder="e.g., UB-26-XXXXX"
        />
      </div>

      {/* Row 2 - Existing Association?, Attends Networking?, Known Businesses */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField 
          label="Existing Association?" 
          type="select" 
          options={["Yes", "No"]} 
          value={data.existingAssociation} 
          onChange={(v) => update({ existingAssociation: v })} 
        />
        <FormField 
          label="Attends Networking?" 
          type="select" 
          options={["Yes", "No"]} 
          value={data.attendsNetworking} 
          onChange={(v) => update({ attendsNetworking: v })} 
        />
        <FormField 
          label="Known Businesses" 
          value={data.knownBusinesses} 
          onChange={(v) => update({ knownBusinesses: v })} 
          placeholder="Approx count"
        />
      </div>

      {/* Row 3 - Biggest Opportunity in Your Area (Full width) */}
      <FormField 
        label="Biggest Opportunity in Your Area" 
        type="textarea" 
        value={data.biggestOpportunity} 
        onChange={(v) => update({ biggestOpportunity: v })} 
        placeholder="Describe the biggest business opportunity in your area..."
      />

      {/* Row 4 - Infrastructure Challenges (Chips) */}
      <div>
        <FormField 
          label="Infrastructure Challenges" 
          type="chips" 
          chips={INFRASTRUCTURE_CHALLENGES} 
          value={data.infrastructureChallenges || []} 
          onChange={(v) => update({ infrastructureChallenges: v })} 
        />
      </div>

      {/* Row 5 - Willing to Refer?, Can Host Meeting?, Aware of Gov Schemes? */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField 
          label="Willing to Refer?" 
          type="select" 
          options={["Yes", "No"]} 
          value={data.willingToRefer} 
          onChange={(v) => update({ willingToRefer: v })} 
        />
        <FormField 
          label="Can Host Meeting?" 
          type="select" 
          options={["Yes", "No"]} 
          value={data.canHostMeeting} 
          onChange={(v) => update({ canHostMeeting: v })} 
        />
        <FormField 
          label="Aware of Gov Schemes?" 
          type="select" 
          options={["Yes", "No"]} 
          value={data.awareOfGovSchemes} 
          onChange={(v) => update({ awareOfGovSchemes: v })} 
        />
      </div>

      {/* Row 6 - Unserved Business Needs (Full width) */}
      <FormField 
        label="Unserved Business Needs" 
        type="textarea" 
        value={data.unservedBusinessNeeds} 
        onChange={(v) => update({ unservedBusinessNeeds: v })} 
        placeholder="Describe any unserved business needs in your area..."
      />
    </div>
  );
}