import React, { useState, useEffect, useCallback } from "react";

export const ImageLightbox = ({ images, startIndex = 0, onClose }) => {
  const [current, setCurrent] = useState(startIndex);
  const [loaded, setLoaded]   = useState(false);
  const [zoomed, setZoomed]   = useState(false);

  const total = images.length;

  const prev = useCallback(() => {
    setLoaded(false);
    setZoomed(false);
    setCurrent((i) => (i - 1 + total) % total);
  }, [total]);

  const next = useCallback(() => {
    setLoaded(false);
    setZoomed(false);
    setCurrent((i) => (i + 1) % total);
  }, [total]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, prev, next]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!images || images.length === 0) return null;

  const img = images[current] || {};

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.92)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        animation: "lbFadeIn 0.18s ease",
      }}
    >
      <style>{`
        @keyframes lbFadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes lbSlideUp { from { opacity:0; transform:translateY(18px) scale(0.97) } to { opacity:1; transform:translateY(0) scale(1) } }
        @keyframes spin { to { transform:rotate(360deg) } }
      `}</style>

      {/* ── Top bar ── */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)",
          zIndex: 10,
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
            {img.imageType || `Image ${current + 1}`}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
            {current + 1} / {total}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Zoom toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setZoomed((z) => !z);
            }}
            title={zoomed ? "Fit to screen" : "Zoom in"}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            {zoomed ? "⊖" : "⊕"}
          </button>
          {/* Download */}
          <a
            href={img.imageUrl}
            download
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="Download image"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              textDecoration: "none",
            }}
          >
            ↓
          </a>
          {/* Close */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            title="Close (Esc)"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* ── Main image ── */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          maxWidth: zoomed ? "none" : "88vw",
          maxHeight: zoomed ? "none" : "78vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "lbSlideUp 0.22s ease",
        }}
      >
        {!loaded && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.15)",
                borderTop: "2px solid #fff",
                animation: "spin 0.7s linear infinite",
              }}
            />
          </div>
        )}
        <img
          key={current}
          src={img.imageUrl}
          alt={img.imageType || "Survey image"}
          onLoad={() => setLoaded(true)}
          onClick={() => setZoomed((z) => !z)}
          style={{
            maxWidth: zoomed ? "95vw" : "88vw",
            maxHeight: zoomed ? "95vh" : "78vh",
            width: "auto",
            height: "auto",
            borderRadius: zoomed ? 4 : 12,
            boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
            objectFit: "contain",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.2s",
            cursor: zoomed ? "zoom-out" : "zoom-in",
            display: "block",
          }}
        />
      </div>

      {/* ── Prev / Next arrows ── */}
      {total > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            style={{
              position: "absolute",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
              fontSize: 20,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.15s",
              zIndex: 10,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.22)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
          >
            ‹
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            style={{
              position: "absolute",
              right: 16,
              top: "50%",
              transform: "translateY(-50%)",
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
              fontSize: 20,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.15s",
              zIndex: 10,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.22)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
          >
            ›
          </button>
        </>
      )}

      {/* ── Bottom thumbnail strip ── */}
      {total > 1 && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            bottom: 18,
            display: "flex",
            gap: 8,
            alignItems: "center",
            padding: "8px 12px",
            background: "rgba(0,0,0,0.5)",
            borderRadius: 12,
            backdropFilter: "blur(8px)",
            maxWidth: "90vw",
            overflowX: "auto",
          }}
        >
          {images.map((im, i) => (
            <div
              key={im.imageId ?? i}
              onClick={() => {
                setLoaded(false);
                setZoomed(false);
                setCurrent(i);
              }}
              style={{
                width: i === current ? 52 : 42,
                height: i === current ? 52 : 42,
                borderRadius: 8,
                overflow: "hidden",
                flexShrink: 0,
                cursor: "pointer",
                border: i === current ? "2px solid #fff" : "2px solid transparent",
                opacity: i === current ? 1 : 0.55,
                transition: "all 0.15s",
              }}
            >
              <img
                src={im.imageUrl}
                alt={im.imageType || `img ${i}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageLightbox;
