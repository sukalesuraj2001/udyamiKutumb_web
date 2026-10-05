import React, { useState } from "react";
import { Building2, AlertCircle, Globe, MapPin, Phone, Calendar, Image as ImageIcon, X } from "lucide-react";

function InfoRow({ label, value, fullWidth = false, isLink = false, linkHref = "" }) {
  return (
    <div className={`flex flex-col gap-1 py-3 px-5 border-b border-[#F1F5F9] last:border-0 ${fullWidth ? "col-span-2 max-sm:col-span-1" : ""}`}>
      <span className="text-[10px] font-semibold uppercase tracking-[0.07em] text-slate-400">
        {label}
      </span>
      <span className="text-[13px] text-[#1a2b4a] font-medium">
        {isLink && value ? (
          <a
            href={linkHref || (value.startsWith("http") ? value : `https://${value}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1a56db] hover:underline flex items-center gap-1 font-semibold"
          >
            <Globe size={13} />
            {value}
          </a>
        ) : (
          value || <span className="text-slate-300 font-normal">Not provided</span>
        )}
      </span>
    </div>
  );
}

// Helper to extract image URL string from businessImage object or string
function getImageSrc(imgData) {
  if (!imgData) return null;
  if (typeof imgData === "string" && imgData.trim()) {
    if (imgData.startsWith("data:") || imgData.startsWith("http")) return imgData;
    return `https://backend.udyamikutumba.com/uploads/${imgData}`;
  }
  if (typeof imgData === "object") {
    const raw = imgData.image || imgData.url || imgData.preview || imgData.fileName;
    if (raw && typeof raw === "string") {
      if (raw.startsWith("data:") || raw.startsWith("http")) return raw;
      return `https://backend.udyamikutumba.com/uploads/${raw}`;
    }
  }
  return null;
}

export default function BusinessInfoCard({ hasBusiness, businessDetails }) {
  const [activePreviewImage, setActivePreviewImage] = useState(null);

  if (!hasBusiness && !businessDetails) {
    return (
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F1F5F9]">
          <div className="w-8 h-8 rounded-lg bg-[#FFF7ED] flex items-center justify-center shrink-0">
            <Building2 size={15} className="text-amber-500" />
          </div>
          <div>
            <h2 className="text-[14px] font-semibold text-[#1a2b4a]">Business information</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Registered business details</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 py-10 px-5">
          <div className="w-10 h-10 rounded-full bg-[#FFF7ED] flex items-center justify-center">
            <AlertCircle size={18} className="text-amber-400" />
          </div>
          <div className="text-center">
            <p className="text-[13px] font-medium text-slate-500">No business registered</p>
            <p className="text-[11.5px] text-slate-400 mt-0.5">
              Business details will appear here once registered.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const {
    businessName,
    businessType,
    sector,
    ownerName,
    owner,
    businessMobile,
    gstNumber,
    gst,
    registrationNumber,
    licenseNumber,
    employees,
    annualTurnover,
    turnover,
    workingHours,
    establishedYear,
    website,
    address,
    businessAddress,
    city,
    district,
    state,
    pincode,
    latitude,
    longitude,
    businessImage1,
    businessImage2,
    businessImage3,
  } = businessDetails || {};

  const resolvedOwner = ownerName || owner;
  const resolvedGst = gstNumber || gst;
  const resolvedRegistration = registrationNumber || licenseNumber;
  const resolvedTurnover = annualTurnover || turnover;
  const resolvedAddress = address || businessAddress;

  const images = [
    getImageSrc(businessImage1),
    getImageSrc(businessImage2),
    getImageSrc(businessImage3),
  ].filter(Boolean);

  const hasCoords = (latitude && Number(latitude) !== 0) || (longitude && Number(longitude) !== 0);

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F1F5F9]">
        <div className="w-8 h-8 rounded-lg bg-[#FFF7ED] flex items-center justify-center shrink-0">
          <Building2 size={15} className="text-amber-500" />
        </div>
        <div>
          <h2 className="text-[14px] font-semibold text-[#1a2b4a]">Business information</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Registered business profile and operations</p>
        </div>
      </div>

      <div className="grid grid-cols-2 max-sm:grid-cols-1">
        <InfoRow label="Business name" value={businessName} />
        <InfoRow label="Business type" value={businessType} />
        <InfoRow label="Sector" value={sector} />
        <InfoRow label="Owner name" value={resolvedOwner} />
        <InfoRow label="Business mobile" value={businessMobile} />
        <InfoRow label="GST number" value={resolvedGst} />
        <InfoRow label="Registration / License" value={resolvedRegistration} />
        <InfoRow label="Employees" value={employees !== null && employees !== undefined ? String(employees) : null} />
        <InfoRow label="Annual turnover" value={resolvedTurnover} />
        <InfoRow label="Working hours" value={workingHours} />
        <InfoRow label="Established year" value={establishedYear ? String(establishedYear) : null} />
        <InfoRow label="Website" value={website} isLink={Boolean(website)} />
        <InfoRow label="City" value={city} />
        <InfoRow label="District" value={district} />
        <InfoRow label="State" value={state} />
        <InfoRow label="Pincode" value={pincode} />

        {hasCoords && (
          <div className="flex flex-col gap-1 py-3 px-5 border-b border-[#F1F5F9] col-span-2 max-sm:col-span-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.07em] text-slate-400">
              Location Coordinates
            </span>
            <a
              href={`https://www.google.com/maps?q=${latitude},${longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-[#1a56db] font-medium hover:underline flex items-center gap-1.5"
            >
              <MapPin size={14} className="text-red-500" />
              <span>{latitude}, {longitude}</span>
              <span className="text-[11px] text-slate-400">(View on Google Maps)</span>
            </a>
          </div>
        )}

        <InfoRow label="Business address" value={resolvedAddress} fullWidth />
      </div>

      {/* Business Images Section */}
      {images.length > 0 && (
        <div className="px-5 py-4 border-t border-[#F1F5F9]">
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon size={14} className="text-slate-400" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-slate-400">
              Business Images ({images.length})
            </span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {images.map((imgSrc, idx) => (
              <div
                key={idx}
                onClick={() => setActivePreviewImage(imgSrc)}
                className="relative w-28 h-28 rounded-xl overflow-hidden border border-slate-200 cursor-pointer group shrink-0 bg-slate-50 hover:shadow-md transition"
              >
                <img
                  src={imgSrc}
                  alt={`Business Image ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/112x112?text=Image";
                  }}
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-medium">
                  View
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Modal Lightbox */}
      {activePreviewImage && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setActivePreviewImage(null)}>
          <div className="relative max-w-3xl max-h-[85vh] bg-white rounded-2xl p-2 overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setActivePreviewImage(null)}
              className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-full transition z-10"
            >
              <X size={16} />
            </button>
            <img
              src={activePreviewImage}
              alt="Business preview"
              className="w-full h-full object-contain rounded-xl max-h-[80vh]"
            />
          </div>
        </div>
      )}
    </div>
  );
}