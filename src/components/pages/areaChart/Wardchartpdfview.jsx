import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import CoverPage from "./components/CoverPage.jsx";
import ChartHeaderBanner from "./components/Chartheaderbanner.jsx";
import ChartSlot from "./components/ChartSlot.jsx";
import MlaCard from "./components/Mlacard.jsx";
import ChairmanHighlightCard from "./components/Chairmanhighlightcard.jsx";
import SectorCard from "./components/Sectorcard.jsx";
import ProductsPage, { SAMPLE_PRODUCT_CATEGORIES } from "./components/Productspage.jsx";

import {
    getWardChartData,
    selectFetchStatus,
    selectFetchedData,
    selectLayoutConfig,
} from "../../redux/slices/areaChartSlice.js";
import { mapApiToAssignments } from "./utils/Mapapitoassignments.js";
import { paginateBrandCategories } from "./utils/paginateCategories.js";
import { HERO_IMAGE_URL } from "./chartAssets.js";

// ─── Same DEFAULT_CONFIG as WardChartDetail ───────────────────────
const DEFAULT_CONFIG = {
    slotCounts: {
        patrons: 3,
        chairmenPage2: 4,
        chairmenPage3: 13,
        advisories: 3,
        mentors: 3,
        udyamiQueens: 20,
        ubRealtyConstruction: 5,
        ubFinanceIT: 5,
        ubSocialBrand: 5,
        yuvaUdyami: 5,
        ec: 5,
    },
    sectors: [
        { key: "reality", label: "Reality Sector", enabled: true },
        { key: "msme", label: "MSME Sector", enabled: true },
        { key: "healthcare", label: "Healthcare", enabled: true },
        { key: "education", label: "Education Sector", enabled: true },
        { key: "food", label: "Food & Hospitality", enabled: true },
        { key: "tech", label: "Tech-Enabled", enabled: true },
        { key: "orange", label: "Orange Economy", enabled: true },
        { key: "finance", label: "Finance-Capital", enabled: true },
        { key: "skillset", label: "Skillset Matching", enabled: true },
        { key: "news", label: "News & Media", enabled: true },
        { key: "agro", label: "Agro Tech", enabled: true },
        { key: "women", label: "Empower - Women", enabled: true },
    ],
    umsRoles: [
        { key: "ai", label: "AI Lead Generation", enabled: true },
        { key: "comms", label: "Communications Management", enabled: true },
        { key: "digital", label: "Digital Management", enabled: true },
        { key: "ground", label: "Ground Intelligence", enabled: true },
        { key: "circle", label: "Circle Meeting", enabled: true },
        { key: "directory", label: "Member Directory", enabled: true },
        { key: "hall", label: "Hall Coordinator", enabled: true },
        { key: "finance2", label: "UB Finance", enabled: true },
        { key: "kutumba", label: "UB Kutumba Coordinator", enabled: true },
        { key: "arbitration", label: "UB Arbitration", enabled: true },
    ],
    brandTiles: SAMPLE_PRODUCT_CATEGORIES.map((cat) => ({
        ...cat,
        products: cat.products.map((p) => ({ ...p, enabled: true })),
    })),
};

const CORE_ROLES = ["President", "Vice-President", "General Secretary", "Treasurer"];

const CATEGORY_COUNT_MAP = {
    "ub-queens": "udyamiQueens",
    "ub-realty": "ubRealtyConstruction",
    "yuva-udyami": "yuvaUdyami",   // ← ADD
    "ec": "ec",            // ← ADD
    "ub-finance-it": "ubFinanceIT",
    "ub-social": "ubSocialBrand",
};

// ─── Page wrapper ─────────────────────────────────────────────────
function PdfPage({ children }) {
    return (
        <div style={{
            width: "794px",
            minHeight: "1123px",
            pageBreakAfter: "always",
            breakAfter: "page",
            position: "relative",
            background: "white",
            overflow: "hidden",
        }}>
            {children}
        </div>
    );
}

// ─── Page footer ──────────────────────────────────────────────────
function PageFooter({ num }) {
    return (
        <div style={{
            background: "#1B2430",
            height: "28px",
            display: "flex",
            alignItems: "center",
            padding: "0 12px",
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
        }}>
            <span style={{
                width: "22px", height: "22px",
                borderRadius: "50%",
                border: "2px solid white",
                color: "white",
                fontSize: "8px",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}>
                {String(num).padStart(2, "0")}
            </span>
        </div>
    );
}

export default function WardChartPdfView() {
    const { wardId } = useParams();
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();

    const fetchStatus = useSelector(selectFetchStatus);
    const fetchedData = useSelector(selectFetchedData);
    const layoutConfig = useSelector(selectLayoutConfig);

    const [assignments, setAssignments] = useState({});
    const [config, setConfig] = useState(DEFAULT_CONFIG);
    const [ready, setReady] = useState(false);
    const [productPages, setProductPages] = useState([]);
    const measureRef = useRef(null);

    // URL params
    const token = searchParams.get("token");
    const wardHeadId = searchParams.get("wardHeadId");
    const wardName = searchParams.get("wardName") || "";
    const wardNumber = searchParams.get("wardNumber") || "";
    const constituency = searchParams.get("constituency") || "";

    // ── Token → localStorage set பண்ணு → Redux auto pick பண்ணும் ──
    useEffect(() => {
        if (token) {
            localStorage.setItem("token", token);
        }
    }, [token]);

    // ── API call ──
    useEffect(() => {
        if (token && wardHeadId && wardId) {
            // Small delay — localStorage set ஆன பின் dispatch பண்ணு
            setTimeout(() => {
                dispatch(getWardChartData({ userId: wardHeadId, wardId }));
            }, 100);
        }
    }, [token, wardHeadId, wardId]);

    // ── Data process ──
    useEffect(() => {
        if (fetchStatus === "succeeded" && fetchedData) {
            const mapped = mapApiToAssignments(fetchedData);
            setAssignments(mapped);

            if (layoutConfig) {
                setConfig({
                    ...DEFAULT_CONFIG,
                    ...layoutConfig,
                    slotCounts: { ...DEFAULT_CONFIG.slotCounts, ...layoutConfig.slotCounts },
                });
            }

            // Puppeteer-கு ready signal
            setTimeout(() => {
                document.body.setAttribute("data-pdf-ready", "true");
                setReady(true);
            }, 500);
        }
    }, [fetchStatus, fetchedData, layoutConfig]);

    const heroImageUrl = assignments["hero-image"]?.photoUrl || HERO_IMAGE_URL;
    const gCode = wardNumber;
    const noop = () => { };

    const activeSectors = useMemo(() => config.sectors.filter((s) => s.enabled), [config.sectors]);
    const activeUms = useMemo(() => config.umsRoles.filter((s) => s.enabled), [config.umsRoles]);

    const sectorsAndUmsPagination = useMemo(() => {
        const totalSectors = activeSectors.length;
        const totalUms = activeUms.length;

        const advisoriesCount = config?.slotCounts?.advisories ?? 3;
        const mentorsCount = config?.slotCounts?.mentors ?? 3;

        // Rule 1: Both Advisory and Mentor <= 3
        const isRule1AdvisoryMentor = advisoriesCount <= 3 && mentorsCount <= 3;

        if (isRule1AdvisoryMentor) {
            // Under Rule 1: if sectors <= 12 and UMS <= 10, EVERYTHING stays on Page 4!
            if (totalSectors <= 12 && totalUms <= 10) {
                return {
                    firstPageSectors: activeSectors,
                    firstPageUms: activeUms,
                    continuationPages: [],
                };
            }
        }

        // When Advisory & Mentor <= 3, Page 1 takes MORE sectors (9 sectors) + 10 UMS roles!
        // When Advisory or Mentor > 3, Page 1 takes 6 sectors + 8 UMS roles!
        const p1SecCount = isRule1AdvisoryMentor ? 9 : 6;
        const p1UmsCount = isRule1AdvisoryMentor ? 10 : 8;

        const firstSecs = activeSectors.slice(0, p1SecCount);
        const firstUms = activeUms.slice(0, p1UmsCount);

        const remSecs = activeSectors.slice(p1SecCount);
        const remUms = activeUms.slice(p1UmsCount);

        const continuations = [];
        let secIdx = 0;
        let umsIdx = 0;

        while (secIdx < remSecs.length || umsIdx < remUms.length) {
            const pageSecs = remSecs.slice(secIdx, secIdx + 12);
            const pageUms = remUms.slice(umsIdx, umsIdx + 12);
            continuations.push({
                sectors: pageSecs,
                ums: pageUms,
            });
            secIdx += 12;
            umsIdx += 12;
        }

        return {
            firstPageSectors: firstSecs,
            firstPageUms: firstUms,
            continuationPages: continuations,
        };
    }, [activeSectors, activeUms, config?.slotCounts?.advisories, config?.slotCounts?.mentors]);

    const { firstPageSectors, firstPageUms, continuationPages } = sectorsAndUmsPagination;

    const activeBrandCategories = useMemo(() =>
        DEFAULT_CONFIG.brandTiles
            .map((defaultCat) => {
                const savedCat = config.brandTiles?.find((c) => c.key === defaultCat.key);
                const defaultProducts = defaultCat.products;
                const customProducts = (savedCat?.products || []).filter(
                    (sp) => !defaultProducts.some((dp) => dp.key === sp.key)
                );
                const allCatProducts = [...defaultProducts, ...customProducts];

                const mergedProducts = allCatProducts.map((p) => {
                    const savedProduct = savedCat?.products.find((sp) => sp.key === p.key);
                    return { ...p, enabled: savedProduct ? savedProduct.enabled : true };
                });
                const enabledProducts = mergedProducts.filter((p) => p.enabled);
                const countKey = CATEGORY_COUNT_MAP[defaultCat.key];
                const maxCount = countKey
                    ? (config.slotCounts[countKey] ?? enabledProducts.length)
                    : enabledProducts.length;
                const slots = [...enabledProducts];
                while (slots.length < maxCount) {
                    const idx = slots.length;
                    slots.push({ key: `placeholder-${idx}`, name: `Slot ${idx + 1}`, sub: "", enabled: true, isPlaceholder: true });
                }
                return { ...defaultCat, products: slots.slice(0, maxCount) };
            })
            .filter((cat) => cat.products.length > 0),
        [config.brandTiles, config.slotCounts]
    );

    // ─── Dynamic Product Page Pagination Engine ───
    useEffect(() => {
        if (!measureRef.current || activeBrandCategories.length === 0) return;
        const timer = setTimeout(() => {
            if (!measureRef.current) return;

            const container = measureRef.current;
            const bannerEl = container.querySelector("[data-banner]");
            const footerEl = container.querySelector("[data-footer]");

            // Total A4 page height in PdfPage (1123px for 794px width)
            const totalA4Height = 1123;
            const headerHeight = bannerEl ? bannerEl.getBoundingClientRect().height : 60;
            const footerHeight = footerEl ? footerEl.getBoundingClientRect().height : 28;
            const paddingBottom = 20;

            // Usable Content Height = Total A4 Height - Header - Footer - Padding
            const usableContentHeight = totalA4Height - headerHeight - footerHeight - paddingBottom;

            const divs = container.querySelectorAll("[data-cat-key]");
            const measuredHeights = {};
            divs.forEach((div) => {
                const key = div.getAttribute("data-cat-key");
                if (key) {
                    measuredHeights[key] = div.getBoundingClientRect().height;
                }
            });

            const next = paginateBrandCategories(
                activeBrandCategories,
                measuredHeights,
                usableContentHeight,
                0,
                794
            );

            const nextStr = JSON.stringify(next.map((p) => p.map((c) => c.key)));
            const prevStr = JSON.stringify(productPages.map((p) => p.map((c) => c.key)));
            if (nextStr !== prevStr) setProductPages(next);
        }, 150);
        return () => clearTimeout(timer);
    }, [activeBrandCategories]);

    const chairmenP2 = Array.from({ length: config.slotCounts.chairmenPage2 }, (_, i) => i);
    const chairmenP3 = Array.from(
        { length: config.slotCounts.chairmenPage3 },
        (_, i) => i + config.slotCounts.chairmenPage2
    );
    const firstRow = chairmenP3.slice(0, 5);
    const secondRow = chairmenP3.slice(5, 10);
    const thirdRow = chairmenP3.slice(10);

    if (fetchStatus === "loading" || !ready) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
                <p style={{ color: "#666", fontSize: "16px" }}>Generating PDF…</p>
            </div>
        );
    }

    return (
        <div style={{ width: "794px", margin: "0 auto", background: "white" }}>

            {/* ══════ PAGE 1 — COVER ══════ */}
            <PdfPage>
                <CoverPage
                    code={gCode}
                    regionName={wardName}
                    wardNumber={wardNumber}
                    wardName={wardName}
                    heroImageUrl={heroImageUrl}
                    showHeroUpload={false}
                />
            </PdfPage>

            {/* ══════ PAGE 2 — MLA + Officials + Patrons + Chairmen ══════ */}
            <PdfPage>
                <div style={{ display: "flex", flexDirection: "column", height: "1095px" }}>
                    <ChartHeaderBanner code={gCode} wardName={wardName} region={constituency} />

                    <div style={{ padding: "2% 3%", flex: 1 }}>
                        {/* MLA */}
                        <div style={{ display: "flex", justifyContent: "center", paddingTop: "1%" }}>
                            <MlaCard
                                mlaLabel={`MLA - ${wardName} Assembly constituency`}
                                assigned={assignments.mla}
                                onAssignClick={noop}
                                showPlus={false}
                                isSuperAdmin={true}
                            />
                        </div>

                        {/* Horizontal line */}
                        <div style={{ position: "relative", margin: "12px 0 8px" }}>
                            <div style={{ position: "absolute", left: "10%", right: "10%", top: 0, height: "1px", background: "rgba(27,36,48,0.4)" }} />
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", paddingTop: "8px" }}>
                                {Array.from({ length: 4 }).map((_, i) => {
                                    const slotId = `official-${i + 1}`;
                                    return (
                                        <div key={slotId} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                            <div style={{ width: "1px", height: "12px", background: "rgba(27,36,48,0.4)", marginBottom: "4px" }} />
                                            <ChartSlot
                                                slotId={slotId} topLabel={`Official ${i + 1}`}
                                                tone="navy" nameCase="upper"
                                                assigned={assignments[slotId]}
                                                onAssignClick={noop} showPlus={false} isSuperAdmin={true}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Patron banner */}
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "12px 0", position: "relative" }}>
                            <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: "2px", background: "#1a2e5e" }} />
                            <div style={{ position: "relative", background: "#b5121b", color: "white", fontWeight: "bold", padding: "6px 40px", fontSize: "13px", textTransform: "uppercase", borderRadius: "2px 2px 12px 12px", minWidth: "210px", textAlign: "center" }}>
                                UDYAMI PATRON
                            </div>
                        </div>

                        {/* Patrons */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px", marginBottom: "12px" }}>
                            {Array.from({ length: config.slotCounts.patrons }).map((_, i) => {
                                const slotId = `patron-${i + 1}`;
                                return (
                                    <ChartSlot key={slotId} slotId={slotId} tone="navy" nameCase="upper"
                                        assigned={assignments[slotId]} onAssignClick={noop} showPlus={false} isSuperAdmin={true} />
                                );
                            })}
                        </div>

                        <div style={{ borderTop: "1px solid rgba(27,36,48,0.2)", marginBottom: "12px" }} />

                        {/* Chairmen P2 */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px" }}>
                            {chairmenP2.map((i) => {
                                const slotId = `chairman-${i + 1}`;
                                return (
                                    <div key={slotId}>
                                        <p style={{ fontSize: "9px", fontWeight: "bold", color: "#A23B2E", textAlign: "center", marginBottom: "4px", textTransform: "uppercase" }}>
                                            {gCode}.{i + 1} Chairman
                                        </p>
                                        <ChartSlot slotId={slotId} tone="brick" nameCase="upper"
                                            assigned={assignments[slotId]} onAssignClick={noop} showPlus={false} isSuperAdmin={true} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <PageFooter num={2} />
            </PdfPage>

            {/* ══════ PAGE 3 — Chairmen continued ══════ */}
            <PdfPage>
                <div style={{ display: "flex", flexDirection: "column", height: "1095px" }}>
                    <ChartHeaderBanner code={gCode} wardName={wardName} region={constituency} />
                    <div style={{ padding: "2% 3%", flex: 1 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                            {[firstRow, secondRow].map((row, ri) => (
                                <div key={ri} style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "20px" }}>
                                    {row.map((i) => {
                                        const slotId = `chairman-${i + 1}`;
                                        return (
                                            <div key={slotId}>
                                                <p style={{ fontSize: "9px", fontWeight: "bold", color: "#A23B2E", textAlign: "center", marginBottom: "4px", textTransform: "uppercase" }}>
                                                    {gCode}.{i + 1} Chairman
                                                </p>
                                                <ChartSlot slotId={slotId} tone="brick" nameCase="upper"
                                                    assigned={assignments[slotId]} onAssignClick={noop} showPlus={false} isSuperAdmin={true} />
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                            <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
                                {thirdRow.map((i) => {
                                    const slotId = `chairman-${i + 1}`;
                                    return (
                                        <div key={slotId}>
                                            <p style={{ fontSize: "9px", fontWeight: "bold", color: "#A23B2E", textAlign: "center", marginBottom: "4px", textTransform: "uppercase" }}>
                                                {gCode}.{i + 1} Chairman
                                            </p>
                                            <ChartSlot slotId={slotId} tone="brick" nameCase="upper"
                                                assigned={assignments[slotId]} onAssignClick={noop} showPlus={false} isSuperAdmin={true} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
                <PageFooter num={3} />
            </PdfPage>

            {/* ══════ PAGE 4 — Advisory + Leadership + Sectors + UMS ══════ */}
            <PdfPage>
                <div style={{ display: "flex", flexDirection: "column", height: "1095px" }}>
                    <ChartHeaderBanner code={gCode} wardName={wardName} region={constituency} />

                    {/* Advisory + Mentor row */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", gap: "12px", padding: "1.5% 2%", background: "white", borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
                        {/* Advisories */}
                        <div style={{ display: "flex", gap: "16px" }}>
                            {Array.from({ length: config.slotCounts.advisories }).map((_, i) => {
                                const slotId = `advisory-${i + 1}`;
                                return (
                                    <div key={slotId} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                                            <span style={{ width: "20px", height: "20px", borderRadius: "50%", border: "2px solid #c8102e", color: "#c8102e", fontSize: "9px", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                                            <span style={{ fontSize: "11px", fontWeight: "bold", color: "#c8102e" }}>Advisory</span>
                                        </div>
                                        <ChartSlot slotId={slotId} label={`${i + 1} Advisory`} tone="navy"
                                            showPlaceholderName={false} assigned={assignments[slotId]}
                                            onAssignClick={noop} showPlus={false} isSuperAdmin={true} />
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ width: "1px", alignSelf: "stretch", background: "#cbd5e1", margin: "0 4px" }} />

                        {/* Mentors */}
                        <div style={{ display: "flex", gap: "16px" }}>
                            {Array.from({ length: config.slotCounts.mentors }).map((_, i) => {
                                const slotId = `mentor-${i + 1}`;
                                return (
                                    <div key={slotId} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                                            <span style={{ width: "20px", height: "20px", borderRadius: "50%", border: "2px solid #1B2430", color: "#1B2430", fontSize: "9px", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                                            <span style={{ fontSize: "11px", fontWeight: "bold", color: "#1B2430" }}>Mentor</span>
                                        </div>
                                        <ChartSlot slotId={slotId} label={`${i + 1} Mentor`} tone="navy"
                                            showPlaceholderName={false} assigned={assignments[slotId]}
                                            onAssignClick={noop} showPlus={false} isSuperAdmin={true} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Chairman + Core roles */}
                    <div style={{ display: "flex", alignItems: "stretch", background: "#1a2e5e", flexShrink: 0 }}>
                        <div style={{ width: "180px", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start" }}>
                            <ChairmanHighlightCard
                                wardNumber={gCode}
                                assigned={assignments["ward-chairman"]}
                                onAssignClick={noop}
                                showPlus={false}
                                isSuperAdmin={true}
                            />
                        </div>

                        <div style={{ flex: 1, display: "flex", justifyContent: "space-evenly", alignItems: "flex-start" }}>
                            {CORE_ROLES.map((role) => {
                                const slotId = `core-${role.toLowerCase().replace(/\s+/g, "-")}`;
                                return (
                                    <div key={slotId} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "105px" }}>
                                        <p style={{ height: "18px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "bold", color: "white", textAlign: "center", marginBottom: "12px" }}>{role}</p>
                                        <div style={{ position: "relative", width: "90px", height: "90px", borderRadius: "8px", border: "2px solid #c8102e", background: "#d32f2f", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                                            {assignments[slotId]?.photoUrl ? (
                                                <img src={assignments[slotId].photoUrl} alt={assignments[slotId].name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            ) : (
                                                <svg viewBox="0 0 64 64" style={{ width: "85%", height: "85%", color: "white" }} fill="currentColor">
                                                    <circle cx="32" cy="22" r="12" />
                                                    <path d="M8 56 Q8 40 32 40 Q56 40 56 56 Z" />
                                                </svg>
                                            )}
                                        </div>
                                        <p style={{ marginTop: "8px", fontSize: "8px", fontWeight: "bold", color: "white", textTransform: "uppercase", textAlign: "center", lineHeight: 1 }}>
                                            {assignments[slotId]?.name || "NAME"}
                                        </p>
                                        <p style={{ fontSize: "6px", color: "rgba(255,255,255,0.6)", textAlign: "center", lineHeight: 1, marginTop: "4px" }}>
                                            {assignments[slotId]?.company}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Red container: Sectors + UMS (Fills remaining height to footer) */}
                    <div style={{ display: "flex", gap: "10px", padding: "2%", background: "#c8102e", flex: 1, minHeight: 0 }}>
                        {/* Sectors */}
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-evenly", padding: "8px 0" }}>
                            {Array.from({ length: Math.ceil(firstPageSectors.length / 3) }).map((_, rowIdx) => {
                                const rowSectors = firstPageSectors.slice(rowIdx * 3, rowIdx * 3 + 3);
                                return (
                                    <div key={rowIdx} style={{ display: "flex", justifyContent: "center", gap: "24px", padding: "0 16px" }}>
                                        {rowSectors.map((s) => {
                                            const slotId = `sector-${s.key}`;
                                            return (
                                                <div key={s.key} style={{ width: "118px", flexShrink: 0 }}>
                                                    <SectorCard
                                                        slotId={slotId} label={s.label}
                                                        assigned={assignments[slotId]}
                                                        onAssignClick={noop} showPlus={false} isSuperAdmin={true}
                                                    />
                                                </div>
                                            );
                                        })}
                                        {rowSectors.length < 3 && Array.from({ length: 3 - rowSectors.length }).map((_, fi) => (
                                            <div key={`fill-${fi}`} style={{ width: "118px", flexShrink: 0, opacity: 0 }} />
                                        ))}
                                    </div>
                                );
                            })}
                        </div>

                        {/* UMS panel */}
                        {firstPageUms.length > 0 && (
                            <div style={{ width: "250px", borderRadius: "2px", border: "1px solid #1B2430", flexShrink: 0, background: "white", overflow: "hidden", display: "flex", flexDirection: "column", height: "fit-content", alignSelf: "flex-start" }}>
                                <div style={{ background: "#1a2e5e", padding: "5px 0", textAlign: "center", flexShrink: 0 }}>
                                    <p style={{ fontSize: "7px", fontWeight: "500", color: "white", margin: 0 }}>Udyami Management System</p>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", padding: "12px", gap: "12px 16px", alignContent: "flex-start" }}>
                                    {firstPageUms.map((s) => {
                                        const slotId = `ums-${s.key}`;
                                        return (
                                            <div key={s.key} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                <p style={{ fontSize: "6px", fontWeight: "500", color: "#b5121b", textAlign: "center", marginBottom: "6px", minHeight: "14px", lineHeight: 1.2 }}>{s.label}</p>
                                                <div style={{ position: "relative", width: "100%", aspectRatio: "3/2", border: "1px solid #c8102e", borderRadius: "2px", background: "#d0d0d8", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    {assignments[slotId]?.photoUrl && (
                                                        <img src={assignments[slotId].photoUrl} alt={assignments[slotId].name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <PageFooter num={4} />
            </PdfPage>

            {/* ══════ PAGE 4 CONTINUATION — Sectors / UMS Overflow ══════ */}
            {continuationPages.map((contPage, idx) => {
                const pageNum = 5 + idx;
                return (
                    <PdfPage key={`page4-cont-${idx}`}>
                        <div style={{ display: "flex", flexDirection: "column", height: "1095px" }}>
                            <ChartHeaderBanner code={gCode} wardName={wardName} region={constituency} />
                            <div style={{ display: "flex", gap: "10px", padding: "2%", background: "#c8102e", flex: 1, minHeight: 0 }}>
                                {/* Sectors */}
                                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-start", gap: "16px", padding: "12px 0" }}>
                                    {Array.from({ length: Math.ceil(contPage.sectors.length / 3) }).map((_, rowIdx) => {
                                        const rowSectors = contPage.sectors.slice(rowIdx * 3, rowIdx * 3 + 3);
                                        return (
                                            <div key={rowIdx} style={{ display: "flex", justifyContent: "center", gap: "24px", padding: "0 16px" }}>
                                                {rowSectors.map((s) => {
                                                    const slotId = `sector-${s.key}`;
                                                    return (
                                                        <div key={s.key} style={{ width: "118px", flexShrink: 0 }}>
                                                            <SectorCard
                                                                slotId={slotId} label={s.label}
                                                                assigned={assignments[slotId]}
                                                                onAssignClick={noop} showPlus={false} isSuperAdmin={true}
                                                            />
                                                        </div>
                                                    );
                                                })}
                                                {rowSectors.length < 3 && Array.from({ length: 3 - rowSectors.length }).map((_, fi) => (
                                                    <div key={`fill-${fi}`} style={{ width: "118px", flexShrink: 0, opacity: 0 }} />
                                                ))}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* UMS panel */}
                                {contPage.ums.length > 0 && (
                                    <div style={{ width: "250px", borderRadius: "2px", border: "1px solid #1B2430", flexShrink: 0, background: "white", overflow: "hidden", display: "flex", flexDirection: "column", height: "fit-content", alignSelf: "flex-start" }}>
                                        <div style={{ background: "#1a2e5e", padding: "5px 0", textAlign: "center", flexShrink: 0 }}>
                                            <p style={{ fontSize: "7px", fontWeight: "500", color: "white", margin: 0 }}>Udyami Management System (Continued)</p>
                                        </div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", padding: "12px", gap: "12px 20px", flex: 1, alignContent: "flex-start" }}>
                                            {contPage.ums.map((s) => {
                                                const slotId = `ums-${s.key}`;
                                                return (
                                                    <div key={s.key} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                        <p style={{ fontSize: "6px", fontWeight: "500", color: "#b5121b", textAlign: "center", marginBottom: "6px", minHeight: "14px", lineHeight: 1.2 }}>{s.label}</p>
                                                        <div style={{ position: "relative", width: "100%", aspectRatio: "3/2", border: "1px solid #c8102e", borderRadius: "2px", background: "#d0d0d8", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                            {assignments[slotId]?.photoUrl && (
                                                                <img src={assignments[slotId].photoUrl} alt={assignments[slotId].name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <PageFooter num={pageNum} />
                    </PdfPage>
                );
            })}

            {/* ══════ PRODUCT PAGES ══════ */}
            {/* Hidden measure div */}
            <div
                ref={measureRef}
                style={{
                    position: "fixed", top: "-9999px", left: "-9999px",
                    width: "794px", opacity: 0, pointerEvents: "none", zIndex: -1,
                }}
            >
                <div data-banner="true">
                    <ChartHeaderBanner code={gCode} wardName={wardName} region={constituency} />
                </div>
                {activeBrandCategories.map((cat) => {
                    const cols = 5;

                    return (
                        <div key={cat.key} data-cat-key={cat.key}>
                            <div className="flex" style={{ backgroundColor: `${cat.color}18` }}>
                                <div className="w-[32px] shrink-0" style={{ backgroundColor: cat.color }} />
                                <div
                                    className="flex-1 grid gap-[10px] p-[12px]"
                                    style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
                                >
                                    {cat.products.map((p) => (
                                        <div key={p.key}>
                                            <p className="text-[9px] font-bold mb-[4px] truncate">{p.name}</p>
                                            <div className="w-full aspect-square border-[3px] rounded-xl"
                                                style={{ borderColor: cat.color }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div data-footer="true">
                    <PageFooter num={1} />
                </div>
            </div>

            {(productPages.length > 0 ? productPages : [activeBrandCategories]).map((pageCats, pageIdx) => (
                <PdfPage key={`pdf-product-page-${pageIdx}`}>
                    <ProductsPage
                        code={gCode}
                        wardName={wardName}
                        region={constituency}
                        categories={pageCats}
                        assignments={assignments}
                        onAssignClick={noop}
                        showPlus={false}
                        isSuperAdmin={true}
                    />
                    <PageFooter num={5 + pageIdx} />
                </PdfPage>
            ))}

        </div>
    );
}