import React, { useEffect, useRef, useState } from "react";
import Globe from "react-globe.gl";

const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function lerpLng(from, to, t) {
  let diff = to - from;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return from + diff * t;
}

const IDLE_POV = { lat: 20, lng: 78, altitude: 1.8 };

export default function GlobeIntro({ flyToLocation, wardPolygon, onArrived }) {
  const globeRef      = useRef(null);
  const containerRef  = useRef(null);
  const rafRef        = useRef(null);
  const prevFlyRef    = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const resize = () => {
      if (containerRef.current) {
        setDimensions({
          width:  containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    const g = globeRef.current;
    if (!g) return;
    g.pointOfView(IDLE_POV, 0);
    const controls = g.controls();
    controls.autoRotate      = true;
    controls.autoRotateSpeed = 0.4;
    controls.enableZoom      = false;
    controls.enablePan       = false;
  }, []);

  useEffect(() => {
    const g = globeRef.current;
    if (!g) return;
    const controls = g.controls();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    if (flyToLocation) {
      controls.autoRotate = false;

      const current    = g.pointOfView();
      const start      = { ...current };
      const end        = { lat: flyToLocation.lat, lng: flyToLocation.lng, altitude: 0.08 };
      const peakAlt    = Math.max(start.altitude, 2.2);
      const duration   = 3000;
      const startTime  = performance.now();

      const step = (now) => {
        const t     = Math.min((now - startTime) / duration, 1);
        const eased = easeInOutCubic(t);

        const lat = start.lat + (end.lat - start.lat) * eased;
        const lng = lerpLng(start.lng, end.lng, eased);
        const altitude =
          t < 0.5
            ? start.altitude + (peakAlt - start.altitude) * (t / 0.5)
            : peakAlt + (end.altitude - peakAlt) * ((t - 0.5) / 0.5);

        g.pointOfView({ lat, lng, altitude }, 0);

        if (t < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          onArrived?.();
        }
      };

      rafRef.current = requestAnimationFrame(step);
      prevFlyRef.current = flyToLocation;

    } else if (prevFlyRef.current) {
      controls.autoRotate = false;

      const current   = g.pointOfView();
      const start     = { ...current };
      const duration  = 2200;
      const startTime = performance.now();

      const step = (now) => {
        const t     = Math.min((now - startTime) / duration, 1);
        const eased = easeInOutCubic(t);

        const lat      = start.lat + (IDLE_POV.lat - start.lat) * eased;
        const lng      = lerpLng(start.lng, IDLE_POV.lng, eased);
        const altitude = start.altitude + (IDLE_POV.altitude - start.altitude) * eased;

        g.pointOfView({ lat, lng, altitude }, 0);

        if (t < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          controls.autoRotate = true;
        }
      };

      rafRef.current = requestAnimationFrame(step);
      prevFlyRef.current = null;
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [flyToLocation]);

  const polygonsData = wardPolygon ? [wardPolygon] : [];

  // ✅ Fix: use ward_name from actual API response properties
  const wardLabel = wardPolygon?.properties?.ward_name
    || wardPolygon?.properties?.Ward_Name
    || `Ward ${wardPolygon?.properties?.ward_id || ""}`;

  return (
    <div ref={containerRef} className="w-full h-full bg-[#0B0F1A]">
      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        atmosphereColor="#4A6FC9"
        atmosphereAltitude={0.18}
        polygonsData={polygonsData}
        polygonCapColor={() => "rgba(251,191,36,0.45)"}
        polygonSideColor={() => "rgba(180,120,0,0.7)"}
        polygonStrokeColor={() => "#FBBF24"}
        polygonAltitude={0.006}
        polygonLabel={() => wardLabel}
      />
    </div>
  );
}