import React, { useEffect, useRef, useState } from "react";
import {
  loadGoogleMaps,
  hasGoogleMapsKey,
  GOOGLE_MAPS_MAP_ID,
  onGoogleMapsAuthFailure,
} from "../../utils/googleMaps";

/**
 * Intro "fly-through" on Google Maps: starts zoomed out over India, swoops out
 * a little, then glides down onto the selected area. Same props as the old
 * globe version so MemberMap needs no changes.
 */
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function lerpLng(from, to, t) {
  let diff = to - from;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return from + diff * t;
}

const IDLE_VIEW = { lat: 20.5, lng: 78.9, zoom: 4 };
const END_ZOOM  = 14;
const PEAK_ZOOM = 3;

export default function GlobeIntro({ flyToLocation, wardPolygon, onArrived }) {
  const mapDivRef   = useRef(null);
  const mapRef      = useRef(null);
  const dataRef     = useRef(null);
  const rafRef      = useRef(null);
  const prevFlyRef  = useRef(null);
  const arrivedRef  = useRef(onArrived);
  useEffect(() => {
    arrivedRef.current = onArrived;
  });

  const [ready, setReady]   = useState(false);
  // "unavailable" = no key / auth failure / load failure -> skip the animation
  const [unavailable, setUnavailable] = useState(!hasGoogleMapsKey);

  // ── Init map ──
  useEffect(() => {
    if (!hasGoogleMapsKey || !mapDivRef.current) return undefined;
    let cancelled = false;
    const offAuth = onGoogleMapsAuthFailure(() => setUnavailable(true));

    loadGoogleMaps()
      .then((gm) => {
        if (cancelled || mapRef.current || !mapDivRef.current) return;
        mapRef.current = new gm.Map(mapDivRef.current, {
          center: { lat: IDLE_VIEW.lat, lng: IDLE_VIEW.lng },
          zoom: IDLE_VIEW.zoom,
          mapId: GOOGLE_MAPS_MAP_ID,
          mapTypeId: "hybrid",
          minZoom: 2,
          disableDefaultUI: true,
          gestureHandling: "none",
          keyboardShortcuts: false,
          clickableIcons: false,
          backgroundColor: "#0B0F1A",
        });
        setReady(true);
      })
      .catch(() => !cancelled && setUnavailable(true));

    return () => {
      cancelled = true;
      offAuth();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      dataRef.current?.setMap(null);
      dataRef.current = null;
      if (mapRef.current && window.google?.maps) window.google.maps.event.clearInstanceListeners(mapRef.current);
      mapRef.current = null;
      setReady(false);
    };
  }, []);

  // ── Highlight the selected area while flying ──
  useEffect(() => {
    const map = mapRef.current;
    const gm  = window.google?.maps;
    if (!ready || !map || !gm) return;

    dataRef.current?.setMap(null);
    dataRef.current = null;
    if (!wardPolygon) return;

    const data = new gm.Data({ map });
    data.addGeoJson({ type: "FeatureCollection", features: [wardPolygon] });
    data.setStyle({
      fillColor: "#FBBF24", fillOpacity: 0.45,
      strokeColor: "#FBBF24", strokeWeight: 2, clickable: false,
    });
    dataRef.current = data;
  }, [ready, wardPolygon]);

  // ── Fly in / fly back ──
  useEffect(() => {
    // No usable Google map: don't leave the UI waiting on the animation.
    if (unavailable) {
      if (!flyToLocation) return undefined;
      const t = setTimeout(() => arrivedRef.current?.(), 300);
      return () => clearTimeout(t);
    }

    const map = mapRef.current;
    if (!ready || !map) return undefined;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const read = () => {
      const c = map.getCenter();
      return { lat: c.lat(), lng: c.lng(), zoom: map.getZoom() ?? IDLE_VIEW.zoom };
    };

    if (flyToLocation) {
      const start     = read();
      const end       = { lat: flyToLocation.lat, lng: flyToLocation.lng, zoom: END_ZOOM };
      const peak      = Math.min(start.zoom, PEAK_ZOOM);
      const duration  = 3000;
      const startTime = performance.now();

      const step = (now) => {
        const t     = Math.min((now - startTime) / duration, 1);
        const eased = easeInOutCubic(t);

        const lat = start.lat + (end.lat - start.lat) * eased;
        const lng = lerpLng(start.lng, end.lng, eased);
        const zoom =
          t < 0.5
            ? start.zoom + (peak - start.zoom) * (t / 0.5)
            : peak + (end.zoom - peak) * ((t - 0.5) / 0.5);

        map.moveCamera({ center: { lat, lng }, zoom });

        if (t < 1) rafRef.current = requestAnimationFrame(step);
        else arrivedRef.current?.();
      };

      rafRef.current = requestAnimationFrame(step);
      prevFlyRef.current = flyToLocation;
    } else if (prevFlyRef.current) {
      const start     = read();
      const duration  = 2200;
      const startTime = performance.now();

      const step = (now) => {
        const t     = Math.min((now - startTime) / duration, 1);
        const eased = easeInOutCubic(t);

        map.moveCamera({
          center: {
            lat: start.lat + (IDLE_VIEW.lat - start.lat) * eased,
            lng: lerpLng(start.lng, IDLE_VIEW.lng, eased),
          },
          zoom: start.zoom + (IDLE_VIEW.zoom - start.zoom) * eased,
        });

        if (t < 1) rafRef.current = requestAnimationFrame(step);
      };

      rafRef.current = requestAnimationFrame(step);
      prevFlyRef.current = null;
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [flyToLocation, ready, unavailable]);

  return (
    <div className="w-full h-full bg-[#0B0F1A]">
      <div ref={mapDivRef} className="w-full h-full" />
    </div>
  );
}
