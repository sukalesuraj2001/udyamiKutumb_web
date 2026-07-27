import React from "react";
import FormField from "../FormField.jsx";

const HOME_BUSINESS_INTERESTS = ["Cooking", "Bakery", "Tailoring", "Fashion", "Makeup", "Art & Craft", "Herbal", "Other"];

export default function Step4UdyamiQueens({ data, update }) {
  return (
    <div className="space-y-5">
      {/* Section Title */}
      <h3 className="text-lg font-semibold text-gray-800">
        Additional questions for Women Entrepreneurs (Udyami Queens)
      </h3>

      {/* Row 1 - Homemaker, Want Home Business?, Relevant Experience? */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField 
          label="Homemaker?" 
          type="select" 
          options={["Yes", "No"]} 
          value={data.homemaker} 
          onChange={(v) => update({ homemaker: v })} 
        />
        <FormField 
          label="Want Home Business?" 
          type="select" 
          options={["Yes", "No"]} 
          value={data.wantHomeBusiness} 
          onChange={(v) => update({ wantHomeBusiness: v })} 
        />
        <FormField 
          label="Relevant Experience?" 
          type="select" 
          options={["Yes", "No"]} 
          value={data.relevantExperience} 
          onChange={(v) => update({ relevantExperience: v })} 
        />
      </div>

      {/* Row 2 - Home Business Interests (chips only) */}
      <div>
        <FormField 
          label="Home Business Interests" 
          type="chips" 
          chips={HOME_BUSINESS_INTERESTS} 
          value={data.homeBusinessInterests || []} 
          onChange={(v) => update({ homeBusinessInterests: v })} 
        />
      </div>

      {/* Row 3 - Has Equipment?, Dark Store Interest?, Existing Customers? */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField 
          label="Has Equipment?" 
          type="select" 
          options={["Yes", "No"]} 
          value={data.hasEquipment} 
          onChange={(v) => update({ hasEquipment: v })} 
        />
        <FormField 
          label="Dark Store Interest?" 
          type="select" 
          options={["Yes", "No"]} 
          value={data.darkStoreInterest} 
          onChange={(v) => update({ darkStoreInterest: v })} 
        />
        <FormField 
          label="Existing Customers?" 
          type="select" 
          options={["Yes", "No"]} 
          value={data.existingCustomers} 
          onChange={(v) => update({ existingCustomers: v })} 
        />
      </div>

      {/* Row 4 - Product Support?, Comfortable Online?, Has Smartphone? */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField 
          label="Product Support?" 
          type="select" 
          options={["Yes", "No"]} 
          value={data.productSupport} 
          onChange={(v) => update({ productSupport: v })} 
        />
        <FormField 
          label="Comfortable Online?" 
          type="select" 
          options={["Yes", "No"]} 
          value={data.comfortableOnline} 
          onChange={(v) => update({ comfortableOnline: v })} 
        />
        <FormField 
          label="Has Smartphone?" 
          type="select" 
          options={["Yes", "No"]} 
          value={data.hasSmartphone} 
          onChange={(v) => update({ hasSmartphone: v })} 
        />
      </div>

      {/* Row 5 - Training Availability, Monthly Income Target, Want Mentor? */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField 
          label="Training Availability" 
          type="select" 
          options={["Flexible", "Morning", "Afternoon", "Evening", "Weekend"]} 
          value={data.trainingAvailability} 
          onChange={(v) => update({ trainingAvailability: v })} 
        />
        <FormField 
          label="Monthly Income Target" 
          type="select" 
          options={["Below ₹10,000", "₹10,000 - ₹25,000", "₹25,000 - ₹50,000", "Above ₹50,000"]} 
          value={data.monthlyIncomeTarget} 
          onChange={(v) => update({ monthlyIncomeTarget: v })} 
        />
        <FormField 
          label="Want Mentor?" 
          type="select" 
          options={["Yes", "No"]} 
          value={data.wantMentor} 
          onChange={(v) => update({ wantMentor: v })} 
        />
      </div>

      {/* Row 6 - Willing to Mentor Women? (Single field) */}
      <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
        <FormField 
          label="Willing to Mentor Women?" 
          type="select" 
          options={["Yes", "No"]} 
          value={data.willingToMentor} 
          onChange={(v) => update({ willingToMentor: v })} 
        />
      </div>
    </div>
  );
}