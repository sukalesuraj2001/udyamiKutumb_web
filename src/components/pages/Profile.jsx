import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "../redux/slices/profileSlice.js";
import PersonalInfoCard from "./profile/PersonalInfoCard.jsx";
import FamilyInfoCard from "./profile/FamilyInfoCard.jsx";
import BusinessInfoCard from "./profile/BusinessInfoCard.jsx";
import EditProfileModal from "./profile/EditProfileModal.jsx";
import { Pencil, UserCircle2, CheckCircle2, XCircle, Award, BadgeCheck } from "lucide-react";

function getInitials(name = "") {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

export default function Profile() {
  const dispatch = useDispatch();
  const { profile, loading, error } = useSelector((s) => s.profile);
  const { user: authUser } = useSelector((s) => s.auth);

  const userId = authUser?.userId || authUser?._id || authUser?.id || localStorage.getItem("userId");
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    if (userId) dispatch(fetchProfile(userId));
  }, [userId]);

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400 text-sm">
        Loading profile…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-red-500 text-sm">
        {error}
      </div>
    );
  }

  if (!profile) return null;

  const user = profile.user || {};
  const profileDetails = profile.profile || {};
  const initials = getInitials(user?.name);
  const isActive = user?.isActive;

  const profileImg = profileDetails?.profileImage || user?.profileImage;
  const avatarUrl = typeof profileImg === "string" ? profileImg : profileImg?.image || profileImg?.url;

  // Membership badges
  const isPrime = user?.isPrime;
  const isPatron = user?.isPatron;
  const isBasic = user?.isBasic;
  const isTrial = user?.isTrial;
  const isDigital = user?.isDigital;

  // Location string
  const locationParts = [profileDetails?.ward, profileDetails?.district, profileDetails?.state].filter(Boolean);
  const locationStr = locationParts.join(", ");

  return (
    <div className="mx-auto pb-10">

      {/* ── Hero banner ── */}
      <div
        className="relative rounded-t-2xl overflow-hidden h-[100px]"
        style={{ background: "linear-gradient(135deg, #1a3a6e 0%, #2563eb 60%, #60a5fa 100%)" }}
      >
        <button
          onClick={() => setShowEdit(true)}
          className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-xs transition flex items-center gap-1.5 text-white text-[12px] font-medium shadow-xs"
        >
          <Pencil size={13} />
          Edit Profile
        </button>
      </div>

      {/* ── Profile Header Card ── */}
      <div className="bg-white border border-t-0 border-[#E2E8F0] rounded-b-2xl px-5 pb-5 mb-5 shadow-2xs">
        <div className="flex items-end justify-between mt-[-32px] mb-3">

          {/* Avatar */}
          <div className="relative w-[68px] h-[68px] rounded-full bg-[#1e40af] border-[4px] border-white flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt={user?.name || "User"} className="w-full h-full object-cover" />
            ) : initials ? (
              <span className="text-[20px] font-bold text-blue-100 leading-none">{initials}</span>
            ) : (
              <UserCircle2 size={32} className="text-blue-200" />
            )}
          </div>
        </div>

        {/* Name + Username */}
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <h1 className="text-[18px] font-bold text-[#1a2b4a]">{user?.name || "—"}</h1>
          {user?.username && (
            <span className="text-[13px] text-slate-400 font-medium">@{user.username}</span>
          )}
        </div>
        <p className="text-[12.5px] text-slate-500 mb-3">{user?.email || "No email on file"}</p>

        {/* Badges / Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Active status */}
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${isActive ? "bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]" : "bg-red-50 text-red-700 border border-red-200"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-[#10B981]" : "bg-[#EF4444]"}`} />
            {isActive ? "Active Account" : "Inactive Account"}
          </span>

          {/* Membership tier */}
          {isPrime && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              <Award size={12} /> Prime Member
            </span>
          )}
          {isPatron && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
              <BadgeCheck size={12} /> Patron Member
            </span>
          )}
          {isDigital && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              ✦ Digital Member
            </span>
          )}
          {isTrial && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Trial Mode
            </span>
          )}
          {isBasic && !isPrime && !isPatron && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Basic Member
            </span>
          )}

          {/* Member ID / CP ID */}
          {user?.memberId && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Member ID: {user.memberId}
            </span>
          )}
          {user?.cpId && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              CP ID: {user.cpId}
            </span>
          )}

          {/* Assignment status */}
          {(user?.isAssigned !== undefined || profileDetails?.isAssigned !== undefined) && (
            <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full ${(user?.isAssigned || profileDetails?.isAssigned) ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-50 text-slate-500 border border-slate-200"}`}>
              {(user?.isAssigned || profileDetails?.isAssigned) ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
              {(user?.isAssigned || profileDetails?.isAssigned) ? "Assigned" : "Unassigned"}
            </span>
          )}

          {/* Location */}
          {locationStr && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-600 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 font-medium">
              📍 {locationStr}
            </span>
          )}

          {/* Joined date */}
          {user?.createdAt && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200">
              📅 Joined {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          )}
        </div>
      </div>

      {/* ── Info Cards Grid ── */}
      <div className="flex flex-col gap-5">
        <PersonalInfoCard user={user} profileDetails={profileDetails} />
        <FamilyInfoCard profileDetails={profileDetails} />
        <BusinessInfoCard
          hasBusiness={profileDetails?.hasBusiness || user?.hasBusiness}
          businessDetails={profileDetails?.businessDetails}
        />
      </div>

      {showEdit && (
        <EditProfileModal
          profile={profile}
          userId={userId}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  );
}