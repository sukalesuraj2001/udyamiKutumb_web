import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const TILE_LAYERS = {
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
  },
  street: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors",
  },
  light: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: "&copy; OpenStreetMap &copy; CARTO",
  },
};

function makePinIcon(color, isSelected = false) {
  const size = isSelected ? 36 : 30;
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:${size}px;height:${size}px;
        background:${color};
        border:${isSelected ? "3px" : "2.5px"} solid white;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        box-shadow:${isSelected ? "0 3px 12px rgba(0,0,0,0.45)" : "0 2px 6px rgba(0,0,0,0.35)"};
        transition:all 0.15s;
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -(size + 4)],
  });
}

const DEFAULT_PIN  = makePinIcon("#B5730B", false);
const SELECTED_PIN = makePinIcon("#2563EB", true);

export default function SatelliteMap({
  location,
  wardPolygon,
  businesses = [],
  selectedBusiness,
  onSelectBusiness,
  onZoomOutToGlobe,
}) {
  const mapDivRef       = useRef(null);
  const mapRef          = useRef(null);
  const tileLayerRef    = useRef(null);
  const polygonLayerRef = useRef(null);
  const markersRef      = useRef([]);
  const currentTileKeyRef = useRef("satellite");

  // ── Init map ──
  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;

    mapRef.current = L.map(mapDivRef.current, {
      center: [location.lat, location.lng],
      zoom: 16,
      zoomControl: false,
      minZoom: 2,
    });

    tileLayerRef.current = L.tileLayer(TILE_LAYERS.satellite.url, {
      attribution: TILE_LAYERS.satellite.attribution,
      maxZoom: 20,
    }).addTo(mapRef.current);

    L.control.zoom({ position: "bottomright" }).addTo(mapRef.current);
    requestAnimationFrame(() => mapRef.current?.invalidateSize());

    mapRef.current.on("zoomend", () => {
      const z = mapRef.current?.getZoom();
      if (z !== undefined && z <= 3) onZoomOutToGlobe?.();
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Ward polygon ──
  useEffect(() => {
    if (!mapRef.current) return;
    if (polygonLayerRef.current) {
      mapRef.current.removeLayer(polygonLayerRef.current);
      polygonLayerRef.current = null;
    }
    if (!wardPolygon) return;

    polygonLayerRef.current = L.geoJSON(wardPolygon, {
      style: {
        color: "#FBBF24",
        weight: 2.5,
        fillColor: "#FBBF24",
        fillOpacity: 0.06,
        dashArray: "6 4",
      },
    }).addTo(mapRef.current);

    const bounds = polygonLayerRef.current.getBounds();
    if (bounds.isValid()) {
      mapRef.current.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [wardPolygon]);

  // ── Business markers (fix: use profileId for selection key) ──
  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach((m) => mapRef.current.removeLayer(m));
    markersRef.current = [];

    businesses.forEach((b) => {
      const [lng, lat] = b.geometry.coordinates;
      const props = b.properties;

      // ✅ Fixed: use profileId (not memberId)
      const isSelected = selectedBusiness?.profileId === props.profileId;

      const marker = L.marker([lat, lng], {
        icon: isSelected ? SELECTED_PIN : DEFAULT_PIN,
      }).addTo(mapRef.current);

      // ✅ Enhanced popup with address, sector, email
      marker.bindPopup(
        `<div style="font-family:system-ui,sans-serif;min-width:180px;max-width:220px">
          <p style="font-weight:700;font-size:13px;margin:0 0 2px;color:#111">${props.businessName}</p>
          ${props.businessType
            ? `<span style="display:inline-block;font-size:10px;font-weight:600;background:#FEF3C7;color:#92400E;border-radius:999px;padding:1px 8px;margin-bottom:6px">${props.businessType}</span>`
            : ""}
          ${props.sector
            ? `<p style="color:#777;font-size:11px;margin:0 0 6px">${props.sector}</p>`
            : ""}
          <div style="border-top:1px solid #f0f0f0;margin:6px 0;padding-top:6px;space-y:3px">
            <p style="color:#555;font-size:11.5px;margin:0 0 3px">👤 ${props.ownerName}</p>
            <p style="color:#555;font-size:11.5px;margin:0 0 3px">📞 ${props.businessMobile || props.mobile}</p>
            ${props.email
              ? `<p style="color:#555;font-size:11.5px;margin:0 0 3px">✉ ${props.email}</p>`
              : ""}
            ${props.address
              ? `<p style="color:#888;font-size:11px;margin:4px 0 0">${props.address}, ${props.city || ""}</p>`
              : ""}
          </div>
          ${props.employees
            ? `<p style="color:#999;font-size:10.5px;margin:4px 0 0">👥 ${props.employees} employees · Est. ${props.establishedYear || "—"}</p>`
            : ""}
        </div>`,
        { maxWidth: 240, className: "clean-popup" }
      );

      marker.on("click", () => {
        onSelectBusiness?.(props);
        marker.openPopup();
      });

      // Auto-open popup if this business is selected
      if (isSelected) {
        setTimeout(() => marker.openPopup(), 100);
      }

      markersRef.current.push(marker);
    });
  }, [businesses, selectedBusiness]);

  // ── Tile switcher ──
  const switchTile = (key) => {
    if (!mapRef.current || currentTileKeyRef.current === key) return;
    if (tileLayerRef.current) mapRef.current.removeLayer(tileLayerRef.current);
    tileLayerRef.current = L.tileLayer(TILE_LAYERS[key].url, {
      attribution: TILE_LAYERS[key].attribution,
      maxZoom: 20,
    }).addTo(mapRef.current);
    currentTileKeyRef.current = key;
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapDivRef} className="w-full h-full z-0" />

      {/* Map style switcher */}
      <div className="absolute top-16 right-4 z-[1000] bg-white/95 backdrop-blur rounded-xl shadow-md p-1 flex gap-0.5">
        {[
          { key: "satellite", label: "Satellite" },
          { key: "street",    label: "Street"    },
          { key: "light",     label: "Light"     },
        ].map((v) => (
          <button
            key={v.key}
            onClick={() => switchTile(v.key)}
            className={`text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              currentTileKeyRef.current === v.key
                ? "bg-ink text-white"
                : "text-muted hover:text-ink hover:bg-ink/[0.05]"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 right-4 z-[1000] bg-white/95 backdrop-blur rounded-xl shadow-md px-3.5 py-3 text-[11.5px] text-ink space-y-2">
        <p className="font-semibold text-[10px] text-muted uppercase tracking-widest">Legend</p>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-amber border-2 border-white shadow-sm inline-block shrink-0" />
          Business pin
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white shadow-sm inline-block shrink-0" />
          Selected
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block shrink-0" style={{ width: 16, height: 2.5, background: "#FBBF24", borderRadius: 2 }} />
          Ward boundary
        </div>
      </div>

      {/* Popup style override */}
      <style>{`
        .clean-popup .leaflet-popup-content-wrapper {
          border-radius: 14px;
          padding: 0;
          box-shadow: 0 8px 24px rgba(0,0,0,0.18);
        }
        .clean-popup .leaflet-popup-content {
          margin: 14px 16px;
        }
        .clean-popup .leaflet-popup-tip-container {
          margin-top: -1px;
        }
      `}</style>
    </div>
  );
}