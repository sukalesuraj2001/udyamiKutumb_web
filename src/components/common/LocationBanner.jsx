
import React from "react";
import { MapPin, Flag, ChevronRight } from "lucide-react";

const CRUMB_CONFIG = [
  {
    key:   "districtName",
    label: "District",
    icon:  MapPin,
    color: "text-blue-600",
    bg:    "bg-blue-50",
  },
  {
    key:   "talukaName",
    label: "Taluka",
    icon:  Flag,
    color: "text-purple-600",
    bg:    "bg-purple-50",
  },
  {
    key:   "wardName",
    label: "Ward",
    icon:  MapPin,
    color: "text-emerald-600",
    bg:    "bg-emerald-50",
  },
];

// level: "district" | "taluka" | "ward"
const LEVEL_CRUMB_COUNT = {
  district: 1,
  taluka:   2,
  ward:     3,
};

const LEVEL_LABEL = {
  district: "Your District",
  taluka:   "Your Taluka",
  ward:     "Your Ward",
};

const LocationBanner = ({ level = "ward" }) => {
  const locationData = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("locationData")) || null;
    } catch {
      return null;
    }
  }, []);

  if (!locationData) return null;

  const crumbCount = LEVEL_CRUMB_COUNT[level] ?? 3;
  const crumbs     = CRUMB_CONFIG.slice(0, crumbCount).filter(
    (c) => locationData[c.key]
  );

  if (crumbs.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-3.5 flex flex-wrap items-center gap-3">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest mr-1">
        {LEVEL_LABEL[level]}
      </span>

      {crumbs.map((c, i) => {
        const Icon = c.icon;
        return (
          <React.Fragment key={c.key}>
            {i > 0 && (
              <ChevronRight size={13} className="text-gray-300 flex-shrink-0" />
            )}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.color}`}
            >
              <Icon size={12} />
              {locationData[c.key]}
            </span>
          </React.Fragment>
        );
      })}

      <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-gray-400">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        Live
      </span>
    </div>
  );
};

export default LocationBanner;