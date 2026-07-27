import React from "react";
import CpFormFeild from "../CpFormFeild.jsx";

const ONLINE_SALES_CHANNELS = ["Amazon", "Flipkart", "Own Website", "Social Media"];
const BIGGEST_CHALLENGES = ["Leads", "Finance", "Marketing", "Technology", "Mentorship", "Logistics", "Legal", "Manpower"];
const SUPPORT_NEEDED = ["Leads", "Finance", "Marketing", "Technology", "Mentorship", "Logistics"];

export default function Step2BusinessInfo({ data, update }) {
  return (
    <div className="space-y-5">
      {/* Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CpFormFeild label="Own a Business?" type="select" options={["Yes", "No"]} value={data.ownBusiness} onChange={(v) => update({ ownBusiness: v })} />
        <CpFormFeild label="Business Name" value={data.businessName} onChange={(v) => update({ businessName: v })} />
        <CpFormFeild label="Business Type" type="select" options={["Sole Proprietorship", "Partnership", "Pvt Ltd", "LLP"]} value={data.businessType} onChange={(v) => update({ businessType: v })} />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CpFormFeild label="Industry Sector" type="select" options={["Manufacturing", "Retail", "Services", "Technology", "Food & Hospitality", "Agriculture"]} value={data.industrySector} onChange={(v) => update({ industrySector: v })} />
        <CpFormFeild label="Sub-category" value={data.subCategory} onChange={(v) => update({ subCategory: v })} placeholder="e.g., Bakery, IT" />
        <CpFormFeild label="Business Stage" type="select" options={["Idea", "Startup", "Growing", "Established"]} value={data.businessStage} onChange={(v) => update({ businessStage: v })} />
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CpFormFeild label="Year Established" value={data.yearEstablished} onChange={(v) => update({ yearEstablished: v })} placeholder="YYYY" />
        <CpFormFeild label="Annual Turnover" type="select" options={["< 5 Lakh", "5-25 Lakh", "25 Lakh - 1 Cr", "> 1 Cr"]} value={data.annualTurnover} onChange={(v) => update({ annualTurnover: v })} />
        <CpFormFeild label="No. of Employees" value={data.employeeCount} onChange={(v) => update({ employeeCount: v })} />
      </div>

      {/* Row 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CpFormFeild label="GST Registration" type="select" options={["Yes", "No"]} value={data.gstRegistration} onChange={(v) => update({ gstRegistration: v })} />
        <CpFormFeild label="GST Number" value={data.gstNumber} onChange={(v) => update({ gstNumber: v })} />
        <CpFormFeild label="MSME Registration" type="select" options={["Yes", "No"]} value={data.msmeRegistration} onChange={(v) => update({ msmeRegistration: v })} />
      </div>

      {/* Row 5 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CpFormFeild label="Target Customer" type="select" options={["B2B", "B2C", "Both"]} value={data.targetCustomer} onChange={(v) => update({ targetCustomer: v })} />
        <CpFormFeild label="Geographic Markets" type="select" options={["Local", "State", "National", "International"]} value={data.geographicMarkets} onChange={(v) => update({ geographicMarkets: v })} />
        <CpFormFeild label="Sales Channels" type="select" options={["Physical Store", "Online", "WhatsApp", "B2B"]} value={data.salesChannels} onChange={(v) => update({ salesChannels: v })} />
      </div>

      {/* Row 6 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CpFormFeild label="Sells Online?" type="select" options={["Yes", "No"]} value={data.sellsOnline} onChange={(v) => update({ sellsOnline: v })} />
        <CpFormFeild label="Business Website" type="url" value={data.businessWebsite} onChange={(v) => update({ businessWebsite: v })} placeholder="https://" />
        <CpFormFeild label="Bank Account?" type="select" options={["Yes", "No"]} value={data.bankAccount} onChange={(v) => update({ bankAccount: v })} />
      </div>

      {/* Primary Products/Services - Full width */}
      <CpFormFeild label="Primary Products/Services" type="textarea" value={data.primaryProducts} onChange={(v) => update({ primaryProducts: v })} />

      {/* Online Sales Channels as Chips */}
      <CpFormFeild
        label="Online Sales Channels"
        type="chips"
        chips={ONLINE_SALES_CHANNELS}
        value={data.onlineSalesChannels || []}
        onChange={(v) => update({ onlineSalesChannels: v })}
      />

      {/* Biggest Challenges as Chips */}
      <CpFormFeild
        label="Biggest Challenges"
        type="chips"
        chips={BIGGEST_CHALLENGES}
        value={data.biggestChallenges || []}
        onChange={(v) => update({ biggestChallenges: v })}
      />

      {/* Support Needed as Chips */}
      <CpFormFeild
        label="Support Needed"
        type="chips"
        chips={SUPPORT_NEEDED}
        value={data.supportNeeded || []}
        onChange={(v) => update({ supportNeeded: v })}
      />

      {/* Two fields side by side - FIX: use string values, not arrays */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CpFormFeild 
          label="Taken Business Loan?" 
          type="select" 
          options={["Yes", "No"]} 
          value={typeof data.takenBusinessLoan === 'string' ? data.takenBusinessLoan : (data.takenBusinessLoan && data.takenBusinessLoan[0]) || ""} 
          onChange={(v) => update({ takenBusinessLoan: v })} 
        />
        <CpFormFeild 
          label="Seeking Funding?" 
          type="select" 
          options={["Yes", "Maybe", "No"]} 
          value={typeof data.seekingFunding === 'string' ? data.seekingFunding : (data.seekingFunding && data.seekingFunding[0]) || ""} 
          onChange={(v) => update({ seekingFunding: v })} 
        />
      </div>
    </div>
  );
}