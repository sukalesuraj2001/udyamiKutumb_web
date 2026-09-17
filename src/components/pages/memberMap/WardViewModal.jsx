import React from "react";
import {
  X, Pencil, Hash, MapPinned, Landmark, MessageCircle,
  Navigation, Layers, Calendar,
} from "lucide-react";

/** Read-only detail view for a single ward row. */
export default function WardViewModal({ open, ward, loading, onClose, onEdit }) {
  if (!open) return null;

  const hasGeoJson = Boolean(ward?.geoJson);
  const hasPoint =
    ward?.geofencingLat != null && ward?.geofencingLang != null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-xl flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-hairline">
          <div className="min-w-0">
            <h2 className="text-[16px] font-semibold text-ink truncate">
              {ward?.wardName || "Ward"}
            </h2>
            <p className="text-[12px] text-muted mt-0.5">
              {ward?.taluka ? `${ward.taluka}, ` : ""}{ward?.district || ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-ink hover:bg-ink/5 transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <p className="text-[13px] text-muted py-6 text-center">Loading ward…</p>
          ) : !ward ? (
            <p className="text-[13px] text-muted py-6 text-center">Ward not found.</p>
          ) : (
            <div className="border border-hairline rounded-xl divide-y divide-hairline overflow-hidden bg-ink/[0.02]">
              <Row icon={Hash} label="Ward Code" value={ward.wardName} />
              <Row icon={Hash} label="Ward Number" value={ward.wardNumber} />
              <Row icon={Landmark} label="District" value={ward.district} />
              <Row icon={MapPinned} label="Taluka" value={ward.taluka} />
              <Row icon={Layers} label="State" value={ward.state} />
              <Row
                icon={MessageCircle}
                label="WhatsApp Group"
                value={ward.whatsappGroup}
                link={isUrl(ward.whatsappGroup) ? ward.whatsappGroup : null}
              />
              <Row
                icon={Navigation}
                label="Geofencing Lat"
                value={ward.geofencingLat}
                mono
              />
              <Row
                icon={Navigation}
                label="Geofencing Lang"
                value={ward.geofencingLang}
                mono
              />
              <Row
                icon={Layers}
                label="Boundary"
                value={hasGeoJson ? "GeoJSON uploaded" : "Not uploaded"}
              />
              <Row
                icon={Calendar}
                label="Created"
                value={
                  ward.createdAt
                    ? new Date(ward.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                      })
                    : null
                }
              />
            </div>
          )}

          {hasPoint && (
            <a
              href={`https://www.google.com/maps?q=${ward.geofencingLat},${ward.geofencingLang}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-[12.5px] font-medium text-steel hover:underline"
            >
              <Navigation size={13} />
              Open geofencing point in Google Maps
            </a>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-hairline bg-paper/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-[13px] font-medium text-ink border border-hairline hover:bg-ink/5 transition-colors"
          >
            Close
          </button>
          {ward && (
            <button
              type="button"
              onClick={() => onEdit?.(ward)}
              className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-ink hover:bg-ink/90 transition-colors inline-flex items-center gap-2"
            >
              <Pencil size={13} />
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function isUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value.trim());
}

function Row({ icon, label, value, mono, link }) {
  const empty = value === null || value === undefined || value === "";

  return (
    <div className="flex items-start gap-3 px-3.5 py-3">
      <div className="w-7 h-7 rounded-lg bg-ink/[0.05] flex items-center justify-center shrink-0 mt-0.5">
        {React.createElement(icon, { size: 13, className: "text-muted" })}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-muted uppercase tracking-wide">{label}</p>
        {empty ? (
          <p className="text-[12.5px] text-muted mt-0.5">—</p>
        ) : link ? (
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="text-[12.5px] text-steel font-medium mt-0.5 break-all leading-snug hover:underline block"
          >
            {value}
          </a>
        ) : (
          <p
            className={`text-[12.5px] text-ink font-medium mt-0.5 break-all leading-snug ${
              mono ? "font-mono text-[11.5px]" : ""
            }`}
          >
            {String(value)}
          </p>
        )}
      </div>
    </div>
  );
}
