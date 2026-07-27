import React, { useMemo, useState } from "react";
import { FileText, Download, Upload, Plus, List, LayoutGrid } from "lucide-react";
import MemberStatsCards from "./MemberStatsCards.jsx";
import MemberFiltersBar from "./MemberFiltersBar.jsx";
import MemberGridView from "./MemberGridView.jsx";
import MemberListView from "./MemberListView.jsx";
import MemberDetailPage from "./MemberDetailPage.jsx";
import Pagination from "../../common/Pagination.jsx";
import MemberFormModal from "../members/MemberFormModal.jsx";
import DeleteMemberModal from "./DeleteMemberModal.jsx";
import { Database } from "lucide-react";
import { useNavigate } from "react-router-dom";
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export const INITIAL_MEMBERS = [
  {
    id: "1",
    name: "Chandru M H",
    initials: "CM",
    udyamiId: "UDY-202607-A3EF8EE5",

    // Step 1: Personal & Contact
    firstName: "Chandru",
    lastName: "M H",
    fathersName: "Manjunath",
    mothersName: "Lakshmi",
    dob: "1990-05-15",
    gender: "Male",
    maritalStatus: "Married",
    primaryMobile: "+919008024594",
    whatsappNumber: "+919008024594",
    email: "chandru@udyamicircle.app",
    preferredChannel: "WhatsApp",
    preferredLanguage: "Kannada",
    bloodGroup: "O+",
    education: "Graduate",
    familyIncome: "₹5 Lakhs - ₹10 Lakhs",
    currentAddress: "#123, 1st Main, Rajajinagar",
    permanentAddress: "#123, 1st Main, Rajajinagar",
    ward: "Ward 10",
    taluk: "Bengaluru North",
    circle: "Rajajinagar",
    state: "Karnataka",
    pincode: "560010",
    languagesKnown: ["Kannada", "English", "Hindi"],
    emergencyContactName: "Lakshmi M",
    emergencyPhone: "+919008024595",
    emergencyRelationship: "Spouse",
    govtIdType: "Aadhaar",
    govtIdNumber: "1234-5678-9012",

    // Step 2: Business Info
    ownBusiness: "Yes",
    business: "Chandru Enterprises",
    businessType: "Sole Proprietorship",
    sector: "Retail",
    subCategory: "Electronics",
    stage: "Growing",
    yearEstablished: "2015",
    annualTurnover: "25 Lakh - 1 Cr",
    employeeCount: "5",
    gstRegistration: "Yes",
    gstNumber: "29ABCDE1234F1Z5",
    msmeRegistration: "Yes",
    targetCustomer: "B2C",
    geographicMarkets: "Local",
    salesChannels: "Physical Store",
    sellsOnline: "Yes",
    businessWebsite: "https://chandruenterprises.in",
    bankAccount: "Yes",
    primaryProducts: "Electronic components, Home appliances, Mobile accessories",
    onlineSalesChannels: ["Amazon", "Own Website"],
    biggestChallenges: ["Finance", "Marketing", "Technology"],
    supportNeeded: ["Marketing", "Technology", "Mentorship"],
    takenBusinessLoan: ["No"],
    seekingFunding: ["Maybe"],

    // Step 3: Skills & Interests
    fieldOfStudy: "Commerce",
    certifications: "Digital Marketing Certification",
    skillProficiency: "Advanced",
    yearsExperience: "8",
    salesExpertise: "Yes",
    digitalMarketingSkill: "Yes",
    financialSkills: "Yes",
    itTechSkills: "Yes",
    publicSpeaking: "No",
    contentCreation: "Yes",
    culinarySkills: "No",
    artCraftSkills: "No",
    professionalSkills: ["Marketing", "Finance", "Sales", "Operations"],
    interests: ["Networking", "Mentorship", "Digital Marketing", "E-commerce"],
    wantNewSkills: "Yes",
    willingToMentorSkills: "Yes",  // ✅ Renamed from willingToMentor
    openToCollaborate: "Yes",
    tags: ["Active", "Prospect", "Udyami Queen"],

    // Step 4: Udyami Queens
    homemaker: "No",
    wantHomeBusiness: "No",
    relevantExperience: "Yes",
    homeBusinessInterests: ["Fashion", "Art & Craft"],
    hasEquipment: "Yes",
    darkStoreInterest: "No",
    existingCustomers: "Yes",
    productSupport: "Yes",
    comfortableOnline: "Yes",
    hasSmartphone: "Yes",
    trainingAvailability: "Flexible",
    monthlyIncomeTarget: "₹25,000 - ₹50,000",
    wantMentor: "Yes",
    willingToMentor: "No",  // ✅ Keeping this for Udyami Queens

    // Step 5: Youth Entrepreneur
    finalYearStudent: "No",
    courseDegree: "MBA",
    institution: "IIM Bangalore",
    graduationYear: "2015",
    interestedEntrepreneurship: "Yes",
    hasBusinessIdea: "Yes",
    interestedSectors: "Technology",
    startupCompetitions: "No",
    financialSupport: "Yes",
    businessIdeaDescription: "E-commerce platform for local artisans",
    problemToSolve: "Connecting rural artisans with urban customers",
    workWithBusinesses: "Yes",
    weeklyHours: "40-50",
    techSkills: "Yes",
    roleModel: "Steve Jobs",

    // Step 6: Digital Presence
    socialPlatforms: ["Facebook", "Instagram", "LinkedIn", "WhatsApp"],
    primaryPlatform: "Instagram",
    dailyUsage: "3-5 hours",
    followers: "500-1000",
    postFrequency: "Daily",
    whatsappBusiness: "Yes",
    fbInstaPage: "Yes",
    googleMyBusiness: "Yes",
    digitalPayments: "Yes",
    procuresOnline: "Yes",
    createContent: "Yes",
    businessSoftware: "Yes",
    smartphoneComfort: "Advanced",
    wantDigitalMarketingTraining: "No",

    // Step 7: Community
    howHeardAboutUs: "Social Media",
    referrerName: "Ramesh K",
    referrerUdyamiId: "UDY-202601-ABC12",
    existingAssociation: "Yes",
    attendsNetworking: "Yes",
    knownBusinesses: "15",
    biggestOpportunity: "Growing demand for electronics in local market",
    infrastructureChallenges: ["Power", "Internet", "Transportation"],
    willingToRefer: "Yes",
    canHostMeeting: "Yes",
    awareOfGovSchemes: "Yes",
    unservedBusinessNeeds: "Lack of skilled technicians for repair services",

    // Backward compatibility fields
    phone: "+919008024594",
    tag: "Prospect",
    plan: "Basic",
    status: "Active",
    createdAt: "2024-01-15",
    updatedAt: "2024-06-20",
  },
  {
    id: "2",
    name: "Rajesh Member",
    initials: "RM",
    udyamiId: "UDY-202606-E283EBE7",

    // Step 1: Personal & Contact
    firstName: "Rajesh",
    lastName: "Member",
    fathersName: "Ravi",
    mothersName: "Sita",
    dob: "1985-08-20",
    gender: "Male",
    maritalStatus: "Married",
    primaryMobile: "+917411109666",
    whatsappNumber: "+917411109666",
    email: "rajesh@udyamicircle.app",
    preferredChannel: "Email",
    preferredLanguage: "English",
    bloodGroup: "A+",
    education: "Postgraduate",
    familyIncome: "₹10 Lakhs - ₹25 Lakhs",
    currentAddress: "#456, 2nd Cross, Jayanagar",
    permanentAddress: "#456, 2nd Cross, Jayanagar",
    ward: "Ward 15",
    taluk: "Bengaluru North",
    circle: "Jayanagar",
    state: "Karnataka",
    pincode: "560011",
    languagesKnown: ["English", "Hindi", "Tamil"],
    emergencyContactName: "Sita R",
    emergencyPhone: "+917411109667",
    emergencyRelationship: "Parent",
    govtIdType: "PAN",
    govtIdNumber: "ABCDE1234F",

    // Step 2: Business Info
    ownBusiness: "Yes",
    business: "Rajesh Consultancy",
    businessType: "Pvt Ltd",
    sector: "Services",
    subCategory: "IT Consulting",
    stage: "Established",
    yearEstablished: "2010",
    annualTurnover: "> 1 Cr",
    employeeCount: "15",
    gstRegistration: "Yes",
    gstNumber: "29XYZ5678F1Z5",
    msmeRegistration: "Yes",
    targetCustomer: "B2B",
    geographicMarkets: "National",
    salesChannels: "Online",
    sellsOnline: "Yes",
    businessWebsite: "https://rajeshconsultancy.in",
    bankAccount: "Yes",
    primaryProducts: "IT consulting, Digital transformation, Cloud services",
    onlineSalesChannels: ["Own Website", "LinkedIn"],
    biggestChallenges: ["Leads", "Manpower", "Legal"],
    supportNeeded: ["Leads", "Finance", "Mentorship"],
    takenBusinessLoan: ["Yes"],
    seekingFunding: ["No"],

    // Step 3: Skills & Interests
    fieldOfStudy: "Computer Science",
    certifications: "AWS Certified, PMP",
    skillProficiency: "Expert",
    yearsExperience: "14",
    salesExpertise: "Yes",
    digitalMarketingSkill: "Yes",
    financialSkills: "Yes",
    itTechSkills: "Yes",
    publicSpeaking: "Yes",
    contentCreation: "No",
    culinarySkills: "No",
    artCraftSkills: "No",
    professionalSkills: ["Technology", "Leadership", "Operations", "Sales"],
    interests: ["Networking", "Mentorship", "Funding", "Training"],
    wantNewSkills: "No",
    willingToMentorSkills: "Yes",  // ✅ Renamed
    openToCollaborate: "Yes",
    tags: ["Active", "Business Owner"],

    // Step 4: Udyami Queens
    homemaker: "No",
    wantHomeBusiness: "No",
    relevantExperience: "No",
    homeBusinessInterests: [],
    hasEquipment: "No",
    darkStoreInterest: "No",
    existingCustomers: "No",
    productSupport: "No",
    comfortableOnline: "No",
    hasSmartphone: "Yes",
    trainingAvailability: "Weekend",
    monthlyIncomeTarget: "Above ₹50,000",
    wantMentor: "Yes",
    willingToMentor: "Yes",  // ✅ Keeping this

    // Step 5: Youth Entrepreneur
    finalYearStudent: "No",
    courseDegree: "B.Tech",
    institution: "IIT Madras",
    graduationYear: "2008",
    interestedEntrepreneurship: "Yes",
    hasBusinessIdea: "Yes",
    interestedSectors: "Technology",
    startupCompetitions: "Yes",
    financialSupport: "No",
    businessIdeaDescription: "AI-powered HR solutions",
    problemToSolve: "Streamlining recruitment processes",
    workWithBusinesses: "Yes",
    weeklyHours: "50-60",
    techSkills: "Yes",
    roleModel: "Elon Musk",

    // Step 6: Digital Presence
    socialPlatforms: ["LinkedIn", "Twitter/X", "YouTube"],
    primaryPlatform: "LinkedIn",
    dailyUsage: "3-5 hours",
    followers: "5000-10000",
    postFrequency: "Weekly",
    whatsappBusiness: "No",
    fbInstaPage: "No",
    googleMyBusiness: "Yes",
    digitalPayments: "Yes",
    procuresOnline: "Yes",
    createContent: "No",
    businessSoftware: "Yes",
    smartphoneComfort: "Advanced",
    wantDigitalMarketingTraining: "No",

    // Step 7: Community
    howHeardAboutUs: "Friend/Relative",
    referrerName: "Priya K",
    referrerUdyamiId: "UDY-202601-XYZ78",
    existingAssociation: "No",
    attendsNetworking: "Yes",
    knownBusinesses: "25",
    biggestOpportunity: "Digital transformation in SME sector",
    infrastructureChallenges: ["Internet", "Skilled Labor"],
    willingToRefer: "Yes",
    canHostMeeting: "Yes",
    awareOfGovSchemes: "Yes",
    unservedBusinessNeeds: "Access to international markets",

    phone: "+917411109666",
    tag: "Prospect",
    plan: "Gold",
    status: "Active",
    createdAt: "2024-02-20",
    updatedAt: "2024-07-01",
  },
    {
    id: "3",
    name: "Chandru M H",
    initials: "CM",
    udyamiId: "UDY-202607-A3EF8EE5",

    // Step 1: Personal & Contact
    firstName: "Chandru",
    lastName: "M H",
    fathersName: "Manjunath",
    mothersName: "Lakshmi",
    dob: "1990-05-15",
    gender: "Male",
    maritalStatus: "Married",
    primaryMobile: "+919008024594",
    whatsappNumber: "+919008024594",
    email: "chandru@udyamicircle.app",
    preferredChannel: "WhatsApp",
    preferredLanguage: "Kannada",
    bloodGroup: "O+",
    education: "Graduate",
    familyIncome: "₹5 Lakhs - ₹10 Lakhs",
    currentAddress: "#123, 1st Main, Rajajinagar",
    permanentAddress: "#123, 1st Main, Rajajinagar",
    ward: "Ward 10",
    taluk: "Bengaluru North",
    circle: "Rajajinagar",
    state: "Karnataka",
    pincode: "560010",
    languagesKnown: ["Kannada", "English", "Hindi"],
    emergencyContactName: "Lakshmi M",
    emergencyPhone: "+919008024595",
    emergencyRelationship: "Spouse",
    govtIdType: "Aadhaar",
    govtIdNumber: "1234-5678-9012",

    // Step 2: Business Info
    ownBusiness: "Yes",
    business: "Chandru Enterprises",
    businessType: "Sole Proprietorship",
    sector: "Retail",
    subCategory: "Electronics",
    stage: "Growing",
    yearEstablished: "2015",
    annualTurnover: "25 Lakh - 1 Cr",
    employeeCount: "5",
    gstRegistration: "Yes",
    gstNumber: "29ABCDE1234F1Z5",
    msmeRegistration: "Yes",
    targetCustomer: "B2C",
    geographicMarkets: "Local",
    salesChannels: "Physical Store",
    sellsOnline: "Yes",
    businessWebsite: "https://chandruenterprises.in",
    bankAccount: "Yes",
    primaryProducts: "Electronic components, Home appliances, Mobile accessories",
    onlineSalesChannels: ["Amazon", "Own Website"],
    biggestChallenges: ["Finance", "Marketing", "Technology"],
    supportNeeded: ["Marketing", "Technology", "Mentorship"],
    takenBusinessLoan: ["No"],
    seekingFunding: ["Maybe"],

    // Step 3: Skills & Interests
    fieldOfStudy: "Commerce",
    certifications: "Digital Marketing Certification",
    skillProficiency: "Advanced",
    yearsExperience: "8",
    salesExpertise: "Yes",
    digitalMarketingSkill: "Yes",
    financialSkills: "Yes",
    itTechSkills: "Yes",
    publicSpeaking: "No",
    contentCreation: "Yes",
    culinarySkills: "No",
    artCraftSkills: "No",
    professionalSkills: ["Marketing", "Finance", "Sales", "Operations"],
    interests: ["Networking", "Mentorship", "Digital Marketing", "E-commerce"],
    wantNewSkills: "Yes",
    willingToMentorSkills: "Yes",  // ✅ Renamed from willingToMentor
    openToCollaborate: "Yes",
    tags: ["Active", "Prospect", "Udyami Queen"],

    // Step 4: Udyami Queens
    homemaker: "No",
    wantHomeBusiness: "No",
    relevantExperience: "Yes",
    homeBusinessInterests: ["Fashion", "Art & Craft"],
    hasEquipment: "Yes",
    darkStoreInterest: "No",
    existingCustomers: "Yes",
    productSupport: "Yes",
    comfortableOnline: "Yes",
    hasSmartphone: "Yes",
    trainingAvailability: "Flexible",
    monthlyIncomeTarget: "₹25,000 - ₹50,000",
    wantMentor: "Yes",
    willingToMentor: "No",  // ✅ Keeping this for Udyami Queens

    // Step 5: Youth Entrepreneur
    finalYearStudent: "No",
    courseDegree: "MBA",
    institution: "IIM Bangalore",
    graduationYear: "2015",
    interestedEntrepreneurship: "Yes",
    hasBusinessIdea: "Yes",
    interestedSectors: "Technology",
    startupCompetitions: "No",
    financialSupport: "Yes",
    businessIdeaDescription: "E-commerce platform for local artisans",
    problemToSolve: "Connecting rural artisans with urban customers",
    workWithBusinesses: "Yes",
    weeklyHours: "40-50",
    techSkills: "Yes",
    roleModel: "Steve Jobs",

    // Step 6: Digital Presence
    socialPlatforms: ["Facebook", "Instagram", "LinkedIn", "WhatsApp"],
    primaryPlatform: "Instagram",
    dailyUsage: "3-5 hours",
    followers: "500-1000",
    postFrequency: "Daily",
    whatsappBusiness: "Yes",
    fbInstaPage: "Yes",
    googleMyBusiness: "Yes",
    digitalPayments: "Yes",
    procuresOnline: "Yes",
    createContent: "Yes",
    businessSoftware: "Yes",
    smartphoneComfort: "Advanced",
    wantDigitalMarketingTraining: "No",

    // Step 7: Community
    howHeardAboutUs: "Social Media",
    referrerName: "Ramesh K",
    referrerUdyamiId: "UDY-202601-ABC12",
    existingAssociation: "Yes",
    attendsNetworking: "Yes",
    knownBusinesses: "15",
    biggestOpportunity: "Growing demand for electronics in local market",
    infrastructureChallenges: ["Power", "Internet", "Transportation"],
    willingToRefer: "Yes",
    canHostMeeting: "Yes",
    awareOfGovSchemes: "Yes",
    unservedBusinessNeeds: "Lack of skilled technicians for repair services",

    // Backward compatibility fields
    phone: "+919008024594",
    tag: "Prospect",
    plan: "Basic",
    status: "Active",
    createdAt: "2024-01-15",
    updatedAt: "2024-06-20",
  },
    {
    id: "4",
    name: "Chandru M H",
    initials: "CM",
    udyamiId: "UDY-202607-A3EF8EE5",

    // Step 1: Personal & Contact
    firstName: "Chandru",
    lastName: "M H",
    fathersName: "Manjunath",
    mothersName: "Lakshmi",
    dob: "1990-05-15",
    gender: "Male",
    maritalStatus: "Married",
    primaryMobile: "+919008024594",
    whatsappNumber: "+919008024594",
    email: "chandru@udyamicircle.app",
    preferredChannel: "WhatsApp",
    preferredLanguage: "Kannada",
    bloodGroup: "O+",
    education: "Graduate",
    familyIncome: "₹5 Lakhs - ₹10 Lakhs",
    currentAddress: "#123, 1st Main, Rajajinagar",
    permanentAddress: "#123, 1st Main, Rajajinagar",
    ward: "Ward 10",
    taluk: "Bengaluru North",
    circle: "Rajajinagar",
    state: "Karnataka",
    pincode: "560010",
    languagesKnown: ["Kannada", "English", "Hindi"],
    emergencyContactName: "Lakshmi M",
    emergencyPhone: "+919008024595",
    emergencyRelationship: "Spouse",
    govtIdType: "Aadhaar",
    govtIdNumber: "1234-5678-9012",

    // Step 2: Business Info
    ownBusiness: "Yes",
    business: "Chandru Enterprises",
    businessType: "Sole Proprietorship",
    sector: "Retail",
    subCategory: "Electronics",
    stage: "Growing",
    yearEstablished: "2015",
    annualTurnover: "25 Lakh - 1 Cr",
    employeeCount: "5",
    gstRegistration: "Yes",
    gstNumber: "29ABCDE1234F1Z5",
    msmeRegistration: "Yes",
    targetCustomer: "B2C",
    geographicMarkets: "Local",
    salesChannels: "Physical Store",
    sellsOnline: "Yes",
    businessWebsite: "https://chandruenterprises.in",
    bankAccount: "Yes",
    primaryProducts: "Electronic components, Home appliances, Mobile accessories",
    onlineSalesChannels: ["Amazon", "Own Website"],
    biggestChallenges: ["Finance", "Marketing", "Technology"],
    supportNeeded: ["Marketing", "Technology", "Mentorship"],
    takenBusinessLoan: ["No"],
    seekingFunding: ["Maybe"],

    // Step 3: Skills & Interests
    fieldOfStudy: "Commerce",
    certifications: "Digital Marketing Certification",
    skillProficiency: "Advanced",
    yearsExperience: "8",
    salesExpertise: "Yes",
    digitalMarketingSkill: "Yes",
    financialSkills: "Yes",
    itTechSkills: "Yes",
    publicSpeaking: "No",
    contentCreation: "Yes",
    culinarySkills: "No",
    artCraftSkills: "No",
    professionalSkills: ["Marketing", "Finance", "Sales", "Operations"],
    interests: ["Networking", "Mentorship", "Digital Marketing", "E-commerce"],
    wantNewSkills: "Yes",
    willingToMentorSkills: "Yes",  // ✅ Renamed from willingToMentor
    openToCollaborate: "Yes",
    tags: ["Active", "Prospect", "Udyami Queen"],

    // Step 4: Udyami Queens
    homemaker: "No",
    wantHomeBusiness: "No",
    relevantExperience: "Yes",
    homeBusinessInterests: ["Fashion", "Art & Craft"],
    hasEquipment: "Yes",
    darkStoreInterest: "No",
    existingCustomers: "Yes",
    productSupport: "Yes",
    comfortableOnline: "Yes",
    hasSmartphone: "Yes",
    trainingAvailability: "Flexible",
    monthlyIncomeTarget: "₹25,000 - ₹50,000",
    wantMentor: "Yes",
    willingToMentor: "No",  // ✅ Keeping this for Udyami Queens

    // Step 5: Youth Entrepreneur
    finalYearStudent: "No",
    courseDegree: "MBA",
    institution: "IIM Bangalore",
    graduationYear: "2015",
    interestedEntrepreneurship: "Yes",
    hasBusinessIdea: "Yes",
    interestedSectors: "Technology",
    startupCompetitions: "No",
    financialSupport: "Yes",
    businessIdeaDescription: "E-commerce platform for local artisans",
    problemToSolve: "Connecting rural artisans with urban customers",
    workWithBusinesses: "Yes",
    weeklyHours: "40-50",
    techSkills: "Yes",
    roleModel: "Steve Jobs",

    // Step 6: Digital Presence
    socialPlatforms: ["Facebook", "Instagram", "LinkedIn", "WhatsApp"],
    primaryPlatform: "Instagram",
    dailyUsage: "3-5 hours",
    followers: "500-1000",
    postFrequency: "Daily",
    whatsappBusiness: "Yes",
    fbInstaPage: "Yes",
    googleMyBusiness: "Yes",
    digitalPayments: "Yes",
    procuresOnline: "Yes",
    createContent: "Yes",
    businessSoftware: "Yes",
    smartphoneComfort: "Advanced",
    wantDigitalMarketingTraining: "No",

    // Step 7: Community
    howHeardAboutUs: "Social Media",
    referrerName: "Ramesh K",
    referrerUdyamiId: "UDY-202601-ABC12",
    existingAssociation: "Yes",
    attendsNetworking: "Yes",
    knownBusinesses: "15",
    biggestOpportunity: "Growing demand for electronics in local market",
    infrastructureChallenges: ["Power", "Internet", "Transportation"],
    willingToRefer: "Yes",
    canHostMeeting: "Yes",
    awareOfGovSchemes: "Yes",
    unservedBusinessNeeds: "Lack of skilled technicians for repair services",

    // Backward compatibility fields
    phone: "+919008024594",
    tag: "Prospect",
    plan: "Basic",
    status: "Active",
    createdAt: "2024-01-15",
    updatedAt: "2024-06-20",
  },
    {
    id: "5",
    name: "Chandru M H",
    initials: "CM",
    udyamiId: "UDY-202607-A3EF8EE5",

    // Step 1: Personal & Contact
    firstName: "Chandru",
    lastName: "M H",
    fathersName: "Manjunath",
    mothersName: "Lakshmi",
    dob: "1990-05-15",
    gender: "Male",
    maritalStatus: "Married",
    primaryMobile: "+919008024594",
    whatsappNumber: "+919008024594",
    email: "chandru@udyamicircle.app",
    preferredChannel: "WhatsApp",
    preferredLanguage: "Kannada",
    bloodGroup: "O+",
    education: "Graduate",
    familyIncome: "₹5 Lakhs - ₹10 Lakhs",
    currentAddress: "#123, 1st Main, Rajajinagar",
    permanentAddress: "#123, 1st Main, Rajajinagar",
    ward: "Ward 10",
    taluk: "Bengaluru North",
    circle: "Rajajinagar",
    state: "Karnataka",
    pincode: "560010",
    languagesKnown: ["Kannada", "English", "Hindi"],
    emergencyContactName: "Lakshmi M",
    emergencyPhone: "+919008024595",
    emergencyRelationship: "Spouse",
    govtIdType: "Aadhaar",
    govtIdNumber: "1234-5678-9012",

    // Step 2: Business Info
    ownBusiness: "Yes",
    business: "Chandru Enterprises",
    businessType: "Sole Proprietorship",
    sector: "Retail",
    subCategory: "Electronics",
    stage: "Growing",
    yearEstablished: "2015",
    annualTurnover: "25 Lakh - 1 Cr",
    employeeCount: "5",
    gstRegistration: "Yes",
    gstNumber: "29ABCDE1234F1Z5",
    msmeRegistration: "Yes",
    targetCustomer: "B2C",
    geographicMarkets: "Local",
    salesChannels: "Physical Store",
    sellsOnline: "Yes",
    businessWebsite: "https://chandruenterprises.in",
    bankAccount: "Yes",
    primaryProducts: "Electronic components, Home appliances, Mobile accessories",
    onlineSalesChannels: ["Amazon", "Own Website"],
    biggestChallenges: ["Finance", "Marketing", "Technology"],
    supportNeeded: ["Marketing", "Technology", "Mentorship"],
    takenBusinessLoan: ["No"],
    seekingFunding: ["Maybe"],

    // Step 3: Skills & Interests
    fieldOfStudy: "Commerce",
    certifications: "Digital Marketing Certification",
    skillProficiency: "Advanced",
    yearsExperience: "8",
    salesExpertise: "Yes",
    digitalMarketingSkill: "Yes",
    financialSkills: "Yes",
    itTechSkills: "Yes",
    publicSpeaking: "No",
    contentCreation: "Yes",
    culinarySkills: "No",
    artCraftSkills: "No",
    professionalSkills: ["Marketing", "Finance", "Sales", "Operations"],
    interests: ["Networking", "Mentorship", "Digital Marketing", "E-commerce"],
    wantNewSkills: "Yes",
    willingToMentorSkills: "Yes",  // ✅ Renamed from willingToMentor
    openToCollaborate: "Yes",
    tags: ["Active", "Prospect", "Udyami Queen"],

    // Step 4: Udyami Queens
    homemaker: "No",
    wantHomeBusiness: "No",
    relevantExperience: "Yes",
    homeBusinessInterests: ["Fashion", "Art & Craft"],
    hasEquipment: "Yes",
    darkStoreInterest: "No",
    existingCustomers: "Yes",
    productSupport: "Yes",
    comfortableOnline: "Yes",
    hasSmartphone: "Yes",
    trainingAvailability: "Flexible",
    monthlyIncomeTarget: "₹25,000 - ₹50,000",
    wantMentor: "Yes",
    willingToMentor: "No",  // ✅ Keeping this for Udyami Queens

    // Step 5: Youth Entrepreneur
    finalYearStudent: "No",
    courseDegree: "MBA",
    institution: "IIM Bangalore",
    graduationYear: "2015",
    interestedEntrepreneurship: "Yes",
    hasBusinessIdea: "Yes",
    interestedSectors: "Technology",
    startupCompetitions: "No",
    financialSupport: "Yes",
    businessIdeaDescription: "E-commerce platform for local artisans",
    problemToSolve: "Connecting rural artisans with urban customers",
    workWithBusinesses: "Yes",
    weeklyHours: "40-50",
    techSkills: "Yes",
    roleModel: "Steve Jobs",

    // Step 6: Digital Presence
    socialPlatforms: ["Facebook", "Instagram", "LinkedIn", "WhatsApp"],
    primaryPlatform: "Instagram",
    dailyUsage: "3-5 hours",
    followers: "500-1000",
    postFrequency: "Daily",
    whatsappBusiness: "Yes",
    fbInstaPage: "Yes",
    googleMyBusiness: "Yes",
    digitalPayments: "Yes",
    procuresOnline: "Yes",
    createContent: "Yes",
    businessSoftware: "Yes",
    smartphoneComfort: "Advanced",
    wantDigitalMarketingTraining: "No",

    // Step 7: Community
    howHeardAboutUs: "Social Media",
    referrerName: "Ramesh K",
    referrerUdyamiId: "UDY-202601-ABC12",
    existingAssociation: "Yes",
    attendsNetworking: "Yes",
    knownBusinesses: "15",
    biggestOpportunity: "Growing demand for electronics in local market",
    infrastructureChallenges: ["Power", "Internet", "Transportation"],
    willingToRefer: "Yes",
    canHostMeeting: "Yes",
    awareOfGovSchemes: "Yes",
    unservedBusinessNeeds: "Lack of skilled technicians for repair services",

    // Backward compatibility fields
    phone: "+919008024594",
    tag: "Prospect",
    plan: "Basic",
    status: "Active",
    createdAt: "2024-01-15",
    updatedAt: "2024-06-20",
  },
    {
    id: "6",
    name: "Chandru M H",
    initials: "CM",
    udyamiId: "UDY-202607-A3EF8EE5",

    // Step 1: Personal & Contact
    firstName: "Chandru",
    lastName: "M H",
    fathersName: "Manjunath",
    mothersName: "Lakshmi",
    dob: "1990-05-15",
    gender: "Male",
    maritalStatus: "Married",
    primaryMobile: "+919008024594",
    whatsappNumber: "+919008024594",
    email: "chandru@udyamicircle.app",
    preferredChannel: "WhatsApp",
    preferredLanguage: "Kannada",
    bloodGroup: "O+",
    education: "Graduate",
    familyIncome: "₹5 Lakhs - ₹10 Lakhs",
    currentAddress: "#123, 1st Main, Rajajinagar",
    permanentAddress: "#123, 1st Main, Rajajinagar",
    ward: "Ward 10",
    taluk: "Bengaluru North",
    circle: "Rajajinagar",
    state: "Karnataka",
    pincode: "560010",
    languagesKnown: ["Kannada", "English", "Hindi"],
    emergencyContactName: "Lakshmi M",
    emergencyPhone: "+919008024595",
    emergencyRelationship: "Spouse",
    govtIdType: "Aadhaar",
    govtIdNumber: "1234-5678-9012",

    // Step 2: Business Info
    ownBusiness: "Yes",
    business: "Chandru Enterprises",
    businessType: "Sole Proprietorship",
    sector: "Retail",
    subCategory: "Electronics",
    stage: "Growing",
    yearEstablished: "2015",
    annualTurnover: "25 Lakh - 1 Cr",
    employeeCount: "5",
    gstRegistration: "Yes",
    gstNumber: "29ABCDE1234F1Z5",
    msmeRegistration: "Yes",
    targetCustomer: "B2C",
    geographicMarkets: "Local",
    salesChannels: "Physical Store",
    sellsOnline: "Yes",
    businessWebsite: "https://chandruenterprises.in",
    bankAccount: "Yes",
    primaryProducts: "Electronic components, Home appliances, Mobile accessories",
    onlineSalesChannels: ["Amazon", "Own Website"],
    biggestChallenges: ["Finance", "Marketing", "Technology"],
    supportNeeded: ["Marketing", "Technology", "Mentorship"],
    takenBusinessLoan: ["No"],
    seekingFunding: ["Maybe"],

    // Step 3: Skills & Interests
    fieldOfStudy: "Commerce",
    certifications: "Digital Marketing Certification",
    skillProficiency: "Advanced",
    yearsExperience: "8",
    salesExpertise: "Yes",
    digitalMarketingSkill: "Yes",
    financialSkills: "Yes",
    itTechSkills: "Yes",
    publicSpeaking: "No",
    contentCreation: "Yes",
    culinarySkills: "No",
    artCraftSkills: "No",
    professionalSkills: ["Marketing", "Finance", "Sales", "Operations"],
    interests: ["Networking", "Mentorship", "Digital Marketing", "E-commerce"],
    wantNewSkills: "Yes",
    willingToMentorSkills: "Yes",  // ✅ Renamed from willingToMentor
    openToCollaborate: "Yes",
    tags: ["Active", "Prospect", "Udyami Queen"],

    // Step 4: Udyami Queens
    homemaker: "No",
    wantHomeBusiness: "No",
    relevantExperience: "Yes",
    homeBusinessInterests: ["Fashion", "Art & Craft"],
    hasEquipment: "Yes",
    darkStoreInterest: "No",
    existingCustomers: "Yes",
    productSupport: "Yes",
    comfortableOnline: "Yes",
    hasSmartphone: "Yes",
    trainingAvailability: "Flexible",
    monthlyIncomeTarget: "₹25,000 - ₹50,000",
    wantMentor: "Yes",
    willingToMentor: "No",  // ✅ Keeping this for Udyami Queens

    // Step 5: Youth Entrepreneur
    finalYearStudent: "No",
    courseDegree: "MBA",
    institution: "IIM Bangalore",
    graduationYear: "2015",
    interestedEntrepreneurship: "Yes",
    hasBusinessIdea: "Yes",
    interestedSectors: "Technology",
    startupCompetitions: "No",
    financialSupport: "Yes",
    businessIdeaDescription: "E-commerce platform for local artisans",
    problemToSolve: "Connecting rural artisans with urban customers",
    workWithBusinesses: "Yes",
    weeklyHours: "40-50",
    techSkills: "Yes",
    roleModel: "Steve Jobs",

    // Step 6: Digital Presence
    socialPlatforms: ["Facebook", "Instagram", "LinkedIn", "WhatsApp"],
    primaryPlatform: "Instagram",
    dailyUsage: "3-5 hours",
    followers: "500-1000",
    postFrequency: "Daily",
    whatsappBusiness: "Yes",
    fbInstaPage: "Yes",
    googleMyBusiness: "Yes",
    digitalPayments: "Yes",
    procuresOnline: "Yes",
    createContent: "Yes",
    businessSoftware: "Yes",
    smartphoneComfort: "Advanced",
    wantDigitalMarketingTraining: "No",

    // Step 7: Community
    howHeardAboutUs: "Social Media",
    referrerName: "Ramesh K",
    referrerUdyamiId: "UDY-202601-ABC12",
    existingAssociation: "Yes",
    attendsNetworking: "Yes",
    knownBusinesses: "15",
    biggestOpportunity: "Growing demand for electronics in local market",
    infrastructureChallenges: ["Power", "Internet", "Transportation"],
    willingToRefer: "Yes",
    canHostMeeting: "Yes",
    awareOfGovSchemes: "Yes",
    unservedBusinessNeeds: "Lack of skilled technicians for repair services",

    // Backward compatibility fields
    phone: "+919008024594",
    tag: "Prospect",
    plan: "Basic",
    status: "Active",
    createdAt: "2024-01-15",
    updatedAt: "2024-06-20",
  },
    {
    id: "7",
    name: "Chandru M H",
    initials: "CM",
    udyamiId: "UDY-202607-A3EF8EE5",

    // Step 1: Personal & Contact
    firstName: "Chandru",
    lastName: "M H",
    fathersName: "Manjunath",
    mothersName: "Lakshmi",
    dob: "1990-05-15",
    gender: "Male",
    maritalStatus: "Married",
    primaryMobile: "+919008024594",
    whatsappNumber: "+919008024594",
    email: "chandru@udyamicircle.app",
    preferredChannel: "WhatsApp",
    preferredLanguage: "Kannada",
    bloodGroup: "O+",
    education: "Graduate",
    familyIncome: "₹5 Lakhs - ₹10 Lakhs",
    currentAddress: "#123, 1st Main, Rajajinagar",
    permanentAddress: "#123, 1st Main, Rajajinagar",
    ward: "Ward 10",
    taluk: "Bengaluru North",
    circle: "Rajajinagar",
    state: "Karnataka",
    pincode: "560010",
    languagesKnown: ["Kannada", "English", "Hindi"],
    emergencyContactName: "Lakshmi M",
    emergencyPhone: "+919008024595",
    emergencyRelationship: "Spouse",
    govtIdType: "Aadhaar",
    govtIdNumber: "1234-5678-9012",

    // Step 2: Business Info
    ownBusiness: "Yes",
    business: "Chandru Enterprises",
    businessType: "Sole Proprietorship",
    sector: "Retail",
    subCategory: "Electronics",
    stage: "Growing",
    yearEstablished: "2015",
    annualTurnover: "25 Lakh - 1 Cr",
    employeeCount: "5",
    gstRegistration: "Yes",
    gstNumber: "29ABCDE1234F1Z5",
    msmeRegistration: "Yes",
    targetCustomer: "B2C",
    geographicMarkets: "Local",
    salesChannels: "Physical Store",
    sellsOnline: "Yes",
    businessWebsite: "https://chandruenterprises.in",
    bankAccount: "Yes",
    primaryProducts: "Electronic components, Home appliances, Mobile accessories",
    onlineSalesChannels: ["Amazon", "Own Website"],
    biggestChallenges: ["Finance", "Marketing", "Technology"],
    supportNeeded: ["Marketing", "Technology", "Mentorship"],
    takenBusinessLoan: ["No"],
    seekingFunding: ["Maybe"],

    // Step 3: Skills & Interests
    fieldOfStudy: "Commerce",
    certifications: "Digital Marketing Certification",
    skillProficiency: "Advanced",
    yearsExperience: "8",
    salesExpertise: "Yes",
    digitalMarketingSkill: "Yes",
    financialSkills: "Yes",
    itTechSkills: "Yes",
    publicSpeaking: "No",
    contentCreation: "Yes",
    culinarySkills: "No",
    artCraftSkills: "No",
    professionalSkills: ["Marketing", "Finance", "Sales", "Operations"],
    interests: ["Networking", "Mentorship", "Digital Marketing", "E-commerce"],
    wantNewSkills: "Yes",
    willingToMentorSkills: "Yes",  // ✅ Renamed from willingToMentor
    openToCollaborate: "Yes",
    tags: ["Active", "Prospect", "Udyami Queen"],

    // Step 4: Udyami Queens
    homemaker: "No",
    wantHomeBusiness: "No",
    relevantExperience: "Yes",
    homeBusinessInterests: ["Fashion", "Art & Craft"],
    hasEquipment: "Yes",
    darkStoreInterest: "No",
    existingCustomers: "Yes",
    productSupport: "Yes",
    comfortableOnline: "Yes",
    hasSmartphone: "Yes",
    trainingAvailability: "Flexible",
    monthlyIncomeTarget: "₹25,000 - ₹50,000",
    wantMentor: "Yes",
    willingToMentor: "No",  // ✅ Keeping this for Udyami Queens

    // Step 5: Youth Entrepreneur
    finalYearStudent: "No",
    courseDegree: "MBA",
    institution: "IIM Bangalore",
    graduationYear: "2015",
    interestedEntrepreneurship: "Yes",
    hasBusinessIdea: "Yes",
    interestedSectors: "Technology",
    startupCompetitions: "No",
    financialSupport: "Yes",
    businessIdeaDescription: "E-commerce platform for local artisans",
    problemToSolve: "Connecting rural artisans with urban customers",
    workWithBusinesses: "Yes",
    weeklyHours: "40-50",
    techSkills: "Yes",
    roleModel: "Steve Jobs",

    // Step 6: Digital Presence
    socialPlatforms: ["Facebook", "Instagram", "LinkedIn", "WhatsApp"],
    primaryPlatform: "Instagram",
    dailyUsage: "3-5 hours",
    followers: "500-1000",
    postFrequency: "Daily",
    whatsappBusiness: "Yes",
    fbInstaPage: "Yes",
    googleMyBusiness: "Yes",
    digitalPayments: "Yes",
    procuresOnline: "Yes",
    createContent: "Yes",
    businessSoftware: "Yes",
    smartphoneComfort: "Advanced",
    wantDigitalMarketingTraining: "No",

    // Step 7: Community
    howHeardAboutUs: "Social Media",
    referrerName: "Ramesh K",
    referrerUdyamiId: "UDY-202601-ABC12",
    existingAssociation: "Yes",
    attendsNetworking: "Yes",
    knownBusinesses: "15",
    biggestOpportunity: "Growing demand for electronics in local market",
    infrastructureChallenges: ["Power", "Internet", "Transportation"],
    willingToRefer: "Yes",
    canHostMeeting: "Yes",
    awareOfGovSchemes: "Yes",
    unservedBusinessNeeds: "Lack of skilled technicians for repair services",

    // Backward compatibility fields
    phone: "+919008024594",
    tag: "Prospect",
    plan: "Basic",
    status: "Active",
    createdAt: "2024-01-15",
    updatedAt: "2024-06-20",
  },
    {
    id: "8",
    name: "Chandru M H",
    initials: "CM",
    udyamiId: "UDY-202607-A3EF8EE5",

    // Step 1: Personal & Contact
    firstName: "Chandru",
    lastName: "M H",
    fathersName: "Manjunath",
    mothersName: "Lakshmi",
    dob: "1990-05-15",
    gender: "Male",
    maritalStatus: "Married",
    primaryMobile: "+919008024594",
    whatsappNumber: "+919008024594",
    email: "chandru@udyamicircle.app",
    preferredChannel: "WhatsApp",
    preferredLanguage: "Kannada",
    bloodGroup: "O+",
    education: "Graduate",
    familyIncome: "₹5 Lakhs - ₹10 Lakhs",
    currentAddress: "#123, 1st Main, Rajajinagar",
    permanentAddress: "#123, 1st Main, Rajajinagar",
    ward: "Ward 10",
    taluk: "Bengaluru North",
    circle: "Rajajinagar",
    state: "Karnataka",
    pincode: "560010",
    languagesKnown: ["Kannada", "English", "Hindi"],
    emergencyContactName: "Lakshmi M",
    emergencyPhone: "+919008024595",
    emergencyRelationship: "Spouse",
    govtIdType: "Aadhaar",
    govtIdNumber: "1234-5678-9012",

    // Step 2: Business Info
    ownBusiness: "Yes",
    business: "Chandru Enterprises",
    businessType: "Sole Proprietorship",
    sector: "Retail",
    subCategory: "Electronics",
    stage: "Growing",
    yearEstablished: "2015",
    annualTurnover: "25 Lakh - 1 Cr",
    employeeCount: "5",
    gstRegistration: "Yes",
    gstNumber: "29ABCDE1234F1Z5",
    msmeRegistration: "Yes",
    targetCustomer: "B2C",
    geographicMarkets: "Local",
    salesChannels: "Physical Store",
    sellsOnline: "Yes",
    businessWebsite: "https://chandruenterprises.in",
    bankAccount: "Yes",
    primaryProducts: "Electronic components, Home appliances, Mobile accessories",
    onlineSalesChannels: ["Amazon", "Own Website"],
    biggestChallenges: ["Finance", "Marketing", "Technology"],
    supportNeeded: ["Marketing", "Technology", "Mentorship"],
    takenBusinessLoan: ["No"],
    seekingFunding: ["Maybe"],

    // Step 3: Skills & Interests
    fieldOfStudy: "Commerce",
    certifications: "Digital Marketing Certification",
    skillProficiency: "Advanced",
    yearsExperience: "8",
    salesExpertise: "Yes",
    digitalMarketingSkill: "Yes",
    financialSkills: "Yes",
    itTechSkills: "Yes",
    publicSpeaking: "No",
    contentCreation: "Yes",
    culinarySkills: "No",
    artCraftSkills: "No",
    professionalSkills: ["Marketing", "Finance", "Sales", "Operations"],
    interests: ["Networking", "Mentorship", "Digital Marketing", "E-commerce"],
    wantNewSkills: "Yes",
    willingToMentorSkills: "Yes",  // ✅ Renamed from willingToMentor
    openToCollaborate: "Yes",
    tags: ["Active", "Prospect", "Udyami Queen"],

    // Step 4: Udyami Queens
    homemaker: "No",
    wantHomeBusiness: "No",
    relevantExperience: "Yes",
    homeBusinessInterests: ["Fashion", "Art & Craft"],
    hasEquipment: "Yes",
    darkStoreInterest: "No",
    existingCustomers: "Yes",
    productSupport: "Yes",
    comfortableOnline: "Yes",
    hasSmartphone: "Yes",
    trainingAvailability: "Flexible",
    monthlyIncomeTarget: "₹25,000 - ₹50,000",
    wantMentor: "Yes",
    willingToMentor: "No",  // ✅ Keeping this for Udyami Queens

    // Step 5: Youth Entrepreneur
    finalYearStudent: "No",
    courseDegree: "MBA",
    institution: "IIM Bangalore",
    graduationYear: "2015",
    interestedEntrepreneurship: "Yes",
    hasBusinessIdea: "Yes",
    interestedSectors: "Technology",
    startupCompetitions: "No",
    financialSupport: "Yes",
    businessIdeaDescription: "E-commerce platform for local artisans",
    problemToSolve: "Connecting rural artisans with urban customers",
    workWithBusinesses: "Yes",
    weeklyHours: "40-50",
    techSkills: "Yes",
    roleModel: "Steve Jobs",

    // Step 6: Digital Presence
    socialPlatforms: ["Facebook", "Instagram", "LinkedIn", "WhatsApp"],
    primaryPlatform: "Instagram",
    dailyUsage: "3-5 hours",
    followers: "500-1000",
    postFrequency: "Daily",
    whatsappBusiness: "Yes",
    fbInstaPage: "Yes",
    googleMyBusiness: "Yes",
    digitalPayments: "Yes",
    procuresOnline: "Yes",
    createContent: "Yes",
    businessSoftware: "Yes",
    smartphoneComfort: "Advanced",
    wantDigitalMarketingTraining: "No",

    // Step 7: Community
    howHeardAboutUs: "Social Media",
    referrerName: "Ramesh K",
    referrerUdyamiId: "UDY-202601-ABC12",
    existingAssociation: "Yes",
    attendsNetworking: "Yes",
    knownBusinesses: "15",
    biggestOpportunity: "Growing demand for electronics in local market",
    infrastructureChallenges: ["Power", "Internet", "Transportation"],
    willingToRefer: "Yes",
    canHostMeeting: "Yes",
    awareOfGovSchemes: "Yes",
    unservedBusinessNeeds: "Lack of skilled technicians for repair services",

    // Backward compatibility fields
    phone: "+919008024594",
    tag: "Prospect",
    plan: "Basic",
    status: "Active",
    createdAt: "2024-01-15",
    updatedAt: "2024-06-20",
  },
    {
    id: "9",
    name: "Chandru M H",
    initials: "CM",
    udyamiId: "UDY-202607-A3EF8EE5",

    // Step 1: Personal & Contact
    firstName: "Chandru",
    lastName: "M H",
    fathersName: "Manjunath",
    mothersName: "Lakshmi",
    dob: "1990-05-15",
    gender: "Male",
    maritalStatus: "Married",
    primaryMobile: "+919008024594",
    whatsappNumber: "+919008024594",
    email: "chandru@udyamicircle.app",
    preferredChannel: "WhatsApp",
    preferredLanguage: "Kannada",
    bloodGroup: "O+",
    education: "Graduate",
    familyIncome: "₹5 Lakhs - ₹10 Lakhs",
    currentAddress: "#123, 1st Main, Rajajinagar",
    permanentAddress: "#123, 1st Main, Rajajinagar",
    ward: "Ward 10",
    taluk: "Bengaluru North",
    circle: "Rajajinagar",
    state: "Karnataka",
    pincode: "560010",
    languagesKnown: ["Kannada", "English", "Hindi"],
    emergencyContactName: "Lakshmi M",
    emergencyPhone: "+919008024595",
    emergencyRelationship: "Spouse",
    govtIdType: "Aadhaar",
    govtIdNumber: "1234-5678-9012",

    // Step 2: Business Info
    ownBusiness: "Yes",
    business: "Chandru Enterprises",
    businessType: "Sole Proprietorship",
    sector: "Retail",
    subCategory: "Electronics",
    stage: "Growing",
    yearEstablished: "2015",
    annualTurnover: "25 Lakh - 1 Cr",
    employeeCount: "5",
    gstRegistration: "Yes",
    gstNumber: "29ABCDE1234F1Z5",
    msmeRegistration: "Yes",
    targetCustomer: "B2C",
    geographicMarkets: "Local",
    salesChannels: "Physical Store",
    sellsOnline: "Yes",
    businessWebsite: "https://chandruenterprises.in",
    bankAccount: "Yes",
    primaryProducts: "Electronic components, Home appliances, Mobile accessories",
    onlineSalesChannels: ["Amazon", "Own Website"],
    biggestChallenges: ["Finance", "Marketing", "Technology"],
    supportNeeded: ["Marketing", "Technology", "Mentorship"],
    takenBusinessLoan: ["No"],
    seekingFunding: ["Maybe"],

    // Step 3: Skills & Interests
    fieldOfStudy: "Commerce",
    certifications: "Digital Marketing Certification",
    skillProficiency: "Advanced",
    yearsExperience: "8",
    salesExpertise: "Yes",
    digitalMarketingSkill: "Yes",
    financialSkills: "Yes",
    itTechSkills: "Yes",
    publicSpeaking: "No",
    contentCreation: "Yes",
    culinarySkills: "No",
    artCraftSkills: "No",
    professionalSkills: ["Marketing", "Finance", "Sales", "Operations"],
    interests: ["Networking", "Mentorship", "Digital Marketing", "E-commerce"],
    wantNewSkills: "Yes",
    willingToMentorSkills: "Yes",  // ✅ Renamed from willingToMentor
    openToCollaborate: "Yes",
    tags: ["Active", "Prospect", "Udyami Queen"],

    // Step 4: Udyami Queens
    homemaker: "No",
    wantHomeBusiness: "No",
    relevantExperience: "Yes",
    homeBusinessInterests: ["Fashion", "Art & Craft"],
    hasEquipment: "Yes",
    darkStoreInterest: "No",
    existingCustomers: "Yes",
    productSupport: "Yes",
    comfortableOnline: "Yes",
    hasSmartphone: "Yes",
    trainingAvailability: "Flexible",
    monthlyIncomeTarget: "₹25,000 - ₹50,000",
    wantMentor: "Yes",
    willingToMentor: "No",  // ✅ Keeping this for Udyami Queens

    // Step 5: Youth Entrepreneur
    finalYearStudent: "No",
    courseDegree: "MBA",
    institution: "IIM Bangalore",
    graduationYear: "2015",
    interestedEntrepreneurship: "Yes",
    hasBusinessIdea: "Yes",
    interestedSectors: "Technology",
    startupCompetitions: "No",
    financialSupport: "Yes",
    businessIdeaDescription: "E-commerce platform for local artisans",
    problemToSolve: "Connecting rural artisans with urban customers",
    workWithBusinesses: "Yes",
    weeklyHours: "40-50",
    techSkills: "Yes",
    roleModel: "Steve Jobs",

    // Step 6: Digital Presence
    socialPlatforms: ["Facebook", "Instagram", "LinkedIn", "WhatsApp"],
    primaryPlatform: "Instagram",
    dailyUsage: "3-5 hours",
    followers: "500-1000",
    postFrequency: "Daily",
    whatsappBusiness: "Yes",
    fbInstaPage: "Yes",
    googleMyBusiness: "Yes",
    digitalPayments: "Yes",
    procuresOnline: "Yes",
    createContent: "Yes",
    businessSoftware: "Yes",
    smartphoneComfort: "Advanced",
    wantDigitalMarketingTraining: "No",

    // Step 7: Community
    howHeardAboutUs: "Social Media",
    referrerName: "Ramesh K",
    referrerUdyamiId: "UDY-202601-ABC12",
    existingAssociation: "Yes",
    attendsNetworking: "Yes",
    knownBusinesses: "15",
    biggestOpportunity: "Growing demand for electronics in local market",
    infrastructureChallenges: ["Power", "Internet", "Transportation"],
    willingToRefer: "Yes",
    canHostMeeting: "Yes",
    awareOfGovSchemes: "Yes",
    unservedBusinessNeeds: "Lack of skilled technicians for repair services",

    // Backward compatibility fields
    phone: "+919008024594",
    tag: "Prospect",
    plan: "Basic",
    status: "Active",
    createdAt: "2024-01-15",
    updatedAt: "2024-06-20",
  },
    {
    id: "10",
    name: "Chandru M H",
    initials: "CM",
    udyamiId: "UDY-202607-A3EF8EE5",

    // Step 1: Personal & Contact
    firstName: "Chandru",
    lastName: "M H",
    fathersName: "Manjunath",
    mothersName: "Lakshmi",
    dob: "1990-05-15",
    gender: "Male",
    maritalStatus: "Married",
    primaryMobile: "+919008024594",
    whatsappNumber: "+919008024594",
    email: "chandru@udyamicircle.app",
    preferredChannel: "WhatsApp",
    preferredLanguage: "Kannada",
    bloodGroup: "O+",
    education: "Graduate",
    familyIncome: "₹5 Lakhs - ₹10 Lakhs",
    currentAddress: "#123, 1st Main, Rajajinagar",
    permanentAddress: "#123, 1st Main, Rajajinagar",
    ward: "Ward 10",
    taluk: "Bengaluru North",
    circle: "Rajajinagar",
    state: "Karnataka",
    pincode: "560010",
    languagesKnown: ["Kannada", "English", "Hindi"],
    emergencyContactName: "Lakshmi M",
    emergencyPhone: "+919008024595",
    emergencyRelationship: "Spouse",
    govtIdType: "Aadhaar",
    govtIdNumber: "1234-5678-9012",

    // Step 2: Business Info
    ownBusiness: "Yes",
    business: "Chandru Enterprises",
    businessType: "Sole Proprietorship",
    sector: "Retail",
    subCategory: "Electronics",
    stage: "Growing",
    yearEstablished: "2015",
    annualTurnover: "25 Lakh - 1 Cr",
    employeeCount: "5",
    gstRegistration: "Yes",
    gstNumber: "29ABCDE1234F1Z5",
    msmeRegistration: "Yes",
    targetCustomer: "B2C",
    geographicMarkets: "Local",
    salesChannels: "Physical Store",
    sellsOnline: "Yes",
    businessWebsite: "https://chandruenterprises.in",
    bankAccount: "Yes",
    primaryProducts: "Electronic components, Home appliances, Mobile accessories",
    onlineSalesChannels: ["Amazon", "Own Website"],
    biggestChallenges: ["Finance", "Marketing", "Technology"],
    supportNeeded: ["Marketing", "Technology", "Mentorship"],
    takenBusinessLoan: ["No"],
    seekingFunding: ["Maybe"],

    // Step 3: Skills & Interests
    fieldOfStudy: "Commerce",
    certifications: "Digital Marketing Certification",
    skillProficiency: "Advanced",
    yearsExperience: "8",
    salesExpertise: "Yes",
    digitalMarketingSkill: "Yes",
    financialSkills: "Yes",
    itTechSkills: "Yes",
    publicSpeaking: "No",
    contentCreation: "Yes",
    culinarySkills: "No",
    artCraftSkills: "No",
    professionalSkills: ["Marketing", "Finance", "Sales", "Operations"],
    interests: ["Networking", "Mentorship", "Digital Marketing", "E-commerce"],
    wantNewSkills: "Yes",
    willingToMentorSkills: "Yes",  // ✅ Renamed from willingToMentor
    openToCollaborate: "Yes",
    tags: ["Active", "Prospect", "Udyami Queen"],

    // Step 4: Udyami Queens
    homemaker: "No",
    wantHomeBusiness: "No",
    relevantExperience: "Yes",
    homeBusinessInterests: ["Fashion", "Art & Craft"],
    hasEquipment: "Yes",
    darkStoreInterest: "No",
    existingCustomers: "Yes",
    productSupport: "Yes",
    comfortableOnline: "Yes",
    hasSmartphone: "Yes",
    trainingAvailability: "Flexible",
    monthlyIncomeTarget: "₹25,000 - ₹50,000",
    wantMentor: "Yes",
    willingToMentor: "No",  // ✅ Keeping this for Udyami Queens

    // Step 5: Youth Entrepreneur
    finalYearStudent: "No",
    courseDegree: "MBA",
    institution: "IIM Bangalore",
    graduationYear: "2015",
    interestedEntrepreneurship: "Yes",
    hasBusinessIdea: "Yes",
    interestedSectors: "Technology",
    startupCompetitions: "No",
    financialSupport: "Yes",
    businessIdeaDescription: "E-commerce platform for local artisans",
    problemToSolve: "Connecting rural artisans with urban customers",
    workWithBusinesses: "Yes",
    weeklyHours: "40-50",
    techSkills: "Yes",
    roleModel: "Steve Jobs",

    // Step 6: Digital Presence
    socialPlatforms: ["Facebook", "Instagram", "LinkedIn", "WhatsApp"],
    primaryPlatform: "Instagram",
    dailyUsage: "3-5 hours",
    followers: "500-1000",
    postFrequency: "Daily",
    whatsappBusiness: "Yes",
    fbInstaPage: "Yes",
    googleMyBusiness: "Yes",
    digitalPayments: "Yes",
    procuresOnline: "Yes",
    createContent: "Yes",
    businessSoftware: "Yes",
    smartphoneComfort: "Advanced",
    wantDigitalMarketingTraining: "No",

    // Step 7: Community
    howHeardAboutUs: "Social Media",
    referrerName: "Ramesh K",
    referrerUdyamiId: "UDY-202601-ABC12",
    existingAssociation: "Yes",
    attendsNetworking: "Yes",
    knownBusinesses: "15",
    biggestOpportunity: "Growing demand for electronics in local market",
    infrastructureChallenges: ["Power", "Internet", "Transportation"],
    willingToRefer: "Yes",
    canHostMeeting: "Yes",
    awareOfGovSchemes: "Yes",
    unservedBusinessNeeds: "Lack of skilled technicians for repair services",

    // Backward compatibility fields
    phone: "+919008024594",
    tag: "Prospect",
    plan: "Basic",
    status: "Active",
    createdAt: "2024-01-15",
    updatedAt: "2024-06-20",
  },
    {
    id: "11",
    name: "Chandru M H",
    initials: "CM",
    udyamiId: "UDY-202607-A3EF8EE5",

    // Step 1: Personal & Contact
    firstName: "Chandru",
    lastName: "M H",
    fathersName: "Manjunath",
    mothersName: "Lakshmi",
    dob: "1990-05-15",
    gender: "Male",
    maritalStatus: "Married",
    primaryMobile: "+919008024594",
    whatsappNumber: "+919008024594",
    email: "chandru@udyamicircle.app",
    preferredChannel: "WhatsApp",
    preferredLanguage: "Kannada",
    bloodGroup: "O+",
    education: "Graduate",
    familyIncome: "₹5 Lakhs - ₹10 Lakhs",
    currentAddress: "#123, 1st Main, Rajajinagar",
    permanentAddress: "#123, 1st Main, Rajajinagar",
    ward: "Ward 10",
    taluk: "Bengaluru North",
    circle: "Rajajinagar",
    state: "Karnataka",
    pincode: "560010",
    languagesKnown: ["Kannada", "English", "Hindi"],
    emergencyContactName: "Lakshmi M",
    emergencyPhone: "+919008024595",
    emergencyRelationship: "Spouse",
    govtIdType: "Aadhaar",
    govtIdNumber: "1234-5678-9012",

    // Step 2: Business Info
    ownBusiness: "Yes",
    business: "Chandru Enterprises",
    businessType: "Sole Proprietorship",
    sector: "Retail",
    subCategory: "Electronics",
    stage: "Growing",
    yearEstablished: "2015",
    annualTurnover: "25 Lakh - 1 Cr",
    employeeCount: "5",
    gstRegistration: "Yes",
    gstNumber: "29ABCDE1234F1Z5",
    msmeRegistration: "Yes",
    targetCustomer: "B2C",
    geographicMarkets: "Local",
    salesChannels: "Physical Store",
    sellsOnline: "Yes",
    businessWebsite: "https://chandruenterprises.in",
    bankAccount: "Yes",
    primaryProducts: "Electronic components, Home appliances, Mobile accessories",
    onlineSalesChannels: ["Amazon", "Own Website"],
    biggestChallenges: ["Finance", "Marketing", "Technology"],
    supportNeeded: ["Marketing", "Technology", "Mentorship"],
    takenBusinessLoan: ["No"],
    seekingFunding: ["Maybe"],

    // Step 3: Skills & Interests
    fieldOfStudy: "Commerce",
    certifications: "Digital Marketing Certification",
    skillProficiency: "Advanced",
    yearsExperience: "8",
    salesExpertise: "Yes",
    digitalMarketingSkill: "Yes",
    financialSkills: "Yes",
    itTechSkills: "Yes",
    publicSpeaking: "No",
    contentCreation: "Yes",
    culinarySkills: "No",
    artCraftSkills: "No",
    professionalSkills: ["Marketing", "Finance", "Sales", "Operations"],
    interests: ["Networking", "Mentorship", "Digital Marketing", "E-commerce"],
    wantNewSkills: "Yes",
    willingToMentorSkills: "Yes",  // ✅ Renamed from willingToMentor
    openToCollaborate: "Yes",
    tags: ["Active", "Prospect", "Udyami Queen"],

    // Step 4: Udyami Queens
    homemaker: "No",
    wantHomeBusiness: "No",
    relevantExperience: "Yes",
    homeBusinessInterests: ["Fashion", "Art & Craft"],
    hasEquipment: "Yes",
    darkStoreInterest: "No",
    existingCustomers: "Yes",
    productSupport: "Yes",
    comfortableOnline: "Yes",
    hasSmartphone: "Yes",
    trainingAvailability: "Flexible",
    monthlyIncomeTarget: "₹25,000 - ₹50,000",
    wantMentor: "Yes",
    willingToMentor: "No",  // ✅ Keeping this for Udyami Queens

    // Step 5: Youth Entrepreneur
    finalYearStudent: "No",
    courseDegree: "MBA",
    institution: "IIM Bangalore",
    graduationYear: "2015",
    interestedEntrepreneurship: "Yes",
    hasBusinessIdea: "Yes",
    interestedSectors: "Technology",
    startupCompetitions: "No",
    financialSupport: "Yes",
    businessIdeaDescription: "E-commerce platform for local artisans",
    problemToSolve: "Connecting rural artisans with urban customers",
    workWithBusinesses: "Yes",
    weeklyHours: "40-50",
    techSkills: "Yes",
    roleModel: "Steve Jobs",

    // Step 6: Digital Presence
    socialPlatforms: ["Facebook", "Instagram", "LinkedIn", "WhatsApp"],
    primaryPlatform: "Instagram",
    dailyUsage: "3-5 hours",
    followers: "500-1000",
    postFrequency: "Daily",
    whatsappBusiness: "Yes",
    fbInstaPage: "Yes",
    googleMyBusiness: "Yes",
    digitalPayments: "Yes",
    procuresOnline: "Yes",
    createContent: "Yes",
    businessSoftware: "Yes",
    smartphoneComfort: "Advanced",
    wantDigitalMarketingTraining: "No",

    // Step 7: Community
    howHeardAboutUs: "Social Media",
    referrerName: "Ramesh K",
    referrerUdyamiId: "UDY-202601-ABC12",
    existingAssociation: "Yes",
    attendsNetworking: "Yes",
    knownBusinesses: "15",
    biggestOpportunity: "Growing demand for electronics in local market",
    infrastructureChallenges: ["Power", "Internet", "Transportation"],
    willingToRefer: "Yes",
    canHostMeeting: "Yes",
    awareOfGovSchemes: "Yes",
    unservedBusinessNeeds: "Lack of skilled technicians for repair services",

    // Backward compatibility fields
    phone: "+919008024594",
    tag: "Prospect",
    plan: "Basic",
    status: "Active",
    createdAt: "2024-01-15",
    updatedAt: "2024-06-20",
  },
    {
    id: "12",
    name: "Chandru M H",
    initials: "CM",
    udyamiId: "UDY-202607-A3EF8EE5",

    // Step 1: Personal & Contact
    firstName: "Chandru",
    lastName: "M H",
    fathersName: "Manjunath",
    mothersName: "Lakshmi",
    dob: "1990-05-15",
    gender: "Male",
    maritalStatus: "Married",
    primaryMobile: "+919008024594",
    whatsappNumber: "+919008024594",
    email: "chandru@udyamicircle.app",
    preferredChannel: "WhatsApp",
    preferredLanguage: "Kannada",
    bloodGroup: "O+",
    education: "Graduate",
    familyIncome: "₹5 Lakhs - ₹10 Lakhs",
    currentAddress: "#123, 1st Main, Rajajinagar",
    permanentAddress: "#123, 1st Main, Rajajinagar",
    ward: "Ward 10",
    taluk: "Bengaluru North",
    circle: "Rajajinagar",
    state: "Karnataka",
    pincode: "560010",
    languagesKnown: ["Kannada", "English", "Hindi"],
    emergencyContactName: "Lakshmi M",
    emergencyPhone: "+919008024595",
    emergencyRelationship: "Spouse",
    govtIdType: "Aadhaar",
    govtIdNumber: "1234-5678-9012",

    // Step 2: Business Info
    ownBusiness: "Yes",
    business: "Chandru Enterprises",
    businessType: "Sole Proprietorship",
    sector: "Retail",
    subCategory: "Electronics",
    stage: "Growing",
    yearEstablished: "2015",
    annualTurnover: "25 Lakh - 1 Cr",
    employeeCount: "5",
    gstRegistration: "Yes",
    gstNumber: "29ABCDE1234F1Z5",
    msmeRegistration: "Yes",
    targetCustomer: "B2C",
    geographicMarkets: "Local",
    salesChannels: "Physical Store",
    sellsOnline: "Yes",
    businessWebsite: "https://chandruenterprises.in",
    bankAccount: "Yes",
    primaryProducts: "Electronic components, Home appliances, Mobile accessories",
    onlineSalesChannels: ["Amazon", "Own Website"],
    biggestChallenges: ["Finance", "Marketing", "Technology"],
    supportNeeded: ["Marketing", "Technology", "Mentorship"],
    takenBusinessLoan: ["No"],
    seekingFunding: ["Maybe"],

    // Step 3: Skills & Interests
    fieldOfStudy: "Commerce",
    certifications: "Digital Marketing Certification",
    skillProficiency: "Advanced",
    yearsExperience: "8",
    salesExpertise: "Yes",
    digitalMarketingSkill: "Yes",
    financialSkills: "Yes",
    itTechSkills: "Yes",
    publicSpeaking: "No",
    contentCreation: "Yes",
    culinarySkills: "No",
    artCraftSkills: "No",
    professionalSkills: ["Marketing", "Finance", "Sales", "Operations"],
    interests: ["Networking", "Mentorship", "Digital Marketing", "E-commerce"],
    wantNewSkills: "Yes",
    willingToMentorSkills: "Yes",  // ✅ Renamed from willingToMentor
    openToCollaborate: "Yes",
    tags: ["Active", "Prospect", "Udyami Queen"],

    // Step 4: Udyami Queens
    homemaker: "No",
    wantHomeBusiness: "No",
    relevantExperience: "Yes",
    homeBusinessInterests: ["Fashion", "Art & Craft"],
    hasEquipment: "Yes",
    darkStoreInterest: "No",
    existingCustomers: "Yes",
    productSupport: "Yes",
    comfortableOnline: "Yes",
    hasSmartphone: "Yes",
    trainingAvailability: "Flexible",
    monthlyIncomeTarget: "₹25,000 - ₹50,000",
    wantMentor: "Yes",
    willingToMentor: "No",  // ✅ Keeping this for Udyami Queens

    // Step 5: Youth Entrepreneur
    finalYearStudent: "No",
    courseDegree: "MBA",
    institution: "IIM Bangalore",
    graduationYear: "2015",
    interestedEntrepreneurship: "Yes",
    hasBusinessIdea: "Yes",
    interestedSectors: "Technology",
    startupCompetitions: "No",
    financialSupport: "Yes",
    businessIdeaDescription: "E-commerce platform for local artisans",
    problemToSolve: "Connecting rural artisans with urban customers",
    workWithBusinesses: "Yes",
    weeklyHours: "40-50",
    techSkills: "Yes",
    roleModel: "Steve Jobs",

    // Step 6: Digital Presence
    socialPlatforms: ["Facebook", "Instagram", "LinkedIn", "WhatsApp"],
    primaryPlatform: "Instagram",
    dailyUsage: "3-5 hours",
    followers: "500-1000",
    postFrequency: "Daily",
    whatsappBusiness: "Yes",
    fbInstaPage: "Yes",
    googleMyBusiness: "Yes",
    digitalPayments: "Yes",
    procuresOnline: "Yes",
    createContent: "Yes",
    businessSoftware: "Yes",
    smartphoneComfort: "Advanced",
    wantDigitalMarketingTraining: "No",

    // Step 7: Community
    howHeardAboutUs: "Social Media",
    referrerName: "Ramesh K",
    referrerUdyamiId: "UDY-202601-ABC12",
    existingAssociation: "Yes",
    attendsNetworking: "Yes",
    knownBusinesses: "15",
    biggestOpportunity: "Growing demand for electronics in local market",
    infrastructureChallenges: ["Power", "Internet", "Transportation"],
    willingToRefer: "Yes",
    canHostMeeting: "Yes",
    awareOfGovSchemes: "Yes",
    unservedBusinessNeeds: "Lack of skilled technicians for repair services",

    // Backward compatibility fields
    phone: "+919008024594",
    tag: "Prospect",
    plan: "Basic",
    status: "Active",
    createdAt: "2024-01-15",
    updatedAt: "2024-06-20",
  },
    {
    id: "13",
    name: "Chandru M H",
    initials: "CM",
    udyamiId: "UDY-202607-A3EF8EE5",

    // Step 1: Personal & Contact
    firstName: "Chandru",
    lastName: "M H",
    fathersName: "Manjunath",
    mothersName: "Lakshmi",
    dob: "1990-05-15",
    gender: "Male",
    maritalStatus: "Married",
    primaryMobile: "+919008024594",
    whatsappNumber: "+919008024594",
    email: "chandru@udyamicircle.app",
    preferredChannel: "WhatsApp",
    preferredLanguage: "Kannada",
    bloodGroup: "O+",
    education: "Graduate",
    familyIncome: "₹5 Lakhs - ₹10 Lakhs",
    currentAddress: "#123, 1st Main, Rajajinagar",
    permanentAddress: "#123, 1st Main, Rajajinagar",
    ward: "Ward 10",
    taluk: "Bengaluru North",
    circle: "Rajajinagar",
    state: "Karnataka",
    pincode: "560010",
    languagesKnown: ["Kannada", "English", "Hindi"],
    emergencyContactName: "Lakshmi M",
    emergencyPhone: "+919008024595",
    emergencyRelationship: "Spouse",
    govtIdType: "Aadhaar",
    govtIdNumber: "1234-5678-9012",

    // Step 2: Business Info
    ownBusiness: "Yes",
    business: "Chandru Enterprises",
    businessType: "Sole Proprietorship",
    sector: "Retail",
    subCategory: "Electronics",
    stage: "Growing",
    yearEstablished: "2015",
    annualTurnover: "25 Lakh - 1 Cr",
    employeeCount: "5",
    gstRegistration: "Yes",
    gstNumber: "29ABCDE1234F1Z5",
    msmeRegistration: "Yes",
    targetCustomer: "B2C",
    geographicMarkets: "Local",
    salesChannels: "Physical Store",
    sellsOnline: "Yes",
    businessWebsite: "https://chandruenterprises.in",
    bankAccount: "Yes",
    primaryProducts: "Electronic components, Home appliances, Mobile accessories",
    onlineSalesChannels: ["Amazon", "Own Website"],
    biggestChallenges: ["Finance", "Marketing", "Technology"],
    supportNeeded: ["Marketing", "Technology", "Mentorship"],
    takenBusinessLoan: ["No"],
    seekingFunding: ["Maybe"],

    // Step 3: Skills & Interests
    fieldOfStudy: "Commerce",
    certifications: "Digital Marketing Certification",
    skillProficiency: "Advanced",
    yearsExperience: "8",
    salesExpertise: "Yes",
    digitalMarketingSkill: "Yes",
    financialSkills: "Yes",
    itTechSkills: "Yes",
    publicSpeaking: "No",
    contentCreation: "Yes",
    culinarySkills: "No",
    artCraftSkills: "No",
    professionalSkills: ["Marketing", "Finance", "Sales", "Operations"],
    interests: ["Networking", "Mentorship", "Digital Marketing", "E-commerce"],
    wantNewSkills: "Yes",
    willingToMentorSkills: "Yes",  // ✅ Renamed from willingToMentor
    openToCollaborate: "Yes",
    tags: ["Active", "Prospect", "Udyami Queen"],

    // Step 4: Udyami Queens
    homemaker: "No",
    wantHomeBusiness: "No",
    relevantExperience: "Yes",
    homeBusinessInterests: ["Fashion", "Art & Craft"],
    hasEquipment: "Yes",
    darkStoreInterest: "No",
    existingCustomers: "Yes",
    productSupport: "Yes",
    comfortableOnline: "Yes",
    hasSmartphone: "Yes",
    trainingAvailability: "Flexible",
    monthlyIncomeTarget: "₹25,000 - ₹50,000",
    wantMentor: "Yes",
    willingToMentor: "No",  // ✅ Keeping this for Udyami Queens

    // Step 5: Youth Entrepreneur
    finalYearStudent: "No",
    courseDegree: "MBA",
    institution: "IIM Bangalore",
    graduationYear: "2015",
    interestedEntrepreneurship: "Yes",
    hasBusinessIdea: "Yes",
    interestedSectors: "Technology",
    startupCompetitions: "No",
    financialSupport: "Yes",
    businessIdeaDescription: "E-commerce platform for local artisans",
    problemToSolve: "Connecting rural artisans with urban customers",
    workWithBusinesses: "Yes",
    weeklyHours: "40-50",
    techSkills: "Yes",
    roleModel: "Steve Jobs",

    // Step 6: Digital Presence
    socialPlatforms: ["Facebook", "Instagram", "LinkedIn", "WhatsApp"],
    primaryPlatform: "Instagram",
    dailyUsage: "3-5 hours",
    followers: "500-1000",
    postFrequency: "Daily",
    whatsappBusiness: "Yes",
    fbInstaPage: "Yes",
    googleMyBusiness: "Yes",
    digitalPayments: "Yes",
    procuresOnline: "Yes",
    createContent: "Yes",
    businessSoftware: "Yes",
    smartphoneComfort: "Advanced",
    wantDigitalMarketingTraining: "No",

    // Step 7: Community
    howHeardAboutUs: "Social Media",
    referrerName: "Ramesh K",
    referrerUdyamiId: "UDY-202601-ABC12",
    existingAssociation: "Yes",
    attendsNetworking: "Yes",
    knownBusinesses: "15",
    biggestOpportunity: "Growing demand for electronics in local market",
    infrastructureChallenges: ["Power", "Internet", "Transportation"],
    willingToRefer: "Yes",
    canHostMeeting: "Yes",
    awareOfGovSchemes: "Yes",
    unservedBusinessNeeds: "Lack of skilled technicians for repair services",

    // Backward compatibility fields
    phone: "+919008024594",
    tag: "Prospect",
    plan: "Basic",
    status: "Active",
    createdAt: "2024-01-15",
    updatedAt: "2024-06-20",
  },
    {
    id: "14",
    name: "Chandru M H",
    initials: "CM",
    udyamiId: "UDY-202607-A3EF8EE5",

    // Step 1: Personal & Contact
    firstName: "Chandru",
    lastName: "M H",
    fathersName: "Manjunath",
    mothersName: "Lakshmi",
    dob: "1990-05-15",
    gender: "Male",
    maritalStatus: "Married",
    primaryMobile: "+919008024594",
    whatsappNumber: "+919008024594",
    email: "chandru@udyamicircle.app",
    preferredChannel: "WhatsApp",
    preferredLanguage: "Kannada",
    bloodGroup: "O+",
    education: "Graduate",
    familyIncome: "₹5 Lakhs - ₹10 Lakhs",
    currentAddress: "#123, 1st Main, Rajajinagar",
    permanentAddress: "#123, 1st Main, Rajajinagar",
    ward: "Ward 10",
    taluk: "Bengaluru North",
    circle: "Rajajinagar",
    state: "Karnataka",
    pincode: "560010",
    languagesKnown: ["Kannada", "English", "Hindi"],
    emergencyContactName: "Lakshmi M",
    emergencyPhone: "+919008024595",
    emergencyRelationship: "Spouse",
    govtIdType: "Aadhaar",
    govtIdNumber: "1234-5678-9012",

    // Step 2: Business Info
    ownBusiness: "Yes",
    business: "Chandru Enterprises",
    businessType: "Sole Proprietorship",
    sector: "Retail",
    subCategory: "Electronics",
    stage: "Growing",
    yearEstablished: "2015",
    annualTurnover: "25 Lakh - 1 Cr",
    employeeCount: "5",
    gstRegistration: "Yes",
    gstNumber: "29ABCDE1234F1Z5",
    msmeRegistration: "Yes",
    targetCustomer: "B2C",
    geographicMarkets: "Local",
    salesChannels: "Physical Store",
    sellsOnline: "Yes",
    businessWebsite: "https://chandruenterprises.in",
    bankAccount: "Yes",
    primaryProducts: "Electronic components, Home appliances, Mobile accessories",
    onlineSalesChannels: ["Amazon", "Own Website"],
    biggestChallenges: ["Finance", "Marketing", "Technology"],
    supportNeeded: ["Marketing", "Technology", "Mentorship"],
    takenBusinessLoan: ["No"],
    seekingFunding: ["Maybe"],

    // Step 3: Skills & Interests
    fieldOfStudy: "Commerce",
    certifications: "Digital Marketing Certification",
    skillProficiency: "Advanced",
    yearsExperience: "8",
    salesExpertise: "Yes",
    digitalMarketingSkill: "Yes",
    financialSkills: "Yes",
    itTechSkills: "Yes",
    publicSpeaking: "No",
    contentCreation: "Yes",
    culinarySkills: "No",
    artCraftSkills: "No",
    professionalSkills: ["Marketing", "Finance", "Sales", "Operations"],
    interests: ["Networking", "Mentorship", "Digital Marketing", "E-commerce"],
    wantNewSkills: "Yes",
    willingToMentorSkills: "Yes",  // ✅ Renamed from willingToMentor
    openToCollaborate: "Yes",
    tags: ["Active", "Prospect", "Udyami Queen"],

    // Step 4: Udyami Queens
    homemaker: "No",
    wantHomeBusiness: "No",
    relevantExperience: "Yes",
    homeBusinessInterests: ["Fashion", "Art & Craft"],
    hasEquipment: "Yes",
    darkStoreInterest: "No",
    existingCustomers: "Yes",
    productSupport: "Yes",
    comfortableOnline: "Yes",
    hasSmartphone: "Yes",
    trainingAvailability: "Flexible",
    monthlyIncomeTarget: "₹25,000 - ₹50,000",
    wantMentor: "Yes",
    willingToMentor: "No",  // ✅ Keeping this for Udyami Queens

    // Step 5: Youth Entrepreneur
    finalYearStudent: "No",
    courseDegree: "MBA",
    institution: "IIM Bangalore",
    graduationYear: "2015",
    interestedEntrepreneurship: "Yes",
    hasBusinessIdea: "Yes",
    interestedSectors: "Technology",
    startupCompetitions: "No",
    financialSupport: "Yes",
    businessIdeaDescription: "E-commerce platform for local artisans",
    problemToSolve: "Connecting rural artisans with urban customers",
    workWithBusinesses: "Yes",
    weeklyHours: "40-50",
    techSkills: "Yes",
    roleModel: "Steve Jobs",

    // Step 6: Digital Presence
    socialPlatforms: ["Facebook", "Instagram", "LinkedIn", "WhatsApp"],
    primaryPlatform: "Instagram",
    dailyUsage: "3-5 hours",
    followers: "500-1000",
    postFrequency: "Daily",
    whatsappBusiness: "Yes",
    fbInstaPage: "Yes",
    googleMyBusiness: "Yes",
    digitalPayments: "Yes",
    procuresOnline: "Yes",
    createContent: "Yes",
    businessSoftware: "Yes",
    smartphoneComfort: "Advanced",
    wantDigitalMarketingTraining: "No",

    // Step 7: Community
    howHeardAboutUs: "Social Media",
    referrerName: "Ramesh K",
    referrerUdyamiId: "UDY-202601-ABC12",
    existingAssociation: "Yes",
    attendsNetworking: "Yes",
    knownBusinesses: "15",
    biggestOpportunity: "Growing demand for electronics in local market",
    infrastructureChallenges: ["Power", "Internet", "Transportation"],
    willingToRefer: "Yes",
    canHostMeeting: "Yes",
    awareOfGovSchemes: "Yes",
    unservedBusinessNeeds: "Lack of skilled technicians for repair services",

    // Backward compatibility fields
    phone: "+919008024594",
    tag: "Prospect",
    plan: "Basic",
    status: "Active",
    createdAt: "2024-01-15",
    updatedAt: "2024-06-20",
  },
    {
    id: "15",
    name: "Chandru M H",
    initials: "CM",
    udyamiId: "UDY-202607-A3EF8EE5",

    // Step 1: Personal & Contact
    firstName: "Chandru",
    lastName: "M H",
    fathersName: "Manjunath",
    mothersName: "Lakshmi",
    dob: "1990-05-15",
    gender: "Male",
    maritalStatus: "Married",
    primaryMobile: "+919008024594",
    whatsappNumber: "+919008024594",
    email: "chandru@udyamicircle.app",
    preferredChannel: "WhatsApp",
    preferredLanguage: "Kannada",
    bloodGroup: "O+",
    education: "Graduate",
    familyIncome: "₹5 Lakhs - ₹10 Lakhs",
    currentAddress: "#123, 1st Main, Rajajinagar",
    permanentAddress: "#123, 1st Main, Rajajinagar",
    ward: "Ward 10",
    taluk: "Bengaluru North",
    circle: "Rajajinagar",
    state: "Karnataka",
    pincode: "560010",
    languagesKnown: ["Kannada", "English", "Hindi"],
    emergencyContactName: "Lakshmi M",
    emergencyPhone: "+919008024595",
    emergencyRelationship: "Spouse",
    govtIdType: "Aadhaar",
    govtIdNumber: "1234-5678-9012",

    // Step 2: Business Info
    ownBusiness: "Yes",
    business: "Chandru Enterprises",
    businessType: "Sole Proprietorship",
    sector: "Retail",
    subCategory: "Electronics",
    stage: "Growing",
    yearEstablished: "2015",
    annualTurnover: "25 Lakh - 1 Cr",
    employeeCount: "5",
    gstRegistration: "Yes",
    gstNumber: "29ABCDE1234F1Z5",
    msmeRegistration: "Yes",
    targetCustomer: "B2C",
    geographicMarkets: "Local",
    salesChannels: "Physical Store",
    sellsOnline: "Yes",
    businessWebsite: "https://chandruenterprises.in",
    bankAccount: "Yes",
    primaryProducts: "Electronic components, Home appliances, Mobile accessories",
    onlineSalesChannels: ["Amazon", "Own Website"],
    biggestChallenges: ["Finance", "Marketing", "Technology"],
    supportNeeded: ["Marketing", "Technology", "Mentorship"],
    takenBusinessLoan: ["No"],
    seekingFunding: ["Maybe"],

    // Step 3: Skills & Interests
    fieldOfStudy: "Commerce",
    certifications: "Digital Marketing Certification",
    skillProficiency: "Advanced",
    yearsExperience: "8",
    salesExpertise: "Yes",
    digitalMarketingSkill: "Yes",
    financialSkills: "Yes",
    itTechSkills: "Yes",
    publicSpeaking: "No",
    contentCreation: "Yes",
    culinarySkills: "No",
    artCraftSkills: "No",
    professionalSkills: ["Marketing", "Finance", "Sales", "Operations"],
    interests: ["Networking", "Mentorship", "Digital Marketing", "E-commerce"],
    wantNewSkills: "Yes",
    willingToMentorSkills: "Yes",  // ✅ Renamed from willingToMentor
    openToCollaborate: "Yes",
    tags: ["Active", "Prospect", "Udyami Queen"],

    // Step 4: Udyami Queens
    homemaker: "No",
    wantHomeBusiness: "No",
    relevantExperience: "Yes",
    homeBusinessInterests: ["Fashion", "Art & Craft"],
    hasEquipment: "Yes",
    darkStoreInterest: "No",
    existingCustomers: "Yes",
    productSupport: "Yes",
    comfortableOnline: "Yes",
    hasSmartphone: "Yes",
    trainingAvailability: "Flexible",
    monthlyIncomeTarget: "₹25,000 - ₹50,000",
    wantMentor: "Yes",
    willingToMentor: "No",  // ✅ Keeping this for Udyami Queens

    // Step 5: Youth Entrepreneur
    finalYearStudent: "No",
    courseDegree: "MBA",
    institution: "IIM Bangalore",
    graduationYear: "2015",
    interestedEntrepreneurship: "Yes",
    hasBusinessIdea: "Yes",
    interestedSectors: "Technology",
    startupCompetitions: "No",
    financialSupport: "Yes",
    businessIdeaDescription: "E-commerce platform for local artisans",
    problemToSolve: "Connecting rural artisans with urban customers",
    workWithBusinesses: "Yes",
    weeklyHours: "40-50",
    techSkills: "Yes",
    roleModel: "Steve Jobs",

    // Step 6: Digital Presence
    socialPlatforms: ["Facebook", "Instagram", "LinkedIn", "WhatsApp"],
    primaryPlatform: "Instagram",
    dailyUsage: "3-5 hours",
    followers: "500-1000",
    postFrequency: "Daily",
    whatsappBusiness: "Yes",
    fbInstaPage: "Yes",
    googleMyBusiness: "Yes",
    digitalPayments: "Yes",
    procuresOnline: "Yes",
    createContent: "Yes",
    businessSoftware: "Yes",
    smartphoneComfort: "Advanced",
    wantDigitalMarketingTraining: "No",

    // Step 7: Community
    howHeardAboutUs: "Social Media",
    referrerName: "Ramesh K",
    referrerUdyamiId: "UDY-202601-ABC12",
    existingAssociation: "Yes",
    attendsNetworking: "Yes",
    knownBusinesses: "15",
    biggestOpportunity: "Growing demand for electronics in local market",
    infrastructureChallenges: ["Power", "Internet", "Transportation"],
    willingToRefer: "Yes",
    canHostMeeting: "Yes",
    awareOfGovSchemes: "Yes",
    unservedBusinessNeeds: "Lack of skilled technicians for repair services",

    // Backward compatibility fields
    phone: "+919008024594",
    tag: "Prospect",
    plan: "Basic",
    status: "Active",
    createdAt: "2024-01-15",
    updatedAt: "2024-06-20",
  },

];

const STATS = {
  total: 23, totalDelta: 5,
  active: 23, activeDelta: 5,
  basic: 23, basicDelta: 5,
  prime: 0, primeDelta: 0,
  newThisMonth: 1, newDelta: -90,
  atRisk: 0, atRiskDelta: 0,
};

export default function Udyamidatabaseupdated() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [viewMode, setViewMode] = useState("list");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewTarget, setViewTarget] = useState(null);
  const [formModal, setFormModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [members, setMembers] = useState(INITIAL_MEMBERS);

  // FIXED: Use 'members' state instead of 'SAMPLE_MEMBERS'
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;  // ✅ live state
    return members.filter(
      (m) => m.name.toLowerCase().includes(q) ||
        m.udyamiId.toLowerCase().includes(q) ||
        (m.business && m.business.toLowerCase().includes(q))
    );
  }, [search, members]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleFilterChange = (key, value) => {
    if (key === "clear") {
      setFilters(value);
    } else {
      setFilters((f) => ({ ...f, [key]: value }));
    }
    setPage(1);
  };

  const handleSuspend = (m) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === m.id
          ? { ...member, status: member.status === "Suspended" ? "Active" : "Suspended" }
          : member
      )
    );
  };

  const handleSearchChange = (v) => {
    setSearch(v);
    setPage(1);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  };

  const handleFormSubmit = (data) => {
    console.log("Submit member:", data);
    // Add new member to the list
    if (formModal?.mode === "add") {
      const newMember = {
        ...data,
        id: String(Date.now()),
        initials: data.name?.split(' ').map(n => n[0]).join('').toUpperCase() || "XX",
      };
      setMembers((prev) => [...prev, newMember]);
    } else if (formModal?.mode === "edit") {
      // Update existing member
      setMembers((prev) => prev.map((m) =>
        m.id === data.id ? { ...m, ...data } : m
      ));
    }
    setFormModal(null);
  };

  const navigate = useNavigate();

  const handleView = (m) => {
    navigate(`/admin-dashboard/members/${m.id}`);
  };
  const handleDelete = (m) => setDeleteTarget(m);

  const handleConfirmDelete = (member) => {
    console.log("Delete member:", member);
    setMembers((prev) => prev.filter((m) => m.id !== member.id));
    setDeleteTarget(null);
  };

  const handleAddMember = () => setFormModal({ mode: "add" });
  const handleEdit = (m) => setFormModal({ mode: "edit", member: m });

  const handleExportExcel = () => console.log("GET /api/members/export?format=excel");
  const handleExportPdf = () => console.log("GET /api/members/export?format=pdf");
  const handleBulkUpload = () => console.log("Open bulk upload flow");

  // If viewing a member detail, show the detail page
  if (viewTarget) {
    return (
      <MemberDetailPage
        member={viewTarget}
        onBack={() => setViewTarget(null)}
        onEdit={(m) => {
          setViewTarget(null);
          handleEdit(m);
        }}
      />
    );
  }

  return (
    <div className="bg-paper -m-8 p-8 min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">

          <span className="w-11 h-11 rounded-2xl bg-amber-tint flex items-center justify-center shrink-0">
            <Database size={20} className="text-amber" />
          </span>

          <div>
            <h1 className="font-display text-[24px] text-ink leading-tight">
              Udyami Database
            </h1>

            <p className="text-[13px] text-muted mt-0.5">
              Manage entrepreneur records and business profiles
            </p>
          </div>

        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleExportExcel} className="flex items-center gap-2 border border-hairline text-[13px] font-semibold text-ink px-3.5 py-2.5 rounded-xl hover:bg-ink/5 transition-colors">
            <FileText size={15} /> Excel
          </button>
          <button onClick={handleExportPdf} className="flex items-center gap-2 border border-hairline text-[13px] font-semibold text-ink px-3.5 py-2.5 rounded-xl hover:bg-ink/5 transition-colors">
            <Download size={15} /> PDF
          </button>
          <button onClick={handleBulkUpload} className="flex items-center gap-2 border border-hairline text-[13px] font-semibold text-ink px-3.5 py-2.5 rounded-xl hover:bg-ink/5 transition-colors">
            <Upload size={15} /> Bulk Upload
          </button>
          <button onClick={handleAddMember} className="flex items-center gap-2 bg-amber text-white text-[13.5px] font-semibold px-4 py-2.5 rounded-xl hover:bg-amber/90 transition-colors">
            <Plus size={16} /> Add Member
          </button>
        </div>
      </div>

      <MemberStatsCards stats={STATS} />

      <MemberFiltersBar
        search={search}
        onSearchChange={handleSearchChange}
        filters={filters}
        onFilterChange={handleFilterChange}
        onSaveSegment={() => console.log("Save segment:", filters)}
      />

      {/* Results header + Page Size Selector + View toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <p className="text-[13.5px] text-muted">{filtered.length} members found</p>
          {/* Page Size/Limit Selector - Only show if more than page size */}
          {filtered.length > PAGE_SIZE_OPTIONS[0] && (
            <div className="flex items-center gap-2">
              <label className="text-[12.5px] text-muted">Show:</label>
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="border border-hairline rounded-lg px-2.5 py-1.5 text-[12.5px] text-ink focus:outline-none focus:ring-2 focus:ring-amber/30 bg-white"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="inline-flex rounded-xl border border-hairline bg-white p-1">
          <button
            onClick={() => setViewMode("list")}
            className={`w-9 h-8 rounded-lg flex items-center justify-center transition-colors ${viewMode === "list" ? "bg-ink text-white" : "text-muted hover:text-ink"}`}
          >
            <List size={15} />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`w-9 h-8 rounded-lg flex items-center justify-center transition-colors ${viewMode === "grid" ? "bg-ink text-white" : "text-muted hover:text-ink"}`}
          >
            <LayoutGrid size={15} />
          </button>
        </div>
      </div>

      {pageItems.length === 0 ? (
        <div className="rounded-2xl border border-hairline bg-white p-14 text-center">
          <p className="text-[14px] text-muted">No members match your search.</p>
        </div>
      ) : viewMode === "grid" ? (
        <MemberGridView members={pageItems} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
      ) : (
        <MemberListView members={pageItems} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} onSuspend={handleSuspend} />
      )}

      {filtered.length > pageSize && (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      {formModal && (
        <MemberFormModal
          mode={formModal.mode}
          existingMember={formModal.member}
          onClose={() => setFormModal(null)}
          onSubmit={handleFormSubmit}
        />
      )}

      {deleteTarget && (
        <DeleteMemberModal
          member={deleteTarget}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}