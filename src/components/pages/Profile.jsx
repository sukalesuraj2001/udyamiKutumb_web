import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "../redux/slices/profileSlice.js";
import PersonalInfoCard from "./profile/PersonalInfoCard.jsx";
import BusinessInfoCard from "./profile/BusinessInfoCard.jsx";
import EditProfileModal from "./profile/EditProfileModal.jsx";
import { Pencil, Share2, UserCircle2, ExternalLink } from "lucide-react";

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

  const { user, profile: profileDetails } = profile;
  const initials = getInitials(user?.name);
  const isActive = user?.isActive;

  return (
    <div className=" mx-auto">

      {/* ── Hero banner ── */}
      <div className="relative rounded-t-2xl overflow-hidden h-[90px]"
        style={{ background: "linear-gradient(135deg, #1a3a6e 0%, #2563eb 60%, #60a5fa 100%)" }}>
        <button
          onClick={() => setShowEdit(true)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center text-white"
        >
          <Pencil size={13} />
        </button>
      </div>

      {/* ── Profile card ── */}
      <div className="bg-white border border-t-0 border-[#E2E8F0] rounded-b-2xl px-5 pb-5 mb-4">
        <div className="flex items-end justify-between mt-[-28px] mb-3">

          {/* Avatar */}
          <div className="relative w-[56px] h-[56px] rounded-full bg-[#1e40af] border-[3px] border-white flex items-center justify-center shrink-0">
            {initials ? (
              <span className="text-[18px] font-semibold text-blue-200 leading-none">{initials}</span>
            ) : (
              <UserCircle2 size={28} className="text-blue-200" />
            )}
            {/* PRO badge */}
            <span className="absolute -bottom-1 -right-1 bg-[#7c3aed] text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full border-2 border-white leading-none">
              PRO
            </span>
          </div>

          {/* Action buttons */}
          {/* <div className="flex gap-2 pb-1">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-[12px] text-slate-600 hover:bg-slate-50 transition">
              <Share2 size={12} /> Share
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a56db] text-white text-[12px] font-medium hover:bg-[#1547c0] transition">
              <ExternalLink size={12} /> View profile
            </button>
          </div> */}
        </div>

        {/* Name + email */}
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-[16px] font-semibold text-[#1a2b4a]">{user?.name || "—"}</h1>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#ede9fe] text-[#5b21b6]">
            ✦ Pro
          </span>
        </div>
        <p className="text-[12px] text-slate-400 mb-3">{user?.email || "No email on file"}</p>

        {/* Pills */}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#ECFDF5] text-[#065F46]">
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-[#10B981]" : "bg-[#EF4444]"}`} />
            {isActive ? "Active" : "Inactive"}
          </span>
          {user?.createdAt && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-100">
              📅 Member since {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
            </span>
          )}
          {profileDetails?.state && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-100">
              📍 {profileDetails.state}
            </span>
          )}
        </div>
      </div>

      {/* ── Info cards ── */}
      <div className="flex flex-col gap-4">
        <PersonalInfoCard user={user} profileDetails={profileDetails} />
        <BusinessInfoCard
          hasBusiness={profileDetails?.hasBusiness}
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