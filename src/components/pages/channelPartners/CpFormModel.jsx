// MemberFormModal.jsx - Fixed version
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { STEPS, EMPTY_FORM_DATA } from "../members/steps/stepConfig.js";
import Step1PersonalContact from "./steps/Step1PersonalContact.jsx";
import Step2BusinessInfo from "./steps/Step2BusinessInfo.jsx";
import Step3SkillsInterests from "./steps/Step3SkillsInterests.jsx";
import Step4UdyamiQueens from "./steps/Step4UdyamiQueens.jsx";
import Step5YouthEntrepreneur from "./steps/Step5YouthEntrepreneur.jsx";
import Step6DigitalPresence from "./steps/Step6DigitalPresence.jsx";
import Step7ReviewSubmit from "./steps/Step7ReviewSubmit.jsx";

const STEP_COMPONENTS = [
    Step1PersonalContact,
    Step2BusinessInfo,
    Step3SkillsInterests,
    Step4UdyamiQueens,
    Step5YouthEntrepreneur,
    Step6DigitalPresence,
    Step7ReviewSubmit,
];

export default function CpFormModel({ mode = "add", existingMember, onClose, onSubmit }) {
    const [stepIndex, setStepIndex] = useState(0);

    const [formData, setFormData] = useState(() => {
        if (mode === "edit" && existingMember) {
            const merged = {
                ...EMPTY_FORM_DATA,
                ...existingMember,
                name: existingMember.name || `${existingMember.firstName || ''} ${existingMember.lastName || ''}`.trim(),
                phone: existingMember.phone || existingMember.primaryMobile,
                business: existingMember.business || existingMember.businessName,
                sector: existingMember.sector || existingMember.industrySector,
                stage: existingMember.stage || existingMember.businessStage,
                tag: existingMember.tag || (existingMember.tags && existingMember.tags[0]),
                tags: existingMember.tags || [],
                taluk: existingMember.taluk || existingMember.circle,
                languagesKnown: existingMember.languagesKnown || [],
                professionalSkills: existingMember.professionalSkills || [],
                interests: existingMember.interests || [],
                socialPlatforms: existingMember.socialPlatforms || [],
                infrastructureChallenges: existingMember.infrastructureChallenges || [],
                onlineSalesChannels: existingMember.onlineSalesChannels || [],
                biggestChallenges: existingMember.biggestChallenges || [],
                supportNeeded: existingMember.supportNeeded || [],
                homeBusinessInterests: existingMember.homeBusinessInterests || [],
                takenBusinessLoan: existingMember.takenBusinessLoan || [],
                seekingFunding: existingMember.seekingFunding || [],
                willingToMentor: existingMember.willingToMentor || "No",
            };
            return merged;
        }
        return EMPTY_FORM_DATA;
    });

    // Fix: Update formData when existingMember changes (for edit mode)
    useEffect(() => {
        if (mode === "edit" && existingMember) {
            const merged = {
                ...EMPTY_FORM_DATA,
                ...existingMember,
                name: existingMember.name || `${existingMember.firstName || ''} ${existingMember.lastName || ''}`.trim(),
                phone: existingMember.phone || existingMember.primaryMobile,
                business: existingMember.business || existingMember.businessName,
                sector: existingMember.sector || existingMember.industrySector,
                stage: existingMember.stage || existingMember.businessStage,
                tag: existingMember.tag || (existingMember.tags && existingMember.tags[0]),
                tags: existingMember.tags || [],
                taluk: existingMember.taluk || existingMember.circle,
                languagesKnown: existingMember.languagesKnown || [],
                professionalSkills: existingMember.professionalSkills || [],
                interests: existingMember.interests || [],
                socialPlatforms: existingMember.socialPlatforms || [],
                infrastructureChallenges: existingMember.infrastructureChallenges || [],
                onlineSalesChannels: existingMember.onlineSalesChannels || [],
                biggestChallenges: existingMember.biggestChallenges || [],
                supportNeeded: existingMember.supportNeeded || [],
                homeBusinessInterests: existingMember.homeBusinessInterests || [],
                takenBusinessLoan: existingMember.takenBusinessLoan || [],
                seekingFunding: existingMember.seekingFunding || [],
                willingToMentor: existingMember.willingToMentor || "No",
            };
            setFormData(merged);
        }
    }, [existingMember, mode]);

    const udyamiId = existingMember?.udyamiId || `UDY-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.random().toString(16).slice(2, 10).toUpperCase()}`;

    const update = (patch) => setFormData((f) => ({ ...f, ...patch }));

    const StepComponent = STEP_COMPONENTS[stepIndex];
    const isFirstStep = stepIndex === 0;
    const isLastStep = stepIndex === STEPS.length - 1;

    const handleNext = () => {
        if (isLastStep) {
            const submitData = {
                ...formData,
                udyamiId,
                id: existingMember?.id,
                // Build name from firstName and lastName
                name: formData.name || `${formData.firstName || ''} ${formData.lastName || ''}`.trim(),
                // Ensure these are stored as strings
                takenBusinessLoan: typeof formData.takenBusinessLoan === 'string'
                    ? formData.takenBusinessLoan
                    : (formData.takenBusinessLoan && formData.takenBusinessLoan[0]) || "",
                seekingFunding: typeof formData.seekingFunding === 'string'
                    ? formData.seekingFunding
                    : (formData.seekingFunding && formData.seekingFunding[0]) || "",
            };
            onSubmit(submitData);
        } else {
            setStepIndex((i) => i + 1);
        }
    };

    const handleBack = () => {
        if (!isFirstStep) setStepIndex((i) => i - 1);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
            <div className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                <div className="flex items-start justify-between px-6 py-5 border-b border-hairline shrink-0">
                    <div>
                        <h2 className="font-display text-[19px] text-ink">{mode === "edit" ? "Edit Member" : "Add New Member"}</h2>
                        <span className="text-[11px] font-mono border border-hairline text-muted px-2 py-0.5 rounded mt-1 inline-block">
                            Udyami ID: {udyamiId}
                        </span>
                    </div>
                    <button onClick={onClose} className="text-muted hover:text-ink">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex items-center gap-1 px-6 pt-4 border-b border-hairline overflow-x-auto shrink-0">
                    {STEPS.map((s, i) => (
                        <button
                            key={s.key}
                            onClick={() => i < stepIndex && setStepIndex(i)}
                            className={`text-[13px] font-medium px-3 py-2.5 border-b-2 whitespace-nowrap transition-colors ${i === stepIndex
                                ? "border-ink text-ink font-semibold"
                                : i < stepIndex
                                    ? "border-transparent text-muted hover:text-ink cursor-pointer"
                                    : "border-transparent text-muted/50 cursor-default"
                                }`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    <StepComponent data={formData} update={update} />
                </div>

                <div className="flex items-center justify-between px-6 py-4 border-t border-hairline shrink-0">
                    <button
                        onClick={handleBack}
                        disabled={isFirstStep}
                        className="border border-hairline text-ink text-[13.5px] font-semibold px-5 py-2.5 rounded-xl hover:bg-ink/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        Back
                    </button>

                    <div className="flex items-center gap-3">
                        <span className="text-[13px] text-muted">{stepIndex + 1} / {STEPS.length}</span>
                        <button onClick={onClose} className="border border-hairline text-ink text-[13.5px] font-semibold px-5 py-2.5 rounded-xl hover:bg-ink/5 transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={handleNext}
                            className="bg-amber text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-xl hover:bg-amber/90 transition-colors"
                        >
                            {isLastStep ? "Submit" : "Next"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}