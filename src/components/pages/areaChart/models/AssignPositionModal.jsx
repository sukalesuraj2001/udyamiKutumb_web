import React, { useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { X, Search, Upload, ZoomIn, Loader2, Building2, Phone, Mail, MapPin, BadgeCheck } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectAreaChartStatus,
  searchMembers,
  selectSearchResults,
  selectSearchStatus,
} from "../../../redux/slices/Areachartslice.js";
import getCroppedImg from "../../../utils/cropImage.js";

const isValidMobile = (mobile) => /^[6-9]\d{9}$/.test(mobile);

// ── Avatar helper ─────────────────────────────────────────────────
function Avatar({ src, name, size = 44 }) {
  const initials = (name || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size }}
        className="rounded-full object-cover shrink-0 border border-hairline"
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      className="rounded-full bg-amber/20 text-amber flex items-center justify-center font-semibold shrink-0"
    >
      {initials}
    </div>
  );
}

// ── Role badge ────────────────────────────────────────────────────
function RoleBadge({ role }) {
  const label = role?.role ?? role?.roleName ?? "Member";
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber/10 text-amber text-[11px] font-semibold">
      <BadgeCheck size={11} />
      {label.replace(/_/g, " ")}
    </span>
  );
}

// ── Member card ───────────────────────────────────────────────────
function MemberCard({ member, selected, onSelect }) {
  const role = member.userRoles?.[0]?.role;
  const photo = member.profile?.profileImage ?? null;

  return (
    <button
      onClick={() => onSelect(member)}
      className={`w-full text-left px-4 py-3.5 rounded-2xl border transition-all duration-150 ${
        selected
          ? "border-amber bg-amber/5 shadow-sm"
          : "border-hairline hover:border-amber/40 hover:bg-ink/[.02]"
      }`}
    >
      <div className="flex items-start gap-3">
        <Avatar src={photo} name={member.name} />

        <div className="min-w-0 flex-1 space-y-1">
          {/* Name + badge row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13.5px] font-semibold text-ink truncate">
              {member.name}
            </span>
            {role && <RoleBadge role={role} />}
            {member.isPrime && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-600 text-[10px] font-semibold">
                Prime
              </span>
            )}
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
            {member.email && (
              <span className="flex items-center gap-1 text-[11.5px] text-muted">
                <Mail size={10} className="shrink-0" />
                {member.email}
              </span>
            )}
            {member.mobileNumber && (
              <span className="flex items-center gap-1 text-[11.5px] text-muted">
                <Phone size={10} className="shrink-0" />
                {member.mobileNumber}
              </span>
            )}
          </div>

          {/* Location + business */}
          {(member.businessLocation || member.profile?.district) && (
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
              {member.businessLocation && (
                <span className="flex items-center gap-1 text-[11.5px] text-muted">
                  <MapPin size={10} className="shrink-0" />
                  {member.businessLocation}
                </span>
              )}
              {member.profile?.businessDetails?.businessName && (
                <span className="flex items-center gap-1 text-[11.5px] text-muted">
                  <Building2 size={10} className="shrink-0" />
                  {member.profile.businessDetails.businessName}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

// ── Main Modal ────────────────────────────────────────────────────
export default function AssignPositionModal({ position, wardName, onClose, onAssign }) {
  const dispatch = useDispatch();

  const apiStatus = useSelector(selectAreaChartStatus);
  const searchResults = useSelector(selectSearchResults);
  const searchStatus = useSelector(selectSearchStatus);
  const isSaving = apiStatus === "loading";
  const isSearching = searchStatus === "loading";

  const [tab, setTab] = useState("invite");

  // Existing member search
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const debounceRef = useRef(null);

  // Invite form
  const [photoFile, setPhotoFile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    mobileNumber: "",
    email: "",
    company: "",
  });

  // Crop
  const [rawImage, setRawImage] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // ── Debounced search ──
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (search.trim().length < 2) return;

    debounceRef.current = setTimeout(() => {
      dispatch(searchMembers(search.trim()));
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [search, dispatch]);

  // Cleanup blob URL
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const handleField = (key) => (e) => {
    let value = e.target.value;
    if (key === "mobileNumber") value = value.replace(/\D/g, "").slice(0, 10);
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleAssignExisting = () => {
    if (!selectedMember || isSaving) return;
    const p = selectedMember.profile ?? {};
    onAssign({
      name: selectedMember.name,
      company: p.businessDetails?.businessName ?? "",
      photoUrl: p.profileImage ?? null,
      memberId: selectedMember.userId,
      mobileNumber: selectedMember.mobileNumber,
      alternatePhone: p.alternateMobile,
      email: selectedMember.email,
      location: selectedMember.businessLocation ?? wardName,
      district: p.district ?? "",
      state: p.state ?? "",
      status: "Active",
    });
  };

  const handleAssignInvite = (sendInvite) => {
    if (!form.name.trim()) return alert("Name is required");
    if (!isValidMobile(form.mobileNumber))
      return alert("Valid 10-digit mobile number kudu");
    if (isSaving) return;

    onAssign({
      ...form,
      photoUrl: photoPreview,
      photoFile,
      status: sendInvite ? "invited" : "registered",
    });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRawImage(reader.result);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCropComplete = (_, pixels) => setCroppedAreaPixels(pixels);

  const handleSaveCrop = async () => {
    if (!rawImage || !croppedAreaPixels) return;
    const file = await getCroppedImg(rawImage, croppedAreaPixels);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setCropModalOpen(false);
    setRawImage(null);
  };

  const handleCancelCrop = () => {
    setCropModalOpen(false);
    setRawImage(null);
  };

  // ── Get all members ──
  const handleGetAll = () => {
    setSearch("");
    setSelectedMember(null);
    dispatch(searchMembers(""));   // empty name → returns all
  };

  // ── Empty state helper ──
  const renderSearchEmpty = () => {
    if (isSearching)
      return (
        <div className="flex items-center justify-center gap-2 py-8 text-muted">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-[13px]">Loading…</span>
        </div>
      );
    if (search.trim().length > 0 && search.trim().length < 2)
      return (
        <p className="text-[13px] text-muted text-center py-8">
          2 characters type pannu to search
        </p>
      );
    if (searchResults.length === 0 && search.trim().length >= 2)
      return (
        <p className="text-[13px] text-muted text-center py-8">
          No members found for "{search}"
        </p>
      );
    if (searchResults.length === 0)
      return (
        <p className="text-[13px] text-muted text-center py-8">
          Search pannalum, "Get All" button press pannalum
        </p>
      );
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-1">
          <h2 className="font-display text-[20px] text-ink">
            Assign Position: {position}
          </h2>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X size={18} />
          </button>
        </div>
        <p className="text-[13px] text-muted mb-6">Ward: {wardName}</p>

        {/* Tabs */}
        <div className="inline-flex w-full rounded-xl border border-hairline bg-paper p-1 mb-6">
          <button
            onClick={() => setTab("existing")}
            className={`flex-1 px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-colors ${
              tab === "existing" ? "bg-white text-ink shadow-sm" : "text-muted"
            }`}
          >
            Existing Member
          </button>
          <button
            onClick={() => setTab("invite")}
            className={`flex-1 px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-colors ${
              tab === "invite" ? "bg-white text-ink shadow-sm" : "text-muted"
            }`}
          >
            Invite New
          </button>
        </div>

        {/* ── EXISTING TAB ── */}
        {tab === "existing" ? (
          <div className="space-y-4">
            {/* Search input */}
            <div className="flex items-center gap-2 border border-hairline rounded-xl px-3.5 py-2.5">
              {isSearching ? (
                <Loader2 size={16} className="text-muted shrink-0 animate-spin" />
              ) : (
                <Search size={16} className="text-muted shrink-0" />
              )}
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedMember(null);
                }}
                placeholder="Name, mobile or email…"
                className="w-full text-[13.5px] text-ink placeholder:text-muted focus:outline-none"
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedMember(null);
                  }}
                  className="text-muted hover:text-ink"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Results list */}
            <div className="space-y-2 max-h-[calc(100vh-340px)] overflow-y-auto pr-0.5">
              {renderSearchEmpty() ??
                searchResults.map((m) => (
                  <MemberCard
                    key={m.userId}
                    member={m}
                    selected={selectedMember?.userId === m.userId}
                    onSelect={setSelectedMember}
                  />
                ))}
            </div>

            {/* Selected preview strip */}
            {selectedMember && (
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-amber/5 border border-amber/20">
                <Avatar
                  src={selectedMember.profile?.profileImage}
                  name={selectedMember.name}
                  size={32}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-semibold text-ink truncate">
                    {selectedMember.name}
                  </p>
                  <p className="text-[11px] text-muted truncate">
                    {selectedMember.email}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="text-muted hover:text-ink shrink-0"
                >
                  <X size={13} />
                </button>
              </div>
            )}

            <button
              onClick={handleAssignExisting}
              disabled={!selectedMember || isSaving}
              className="w-full bg-ink text-white text-[13.5px] font-semibold py-3 rounded-xl disabled:bg-ink/30 disabled:cursor-not-allowed hover:bg-ink/90 transition-colors"
            >
              {isSaving ? "Saving…" : "Assign Selected Member"}
            </button>
          </div>
        ) : (
          /* ── INVITE TAB ── */
          <div className="space-y-4">
            <Field label="Full Name *" value={form.name} onChange={handleField("name")} />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Mobile *"
                value={form.mobileNumber}
                onChange={handleField("mobileNumber")}
                type="tel"
                maxLength={10}
              />
              <Field
                label="Email"
                value={form.email}
                onChange={handleField("email")}
                type="email"
              />
            </div>
            <Field
              label="Company Name"
              value={form.company}
              onChange={handleField("company")}
            />

            {/* Photo */}
            <div>
              <label className="text-[13px] font-medium text-ink mb-1.5 block">
                Photo
              </label>
              {photoPreview ? (
                <div className="flex items-center gap-3">
                  <img
                    src={photoPreview}
                    alt="Selected"
                    className="w-16 h-16 rounded-xl object-cover border border-hairline"
                  />
                  <label className="text-[13px] font-medium text-ink underline cursor-pointer">
                    Replace photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                  </label>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 border border-dashed border-hairline rounded-xl py-3 text-[13px] font-medium text-muted cursor-pointer hover:bg-ink/5 transition-colors">
                  <Upload size={15} /> Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </label>
              )}
            </div>

            <button
              onClick={() => handleAssignInvite(true)}
              disabled={!form.name.trim() || isSaving}
              className="w-full bg-ink text-white text-[13.5px] font-semibold py-3 rounded-xl disabled:bg-ink/30 disabled:cursor-not-allowed hover:bg-ink/90 transition-colors"
            >
              {isSaving ? "Saving…" : "Assign & Send Invite"}
            </button>
            <button
              onClick={() => handleAssignInvite(false)}
              disabled={!form.name.trim() || isSaving}
              className="w-full border border-hairline text-ink text-[13.5px] font-medium py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-ink/5 transition-colors"
            >
              {isSaving ? "Saving…" : "Assign Without Invite"}
            </button>
          </div>
        )}
      </div>

      {/* ── Crop Modal ── */}
      {cropModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-ink/60"
            onClick={handleCancelCrop}
          />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="relative w-full h-72 bg-ink">
              <Cropper
                image={rawImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
              />
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <ZoomIn size={16} className="text-muted shrink-0" />
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-ink"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCancelCrop}
                  className="flex-1 border border-hairline text-ink text-[13.5px] font-medium py-2.5 rounded-xl hover:bg-ink/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCrop}
                  className="flex-1 bg-ink text-white text-[13.5px] font-semibold py-2.5 rounded-xl hover:bg-ink/90 transition-colors"
                >
                  Save photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", maxLength }) {
  return (
    <div>
      <label className="text-[13px] font-medium text-ink mb-1.5 block">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        className="w-full border border-hairline rounded-xl px-3.5 py-2.5 text-[13.5px] text-ink focus:outline-none focus:ring-2 focus:ring-amber/30"
      />
    </div>
  );
}