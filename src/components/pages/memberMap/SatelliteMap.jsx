import React, { useEffect, useRef, useState } from "react";
import { buildRolePinSvg, resolveRoleKey } from "../../utils/RolePinIcon";
import {
  loadGoogleMaps,
  hasGoogleMapsKey,
  GOOGLE_MAPS_MAP_ID,
  onGoogleMapsAuthFailure,
  extendBoundsWithGeo,
  featureCenter,
  sanitizeGeo,
  safeAddGeoJson,
} from "../../utils/googleMaps";

// Google Maps JavaScript API map types
const MAP_TYPES = [
  { key: "hybrid",  label: "Satellite" },
  { key: "roadmap", label: "Street"    },
  { key: "terrain", label: "Terrain"   },
];

const LAYER_STYLES = {
  district: { color: "#1E40AF", weight: 4, fillColor: "#1E40AF", fillOpacity: 0.08 },
  taluka:   { color: "#EA580C", weight: 3, fillColor: "#EA580C", fillOpacity: 0.1  },
  ward:     { color: "#16A34A", weight: 2, fillColor: "#16A34A", fillOpacity: 0.1  },
};

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function popupHtml(props) {
  return `<div style="font-family:system-ui,sans-serif;min-width:180px;max-width:220px">
    <p style="font-weight:700;font-size:13px;margin:0 0 2px;color:#111">${esc(props.businessName)}</p>
    ${props.businessType
      ? `<span style="display:inline-block;font-size:10px;font-weight:600;background:#FEF3C7;color:#92400E;border-radius:999px;padding:1px 8px;margin-bottom:6px">${esc(props.businessType)}</span>`
      : ""}
    ${props.sector ? `<p style="color:#777;font-size:11px;margin:0 0 6px">${esc(props.sector)}</p>` : ""}
    <div style="border-top:1px solid #f0f0f0;margin:6px 0;padding-top:6px">
      <p style="color:#555;font-size:11.5px;margin:0 0 3px">👤 ${esc(props.ownerName || "—")}</p>
      <p style="color:#555;font-size:11.5px;margin:0 0 3px">📞 ${esc(props.businessMobile || props.mobile || "—")}</p>
      ${props.email ? `<p style="color:#555;font-size:11.5px;margin:0">✉ ${esc(props.email)}</p>` : ""}
      ${props.address ? `<p style="color:#888;font-size:11px;margin:4px 0 0">${esc(props.address)}${props.city ? ", " + esc(props.city) : ""}</p>` : ""}
    </div>
    ${props.employees
      ? `<p style="color:#999;font-size:10.5px;margin:4px 0 0">👥 ${esc(props.employees)} employees · Est. ${esc(props.establishedYear || "—")}</p>`
      : ""}
  </div>`;
}

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
  const mapDivRef  = useRef(null);
  const mapRef     = useRef(null);
  const infoRef    = useRef(null);
  const layerRefs  = useRef({ district: null, taluka: null, ward: null });
  const markersRef = useRef([]);
  // Latest callbacks, so effects don't re-run when the parent re-renders.
  const zoomCbRef   = useRef(onZoomOutToGlobe);
  const selectCbRef = useRef(onSelectBusiness);
  useEffect(() => {
    zoomCbRef.current   = onZoomOutToGlobe;
    selectCbRef.current = onSelectBusiness;
  });

  const [ready, setReady]           = useState(false);
  const [mapType, setMapType]       = useState("hybrid");
  const [status, setStatus]         = useState(hasGoogleMapsKey ? "loading" : "nokey"); // loading | ok | nokey | authfail | error
  const [legendOpen, setLegendOpen] = useState(false); // mobile only; always visible on sm+

  // ── Init map ──
  useEffect(() => {
    if (!hasGoogleMapsKey || !mapDivRef.current) return undefined;
    let cancelled = false;
    const offAuth = onGoogleMapsAuthFailure(() => setStatus("authfail"));

    loadGoogleMaps()
      .then((gm) => {
        if (cancelled || mapRef.current || !mapDivRef.current) return;
        const map = new gm.Map(mapDivRef.current, {
          center: { lat: location.lat, lng: location.lng },
          zoom: fetchType === "district" ? 10 : fetchType === "taluka" ? 12 : 15,
          mapId: GOOGLE_MAPS_MAP_ID,
          mapTypeId: "hybrid",
          minZoom: 2,
          maxZoom: 21,
          disableDefaultUI: true,
          zoomControl: true,
          zoomControlOptions: { position: gm.ControlPosition.RIGHT_BOTTOM },
          fullscreenControl: false,
          gestureHandling: "greedy",
          clickableIcons: false,
          backgroundColor: "#0B0F1A",
        });
        mapRef.current  = map;
        infoRef.current = new gm.InfoWindow({ maxWidth: 240 });

        map.addListener("zoom_changed", () => {
          const z = map.getZoom();
          if (z !== undefined && z <= 3) zoomCbRef.current?.();
        });
        setStatus((s) => (s === "authfail" ? s : "ok"));
        setReady(true);
      })
      .catch(() => !cancelled && setStatus("error"));

    return () => {
      cancelled = true;
      offAuth();
      markersRef.current.forEach((m) => { m.map = null; });
      markersRef.current = [];
      Object.values(layerRefs.current).forEach((l) => {
        l?.data?.setMap(null);
        l?.labels?.forEach((m) => { m.map = null; });
      });
      layerRefs.current = { district: null, taluka: null, ward: null };
      if (mapRef.current && window.google?.maps) window.google.maps.event.clearInstanceListeners(mapRef.current);
      infoRef.current?.close();
      infoRef.current = null;
      mapRef.current = null;
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Map type switcher ──
  useEffect(() => {
    mapRef.current?.setMapTypeId(mapType);
  }, [mapType, ready]);

  // ── GeoJSON layers ──
  useEffect(() => {
    const map = mapRef.current;
    const gm  = window.google?.maps;
    if (!ready || !map || !gm) return;

    Object.values(layerRefs.current).forEach((l) => {
      l?.data?.setMap(null);
      l?.labels?.forEach((m) => { m.map = null; });
    });
    layerRefs.current = { district: null, taluka: null, ward: null };

    const addLayer = (key, rawGeo, nameOf, labelClass) => {
      const s    = LAYER_STYLES[key];
      const geo  = sanitizeGeo(rawGeo);
      const data = new gm.Data({ map });
      safeAddGeoJson(data, geo);
      data.setStyle({
        strokeColor: s.color, strokeWeight: s.weight, strokeOpacity: 1,
        fillColor: s.fillColor, fillOpacity: s.fillOpacity, clickable: false,
      });
      const labels = (geo.features || [])
        .map((f) => {
          const name   = nameOf(f);
          const center = featureCenter(f);
          if (!name || !center) return null;
          const el = document.createElement("div");
          el.className = `geo-label ${labelClass}`;
          el.textContent = name;
          try {
            return new gm.marker.AdvancedMarkerElement({ map, position: center, content: el, zIndex: 1 });
          } catch (err) {
            console.error("Could not add map label:", err);
            return null;
          }
        })
        .filter(Boolean);
      layerRefs.current[key] = { data, labels };
      return geo;
    };

    let fitGeo = null;

    const wardData = wardGeos || (wardPolygon ? { type: "FeatureCollection", features: [wardPolygon] } : null);
    if (showWardLayer && wardData?.features?.length) {
      fitGeo = addLayer(
        "ward", wardData,
        (f) => f.properties?.name || f.properties?.ward_name || f.properties?.Ward_Name || "",
        "ward-label"
      );
    }
    if (showTalukaLayer && talukaGeos?.features?.length) {
      fitGeo = addLayer("taluka", talukaGeos, (f) => f.properties?.name || f.properties?.talukaName || "", "taluka-label");
    }
    if (showDistrictLayer && districtGeo?.features?.length) {
      fitGeo = addLayer("district", districtGeo, (f) => f.properties?.name || "", "district-label");
    }

    if (fitGeo) {
      const bounds = new gm.LatLngBounds();
      extendBoundsWithGeo(bounds, fitGeo);
      if (!bounds.isEmpty()) map.fitBounds(bounds, 40);
    }
  }, [ready, districtGeo, talukaGeos, wardGeos, wardPolygon, showDistrictLayer, showTalukaLayer, showWardLayer]);

  // ── Business markers ──
  useEffect(() => {
    const map = mapRef.current;
    const gm  = window.google?.maps;
    if (!ready || !map || !gm) return undefined;

    markersRef.current.forEach((m) => { m.map = null; });
    markersRef.current = [];
    infoRef.current?.close();

    if (!showBusinessMarkers) return undefined;

    const timers = [];
    businesses.forEach((b) => {
      const coords = b?.geometry?.coordinates;
      if (!Array.isArray(coords) || !Number.isFinite(Number(coords[0])) || !Number.isFinite(Number(coords[1]))) return;
      const [lng, lat] = [Number(coords[0]), Number(coords[1])];
      const props      = b.properties || {};
      const isSelected = selectedBusiness?.profileId === props.profileId;
      const { html }   = buildRolePinSvg(resolveRoleKey(props), isSelected);

      const el = document.createElement("div");
      el.style.cursor = "pointer";
      el.innerHTML = html;

      const marker = new gm.marker.AdvancedMarkerElement({
        map,
        position: { lat, lng },
        content: el,
        title: props.businessName || "",
        zIndex: isSelected ? 1000 : 10,
      });

      const openPopup = () => {
        infoRef.current?.setContent(popupHtml(props));
        infoRef.current?.open({ map, anchor: marker });
      };

      marker.addEventListener("gmp-click", () => {
        selectCbRef.current?.(props);
        openPopup();
      });

      if (isSelected) timers.push(setTimeout(openPopup, 100));
      markersRef.current.push(marker);
    });

    return () => timers.forEach(clearTimeout);
  }, [ready, businesses, selectedBusiness, showBusinessMarkers]);

  const legendItems = [
    ...(fetchType === "district" ? [{ color: "#1E40AF", dash: false, label: "District boundary" }] : []),
    ...(fetchType !== "ward"     ? [{ color: "#EA580C", dash: true,  label: "Taluka boundary"   }] : []),
    { color: "#16A34A", dash: true,  label: "Ward boundary" },
    { color: "#90A4AE", pin: true,   label: "Member"        },
    { color: "#2563EB", pin: true,   label: "Selected"      },
  ];

  const notice = {
    nokey: {
      title: "Google Maps API key not set",
      body: "Add your key as VITE_GOOGLE_MAPS_API_KEY in the .env file and restart the dev server.",
    },
    authfail: {
      title: "Google Maps could not authorize this key",
      body: "Check that Maps JavaScript API is enabled, billing is active and this site's URL is allowed in the key's HTTP referrer restrictions.",
    },
    error: {
      title: "Google Maps failed to load",
      body: "Check your internet connection and try again.",
    },
  }[status];

  return (
    <div className="relative w-full h-full">
      <div ref={mapDivRef} className="w-full h-full z-0 bg-[#0B0F1A]" />

      {/* Key / load problems */}
      {notice && (
        <div className="absolute inset-0 z-[1100] flex items-center justify-center bg-[#0B0F1A]/90 p-6 text-center">
          <div className="max-w-sm">
            <p className="text-white text-[14px] font-semibold">{notice.title}</p>
            <p className="text-white/60 text-[12px] mt-1.5 leading-relaxed">{notice.body}</p>
          </div>
        </div>
      )}

      {/* Map type switcher */}
      <div className="absolute top-[4.5rem] right-3 sm:top-16 sm:right-4 z-[1000] bg-white/95 backdrop-blur rounded-xl shadow-md p-1 flex gap-0.5">
        {MAP_TYPES.map((v) => (
          <button
            key={v.key}
            onClick={() => setMapType(v.key)}
            className={`text-[11px] sm:text-[12px] font-semibold px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-colors ${
              mapType === v.key
                ? "bg-ink text-white"
                : "text-muted hover:text-ink hover:bg-ink/[0.05]"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Legend toggle (mobile only) */}
      <button
        type="button"
        onClick={() => setLegendOpen((o) => !o)}
        className="sm:hidden absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur rounded-lg shadow-md px-2.5 py-1.5 text-[11px] font-semibold text-ink"
        aria-expanded={legendOpen}
      >
        {legendOpen ? "Hide legend" : "Legend"}
      </button>

      {/* Legend — bottom-left so it never collides with the zoom control (bottom-right) */}
      <div
        className={`${legendOpen ? "block" : "hidden"} sm:block absolute bottom-12 left-3 sm:bottom-6 sm:left-4 z-[1000] bg-white/95 backdrop-blur rounded-xl shadow-md px-3 sm:px-3.5 py-2.5 sm:py-3 text-[11px] sm:text-[11.5px] text-ink space-y-1.5 sm:space-y-2 max-w-[70%]`}
      >
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
        /* Info window (business popup) */
        .gm-style .gm-style-iw-c { border-radius: 14px !important; padding: 12px 14px !important; box-shadow: 0 8px 24px rgba(0,0,0,0.18) !important; }
        .gm-style .gm-style-iw-d { overflow: auto !important; }

        .geo-label {
          background: rgba(255,255,255,0.75);
          backdrop-filter: blur(2px);
          border: 1px solid rgba(0,0,0,0.15);
          border-radius: 6px;
          padding: 2px 6px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          font-family: system-ui, sans-serif;
          font-weight: 700;
          pointer-events: none;
          white-space: nowrap;
          transform: translateY(50%); /* AdvancedMarker anchors bottom-centre; centre it on the polygon */
        }
        .district-label { font-size: 13px;   color: #003366; }
        .taluka-label   { font-size: 11px;   color: #C2410C; }
        .ward-label     { font-size: 10.5px; color: #15803D; }

        /* Smaller labels / popups on phones so the map isn't buried in text */
        @media (max-width: 640px) {
          .geo-label { padding: 1px 4px; border-radius: 4px; }
          .district-label { font-size: 11px; }
          .taluka-label   { font-size: 9.5px; }
          .ward-label     { font-size: 9px; }
        }
      `}</style>
    </div>
  );
}
