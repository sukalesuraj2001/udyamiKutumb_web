import React, { useMemo, useState } from "react";
import { FileText, Download, Upload, Plus, List, LayoutGrid } from "lucide-react";
import Pagination from "../../common/Pagination.jsx";
import DeleteMemberModal from "../members/DeleteMemberModal.jsx";
import { Database } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CpBanner from "./CpBanner.jsx";
import CpFillter from "./CpFillter.jsx";
import CpListView from "./CpListView.jsx";
import CpGridView from "./CpGridView.jsx";
import CpFormModel from "./CpFormModel.jsx";
import CpMemberDetails from "./CpMemberDetails.jsx";
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export const CP_INITIAL_MEMBERS = [
  {
    id: "1",
    name: "Chandru M H",
    initials: "CM",
    udyamiId: "UDY-202607-A3EF8EE5",
    walletPoints: 1240,
    rewardTier: "Basic",

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
    sector: "UB Queens",
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
    willingToMentorSkills: "Yes",
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
    walletPoints: 1200,
    rewardTier: "Prime",

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
    sector: "UB Reality Construction",
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
    name: "Rajesh Member",
    initials: "RM",
    udyamiId: "UDY-202606-E283EBE7",
    walletPoints: 1840,
    rewardTier: "Basic",

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
    sector: "UB Finance & IT",
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
    id: "4",
    name: "Rajesh Member",
    initials: "RM",
    udyamiId: "UDY-202606-E283EBE7",
    walletPoints: 2240,
    rewardTier: "Basic",

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
    sector: "UB PAC",
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
    id: "5",
    name: "Rajesh Member",
    initials: "RM",
    udyamiId: "UDY-202606-E283EBE7",
    walletPoints: 1840,
    rewardTier: "Prime",

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
    sector: "UB Reality Construction",
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
    id: "6",
    name: "Rajesh Member",
    initials: "RM",
    udyamiId: "UDY-202606-E283EBE7",
    walletPoints: 1240,
    rewardTier: "Basic",

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
    sector: "UB PAC",
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
    id: "7",
    name: "Rajesh Member",
    initials: "RM",
    udyamiId: "UDY-202606-E283EBE7",
    walletPoints: 1240,
    rewardTier: "Basic",
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
    sector: "UB PAC",
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
    id: "8",
    name: "Rajesh Member",
    initials: "RM",
    udyamiId: "UDY-202606-E283EBE7",
    walletPoints: 1240,
   rewardTier: "Prime",

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
    sector: "UB PAC",
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
    id: "9",
    name: "Rajesh Member",
    initials: "RM",
    udyamiId: "UDY-202606-E283EBE7",
    walletPoints: 1240,
    rewardTier: "Prime",

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
    sector: "UB Queens",
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
    id: "10",
    name: "Rajesh Member",
    initials: "RM",
    udyamiId: "UDY-202606-E283EBE7",
    walletPoints: 1240,
    rewardTier: "Basic",

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
    sector: "UB Queens",
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
    id: "11",
    name: "Rajesh Member",
    initials: "RM",
    udyamiId: "UDY-202606-E283EBE7",
    walletPoints: 1240,
    rewardTier: "Basic",

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
    sector: "UB Queens",
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
    id: "12",
    name: "Rajesh Member",
    initials: "RM",
    udyamiId: "UDY-202606-E283EBE7",
    walletPoints: 1240,
    rewardTier: "Prime",

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
    sector: "UB Finance & IT",
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
    id: "13",
    name: "Rajesh Member",
    initials: "RM",
    udyamiId: "UDY-202606-E283EBE7",
    walletPoints: 1240,
    rewardTier: "Prime",

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
    sector: "UB PAC",
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
];

const CPSTATS = {
  totalCp: 23, totalDelta: 5,
  activeCp: 23, activeDelta: 5,
  deActiveCp: 5, basicDelta: 5
};

export default function ChannelPartner() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [viewMode, setViewMode] = useState("list");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewTarget, setViewTarget] = useState(null);
  const [formModal, setFormModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [members, setMembers] = useState(CP_INITIAL_MEMBERS);

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

    if (formModal?.mode === "add") {
      const newMember = {
        ...data,
        id: String(Date.now()),
        initials: data.name?.split(' ').map(n => n[0]).join('').toUpperCase() || "XX",
        // Ensure these are stored as strings
        takenBusinessLoan: typeof data.takenBusinessLoan === 'string' ? data.takenBusinessLoan : (data.takenBusinessLoan && data.takenBusinessLoan[0]) || "",
        seekingFunding: typeof data.seekingFunding === 'string' ? data.seekingFunding : (data.seekingFunding && data.seekingFunding[0]) || "",
      };
      setMembers((prev) => [...prev, newMember]);
    } else if (formModal?.mode === "edit") {
      const updatedData = {
        ...data,
        // ✅ Always rebuild from firstName + lastName
        name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.name,
        takenBusinessLoan: typeof data.takenBusinessLoan === 'string' ? data.takenBusinessLoan : (data.takenBusinessLoan && data.takenBusinessLoan[0]) || "",
        seekingFunding: typeof data.seekingFunding === 'string' ? data.seekingFunding : (data.seekingFunding && data.seekingFunding[0]) || "",
      };

      setMembers((prev) => prev.map((m) =>
        m.id === data.id ? { ...m, ...updatedData } : m
      ));
    }
    setFormModal(null);
  };

  const navigate = useNavigate();

  const handleView = (m) => {
    navigate(`/admin-dashboard/members/channelPartners/${m.id}`);
  };
  const handleDelete = (m) => setDeleteTarget(m);

  const handleConfirmDelete = (member) => {
    console.log("Delete member:", member);
    setMembers((prev) => prev.filter((m) => m.id !== member.id));
    setDeleteTarget(null);
  };
  const handleAddMember = () => setFormModal({ mode: "add" });
  const handleEdit = (m) => {
    console.log("Edit triggered, member id:", m?.id, m);
    setFormModal({ mode: "edit", member: m });
  };
  const handleExportExcel = () => console.log("GET /api/members/export?format=excel");
  const handleExportPdf = () => console.log("GET /api/members/export?format=pdf");
  const handleBulkUpload = () => console.log("Open bulk upload flow");

  // If viewing a member detail, show the detail page
  if (viewTarget) {
    return (
      <CpMemberDetails
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
    <div className="bg-gray-50 -m-8 p-8 min-h-screen space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 shadow-sm">
            <Database size={20} className="text-blue-600" />
          </span>
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900 leading-tight">
              Channel Partners
            </h1>
            <p className="text-[13px] text-gray-500 mt-0.5">
              Platform overview · Live data
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 border border-gray-200 text-[13px] font-semibold text-gray-700 px-3.5 py-2.5 rounded-xl bg-white hover:bg-gray-50 shadow-sm transition-colors"
          >
            <FileText size={15} /> Excel
          </button>
          <button
            onClick={handleExportPdf}
            className="flex items-center gap-2 border border-gray-200 text-[13px] font-semibold text-gray-700 px-3.5 py-2.5 rounded-xl bg-white hover:bg-gray-50 shadow-sm transition-colors"
          >
            <Download size={15} /> PDF
          </button>
          <button
            onClick={handleBulkUpload}
            className="flex items-center gap-2 border border-gray-200 text-[13px] font-semibold text-gray-700 px-3.5 py-2.5 rounded-xl bg-white hover:bg-gray-50 shadow-sm transition-colors"
          >
            <Upload size={15} /> Bulk Upload
          </button>
          <button
            onClick={handleAddMember}
            className="flex items-center gap-2 bg-blue-600 text-white text-[13.5px] font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-700 shadow-sm transition-colors"
          >
            <Plus size={16} /> Add Partner
          </button>
        </div>
      </div>

      {/* ── Banner Cards ── */}
      <CpBanner stats={CPSTATS} />

      {/* ── Search & Filters ── */}
      <CpFillter
        search={search}
        onSearchChange={handleSearchChange}
        filters={filters}
        onFilterChange={handleFilterChange}
        onSaveSegment={() => console.log("Save segment:", filters)}
      />

      {/* ── Results bar + Page size + View toggle ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <p className="text-[13.5px] text-gray-500">
            {filtered.length} members found
          </p>
          {filtered.length > PAGE_SIZE_OPTIONS[0] && (
            <div className="flex items-center gap-2">
              <label className="text-[12.5px] text-gray-400">Show:</label>
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-[12.5px] text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="inline-flex rounded-xl border border-gray-200 bg-white shadow-sm p-1">
          <button
            onClick={() => setViewMode("list")}
            className={`w-9 h-8 rounded-lg flex items-center justify-center transition-colors ${
              viewMode === "list"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            <List size={15} />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`w-9 h-8 rounded-lg flex items-center justify-center transition-colors ${
              viewMode === "grid"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            <LayoutGrid size={15} />
          </button>
        </div>
      </div>

      {pageItems.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-14 text-center">
          <p className="text-[14px] text-gray-400">No members match your search.</p>
        </div>
      ) : viewMode === "grid" ? (
        <CpGridView members={pageItems} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
      ) : (
        <CpListView members={pageItems} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} onSuspend={handleSuspend} />
      )}

      {filtered.length > pageSize && (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      {/* {formModal && (
        <MemberFormModal
          mode={formModal.mode}
          existingMember={formModal.member}
          onClose={() => setFormModal(null)}
          onSubmit={handleFormSubmit}
        />
      )} */}

      {formModal && (
        <CpFormModel
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