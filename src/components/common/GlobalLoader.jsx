import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import logo from "../../assets/logo.png";

export default function GlobalLoader() {
  const { isLoading, activeRequests, requestStartTime } = useSelector(
    (s) => s.globalLoader
  );

  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [fillPct, setFillPct] = useState(0);
  const [done, setDone]       = useState(false);

  const canvasRef         = useRef(null);
  const waveRafRef        = useRef(null);
  const fillRafRef        = useRef(null);

  const fillRef           = useRef(0);
  const phaseRef          = useRef("idle"); // idle | crawl | burst | hold | exit
  const startTimeRef      = useRef(null);
  const phaseStartTimeRef = useRef(null);
  const burstStartFillRef = useRef(0);
  const waveOffsetRef     = useRef(0);

  // ── Wave draw loop (independent RAF) ─────────────────────────────────────
  const drawWave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;

    waveOffsetRef.current += 2;
    const o = waveOffsetRef.current;

    ctx.clearRect(0, 0, W, H);

    const fillY = H * 0.45;

    // Wave 1
    const g1 = ctx.createLinearGradient(0, 0, W, 0);
    g1.addColorStop(0,   "rgba(240,118,48,0.92)");
    g1.addColorStop(0.5, "rgba(41,182,176,0.92)");
    g1.addColorStop(1,   "rgba(61,168,216,0.92)");

    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x++) {
      const y = Math.sin((x / W) * Math.PI * 3 + o * 0.06) * 9
              + Math.sin((x / W) * Math.PI * 1.5 + o * 0.04) * 5
              + fillY;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fillStyle = g1;
    ctx.fill();

    // Wave 2 — softer layer
    const g2 = ctx.createLinearGradient(0, 0, W, 0);
    g2.addColorStop(0,   "rgba(61,168,216,0.55)");
    g2.addColorStop(0.5, "rgba(41,182,176,0.55)");
    g2.addColorStop(1,   "rgba(240,118,48,0.55)");

    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x++) {
      const y = Math.sin((x / W) * Math.PI * 2.5 + o * 0.05 + 1.2) * 7
              + Math.sin((x / W) * Math.PI * 1.2 + o * 0.035) * 4
              + fillY + 4;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fillStyle = g2;
    ctx.fill();

    waveRafRef.current = requestAnimationFrame(drawWave);
  }, []);

  // ── Start/Stop wave when visible ─────────────────────────────────────────
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => {
      cancelAnimationFrame(waveRafRef.current);
      waveRafRef.current = requestAnimationFrame(drawWave);
    }, 30);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(waveRafRef.current);
    };
  }, [visible, drawWave]);

  // ── Main Fill & Phase Animation Loop ──────────────────────────────────────
  const isLoadingRef = useRef(isLoading);
  const activeRequestsRef = useRef(activeRequests);

  useEffect(() => {
    isLoadingRef.current = isLoading;
    activeRequestsRef.current = activeRequests;
  }, [isLoading, activeRequests]);

  useEffect(() => {
    if (isLoading || activeRequests > 0) {
      setVisible(true);

      if (phaseRef.current === "idle") {
        fillRef.current = 0;
        setFillPct(0);
        setDone(false);
        setExiting(false);
        startTimeRef.current = requestStartTime || Date.now();
        phaseRef.current = "crawl";
        phaseStartTimeRef.current = Date.now();
      } else if (
        phaseRef.current === "burst" ||
        phaseRef.current === "hold" ||
        phaseRef.current === "exit"
      ) {
        setExiting(false);
        setDone(false);
        phaseRef.current = "crawl";
        if (requestStartTime) {
          startTimeRef.current = requestStartTime;
        }
      }
    }
  }, [isLoading, activeRequests, requestStartTime]);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const currentPhase = phaseRef.current;

      if (currentPhase === "crawl") {
        const start = startTimeRef.current || now;
        const sessionElapsed = Math.max(0, now - start);

        // Smooth logarithmic/asymptotic crawl towards 83.5%
        const maxCrawl = 83.5;
        const targetCrawl = maxCrawl * (1 - Math.exp(-sessionElapsed / 2200));

        // Never move backwards
        const newFill = Math.max(fillRef.current, Math.min(maxCrawl, targetCrawl));
        fillRef.current = newFill;
        setFillPct(newFill);

        const isStillLoading = isLoadingRef.current || activeRequestsRef.current > 0;
        const minDisplayMet = sessionElapsed >= 600;

        if (!isStillLoading && minDisplayMet) {
          phaseRef.current = "burst";
          burstStartFillRef.current = fillRef.current;
          phaseStartTimeRef.current = now;
        }
      } else if (currentPhase === "burst") {
        const burstElapsed = now - (phaseStartTimeRef.current || now);
        const duration = 380; // ~350-400ms
        const progress = Math.min(1, burstElapsed / duration);

        const ease = 1 - Math.pow(1 - progress, 3);
        const newFill = burstStartFillRef.current + (100 - burstStartFillRef.current) * ease;

        fillRef.current = Math.max(fillRef.current, Math.min(100, newFill));
        setFillPct(fillRef.current);

        if (progress >= 1 || fillRef.current >= 100) {
          fillRef.current = 100;
          setFillPct(100);
          setDone(true);

          phaseRef.current = "hold";
          phaseStartTimeRef.current = now;
        }
      } else if (currentPhase === "hold") {
        const holdElapsed = now - (phaseStartTimeRef.current || now);
        if (holdElapsed >= 300) { // ~300ms hold
          phaseRef.current = "exit";
          phaseStartTimeRef.current = now;
          setExiting(true);
        }
      } else if (currentPhase === "exit") {
        const exitElapsed = now - (phaseStartTimeRef.current || now);
        if (exitElapsed >= 300) { // ~300ms exit fade
          phaseRef.current = "idle";
          setVisible(false);
          setExiting(false);
          setDone(false);
          fillRef.current = 0;
          setFillPct(0);
        }
      }

      if (phaseRef.current !== "idle") {
        fillRafRef.current = requestAnimationFrame(tick);
      }
    };

    if (visible) {
      cancelAnimationFrame(fillRafRef.current);
      fillRafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(fillRafRef.current);
    };
  }, [visible]);

  useEffect(() => () => {
    cancelAnimationFrame(waveRafRef.current);
    cancelAnimationFrame(fillRafRef.current);
  }, []);

  if (!visible) return null;

  const WRAP = 220;
  const filledPx     = (fillPct / 100) * WRAP;
  const CANVAS_H     = 60;
  const bottomOffset = Math.max(-CANVAS_H * 0.3, Math.min(filledPx - CANVAS_H * 0.5, WRAP));

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center
        transition-opacity duration-300 ${exiting ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      style={{
        backdropFilter: "blur(5px)",
        WebkitBackdropFilter: "blur(5px)",
        backgroundColor: "rgba(0,0,0,0.22)",
      }}
    >
      {/* ── Logo + wave stack ── */}
      <div style={{ position: "relative", width: WRAP, height: WRAP }}>

        {/* 1. Ghost logo — full, desaturated */}
        <img
          src={logo}
          alt=""
          aria-hidden
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "contain",
            filter: done
              ? "none"
              : "grayscale(1) brightness(1.9) opacity(0.22)",
            transition: "filter 0.5s ease",
            zIndex: 1,
          }}
        />

        {/* 2. Wave + colour fill — masked to logo shape */}
        <div
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            WebkitMaskImage: `url(${logo})`,
            maskImage: `url(${logo})`,
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskPosition: "center",
            maskPosition: "center",
            zIndex: 2,
          }}
        >
          {/* Wave canvas — positioned at waterline, clipped to logo mask */}
          {!done && (
            <canvas
              ref={canvasRef}
              width={WRAP}
              height={CANVAS_H}
              style={{
                position: "absolute",
                left: 0,
                bottom: bottomOffset,
                width: "100%",
                opacity: fillPct > 1 ? 1 : 0,
                transition: "opacity 0.3s",
              }}
            />
          )}

          {/* Coloured logo revealed from bottom — sits above wave */}
          <img
            src={logo}
            alt="Kutumba"
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "contain",
              clipPath: `inset(${Math.max(0, 100 - fillPct)}% 0 0 0)`,
            }}
          />
        </div>
      </div>

      {/* ── Tagline ── */}
      <div
        className="mt-3 text-center"
        style={{ opacity: done ? 1 : 0.8, transition: "opacity 0.4s" }}
      >
        {/* <p
          className="text-[11px] font-semibold tracking-[0.22em] uppercase"
          style={{ color: "#7ee8e4", textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}
        >
          Udyami Bharat
        </p>
        <h1
          className="text-2xl font-black tracking-tight text-white"
          style={{ textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}
        >
          Kutumba
        </h1> */}
      </div>
    </div>
  );
}