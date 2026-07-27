import React from "react";
import FormField from "../FormField.jsx";

const INTERESTED_SECTORS = [
  "Technology",
  "Healthcare",
  "Education",
  "Agriculture",
  "Manufacturing",
  "Retail",
  "Food & Beverage",
  "Fashion",
  "Real Estate",
  "Transportation",
  "Finance",
  "Entertainment",
  "Other"
];

export default function Step5YouthEntrepreneur({ data, update }) {
  return (
    <div className="space-y-5">
      {/* Section Title */}
      <h3 className="text-lg font-semibold text-gray-800">
        Additional questions for Youth Entrepreneurs
      </h3>

      {/* Row 1 - Final Year Student?, Course/Degree, Institution */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField 
          label="Final Year Student?" 
          type="select" 
          options={["Yes", "No"]} 
          value={data.finalYearStudent} 
          onChange={(v) => update({ finalYearStudent: v })} 
        />
        <FormField 
          label="Course/Degree" 
          value={data.courseDegree} 
          onChange={(v) => update({ courseDegree: v })} 
          placeholder="e.g., B.Tech, MBA"
        />
        <FormField 
          label="Institution" 
          value={data.institution} 
          onChange={(v) => update({ institution: v })} 
          placeholder="College/University Name"
        />
      </div>

      {/* Row 2 - Graduation Year, Interested in Entrepreneurship?, Has Business Idea? */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField 
          label="Graduation Year" 
          type="select" 
          options={["2024", "2025", "2026", "2027", "2028"]} 
          value={data.graduationYear} 
          onChange={(v) => update({ graduationYear: v })} 
        />
        <FormField 
          label="Interested in Entrepreneurship?" 
          type="select" 
          options={["Yes", "No"]} 
          value={data.interestedEntrepreneurship} 
          onChange={(v) => update({ interestedEntrepreneurship: v })} 
        />
        <FormField 
          label="Has Business Idea?" 
          type="select" 
          options={["Yes", "No"]} 
          value={data.hasBusinessIdea} 
          onChange={(v) => update({ hasBusinessIdea: v })} 
        />
      </div>

      {/* Row 3 - Interested Sectors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField 
          label="Interested Sectors" 
          type="select" 
          options={INTERESTED_SECTORS} 
          value={data.interestedSectors} 
          onChange={(v) => update({ interestedSectors: v })} 
        />
        <FormField 
          label="Startup Competitions?" 
          type="select" 
          options={["Yes", "No"]} 
          value={data.startupCompetitions} 
          onChange={(v) => update({ startupCompetitions: v })} 
        />
        <FormField 
          label="Financial Support?" 
          type="select" 
          options={["Yes", "No"]} 
          value={data.financialSupport} 
          onChange={(v) => update({ financialSupport: v })} 
        />
      </div>

      {/* Row 4 - Business Idea Description */}
      <FormField 
        label="Business Idea Description" 
        type="textarea" 
        value={data.businessIdeaDescription} 
        onChange={(v) => update({ businessIdeaDescription: v })} 
        placeholder="One-line description..."
      />

      {/* Row 5 - Problem to Solve */}
      <FormField 
        label="Problem to Solve" 
        type="textarea" 
        value={data.problemToSolve} 
        onChange={(v) => update({ problemToSolve: v })} 
        placeholder="What problem does your business solve?"
      />

      {/* Row 6 - Work with Businesses?, Weekly Hours, Tech Skills? */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField 
          label="Work with Businesses?" 
          type="select" 
          options={["Yes", "No"]} 
          value={data.workWithBusinesses} 
          onChange={(v) => update({ workWithBusinesses: v })} 
        />
        <FormField 
          label="Weekly Hours" 
          value={data.weeklyHours} 
          onChange={(v) => update({ weeklyHours: v })} 
          placeholder="e.g., 10–15"
        />
        <FormField 
          label="Tech Skills?" 
          type="select" 
          options={["Yes", "No"]} 
          value={data.techSkills} 
          onChange={(v) => update({ techSkills: v })} 
        />
      </div>

      {/* Row 7 - Role Model (Text box) */}
      <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
        <FormField 
          label="Role Model" 
          value={data.roleModel} 
          onChange={(v) => update({ roleModel: v })} 
          placeholder="Who inspires you as an entrepreneur?"
        />
      </div>
    </div>
  );
}