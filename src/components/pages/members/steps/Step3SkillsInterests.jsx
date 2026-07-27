import React from "react";
import FormField from "../FormField.jsx";

const PROFESSIONAL_SKILLS = ["Marketing", "Finance", "Technology", "Sales", "Leadership", "Design", "Operations", "Legal", "HR", "Supply Chain"];
const INTERESTS = ["Networking", "Mentorship", "Funding", "Export", "Digital Marketing", "E-commerce", "Government Schemes", "Training"];
const TAGS = ["Active", "Prospect", "Udyami Queen", "Youth", "Job Seeker"];

export default function Step3SkillsInterests({ data, update }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField label="Field of Study" value={data.fieldOfStudy} onChange={(v) => update({ fieldOfStudy: v })} />
        <FormField label="Certifications" value={data.certifications} onChange={(v) => update({ certifications: v })} />
        <FormField label="Skill Proficiency" type="select" options={["Beginner", "Intermediate", "Advanced", "Expert"]} value={data.skillProficiency} onChange={(v) => update({ skillProficiency: v })} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField label="Years of Experience" value={data.yearsExperience} onChange={(v) => update({ yearsExperience: v })} />
        <FormField label="Sales Expertise" type="select" options={["Yes", "No"]} value={data.salesExpertise} onChange={(v) => update({ salesExpertise: v })} />
        <FormField label="Digital Marketing" type="select" options={["Yes", "No"]} value={data.digitalMarketingSkill} onChange={(v) => update({ digitalMarketingSkill: v })} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField label="Financial Skills" type="select" options={["Yes", "No"]} value={data.financialSkills} onChange={(v) => update({ financialSkills: v })} />
        <FormField label="IT/Tech Skills" type="select" options={["Yes", "No"]} value={data.itTechSkills} onChange={(v) => update({ itTechSkills: v })} />
        <FormField label="Public Speaking" type="select" options={["Yes", "No"]} value={data.publicSpeaking} onChange={(v) => update({ publicSpeaking: v })} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField label="Content Creation" type="select" options={["Yes", "No"]} value={data.contentCreation} onChange={(v) => update({ contentCreation: v })} />
        <FormField label="Culinary Skills" type="select" options={["Yes", "No"]} value={data.culinarySkills} onChange={(v) => update({ culinarySkills: v })} />
        <FormField label="Art/Craft Skills" type="select" options={["Yes", "No"]} value={data.artCraftSkills} onChange={(v) => update({ artCraftSkills: v })} />
      </div>

      <FormField label="Professional Skills" type="chips" chips={PROFESSIONAL_SKILLS} value={data.professionalSkills} onChange={(v) => update({ professionalSkills: v })} />
      <FormField label="Interests" type="chips" chips={INTERESTS} value={data.interests} onChange={(v) => update({ interests: v })} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField label="Want New Skills?" type="select" options={["Yes", "No"]} value={data.wantNewSkills} onChange={(v) => update({ wantNewSkills: v })} />
        <FormField label="Willing to Mentor?" type="select" options={["Yes", "No"]} value={data.willingToMentor} onChange={(v) => update({ willingToMentor: v })} />
        <FormField label="Open to Collaborate?" type="select" options={["Yes", "No"]} value={data.openToCollaborate} onChange={(v) => update({ openToCollaborate: v })} />
      </div>

      <FormField label="Tags" type="chips" chips={TAGS} value={data.tags} onChange={(v) => update({ tags: v })} />
    </div>
  );
}