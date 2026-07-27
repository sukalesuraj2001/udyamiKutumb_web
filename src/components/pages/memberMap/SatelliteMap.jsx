import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Layers } from "lucide-react";

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

// Make a custom pin icon
function makePinIcon(color) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 30px; height: 30px;
        background: ${color};
        border: 2.5px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 6px rgba(0,0,0,0.35);
      "></div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -32],
  });
}

const DEFAULT_PIN = makePinIcon("#B5730B");   // amber
const SELECTED_PIN = makePinIcon("#2563EB");  // blue when selected

export default function SatelliteMap({
  location,
  wardPolygon,
  businesses = [],
  selectedBusiness,
  onSelectBusiness,
  onZoomOutToGlobe,
}) {
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const tileLayerRef = useRef(null);
  const polygonLayerRef = useRef(null);
  const markersRef = useRef([]);
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

    // Default: satellite
    tileLayerRef.current = L.tileLayer(TILE_LAYERS.satellite.url, {
      attribution: TILE_LAYERS.satellite.attribution,
      maxZoom: 20,
    }).addTo(mapRef.current);

    L.control.zoom({ position: "bottomright" }).addTo(mapRef.current);

    requestAnimationFrame(() => mapRef.current?.invalidateSize());

    // Zoom out → back to globe
    mapRef.current.on("zoomend", () => {
      const z = mapRef.current?.getZoom();
      if (z !== undefined && z <= 3) {
        onZoomOutToGlobe?.();
      }
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Draw ward polygon boundary ──
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
        fillOpacity: 0.08,
        dashArray: "6 4",
      },
    }).addTo(mapRef.current);

    const bounds = polygonLayerRef.current.getBounds();
    if (bounds.isValid()) {
      mapRef.current.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [wardPolygon]);

  // ── Business markers ──
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove old markers
    markersRef.current.forEach((m) => mapRef.current.removeLayer(m));
    markersRef.current = [];

    businesses.forEach((b) => {
      const [lng, lat] = b.geometry.coordinates;
      const isSelected = selectedBusiness?.memberId === b.properties.memberId;

      const marker = L.marker([lat, lng], {
        icon: isSelected ? SELECTED_PIN : DEFAULT_PIN,
      }).addTo(mapRef.current);

      marker.bindPopup(`
        <div style="font-family:sans-serif;min-width:160px">
          <p style="font-weight:700;font-size:13px;margin:0 0 4px">${b.properties.businessName}</p>
          <p style="color:#666;font-size:11.5px;margin:0">${b.properties.ownerName}</p>
          <p style="color:#666;font-size:11.5px;margin:2px 0 0">${b.properties.mobile}</p>
          <p style="color:#888;font-size:10.5px;margin:4px 0 0">${b.properties.membershipNumber}</p>
        </div>
      `);

      marker.on("click", () => {
        onSelectBusiness?.(b.properties);
        marker.openPopup();
      });

      markersRef.current.push(marker);
    });
  }, [businesses, selectedBusiness]);

  // ── Tile layer switcher (exposed via button panel below) ──
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

      {/* Map style switcher — top right (below the ward label bar) */}
      <div className="absolute top-16 right-4 z-[1000] bg-white rounded-xl shadow-sm p-1 flex gap-1">
        {[
          { key: "satellite", label: "Satellite" },
          { key: "street", label: "Street" },
          { key: "light", label: "Light" },
        ].map((v) => (
          <button
            key={v.key}
            onClick={() => switchTile(v.key)}
            className={`text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              currentTileKeyRef.current === v.key
                ? "bg-ink text-white"
                : "text-muted hover:text-ink"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 right-4 z-[1000] bg-white/90 backdrop-blur rounded-xl shadow-sm px-3 py-2.5 text-[11.5px] text-ink space-y-1.5">
        <p className="font-semibold text-[11px] text-muted uppercase tracking-wide mb-1">Legend</p>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-amber border-2 border-white shadow-sm inline-block" />
          Business pin
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-sm inline-block" />
          Selected
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block"
            style={{
              width: 16,
              height: 3,
              background: "#FBBF24",
              borderRadius: 2,
            }}
          />
          Ward boundary
        </div>
      </div>
    </div>
  );
}