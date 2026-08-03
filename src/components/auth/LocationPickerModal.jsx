import React, { useState, useEffect, useRef, useCallback } from "react";

// ─── Google Maps Loader ───────────────────────────────────────────────────────
function loadGoogleMaps(apiKey) {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) return resolve(window.google.maps);
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function PinIcon({ color = "#1a56db" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={color}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function CrosshairIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" /><line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

// ─── LocationPickerModal ──────────────────────────────────────────────────────
/**
 * Props:
 *   isOpen       – boolean
 *   onClose      – () => void
 *   onSelect     – ({ address, lat, lng }) => void
 *   title        – string  (e.g. "Select Office Location")
 *   initialLat   – number (optional)
 *   initialLng   – number (optional)
 *   apiKey       – string  (your Google Maps API key)
 */
export default function LocationPickerModal({
  isOpen,
  onClose,
  onSelect,
  title = "Select Location",
  initialLat,
  initialLng,
  apiKey = "YOUR_GOOGLE_MAPS_API_KEY", // ← replace or pass as prop
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);

  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [locating, setLocating] = useState(false);

  // Load Google Maps SDK
  useEffect(() => {
    if (!isOpen) return;
    loadGoogleMaps(apiKey)
      .then(() => setMapsLoaded(true))
      .catch(() => setLoadError(true));
  }, [isOpen, apiKey]);

  // Reverse geocode helper
  const reverseGeocode = useCallback((lat, lng) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        setSelectedAddress(results[0].formatted_address);
      }
    });
    setSelectedCoords({ lat, lng });
  }, []);

  // Place marker on map
  const placeMarker = useCallback((lat, lng) => {
    if (!mapInstanceRef.current) return;
    const pos = { lat, lng };
    if (markerRef.current) {
      markerRef.current.setPosition(pos);
    } else {
      markerRef.current = new window.google.maps.Marker({
        position: pos,
        map: mapInstanceRef.current,
        draggable: true,
        animation: window.google.maps.Animation.DROP,
      });
      markerRef.current.addListener("dragend", (e) => {
        reverseGeocode(e.latLng.lat(), e.latLng.lng());
      });
    }
    mapInstanceRef.current.panTo(pos);
  }, [reverseGeocode]);

  // Init map after SDK loads
  useEffect(() => {
    if (!mapsLoaded || !mapRef.current) return;

    const defaultCenter = (initialLat && initialLng)
      ? { lat: initialLat, lng: initialLng }
      : { lat: 20.5937, lng: 78.9629 }; // India center

    const map = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: initialLat ? 15 : 5,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
      ],
    });
    mapInstanceRef.current = map;

    // Click to place marker
    map.addListener("click", (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      placeMarker(lat, lng);
      reverseGeocode(lat, lng);
    });

    // If initial coords provided, drop a marker
    if (initialLat && initialLng) {
      placeMarker(initialLat, initialLng);
      reverseGeocode(initialLat, initialLng);
    }

    // Autocomplete on search input
    if (inputRef.current) {
      const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "in" },
        fields: ["geometry", "formatted_address", "name"],
      });
      autocompleteRef.current = ac;

      ac.addListener("place_changed", () => {
        const place = ac.getPlace();
        if (!place.geometry?.location) return;
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setSelectedAddress(place.formatted_address || place.name || "");
        setSelectedCoords({ lat, lng });
        placeMarker(lat, lng);
        map.setZoom(16);
      });
    }

    return () => {
      // cleanup marker on unmount
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      mapInstanceRef.current = null;
    };
  }, [mapsLoaded]); // eslint-disable-line

  // Use current location
  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        placeMarker(lat, lng);
        reverseGeocode(lat, lng);
        mapInstanceRef.current?.setZoom(16);
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  const handleConfirm = () => {
    if (!selectedCoords) return;
    onSelect({ address: selectedAddress, lat: selectedCoords.lat, lng: selectedCoords.lng });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: "90vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <PinIcon />
            <h2 className="font-semibold text-[15px] text-[#1a2b4a]">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition p-1 rounded-lg hover:bg-slate-100"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Search bar */}
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
          <div className="relative flex items-center gap-2">
            <div className="absolute left-3 text-slate-400">
              <SearchIcon />
            </div>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search for a location..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 pl-9 text-sm outline-none focus:ring-2 focus:ring-[#1a56db]/20 focus:border-[#1a56db] transition"
            />
            <button
              type="button"
              onClick={useCurrentLocation}
              disabled={locating}
              title="Use my current location"
              className="flex items-center gap-1.5 text-[12.5px] font-medium text-[#1a56db] border border-[#1a56db]/30 bg-[#EEF3FF] rounded-lg px-3 py-2.5 hover:bg-[#1a56db] hover:text-white transition disabled:opacity-50 whitespace-nowrap"
            >
              <CrosshairIcon />
              {locating ? "Locating…" : "My location"}
            </button>
          </div>
        </div>

        {/* Map */}
        <div className="relative flex-1" style={{ minHeight: 340 }}>
          {loadError && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-red-500 bg-red-50">
              Failed to load Google Maps. Check your API key.
            </div>
          )}
          {!mapsLoaded && !loadError && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-sm text-slate-400">
              Loading map…
            </div>
          )}
          <div ref={mapRef} className="w-full h-full" style={{ minHeight: 340 }} />

          {/* Hint overlay */}
          {mapsLoaded && !selectedCoords && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-full px-4 py-1.5 text-[12px] text-slate-500 shadow-sm pointer-events-none">
              Click on the map or search to pin a location
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 bg-white">
          {selectedAddress ? (
            <div className="flex items-start gap-2 mb-3">
              <span className="mt-0.5"><PinIcon color="#16a34a" /></span>
              <p className="text-[12.5px] text-slate-600 leading-snug">{selectedAddress}</p>
            </div>
          ) : (
            <p className="text-[12px] text-slate-400 mb-3">No location selected</p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-200 text-slate-600 text-[13.5px] font-medium py-2.5 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedCoords}
              className="flex-1 rounded-lg bg-[#1a56db] text-white text-[13.5px] font-semibold py-2.5 hover:bg-[#1547c0] disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Confirm Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
