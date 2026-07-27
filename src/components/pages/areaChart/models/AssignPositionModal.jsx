import React, { useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import { X, Search, Upload, ZoomIn } from "lucide-react";
import { useSelector } from "react-redux";                          // ← added
import { selectAreaChartStatus } from "../../../redux/slices/Areachartslice.js"; // ← adjust path
import getCroppedImg from "../../../utils/cropImage.js";

// Replace with real member search (API / Redux)
const SAMPLE_MEMBERS = [];

export default function AssignPositionModal({ position, wardName, onClose, onAssign }) {
  // ── Read Redux loading state so we can disable submit while the API call is in flight ──
  const apiStatus = useSelector(selectAreaChartStatus);
  const isSaving = apiStatus === "loading";

  const [tab, setTab] = useState("invite");

  // Existing member search
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const isValidMobile = (mobile) => /^[6-9]\d{9}$/.test(mobile);
  // Invite new form
  const [form, setForm] = useState({
    name: "",
    mobileNumber: "",
    email: "",
    company: "",
  });

  // Photo upload + crop
  const [rawImage, setRawImage] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const handleAssignInvite = (sendInvite) => {
    if (!form.name.trim()) {
      alert("Name is required");
      return;
    }

    if (!isValidMobile(form.mobileNumber)) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }

    if (isSaving) return;

    onAssign({
      ...form,
      photoUrl: photoPreview,
      photoFile: photoFile,
      status: sendInvite ? "invited" : "registered",
    });
  };
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const filteredMembers = SAMPLE_MEMBERS.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleField = (key) => (e) => {
    let value = e.target.value;

    if (key === "mobileNumber") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    setForm((f) => ({
      ...f,
      [key]: value,
    }));
  };
  const handleAssignExisting = () => {
    if (!selectedMember || isSaving) return;
    onAssign({
      name: selectedMember.name,
      company: selectedMember.company,
      photoUrl: selectedMember.photoUrl,
      memberId: selectedMember.memberId || "MEM-0001",
      mobileNumber: selectedMember.mobileNumber,
      alternatePhone: selectedMember.alternatePhone,
      email: selectedMember.email || "member@udyami.org",
      location: selectedMember.location || wardName,
      district: selectedMember.district || "Bengaluru Urban",
      state: selectedMember.state || "Karnataka",
      reportsTo: selectedMember.reportsTo || "Ward Chairman",
      directReports: selectedMember.directReports || 0,
      membershipType: selectedMember.membershipType || "Member",
      joinedDate: selectedMember.joinedDate || "15 Jul 2025",
      assignedDate: new Date().toLocaleDateString(),
      status: "Active",
    });
  };

  // const handleAssignInvite = (sendInvite) => {
  //   if (!form.name.trim() || isSaving) return;
  //   onAssign({
  //     ...form,
  //     photoUrl: photoPreview,
  //     photoFile: photoFile,
  //     status: sendInvite ? "invited" : "registered",
  //   });
  // };

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

  const handleCropComplete = (_croppedArea, croppedAreaPixelsResult) => {
    setCroppedAreaPixels(croppedAreaPixelsResult);
  };

  const handleSaveCrop = async () => {
    if (!rawImage || !croppedAreaPixels) return;
    const file = await getCroppedImg(rawImage, croppedAreaPixels); // now returns File

    setPhotoFile(file); // ✅ real file for upload
    setPhotoPreview(URL.createObjectURL(file)); // ✅ blob URL only for preview display
    setCropModalOpen(false);
    setRawImage(null);
  };

  const handleCancelCrop = () => {
    setCropModalOpen(false);
    setRawImage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto">
        <div className="flex items-start justify-between mb-1">
          <h2 className="font-display text-[20px] text-ink">Assign Position: {position}</h2>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X size={18} />
          </button>
        </div>
        <p className="text-[13px] text-muted mb-6">Ward: {wardName}</p>

        {/* Tabs */}
        <div className="inline-flex w-full rounded-xl border border-hairline bg-paper p-1 mb-6">
          <button
            onClick={() => setTab("existing")}
            className={`flex-1 px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-colors ${tab === "existing" ? "bg-white text-ink shadow-sm" : "text-muted"}`}
          >
            Existing Member
          </button>
          <button
            onClick={() => setTab("invite")}
            className={`flex-1 px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-colors ${tab === "invite" ? "bg-white text-ink shadow-sm" : "text-muted"}`}
          >
            Invite New
          </button>
        </div>

        {tab === "existing" ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border border-hairline rounded-xl px-3.5 py-2.5">
              <Search size={16} className="text-muted shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search members"
                className="w-full text-[13.5px] text-ink placeholder:text-muted focus:outline-none"
              />
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredMembers.length === 0 ? (
                <p className="text-[13px] text-muted text-center py-6">No members found.</p>
              ) : (
                filteredMembers.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMember(m)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${selectedMember?.id === m.id ? "border-amber bg-amber-tint" : "border-hairline hover:bg-ink/5"
                      }`}
                  >
                    <p className="text-[13.5px] font-medium text-ink">{m.name}</p>
                    <p className="text-[12px] text-muted">{m.company}</p>
                  </button>
                ))
              )}
            </div>

            <button
              onClick={handleAssignExisting}
              disabled={!selectedMember || isSaving}
              className="w-full bg-ink text-white text-[13.5px] font-semibold py-3 rounded-xl disabled:bg-ink/30 disabled:cursor-not-allowed hover:bg-ink/90 transition-colors"
            >
              {isSaving ? "Saving…" : "Assign Selected Member"}
            </button>
          </div>
        ) : (
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
            <Field label="Company Name" value={form.company} onChange={handleField("company")} />

            <div>
              <label className="text-[13px] font-medium text-ink mb-1.5 block">Photo</label>
              {photoPreview ? (
                <div className="flex items-center gap-3">
                  <img src={photoPreview} alt="Selected" className="w-16 h-16 rounded-xl object-cover border border-hairline" />
                  <label className="text-[13px] font-medium text-ink underline cursor-pointer">
                    Replace photo
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                  </label>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 border border-dashed border-hairline rounded-xl py-3 text-[13px] font-medium text-muted cursor-pointer hover:bg-ink/5 transition-colors">
                  <Upload size={15} /> Upload Photo
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
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

      {/* Crop modal */}
      {cropModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/60" onClick={handleCancelCrop} />
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

function Field({
  label,
  value,
  onChange,
  type = "text",
  maxLength,
}) {
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