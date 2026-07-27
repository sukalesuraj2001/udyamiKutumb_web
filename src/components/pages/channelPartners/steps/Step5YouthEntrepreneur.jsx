import React from "react";
import CpFormFeild from "../CpFormFeild.jsx";

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
        <CpFormFeild 
          label="Final Year Student?" 
          type="select" 
          options={["Yes", "No"]} 
          value={data.finalYearStudent} 
          onChange={(v) => update({ finalYearStudent: v })} 
        />
        <CpFormFeild 
          label="Course/Degree" 
          value={data.courseDegree} 
          onChange={(v) => update({ courseDegree: v })} 
          placeholder="e.g., B.Tech, MBA"
        />
        <CpFormFeild 
          label="Institution" 
          value={data.institution} 
          onChange={(v) => update({ institution: v })} 
          placeholder="College/University Name"
        />
      </div>

      {/* Row 2 - Graduation Year, Interested in Entrepreneurship?, Has Business Idea? */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CpFormFeild 
          label="Graduation Year" 
          type="select" 
          options={["2024", "2025", "2026", "2027", "2028"]} 
          value={data.graduationYear} 
          onChange={(v) => update({ graduationYear: v })} 
        />
        <CpFormFeild 
          label="Interested in Entrepreneurship?" 
          type="select" 
          options={["Yes", "No"]} 
          value={data.interestedEntrepreneurship} 
          onChange={(v) => update({ interestedEntrepreneurship: v })} 
        />
        <CpFormFeild 
          label="Has Business Idea?" 
          type="select" 
          options={["Yes", "No"]} 
          value={data.hasBusinessIdea} 
          onChange={(v) => update({ hasBusinessIdea: v })} 
        />
      </div>

      {/* Row 3 - Interested Sectors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CpFormFeild 
          label="Interested Sectors" 
          type="select" 
          options={INTERESTED_SECTORS} 
          value={data.interestedSectors} 
          onChange={(v) => update({ interestedSectors: v })} 
        />
        <CpFormFeild 
          label="Startup Competitions?" 
          type="select" 
          options={["Yes", "No"]} 
          value={data.startupCompetitions} 
          onChange={(v) => update({ startupCompetitions: v })} 
        />
        <CpFormFeild 
          label="Financial Support?" 
          type="select" 
          options={["Yes", "No"]} 
          value={data.financialSupport} 
          onChange={(v) => update({ financialSupport: v })} 
        />
      </div>

      {/* Row 4 - Business Idea Description */}
      <CpFormFeild 
        label="Business Idea Description" 
        type="textarea" 
        value={data.businessIdeaDescription} 
        onChange={(v) => update({ businessIdeaDescription: v })} 
        placeholder="One-line description..."
      />

      {/* Row 5 - Problem to Solve */}
      <CpFormFeild 
        label="Problem to Solve" 
        type="textarea" 
        value={data.problemToSolve} 
        onChange={(v) => update({ problemToSolve: v })} 
        placeholder="What problem does your business solve?"
      />

      {/* Row 6 - Work with Businesses?, Weekly Hours, Tech Skills? */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CpFormFeild 
          label="Work with Businesses?" 
          type="select" 
          options={["Yes", "No"]} 
          value={data.workWithBusinesses} 
          onChange={(v) => update({ workWithBusinesses: v })} 
        />
        <CpFormFeild 
          label="Weekly Hours" 
          value={data.weeklyHours} 
          onChange={(v) => update({ weeklyHours: v })} 
          placeholder="e.g., 10–15"
        />
        <CpFormFeild 
          label="Tech Skills?" 
          type="select" 
          options={["Yes", "No"]} 
          value={data.techSkills} 
          onChange={(v) => update({ techSkills: v })} 
        />
      </div>

      {/* Row 7 - Role Model (Text box) */}
      <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
        <CpFormFeild 
          label="Role Model" 
          value={data.roleModel} 
          onChange={(v) => update({ roleModel: v })} 
          placeholder="Who inspires you as an entrepreneur?"
        />
      </div>
    </div>
  );
}