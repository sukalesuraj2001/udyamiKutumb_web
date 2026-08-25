import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { makeRolePinIcon, resolveRoleKey } from "../../utils/RolePinIcon";

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

const LAYER_STYLES = {
  district: {
    color: "#1E40AF",
    weight: 4,
    fillColor: "#1E40AF",
    fillOpacity: 0.08,
  },
  taluka: {
    color: "#EA580C",
    weight: 3,
    fillColor: "#EA580C",
    fillOpacity: 0.1,
  },
  ward: {
    color: "#16A34A",
    weight: 2,
    fillColor: "#16A34A",
    fillOpacity: 0.1,
  },
};

export default function SatelliteMap({
  location,
  wardPolygon,
  businesses = [],
  selectedBusiness,
  onSelectBusiness,
  onZoomOutToGlobe,
  districtGeo = null,
  talukaGeos = null,
  wardGeos = null,
  fetchType = "ward",
  showDistrictLayer = true,
  showTalukaLayer = true,
  showWardLayer = true,
  showBusinessMarkers = true,
}) {
  const mapDivRef         = useRef(null);
  const mapRef            = useRef(null);
  const tileLayerRef      = useRef(null);
  const layerRefs         = useRef({ district: null, taluka: null, ward: null });
  const markersRef        = useRef([]);
  const currentTileKeyRef = useRef("satellite");
  const [currentTile, setCurrentTile] = useState("satellite");

  // ── Init map ──
  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;

    mapRef.current = L.map(mapDivRef.current, {
      center: [location.lat, location.lng],
      zoom: fetchType === "district" ? 10 : fetchType === "taluka" ? 12 : 15,
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

  // ── GeoJSON layers ──
  useEffect(() => {
    if (!mapRef.current) return;

    Object.values(layerRefs.current).forEach((layer) => {
      if (layer) mapRef.current.removeLayer(layer);
    });
    layerRefs.current = { district: null, taluka: null, ward: null };

    let fitBoundsLayer = null;

    // Ward
    const wardData = wardGeos || (wardPolygon ? { type: "FeatureCollection", features: [wardPolygon] } : null);
    if (showWardLayer && wardData?.features?.length) {
      layerRefs.current.ward = L.geoJSON(wardData, {
        style: LAYER_STYLES.ward,
        onEachFeature: (feature, layer) => {
          const name =
            feature.properties?.name ||
            feature.properties?.ward_name ||
            feature.properties?.Ward_Name || "";
          if (name) {
            layer.bindTooltip(name, {
              permanent: true,
              direction: "center",
              className: "geo-label ward-label",
            });
          }
        },
      }).addTo(mapRef.current);
      fitBoundsLayer = layerRefs.current.ward;
    }

    // Taluka
    if (showTalukaLayer && talukaGeos?.features?.length) {
      layerRefs.current.taluka = L.geoJSON(talukaGeos, {
        style: LAYER_STYLES.taluka,
        onEachFeature: (feature, layer) => {
          const name = feature.properties?.name || feature.properties?.talukaName || "";
          if (name) {
            layer.bindTooltip(name, {
              permanent: true,
              direction: "center",
              className: "geo-label taluka-label",
            });
          }
        },
      }).addTo(mapRef.current);
      fitBoundsLayer = layerRefs.current.taluka;
    }

    // District
    if (showDistrictLayer && districtGeo?.features?.length) {
      layerRefs.current.district = L.geoJSON(districtGeo, {
        style: LAYER_STYLES.district,
        onEachFeature: (feature, layer) => {
          const name = feature.properties?.name || "";
          if (name) {
            layer.bindTooltip(name, {
              permanent: true,
              direction: "center",
              className: "geo-label district-label",
            });
          }
        },
      }).addTo(mapRef.current);
      fitBoundsLayer = layerRefs.current.district;
    }

    if (fitBoundsLayer) {
      const bounds = fitBoundsLayer.getBounds();
      if (bounds.isValid()) {
        mapRef.current.fitBounds(bounds, { padding: [40, 40] });
      }
    }
  }, [districtGeo, talukaGeos, wardGeos, wardPolygon, showDistrictLayer, showTalukaLayer, showWardLayer]);

  // ── Business markers ──
  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach((m) => mapRef.current.removeLayer(m));
    markersRef.current = [];

    if (!showBusinessMarkers) return;

    businesses.forEach((b) => {
      const [lng, lat] = b.geometry.coordinates;
      const props      = b.properties;
      const isSelected = selectedBusiness?.profileId === props.profileId;
      const roleKey    = resolveRoleKey(props);
      const icon       = makeRolePinIcon(roleKey, isSelected);

      const marker = L.marker([lat, lng], { icon }).addTo(mapRef.current);

      marker.bindPopup(
        `<div style="font-family:system-ui,sans-serif;min-width:180px;max-width:220px">
          <p style="font-weight:700;font-size:13px;margin:0 0 2px;color:#111">${props.businessName}</p>
          ${props.businessType
            ? `<span style="display:inline-block;font-size:10px;font-weight:600;background:#FEF3C7;color:#92400E;border-radius:999px;padding:1px 8px;margin-bottom:6px">${props.businessType}</span>`
            : ""}
          ${props.sector
            ? `<p style="color:#777;font-size:11px;margin:0 0 6px">${props.sector}</p>`
            : ""}
          <div style="border-top:1px solid #f0f0f0;margin:6px 0;padding-top:6px">
            <p style="color:#555;font-size:11.5px;margin:0 0 3px">👤 ${props.ownerName || "—"}</p>
            <p style="color:#555;font-size:11.5px;margin:0 0 3px">📞 ${props.businessMobile || props.mobile || "—"}</p>
            ${props.email ? `<p style="color:#555;font-size:11.5px;margin:0">✉ ${props.email}</p>` : ""}
            ${props.address ? `<p style="color:#888;font-size:11px;margin:4px 0 0">${props.address}${props.city ? ", " + props.city : ""}</p>` : ""}
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

      if (isSelected) setTimeout(() => marker.openPopup(), 100);
      markersRef.current.push(marker);
    });
  }, [businesses, selectedBusiness, showBusinessMarkers]);

  // ── Tile switcher ──
  const switchTile = (key) => {
    if (!mapRef.current || currentTileKeyRef.current === key) return;
    if (tileLayerRef.current) mapRef.current.removeLayer(tileLayerRef.current);
    tileLayerRef.current = L.tileLayer(TILE_LAYERS[key].url, {
      attribution: TILE_LAYERS[key].attribution,
      maxZoom: 20,
    }).addTo(mapRef.current);
    currentTileKeyRef.current = key;
    setCurrentTile(key);
  };

  const legendItems = [
    ...(fetchType === "district" ? [{ color: "#1E40AF", dash: false, label: "District boundary" }] : []),
    ...(fetchType !== "ward"     ? [{ color: "#EA580C", dash: true,  label: "Taluka boundary"   }] : []),
    { color: "#16A34A", dash: true,  label: "Ward boundary" },
    { color: "#90A4AE", pin: true,   label: "Member"        },
    { color: "#2563EB", pin: true,   label: "Selected"      },
  ];

  return (
    <div className="relative w-full h-full">
      <div ref={mapDivRef} className="w-full h-full z-0" />

      {/* Tile switcher */}
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
              currentTile === v.key
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
        {legendItems.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            {item.pin ? (
              <span
                className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm inline-block shrink-0"
                style={{ background: item.color }}
              />
            ) : (
              <span
                className="inline-block shrink-0"
                style={{
                  width: 18, height: 2.5,
                  background: item.color,
                  borderRadius: 2,
                  ...(item.dash
                    ? { borderTop: `2px dashed ${item.color}`, background: "transparent", height: 0 }
                    : {}),
                }}
              />
            )}
            {item.label}
          </div>
        ))}
      </div>

      <style>{`
        .clean-popup .leaflet-popup-content-wrapper {
          border-radius: 14px; padding: 0;
          box-shadow: 0 8px 24px rgba(0,0,0,0.18);
        }
        .clean-popup .leaflet-popup-content { margin: 14px 16px; }
        .clean-popup .leaflet-popup-tip-container { margin-top: -1px; }

        .geo-label {
          background: rgba(255,255,255,0.75) !important;
          backdrop-filter: blur(2px);
          border: 1px solid rgba(0,0,0,0.15) !important;
          border-radius: 6px !important;
          padding: 2px 6px !important;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2) !important;
          font-family: system-ui, sans-serif;
          font-weight: 700;
          pointer-events: none;
          white-space: nowrap;
        }
        .district-label { font-size: 13px;   color: #003366; }
        .taluka-label   { font-size: 11px;   color: #C2410C; }
        .ward-label     { font-size: 10.5px; color: #15803D; }
      `}</style>
    </div>
  );
}