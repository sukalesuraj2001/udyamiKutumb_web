// export const STEPS = [
//   { key: "personal", label: "Personal & Contact" },
//   { key: "business", label: "Business Info" },
//   { key: "skills", label: "Skills & Interests" },
//   { key: "udyamiQueens", label: "Udyami Queens" },
//   { key: "youthEntrepreneur", label: "Youth Entrepreneur" },
//   { key: "digitalPresence", label: "Digital Presence" },
//   { key: "community", label: "Community" },
// ];

// export const EMPTY_FORM_DATA = {
//   // Step 1 — Personal & Contact
//   firstName: "", lastName: "", fathersName: "", mothersName: "", dob: "", gender: "Male",
//   maritalStatus: "Single", primaryMobile: "", whatsappNumber: "", email: "",
//   preferredChannel: "WhatsApp", education: "", currentAddress: "", permanentAddress: "",
//   ward: "", circle: "", state: "", pincode: "", languagesKnown: [],

//   // Step 2 — Business Info
//   ownBusiness: "No", businessName: "", businessType: "", industrySector: "", subCategory: "",
//   businessStage: "Idea", yearEstablished: "", annualTurnover: "", employeeCount: "",
//   gstRegistration: "No", gstNumber: "", msmeRegistration: "No", targetCustomer: "B2B",
//   primaryProducts: "", geographicMarkets: "", businessWebsite: "",

//   // Step 3 — Skills & Interests
//   fieldOfStudy: "", certifications: "", skillProficiency: "Beginner", yearsExperience: "",
//   salesExpertise: "No", digitalMarketingSkill: "No", financialSkills: "No", itTechSkills: "No",
//   publicSpeaking: "No", contentCreation: "No", culinarySkills: "No", artCraftSkills: "No",
//   professionalSkills: [], interests: [], wantNewSkills: "Yes", willingToMentor: "No",
//   openToCollaborate: "Yes", tags: [],

//   // Step 4 — Udyami Queens
//   // (fields TBD — send the screenshot for this tab and I'll fill it in)

//   // Step 5 — Youth Entrepreneur
//   // (fields TBD)

//   // Step 6 — Digital Presence
//   // (fields TBD)

//   // Step 7 — Community
//   // (fields TBD — this is likely "Review & Submit")
// };

export const STEPS = [
  { key: "personal", label: "Personal & Contact" },
  { key: "business", label: "Business Info" },
  { key: "skills", label: "Skills & Interests" },
  { key: "udyamiQueens", label: "Udyami Queens" },
  { key: "youthEntrepreneur", label: "Youth Entrepreneur" },
  { key: "digitalPresence", label: "Digital Presence" },
  { key: "community", label: "Community" },
];

export const EMPTY_FORM_DATA = {
  // Step 1 — Personal & Contact
  firstName: "", lastName: "", fathersName: "", mothersName: "", dob: "", gender: "Male",
  maritalStatus: "Single", primaryMobile: "", whatsappNumber: "", email: "",
  preferredChannel: "WhatsApp", preferredLanguage: "Kannada", bloodGroup: "", education: "",
  familyIncome: "", currentAddress: "", permanentAddress: "", ward: "", circle: "", state: "",
  pincode: "", languagesKnown: [], emergencyContactName: "", emergencyPhone: "",
  emergencyRelationship: "", govtIdType: "", govtIdNumber: "",

  // Step 2 — Business Info
  ownBusiness: "No", businessName: "", businessType: "", industrySector: "", subCategory: "",
  businessStage: "Idea", yearEstablished: "", annualTurnover: "", employeeCount: "",
  gstRegistration: "No", gstNumber: "", msmeRegistration: "No", targetCustomer: "B2B",
  primaryProducts: "", geographicMarkets: "", salesChannels: "", sellsOnline: "No",
  businessWebsite: "", bankAccount: "No", onlineSalesChannels: [], biggestChallenges: [],
  supportNeeded: [], takenBusinessLoan: [], seekingFunding: [],

  // Step 3 — Skills & Interests
  fieldOfStudy: "", certifications: "", skillProficiency: "Beginner", yearsExperience: "",
  salesExpertise: "No", digitalMarketingSkill: "No", financialSkills: "No", itTechSkills: "No",
  publicSpeaking: "No", contentCreation: "No", culinarySkills: "No", artCraftSkills: "No",
  professionalSkills: [], interests: [], wantNewSkills: "Yes", willingToMentor: "No",
  openToCollaborate: "Yes", tags: [],

  // Step 4 — Udyami Queens
  homemaker: "No", wantHomeBusiness: "No", relevantExperience: "No", homeBusinessInterests: [],
  hasEquipment: "No", darkStoreInterest: "No", existingCustomers: "No", productSupport: "No",
  comfortableOnline: "No", hasSmartphone: "Yes", trainingAvailability: "", monthlyIncomeTarget: "",
  wantMentor: "No", willingToMentorWomen: "No",

  // Step 5 — Youth Entrepreneur
  finalYearStudent: "No", courseDegree: "", institution: "", graduationYear: "",
  interestedEntrepreneurship: "No", hasBusinessIdea: "No", interestedSectors: "",
  startupCompetitions: "No", financialSupport: "No", businessIdeaDescription: "",
  problemToSolve: "", workWithBusinesses: "No", weeklyHours: "", techSkills: "No", roleModel: "",

  // Step 6 — Digital Presence
  socialPlatforms: [], primaryPlatform: "", dailyUsage: "", followers: "", postFrequency: "",
  whatsappBusiness: "No", fbInstaPage: "No", googleMyBusiness: "No", digitalPayments: "No",
  procuresOnline: "No", createContent: "No", businessSoftware: "No", smartphoneComfort: "",
  wantDigitalMarketingTraining: "No",

  // Step 7 — Community
  howHeardAboutUs: "", referrerName: "", referrerUdyamiId: "", existingAssociation: "No",
  attendsNetworking: "No", knownBusinesses: "", biggestOpportunity: "", infrastructureChallenges: [],
  willingToRefer: "No", canHostMeeting: "No", awareOfGovSchemes: "No", unservedBusinessNeeds: "",
  
  // Legacy fields for backward compatibility
  name: "", phone: "", business: "", sector: "", stage: "", tag: "", taluk: "",
};