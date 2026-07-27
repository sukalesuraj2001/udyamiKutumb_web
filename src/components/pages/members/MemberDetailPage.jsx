import React, { useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  User,
  Calendar,
  Building,
  Globe,
  Users,
  Award,
  Heart,
  Star,
  Clock,
  Link,
  Edit,
  Camera,
  Smartphone,
  Download,
  Video,
  Printer,
  Share2,
  CheckCircle,
  MessageCircle,
  UserCheck,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { INITIAL_MEMBERS } from "./Udyamidatabaseupdated.jsx";


const STAGE_CLASS = {
  Idea: "bg-blue-50 text-blue-700 border-blue-200",
  Startup: "bg-purple-50 text-purple-700 border-purple-200",
  Growing: "bg-amber-50 text-amber-700 border-amber-200",
  Established: "bg-green-50 text-green-700 border-green-200",
};

const STATUS_CLASS = {
  Active: "bg-green-50 text-green-700 border-green-200",
  Prospect: "bg-blue-50 text-blue-700 border-blue-200",
  Inactive: "bg-gray-50 text-gray-700 border-gray-200",
  "At Risk": "bg-red-50 text-red-700 border-red-200",
  Suspended: "bg-red-50 text-red-700 border-red-200",
};

// Map platform names to icons
const PlatformIcon = ({ platform }) => {
  const iconMap = {
    "Facebook": <Share2 size={14} />,
    "Instagram": <Camera size={14} />,
    "LinkedIn": <Briefcase size={14} />,
    "Twitter/X": <MessageCircle size={14} />,
    "YouTube": <Video size={14} />,
    "WhatsApp": <MessageCircle size={14} />,
  };
  return iconMap[platform] || <Globe size={14} />;
};

/**
 * @param {function} onSuspend - (member) => void, toggles member.status between "Active" and "Suspended".
 *   The header shows an "Activate" button ONLY when the member is currently suspended.
 */
export default function MemberDetailPage() {
    const [activeTab, setActiveTab] = useState("overview");

    const navigate = useNavigate();
    const { id } = useParams();

    const member = INITIAL_MEMBERS.find(
        m => m.id === id
    );

    if (!member) {
        return (
            <div className="flex items-center justify-center h-64">
                Member not found
            </div>
        );
    }

    const onBack = () => {
        navigate("/admin-dashboard/members");
    };




  const isSuspended = member.status === "Suspended";

  const InfoCard = ({ icon: Icon, label, value, className = "" }) => (
    <div className={`flex items-start gap-3 p-3 rounded-xl border border-hairline bg-white/50 ${className}`}>
      <Icon size={18} className="text-amber shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-[10.5px] font-medium uppercase tracking-wide text-muted">{label}</p>
        <p className="text-[14px] font-medium text-ink break-words">{value || "—"}</p>
      </div>
    </div>
  );

  const Tag = ({ label, className = "" }) => (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border ${className}`}>
      {label}
    </span>
  );

  const Section = ({ title, children }) => (
    <div className="mb-6">
      <h3 className="text-[13px] font-semibold text-muted uppercase tracking-wide mb-3 flex items-center gap-2">
        <span className="w-6 h-0.5 bg-amber/30 rounded-full" />
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {children}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted hover:text-ink transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-[13.5px] font-medium">Back to Database</span>
        </button>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-xl border border-hairline text-muted hover:text-ink hover:bg-ink/5 transition-colors">
            <Printer size={16} />
          </button>
          <button className="p-2 rounded-xl border border-hairline text-muted hover:text-ink hover:bg-ink/5 transition-colors">
            <Share2 size={16} />
          </button>
          {/* Only shown while suspended — the way back to Active */}
          {isSuspended && (
            <button
              onClick={() => onSuspend?.(member)}
              className="flex items-center gap-2 px-4 py-2 bg-forest text-white rounded-xl hover:bg-forest/90 transition-colors text-[13px] font-semibold"
            >
              <UserCheck size={15} /> Activate
            </button>
          )}
          <button
            onClick={() => onEdit(member)}
            className="flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-xl hover:bg-ink/90 transition-colors text-[13px] font-semibold"
          >
            <Edit size={15} /> Edit
          </button>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-hairline p-6 md:p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber/20 to-amber/10 flex items-center justify-center">
              <span className="text-3xl font-semibold text-ink">
                {member.initials || member.name?.slice(0, 2).toUpperCase()}
              </span>
            </div>
            {/* Red when suspended, green otherwise */}
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${isSuspended ? "bg-red-500" : "bg-green-500"}`} />
          </div>

          {/* Name & ID */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-[26px] font-semibold text-ink">{member.name}</h1>
              <span className="text-[11px] font-mono border border-hairline text-muted px-2.5 py-1 rounded-lg bg-gray-50">
                {member.udyamiId}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[13px] text-muted">
              <span className="flex items-center gap-1">
                <MapPin size={14} /> {member.ward || "—"}, {member.state || "—"}
              </span>
              <span className="w-1 h-1 rounded-full bg-hairline" />
              <span className="flex items-center gap-1">
                <Briefcase size={14} /> {member.business || "No business listed"}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {member.tag && <Tag label={member.tag} className="bg-blue-50 text-blue-700 border-blue-200" />}
              {member.stage && (
                <Tag
                  label={member.stage}
                  className={STAGE_CLASS[member.stage] || "bg-gray-50 text-gray-700 border-gray-200"}
                />
              )}
              {member.plan && (
                <Tag
                  label={member.plan}
                  className={member.plan === "Premium" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-gray-50 text-gray-700 border-gray-200"}
                />
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-hairline rounded-xl hover:bg-ink/5 transition-colors text-[12.5px] font-medium">
              <Download size={15} /> Export
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-hairline mb-6">
        {["overview", "business", "skills", "digital", "community"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${activeTab === tab
              ? "border-ink text-ink"
              : "border-transparent text-muted hover:text-ink"
              }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <>
              <Section title="Personal Information">
                <InfoCard icon={User} label="Full Name" value={member.name} />
                <InfoCard icon={Calendar} label="Date of Birth" value={member.dob || "—"} />
                <InfoCard icon={User} label="Gender" value={member.gender || "—"} />
                <InfoCard icon={User} label="Marital Status" value={member.maritalStatus || "—"} />
                <InfoCard icon={Award} label="Education" value={member.education || "—"} />
                <InfoCard icon={Heart} label="Blood Group" value={member.bloodGroup || "—"} />
              </Section>

              <Section title="Contact Details">
                <InfoCard icon={Phone} label="Primary Mobile" value={member.phone} />
                <InfoCard icon={Phone} label="WhatsApp" value={member.whatsappNumber || "—"} />
                <InfoCard icon={Mail} label="Email" value={member.email || "—"} />
                <InfoCard icon={MessageCircle} label="Preferred Channel" value={member.preferredChannel || "—"} />
                <InfoCard icon={Globe} label="Preferred Language" value={member.preferredLanguage || "—"} />
              </Section>

              <Section title="Address">
                <InfoCard icon={MapPin} label="Current Address" value={member.currentAddress || "—"} />
                <InfoCard icon={MapPin} label="Permanent Address" value={member.permanentAddress || "—"} />
                <InfoCard icon={MapPin} label="Ward" value={member.ward || "—"} />
                <InfoCard icon={MapPin} label="State" value={member.state || "—"} />
                <InfoCard icon={MapPin} label="Pincode" value={member.pincode || "—"} />
              </Section>

              <Section title="Emergency Contact">
                <InfoCard icon={User} label="Emergency Contact" value={member.emergencyContactName || "—"} />
                <InfoCard icon={Phone} label="Emergency Phone" value={member.emergencyPhone || "—"} />
                <InfoCard icon={Users} label="Relationship" value={member.emergencyRelationship || "—"} />
              </Section>
            </>
          )}

          {/* Business Tab */}
          {activeTab === "business" && (
            <>
              <Section title="Business Information">
                <InfoCard icon={Briefcase} label="Business Name" value={member.business || "—"} />
                <InfoCard icon={Building} label="Business Type" value={member.businessType || "—"} />
                <InfoCard icon={Globe} label="Industry Sector" value={member.sector || "—"} />
                <InfoCard icon={Award} label="Sub-category" value={member.subCategory || "—"} />
                <InfoCard icon={Star} label="Business Stage" value={member.stage || "—"} />
                <InfoCard icon={Calendar} label="Year Established" value={member.yearEstablished || "—"} />
              </Section>

              <Section title="Financial & Operations">
                <InfoCard icon={Briefcase} label="Annual Turnover" value={member.annualTurnover || "—"} />
                <InfoCard icon={Users} label="No. of Employees" value={member.employeeCount || "—"} />
                <InfoCard icon={CheckCircle} label="GST Registration" value={member.gstRegistration || "—"} />
                <InfoCard icon={CheckCircle} label="GST Number" value={member.gstNumber || "—"} />
                <InfoCard icon={CheckCircle} label="MSME Registration" value={member.msmeRegistration || "—"} />
              </Section>

              <Section title="Market & Sales">
                <InfoCard icon={Users} label="Target Customer" value={member.targetCustomer || "—"} />
                <InfoCard icon={Globe} label="Geographic Markets" value={member.geographicMarkets || "—"} />
                <InfoCard icon={Link} label="Sales Channels" value={member.salesChannels || "—"} />
                <InfoCard icon={Link} label="Sells Online?" value={member.sellsOnline || "—"} />
                <InfoCard icon={Link} label="Business Website" value={member.businessWebsite || "—"} />
              </Section>

              <Section title="Products & Services">
                <div className="col-span-2">
                  <div className="p-3 rounded-xl border border-hairline bg-white/50">
                    <p className="text-[10.5px] font-medium uppercase tracking-wide text-muted">Primary Products/Services</p>
                    <p className="text-[14px] font-medium text-ink mt-1">{member.primaryProducts || "—"}</p>
                  </div>
                </div>
              </Section>
            </>
          )}

          {/* Skills Tab */}
          {activeTab === "skills" && (
            <>
              <Section title="Skills & Expertise">
                <div className="col-span-2">
                  <div className="p-3 rounded-xl border border-hairline bg-white/50">
                    <p className="text-[10.5px] font-medium uppercase tracking-wide text-muted">Professional Skills</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {member.professionalSkills?.length > 0 ? (
                        member.professionalSkills.map((skill) => (
                          <span key={skill} className="px-3 py-1 bg-amber/10 text-amber text-[12px] font-medium rounded-full">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-[13px] text-muted">No skills listed</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-span-2 mt-2">
                  <div className="p-3 rounded-xl border border-hairline bg-white/50">
                    <p className="text-[10.5px] font-medium uppercase tracking-wide text-muted">Interests</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {member.interests?.length > 0 ? (
                        member.interests.map((interest) => (
                          <span key={interest} className="px-3 py-1 bg-blue-50 text-blue-700 text-[12px] font-medium rounded-full">
                            {interest}
                          </span>
                        ))
                      ) : (
                        <p className="text-[13px] text-muted">No interests listed</p>
                      )}
                    </div>
                  </div>
                </div>
              </Section>

              <Section title="Additional Info">
                <InfoCard icon={Award} label="Field of Study" value={member.fieldOfStudy || "—"} />
                <InfoCard icon={Award} label="Certifications" value={member.certifications || "—"} />
                <InfoCard icon={Star} label="Skill Proficiency" value={member.skillProficiency || "—"} />
                <InfoCard icon={Calendar} label="Years of Experience" value={member.yearsExperience || "—"} />
              </Section>
            </>
          )}

          {/* Digital Tab */}
          {activeTab === "digital" && (
            <>
              <Section title="Social Media">
                <div className="col-span-2">
                  <div className="p-3 rounded-xl border border-hairline bg-white/50">
                    <p className="text-[10.5px] font-medium uppercase tracking-wide text-muted">Platforms Used</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {member.socialPlatforms?.length > 0 ? (
                        member.socialPlatforms.map((platform) => (
                          <span key={platform} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-hairline rounded-lg text-[12px] font-medium">
                            <PlatformIcon platform={platform} />
                            {platform}
                          </span>
                        ))
                      ) : (
                        <p className="text-[13px] text-muted">No platforms listed</p>
                      )}
                    </div>
                  </div>
                </div>
              </Section>

              <Section title="Digital Presence">
                <InfoCard icon={Globe} label="Primary Platform" value={member.primaryPlatform || "—"} />
                <InfoCard icon={Clock} label="Daily Usage" value={member.dailyUsage || "—"} />
                <InfoCard icon={Users} label="Followers" value={member.followers || "—"} />
                <InfoCard icon={Clock} label="Post Frequency" value={member.postFrequency || "—"} />
                <InfoCard icon={CheckCircle} label="WhatsApp Business?" value={member.whatsappBusiness || "—"} />
                <InfoCard icon={CheckCircle} label="FB/Insta Page?" value={member.fbInstaPage || "—"} />
                <InfoCard icon={CheckCircle} label="Google My Business?" value={member.googleMyBusiness || "—"} />
                <InfoCard icon={Smartphone} label="Smartphone Comfort" value={member.smartphoneComfort || "—"} />
              </Section>
            </>
          )}

          {/* Community Tab */}
          {activeTab === "community" && (
            <>
              <Section title="How Heard & Referrals">
                <InfoCard icon={Users} label="How Heard About Us" value={member.howHeardAboutUs || "—"} />
                <InfoCard icon={User} label="Referrer Name" value={member.referrerName || "—"} />
                <InfoCard icon={User} label="Referrer Udyami ID" value={member.referrerUdyamiId || "—"} />
                <InfoCard icon={CheckCircle} label="Existing Association?" value={member.existingAssociation || "—"} />
                <InfoCard icon={Users} label="Attends Networking?" value={member.attendsNetworking || "—"} />
                <InfoCard icon={Users} label="Known Businesses" value={member.knownBusinesses || "—"} />
              </Section>

              <Section title="Community Engagement">
                <div className="col-span-2">
                  <div className="p-3 rounded-xl border border-hairline bg-white/50">
                    <p className="text-[10.5px] font-medium uppercase tracking-wide text-muted">Biggest Opportunity in Your Area</p>
                    <p className="text-[14px] font-medium text-ink mt-1">{member.biggestOpportunity || "—"}</p>
                  </div>
                </div>
                <div className="col-span-2 mt-2">
                  <div className="p-3 rounded-xl border border-hairline bg-white/50">
                    <p className="text-[10.5px] font-medium uppercase tracking-wide text-muted">Unserved Business Needs</p>
                    <p className="text-[14px] font-medium text-ink mt-1">{member.unservedBusinessNeeds || "—"}</p>
                  </div>
                </div>
                <InfoCard icon={CheckCircle} label="Willing to Refer?" value={member.willingToRefer || "—"} />
                <InfoCard icon={CheckCircle} label="Can Host Meeting?" value={member.canHostMeeting || "—"} />
                <InfoCard icon={CheckCircle} label="Aware of Gov Schemes?" value={member.awareOfGovSchemes || "—"} />
              </Section>

              <Section title="Infrastructure Challenges">
                <div className="col-span-2">
                  <div className="p-3 rounded-xl border border-hairline bg-white/50">
                    <p className="text-[10.5px] font-medium uppercase tracking-wide text-muted">Challenges</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {member.infrastructureChallenges?.length > 0 ? (
                        member.infrastructureChallenges.map((challenge) => (
                          <span key={challenge} className="px-3 py-1 bg-red-50 text-red-700 text-[12px] font-medium rounded-full">
                            {challenge}
                          </span>
                        ))
                      ) : (
                        <p className="text-[13px] text-muted">No challenges listed</p>
                      )}
                    </div>
                  </div>
                </div>
              </Section>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="bg-white rounded-2xl border border-hairline p-5">
            <h4 className="text-[12px] font-semibold uppercase tracking-wide text-muted mb-4">Quick Stats</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-hairline">
                <span className="text-[13px] text-muted">Member Since</span>
                <span className="text-[13px] font-medium text-ink">{member.createdAt || "—"}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-hairline">
                <span className="text-[13px] text-muted">Last Updated</span>
                <span className="text-[13px] font-medium text-ink">{member.updatedAt || "—"}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-hairline">
                <span className="text-[13px] text-muted">Status</span>
                <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${STATUS_CLASS[member.status] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
                  {member.status || "Active"}
                </span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {(member.tags?.length > 0 || member.tag) && (
            <div className="bg-white rounded-2xl border border-hairline p-5">
              <h4 className="text-[12px] font-semibold uppercase tracking-wide text-muted mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {member.tags?.map((tag) => (
                  <span key={tag} className="px-3 py-1.5 bg-gray-50 border border-hairline rounded-lg text-[12px] font-medium">
                    {tag}
                  </span>
                ))}
                {member.tag && !member.tags?.includes(member.tag) && (
                  <span className="px-3 py-1.5 bg-gray-50 border border-hairline rounded-lg text-[12px] font-medium">
                    {member.tag}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Languages */}
          {member.languagesKnown?.length > 0 && (
            <div className="bg-white rounded-2xl border border-hairline p-5">
              <h4 className="text-[12px] font-semibold uppercase tracking-wide text-muted mb-3">Languages</h4>
              <div className="flex flex-wrap gap-2">
                {member.languagesKnown.map((lang) => (
                  <span key={lang} className="px-3 py-1.5 bg-amber/5 border border-amber/20 rounded-lg text-[12px] font-medium text-amber">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Government ID */}
          {(member.govtIdType || member.govtIdNumber) && (
            <div className="bg-white rounded-2xl border border-hairline p-5">
              <h4 className="text-[12px] font-semibold uppercase tracking-wide text-muted mb-3">Government ID</h4>
              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-hairline">
                  <span className="text-[12.5px] text-muted">Type</span>
                  <span className="text-[12.5px] font-medium text-ink">{member.govtIdType || "—"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[12.5px] text-muted">Number</span>
                  <span className="text-[12.5px] font-medium text-ink">{member.govtIdNumber || "—"}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}