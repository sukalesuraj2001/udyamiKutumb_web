import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Building2, Briefcase, Crown, Zap,
  Globe, Users, Save, Send, ChevronDown, Settings,
} from "lucide-react";

// ── helpers ────────────────────────────────────────────────────────────────
const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman & Nicobar","Chandigarh","Dadra & Nagar Haveli","Daman & Diu",
  "Delhi","Jammu & Kashmir","Ladakh","Lakshadweep","Puducherry",
];

const BUSINESS_TYPES = [
  "Sole Proprietorship","Partnership","LLP","Private Limited","Public Limited",
  "NGO / Trust","Co-operative Society","Other",
];

const INDUSTRY_SECTORS = [
  "Agriculture & Allied","Education & Training","Finance & Banking",
  "Healthcare","IT & Technology","Manufacturing","Media & Entertainment",
  "Real Estate","Retail & E-Commerce","Textile & Apparel",
  "Tourism & Hospitality","Transport & Logistics","Other",
];

const SKILLS_LIST = [
  "Business Development","Digital Marketing","Event Management",
  "Finance & Accounting","Government Liaison","HR & Recruitment",
  "IT & Software","Legal & Compliance","Network Building",
  "Public Relations","Sales & Distribution","Training & Coaching",
];

const INTEREST_AREAS = [
  "Agri-business","Arts & Culture","Community Service","Education",
  "Environment","Healthcare","Social Entrepreneurship","Women Empowerment",
  "Youth Development","Other",
];

const SOCIAL_PLATFORMS = [
  "Facebook","Instagram","LinkedIn","Twitter / X","YouTube","Telegram","WhatsApp Channel","Koo",
];

// ── section wrapper ────────────────────────────────────────────────────────
function Section({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
          <Icon size={16} className="text-indigo-600" />
        </span>
        <div>
          <h3 className="text-[13.5px] font-bold text-gray-900">{title}</h3>
          {subtitle && <p className="text-[11.5px] text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

// ── field primitives ───────────────────────────────────────────────────────
function Label({ children, required }) {
  return (
    <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

const inputCls =
  "w-full h-9 px-3 text-[12.5px] text-gray-800 bg-white border border-gray-200 rounded-lg " +
  "focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition placeholder:text-gray-300";

const selectCls =
  "w-full h-9 px-3 pr-8 text-[12.5px] text-gray-800 bg-white border border-gray-200 rounded-lg " +
  "appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition";

function SelectField({ name, value, onChange, options, placeholder = "Select…" }) {
  return (
    <div className="relative">
      <select name={name} value={value} onChange={onChange} className={selectCls}>
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

function TextareaField({ name, value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      name={name} value={value} onChange={onChange}
      placeholder={placeholder} rows={rows}
      className="w-full px-3 py-2 text-[12.5px] text-gray-800 bg-white border border-gray-200 rounded-lg
        focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition
        placeholder:text-gray-300 resize-none"
    />
  );
}

function RadioGroup({ name, value, onChange, options }) {
  return (
    <div className="flex flex-wrap gap-4">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio" name={name} value={opt}
            checked={value === opt} onChange={onChange}
            className="accent-indigo-600 w-3.5 h-3.5"
          />
          <span className="text-[12.5px] text-gray-700">{opt}</span>
        </label>
      ))}
    </div>
  );
}

function CheckboxGrid({ name, selected, onChange, options }) {
  const toggle = (opt) => {
    const next = selected.includes(opt)
      ? selected.filter((x) => x !== opt)
      : [...selected, opt];
    onChange(name, next);
  };
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox" checked={selected.includes(opt)}
            onChange={() => toggle(opt)}
            className="accent-indigo-600 w-3.5 h-3.5 shrink-0"
          />
          <span className="text-[12px] text-gray-700 group-hover:text-indigo-600 transition-colors">
            {opt}
          </span>
        </label>
      ))}
    </div>
  );
}

function Grid2({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}
function Grid3({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{children}</div>;
}
function Field({ children }) {
  return <div className="flex flex-col">{children}</div>;
}

// ── initial state ──────────────────────────────────────────────────────────
const INIT = {
  fullName: "", dob: "", gender: "", email: "", phone: "", altPhone: "",
  aadhaar: "", pan: "",
  addressLine1: "", addressLine2: "", city: "", district: "", state: "", pincode: "",
  businessName: "", businessType: "", industrySector: "", gstin: "",
  businessRegNo: "", incorporationDate: "", businessEmail: "", businessPhone: "",
  businessAddressLine1: "", businessAddressLine2: "",
  businessCity: "", businessState: "", businessPincode: "",
  annualTurnover: "", noOfEmployees: "", businessDesc: "",
  skills: [], interests: [], otherSkill: "", languagesKnown: "",
  experienceYears: "", educationLevel: "",
  isUdyamiQueen: "", queenCategory: "", womenGroupName: "", womenGroupSize: "",
  womenGroupDesc: "",
  isYouthEntrepreneur: "", youthAge: "", collegeUniversity: "", courseName: "",
  startupName: "", startupStage: "", startupDesc: "",
  website: "", socialPlatforms: [], facebookUrl: "", instagramUrl: "",
  linkedinUrl: "", youtubeUrl: "", telegramChannel: "", whatsappChannel: "",
  monthlyReach: "", contentType: "",
  district_network: "", wardArea: "", membershipType: "", referredBy: "",
  sponsorCpCode: "", reasonToJoin: "", termsAccepted: false,
};

// ── main component ─────────────────────────────────────────────────────────
export default function ChannelPartnerOnboard() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INIT);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleMulti = (name, arr) => setForm((p) => ({ ...p, [name]: arr }));

  const handleDraft = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); alert("Draft saved successfully."); }, 800);
  };

  const handleSubmit = () => {
    if (!form.fullName || !form.phone || !form.email) {
      alert("Please fill required fields: Full Name, Email, Phone.");
      return;
    }
    if (!form.termsAccepted) {
      alert("Please accept the terms & conditions.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      navigate("/super-admin-dashboard/members/channelPartners");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-[15px] font-bold text-gray-900">Channel Partner Onboarding</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">
            Complete all required fields to register a new Channel Partner
          </p>
        </div>

        {/* ── Form Builder shortcut button ── */}
        <button
          onClick={() => navigate("/super-admin-dashboard/form-builder/channelPartner")}
          className="flex items-center gap-2 h-9 px-4 text-[12.5px] font-semibold text-indigo-600
            bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100
            hover:border-indigo-300 transition-colors"
        >
          <Settings size={14} />
          Configure Form
        </button>
      </div>

      {/* Form body */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* ── 1. Personal & Contact ── */}
        <Section icon={User} title="Personal & Contact" subtitle="Primary identity and contact details">
          <div className="space-y-4">
            <Grid3>
              <Field>
                <Label required>Full Name</Label>
                <input name="fullName" value={form.fullName} onChange={handleChange}
                  placeholder="As per Aadhaar" className={inputCls} />
              </Field>
              <Field>
                <Label required>Date of Birth</Label>
                <input type="date" name="dob" value={form.dob} onChange={handleChange} className={inputCls} />
              </Field>
              <Field>
                <Label required>Gender</Label>
                <SelectField name="gender" value={form.gender} onChange={handleChange}
                  options={["Male","Female","Transgender","Prefer not to say"]} />
              </Field>
            </Grid3>
            <Grid2>
              <Field>
                <Label required>Email Address</Label>
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="partner@example.com" className={inputCls} />
              </Field>
              <Field>
                <Label required>Mobile Number</Label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX" className={inputCls} />
              </Field>
              <Field>
                <Label>Alternate Mobile</Label>
                <input type="tel" name="altPhone" value={form.altPhone} onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX" className={inputCls} />
              </Field>
              <Field>
                <Label>Aadhaar Number</Label>
                <input name="aadhaar" value={form.aadhaar} onChange={handleChange}
                  placeholder="XXXX XXXX XXXX" maxLength={14} className={inputCls} />
              </Field>
              <Field>
                <Label>PAN Number</Label>
                <input name="pan" value={form.pan} onChange={handleChange}
                  placeholder="ABCDE1234F" maxLength={10} className={`${inputCls} uppercase`} />
              </Field>
            </Grid2>
            <div className="pt-1">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Residential Address</p>
              <div className="space-y-3">
                <Field>
                  <Label>Address Line 1</Label>
                  <input name="addressLine1" value={form.addressLine1} onChange={handleChange}
                    placeholder="Flat / House No, Street" className={inputCls} />
                </Field>
                <Field>
                  <Label>Address Line 2</Label>
                  <input name="addressLine2" value={form.addressLine2} onChange={handleChange}
                    placeholder="Area / Locality" className={inputCls} />
                </Field>
                <Grid3>
                  <Field>
                    <Label required>City</Label>
                    <input name="city" value={form.city} onChange={handleChange}
                      placeholder="City" className={inputCls} />
                  </Field>
                  <Field>
                    <Label>District</Label>
                    <input name="district" value={form.district} onChange={handleChange}
                      placeholder="District" className={inputCls} />
                  </Field>
                  <Field>
                    <Label required>State</Label>
                    <SelectField name="state" value={form.state} onChange={handleChange} options={STATES} />
                  </Field>
                  <Field>
                    <Label required>Pincode</Label>
                    <input name="pincode" value={form.pincode} onChange={handleChange}
                      placeholder="600001" maxLength={6} className={inputCls} />
                  </Field>
                </Grid3>
              </div>
            </div>
          </div>
        </Section>

        {/* ── 2. Business Information ── */}
        <Section icon={Building2} title="Business Information" subtitle="Details about the partner's business entity">
          <div className="space-y-4">
            <Grid2>
              <Field><Label>Business / Brand Name</Label>
                <input name="businessName" value={form.businessName} onChange={handleChange}
                  placeholder="Business name" className={inputCls} /></Field>
              <Field><Label>Type of Business</Label>
                <SelectField name="businessType" value={form.businessType} onChange={handleChange} options={BUSINESS_TYPES} /></Field>
              <Field><Label>Industry Sector</Label>
                <SelectField name="industrySector" value={form.industrySector} onChange={handleChange} options={INDUSTRY_SECTORS} /></Field>
              <Field><Label>GSTIN</Label>
                <input name="gstin" value={form.gstin} onChange={handleChange}
                  placeholder="22AAAAA0000A1Z5" maxLength={15} className={`${inputCls} uppercase`} /></Field>
              <Field><Label>Business Reg. No.</Label>
                <input name="businessRegNo" value={form.businessRegNo} onChange={handleChange}
                  placeholder="Registration number" className={inputCls} /></Field>
              <Field><Label>Incorporation Date</Label>
                <input type="date" name="incorporationDate" value={form.incorporationDate}
                  onChange={handleChange} className={inputCls} /></Field>
              <Field><Label>Business Email</Label>
                <input type="email" name="businessEmail" value={form.businessEmail} onChange={handleChange}
                  placeholder="info@business.com" className={inputCls} /></Field>
              <Field><Label>Business Phone</Label>
                <input type="tel" name="businessPhone" value={form.businessPhone} onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX" className={inputCls} /></Field>
              <Field><Label>Annual Turnover (₹)</Label>
                <SelectField name="annualTurnover" value={form.annualTurnover} onChange={handleChange}
                  options={["Below 5 Lakh","5–25 Lakh","25–1 Crore","1–10 Crore","Above 10 Crore"]} /></Field>
              <Field><Label>No. of Employees</Label>
                <SelectField name="noOfEmployees" value={form.noOfEmployees} onChange={handleChange}
                  options={["1 (Self)","2–5","6–20","21–50","51–200","200+"]} /></Field>
            </Grid2>
            <div className="pt-1">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Business Address</p>
              <div className="space-y-3">
                <Grid2>
                  <Field><Label>Address Line 1</Label>
                    <input name="businessAddressLine1" value={form.businessAddressLine1} onChange={handleChange}
                      placeholder="Office / Shop No, Street" className={inputCls} /></Field>
                  <Field><Label>Address Line 2</Label>
                    <input name="businessAddressLine2" value={form.businessAddressLine2} onChange={handleChange}
                      placeholder="Area / Locality" className={inputCls} /></Field>
                </Grid2>
                <Grid3>
                  <Field><Label>City</Label>
                    <input name="businessCity" value={form.businessCity} onChange={handleChange}
                      placeholder="City" className={inputCls} /></Field>
                  <Field><Label>State</Label>
                    <SelectField name="businessState" value={form.businessState} onChange={handleChange} options={STATES} /></Field>
                  <Field><Label>Pincode</Label>
                    <input name="businessPincode" value={form.businessPincode} onChange={handleChange}
                      placeholder="600001" maxLength={6} className={inputCls} /></Field>
                </Grid3>
              </div>
            </div>
            <Field><Label>Business Description</Label>
              <TextareaField name="businessDesc" value={form.businessDesc} onChange={handleChange}
                placeholder="Briefly describe the business, products/services offered…" rows={3} /></Field>
          </div>
        </Section>

        {/* ── 3. Skills & Interests ── */}
        <Section icon={Briefcase} title="Skills & Interests" subtitle="Partner's professional skills and area of interest">
          <div className="space-y-5">
            <Field><Label>Skills (select all that apply)</Label>
              <CheckboxGrid name="skills" selected={form.skills} onChange={handleMulti} options={SKILLS_LIST} /></Field>
            <Grid2>
              <Field><Label>Other Skill</Label>
                <input name="otherSkill" value={form.otherSkill} onChange={handleChange}
                  placeholder="Any other skill" className={inputCls} /></Field>
              <Field><Label>Years of Experience</Label>
                <SelectField name="experienceYears" value={form.experienceYears} onChange={handleChange}
                  options={["Less than 1 year","1–3 years","3–5 years","5–10 years","10+ years"]} /></Field>
              <Field><Label>Highest Education</Label>
                <SelectField name="educationLevel" value={form.educationLevel} onChange={handleChange}
                  options={["Below 10th","10th Pass","12th Pass","Diploma","Graduate","Post Graduate","PhD / Doctorate"]} /></Field>
              <Field><Label>Languages Known</Label>
                <input name="languagesKnown" value={form.languagesKnown} onChange={handleChange}
                  placeholder="e.g. Tamil, Hindi, English" className={inputCls} /></Field>
            </Grid2>
            <Field><Label>Areas of Interest</Label>
              <CheckboxGrid name="interests" selected={form.interests} onChange={handleMulti} options={INTEREST_AREAS} /></Field>
          </div>
        </Section>

        {/* ── 4. Udyami Queens ── */}
        <Section icon={Crown} title="Udyami Queens" subtitle="Women entrepreneurship initiative details (if applicable)">
          <div className="space-y-4">
            <Field><Label required>Is this partner part of Udyami Queens?</Label>
              <RadioGroup name="isUdyamiQueen" value={form.isUdyamiQueen} onChange={handleChange} options={["Yes","No"]} /></Field>
            {form.isUdyamiQueen === "Yes" && (
              <div className="space-y-4 pt-1 border-t border-gray-100 mt-2">
                <Grid2>
                  <Field><Label>Queen Category</Label>
                    <SelectField name="queenCategory" value={form.queenCategory} onChange={handleChange}
                      options={["Agri Queen","Artisan Queen","Digital Queen","Finance Queen","Health Queen","Trade Queen"]} /></Field>
                  <Field><Label>Women Group / SHG Name</Label>
                    <input name="womenGroupName" value={form.womenGroupName} onChange={handleChange}
                      placeholder="Self-Help Group name" className={inputCls} /></Field>
                  <Field><Label>Group Size</Label>
                    <input type="number" name="womenGroupSize" value={form.womenGroupSize} onChange={handleChange}
                      placeholder="No. of members" className={inputCls} /></Field>
                </Grid2>
                <Field><Label>Group Description</Label>
                  <TextareaField name="womenGroupDesc" value={form.womenGroupDesc} onChange={handleChange}
                    placeholder="Brief about the women group / SHG activities…" /></Field>
              </div>
            )}
          </div>
        </Section>

        {/* ── 5. Youth Entrepreneur ── */}
        <Section icon={Zap} title="Youth Entrepreneur" subtitle="For partners under 35 with a startup or innovation idea">
          <div className="space-y-4">
            <Field><Label required>Is this partner a Youth Entrepreneur?</Label>
              <RadioGroup name="isYouthEntrepreneur" value={form.isYouthEntrepreneur} onChange={handleChange} options={["Yes","No"]} /></Field>
            {form.isYouthEntrepreneur === "Yes" && (
              <div className="space-y-4 pt-1 border-t border-gray-100 mt-2">
                <Grid3>
                  <Field><Label>Age</Label>
                    <input type="number" name="youthAge" value={form.youthAge} onChange={handleChange}
                      placeholder="Age" min={18} max={35} className={inputCls} /></Field>
                  <Field><Label>College / University</Label>
                    <input name="collegeUniversity" value={form.collegeUniversity} onChange={handleChange}
                      placeholder="Institution name" className={inputCls} /></Field>
                  <Field><Label>Course / Degree</Label>
                    <input name="courseName" value={form.courseName} onChange={handleChange}
                      placeholder="e.g. B.Tech CSE" className={inputCls} /></Field>
                  <Field><Label>Startup Name</Label>
                    <input name="startupName" value={form.startupName} onChange={handleChange}
                      placeholder="Your startup / venture name" className={inputCls} /></Field>
                  <Field><Label>Startup Stage</Label>
                    <SelectField name="startupStage" value={form.startupStage} onChange={handleChange}
                      options={["Idea","Prototype","MVP","Revenue Stage","Scaling"]} /></Field>
                </Grid3>
                <Field><Label>Startup Description</Label>
                  <TextareaField name="startupDesc" value={form.startupDesc} onChange={handleChange}
                    placeholder="Brief about your startup — problem, solution, impact…" /></Field>
              </div>
            )}
          </div>
        </Section>

        {/* ── 6. Digital Presence ── */}
        <Section icon={Globe} title="Digital Presence" subtitle="Online channels and reach details">
          <div className="space-y-4">
            <Grid2>
              <Field><Label>Website / Portfolio URL</Label>
                <input type="url" name="website" value={form.website} onChange={handleChange}
                  placeholder="https://yourwebsite.com" className={inputCls} /></Field>
              <Field><Label>Monthly Reach (approx.)</Label>
                <SelectField name="monthlyReach" value={form.monthlyReach} onChange={handleChange}
                  options={["Below 1,000","1K–10K","10K–1 Lakh","1L–10 Lakh","10 Lakh+"]} /></Field>
              <Field><Label>Primary Content Type</Label>
                <SelectField name="contentType" value={form.contentType} onChange={handleChange}
                  options={["Business / Entrepreneurship","Education","Entertainment","Finance","Health & Wellness",
                    "News & Politics","Spirituality","Technology","Women Empowerment","Other"]} /></Field>
            </Grid2>
            <Field><Label>Active Social Platforms</Label>
              <CheckboxGrid name="socialPlatforms" selected={form.socialPlatforms} onChange={handleMulti} options={SOCIAL_PLATFORMS} /></Field>
            {form.socialPlatforms.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Profile / Channel URLs</p>
                <Grid2>
                  {form.socialPlatforms.includes("Facebook") && (
                    <Field><Label>Facebook URL</Label>
                      <input type="url" name="facebookUrl" value={form.facebookUrl} onChange={handleChange}
                        placeholder="https://facebook.com/…" className={inputCls} /></Field>
                  )}
                  {form.socialPlatforms.includes("Instagram") && (
                    <Field><Label>Instagram URL</Label>
                      <input type="url" name="instagramUrl" value={form.instagramUrl} onChange={handleChange}
                        placeholder="https://instagram.com/…" className={inputCls} /></Field>
                  )}
                  {form.socialPlatforms.includes("LinkedIn") && (
                    <Field><Label>LinkedIn URL</Label>
                      <input type="url" name="linkedinUrl" value={form.linkedinUrl} onChange={handleChange}
                        placeholder="https://linkedin.com/in/…" className={inputCls} /></Field>
                  )}
                  {form.socialPlatforms.includes("YouTube") && (
                    <Field><Label>YouTube Channel URL</Label>
                      <input type="url" name="youtubeUrl" value={form.youtubeUrl} onChange={handleChange}
                        placeholder="https://youtube.com/@…" className={inputCls} /></Field>
                  )}
                  {form.socialPlatforms.includes("Telegram") && (
                    <Field><Label>Telegram Channel Link</Label>
                      <input type="url" name="telegramChannel" value={form.telegramChannel} onChange={handleChange}
                        placeholder="https://t.me/…" className={inputCls} /></Field>
                  )}
                  {form.socialPlatforms.includes("WhatsApp Channel") && (
                    <Field><Label>WhatsApp Channel Link</Label>
                      <input type="url" name="whatsappChannel" value={form.whatsappChannel} onChange={handleChange}
                        placeholder="https://whatsapp.com/channel/…" className={inputCls} /></Field>
                  )}
                </Grid2>
              </div>
            )}
          </div>
        </Section>

        {/* ── 7. Community ── */}
        <Section icon={Users} title="Community" subtitle="Network affiliation and membership details">
          <div className="space-y-4">
            <Grid2>
              <Field><Label>District Network</Label>
                <input name="district_network" value={form.district_network} onChange={handleChange}
                  placeholder="e.g. Chennai South Network" className={inputCls} /></Field>
              <Field><Label>Ward / Area</Label>
                <input name="wardArea" value={form.wardArea} onChange={handleChange}
                  placeholder="Ward name / Area" className={inputCls} /></Field>
              <Field><Label>Membership Type</Label>
                <SelectField name="membershipType" value={form.membershipType} onChange={handleChange}
                  options={["Basic","Silver","Gold","Platinum","Diamond"]} /></Field>
              <Field><Label>Referred By (Name)</Label>
                <input name="referredBy" value={form.referredBy} onChange={handleChange}
                  placeholder="Referrer's full name" className={inputCls} /></Field>
              <Field><Label>Sponsor CP Code</Label>
                <input name="sponsorCpCode" value={form.sponsorCpCode} onChange={handleChange}
                  placeholder="e.g. CP-00123" className={inputCls} /></Field>
            </Grid2>
            <Field><Label>Reason to Join Udyami Bharat</Label>
              <TextareaField name="reasonToJoin" value={form.reasonToJoin} onChange={handleChange}
                placeholder="Why do you want to become a Channel Partner? What value do you bring?…" rows={3} /></Field>
            <div className="flex items-start gap-3 pt-2 border-t border-gray-100">
              <input type="checkbox" id="terms" name="termsAccepted"
                checked={form.termsAccepted} onChange={handleChange}
                className="accent-indigo-600 w-4 h-4 mt-0.5 shrink-0 cursor-pointer" />
              <label htmlFor="terms" className="text-[12px] text-gray-600 leading-relaxed cursor-pointer">
                I confirm that all information provided is accurate and I agree to the{" "}
                <span className="text-indigo-600 font-semibold">Terms & Conditions</span> and{" "}
                <span className="text-indigo-600 font-semibold">Privacy Policy</span> of Udyami Bharat.
              </label>
            </div>
          </div>
        </Section>

        {/* ── Action bar ── */}
        <div className="flex items-center justify-between gap-3 pb-8">
          <p className="text-[11.5px] text-gray-400">
            Fields marked <span className="text-red-500 font-bold">*</span> are required
          </p>
          <div className="flex items-center gap-3">
            <button onClick={handleDraft} disabled={saving}
              className="flex items-center gap-2 h-9 px-5 text-[12.5px] font-semibold text-gray-700
                bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-60 transition-colors">
              <Save size={14} />
              {saving ? "Saving…" : "Save Draft"}
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className="flex items-center gap-2 h-9 px-6 text-[12.5px] font-semibold text-white
                bg-indigo-600 rounded-lg hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60 transition-all">
              <Send size={14} />
              {submitting ? "Submitting…" : "Submit"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}