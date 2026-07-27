// ─────────────────────────────────────────────────────────────────────────────
// mockData.js  –  Replace with API responses when backend is ready
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_FILTERS = {
  states: [
    { value: "karnataka", label: "Karnataka" },
    { value: "maharashtra", label: "Maharashtra" },
    { value: "tamilnadu", label: "Tamil Nadu" },
  ],
  districts: [
    { value: "bangalore_urban", label: "Bangalore Urban", state: "karnataka" },
    { value: "mysore", label: "Mysore", state: "karnataka" },
    { value: "pune", label: "Pune", state: "maharashtra" },
    { value: "nashik", label: "Nashik", state: "maharashtra" },
    { value: "chennai", label: "Chennai", state: "tamilnadu" },
    { value: "coimbatore", label: "Coimbatore", state: "tamilnadu" },
  ],
  taluks: [
    { value: "bangalore_north", label: "Bangalore North", district: "bangalore_urban" },
    { value: "bangalore_south", label: "Bangalore South", district: "bangalore_urban" },
    { value: "mysore_taluk", label: "Mysore Taluk", district: "mysore" },
    { value: "pune_city", label: "Pune City", district: "pune" },
    { value: "chennai_north", label: "Chennai North", district: "chennai" },
  ],
  wards: [
    { value: "ward_14", label: "Ward 14 – Shivajinagar", taluk: "bangalore_north" },
    { value: "ward_22", label: "Ward 22 – Malleswaram", taluk: "bangalore_north" },
    { value: "ward_07", label: "Ward 07 – JP Nagar", taluk: "bangalore_south" },
    { value: "ward_31", label: "Ward 31 – Koramangala", taluk: "bangalore_south" },
  ],
  chapters: [
    { value: "ch_tech", label: "Tech Entrepreneurs" },
    { value: "ch_retail", label: "Retail Business" },
    { value: "ch_women", label: "Women Entrepreneurs" },
    { value: "ch_agri", label: "Agribusiness" },
  ],
  membershipTypes: [
    { value: "basic", label: "Basic Member" },
    { value: "prime", label: "Prime Member" },
    { value: "elite", label: "Elite Member" },
  ],
  businessCategories: [
    { value: "retail", label: "Retail" },
    { value: "manufacturing", label: "Manufacturing" },
    { value: "services", label: "Services" },
    { value: "agriculture", label: "Agriculture" },
    { value: "it", label: "IT / Technology" },
  ],
  sectors: [
    { value: "formal", label: "Formal" },
    { value: "informal", label: "Informal" },
    { value: "msme", label: "MSME" },
  ],
  plans: [
    { value: "free", label: "Free" },
    { value: "basic", label: "Basic" },
    { value: "prime", label: "Prime" },
  ],
  businessTypes: [
    { value: "proprietorship", label: "Proprietorship" },
    { value: "partnership", label: "Partnership" },
    { value: "pvt_ltd", label: "Pvt. Ltd." },
    { value: "llp", label: "LLP" },
    { value: "others", label: "Others" },
  ],
  tags: [
    { value: "high_value", label: "High Value" },
    { value: "new_member", label: "New Member" },
    { value: "inactive", label: "Inactive" },
    { value: "event_attendee", label: "Event Attendee" },
    { value: "export_ready", label: "Export Ready" },
  ],
};

export const MOCK_MEMBERS = [
  { id: "UB-10234", name: "Priya Shankar",       ward: "Ward 14 – Shivajinagar", sector: "Formal",   businessType: "Proprietorship", mobile: "+91 98400 12345", status: "active"   },
  { id: "UB-10235", name: "Rahul Verma",          ward: "Ward 22 – Malleswaram",  sector: "MSME",     businessType: "Pvt. Ltd.",      mobile: "+91 88001 45678", status: "active"   },
  { id: "UB-10236", name: "Meena Krishnaswamy",  ward: "Ward 07 – JP Nagar",     sector: "Informal", businessType: "Partnership",    mobile: "+91 77200 78901", status: "dnd"      },
  { id: "UB-10237", name: "Suresh Patil",         ward: "Ward 31 – Koramangala",  sector: "MSME",     businessType: "LLP",            mobile: "+91 99300 23456", status: "active"   },
  { id: "UB-10238", name: "Anjali Nair",          ward: "Ward 14 – Shivajinagar", sector: "Formal",   businessType: "Proprietorship", mobile: "+91 91100 34567", status: "active"   },
  { id: "UB-10239", name: "Karthik Rajan",        ward: "Ward 22 – Malleswaram",  sector: "Formal",   businessType: "Pvt. Ltd.",      mobile: "+91 80900 56789", status: "invalid"  },
  { id: "UB-10240", name: "Deepa Murthy",         ward: "Ward 07 – JP Nagar",     sector: "MSME",     businessType: "Partnership",    mobile: "+91 76500 67890", status: "active"   },
  { id: "UB-10241", name: "Naveen Gowda",         ward: "Ward 31 – Koramangala",  sector: "Informal", businessType: "Proprietorship", mobile: "+91 95400 89012", status: "active"   },
  { id: "UB-10242", name: "Savitha Reddy",        ward: "Ward 14 – Shivajinagar", sector: "Formal",   businessType: "LLP",            mobile: "+91 82300 90123", status: "active"   },
  { id: "UB-10243", name: "Mohan Das",            ward: "Ward 22 – Malleswaram",  sector: "MSME",     businessType: "Pvt. Ltd.",      mobile: "+91 98700 01234", status: "dnd"      },
  { id: "UB-10244", name: "Lalitha Subramaniam", ward: "Ward 07 – JP Nagar",     sector: "Informal", businessType: "Partnership",    mobile: "+91 74100 12890", status: "active"   },
  { id: "UB-10245", name: "Vikram Hegde",         ward: "Ward 31 – Koramangala",  sector: "Formal",   businessType: "Proprietorship", mobile: "+91 87600 34512", status: "active"   },
  { id: "UB-10246", name: "Pooja Iyer",           ward: "Ward 14 – Shivajinagar", sector: "MSME",     businessType: "Pvt. Ltd.",      mobile: "+91 96500 45623", status: "invalid"  },
  { id: "UB-10247", name: "Anil Kumar",           ward: "Ward 22 – Malleswaram",  sector: "Formal",   businessType: "LLP",            mobile: "+91 78900 56734", status: "active"   },
  { id: "UB-10248", name: "Revathi Gopal",        ward: "Ward 07 – JP Nagar",     sector: "Informal", businessType: "Partnership",    mobile: "+91 93200 67845", status: "active"   },
];

export const MOCK_RECENT_CAMPAIGNS = [
  {
    id: "camp_001",
    name: "Diwali Business Boost",
    channel: "sms",
    status: "sent",
    scheduledAt: "2025-10-20T09:00:00",
    audienceCount: 1240,
    creditsUsed: 1240,
    deliveryRate: 96,
  },
  {
    id: "camp_002",
    name: "WhatsApp – New Scheme Alert",
    channel: "whatsapp",
    status: "scheduled",
    scheduledAt: "2025-11-05T10:30:00",
    audienceCount: 580,
    creditsUsed: 0,
    deliveryRate: null,
  },
  {
    id: "camp_003",
    name: "IVR – Renewal Reminder",
    channel: "ivr",
    status: "failed",
    scheduledAt: "2025-10-18T14:00:00",
    audienceCount: 320,
    creditsUsed: 140,
    deliveryRate: 43,
  },
  {
    id: "camp_004",
    name: "Email – Monthly Newsletter",
    channel: "email",
    status: "sent",
    scheduledAt: "2025-10-01T08:00:00",
    audienceCount: 2100,
    creditsUsed: 2100,
    deliveryRate: 91,
  },
  {
    id: "camp_005",
    name: "SMS – Event Reminder",
    channel: "sms",
    status: "cancelled",
    scheduledAt: "2025-10-25T11:00:00",
    audienceCount: 450,
    creditsUsed: 0,
    deliveryRate: null,
  },
];

// Audience summary – derive from resolved audience in a real API
export const MOCK_AUDIENCE_SUMMARY = {
  estimatedReach: 1240,
  eligible: 1190,
  dndExcluded: 35,
  invalidMobile: 15,
  estimatedCredits: 1190,
};
