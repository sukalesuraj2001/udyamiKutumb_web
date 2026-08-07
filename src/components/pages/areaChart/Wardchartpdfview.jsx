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
    selectWards,
} from "../../redux/slices/areaChartSlice.js";
import { mapApiToAssignments } from "./utils/Mapapitoassignments.js";
import { paginateBrandCategories } from "./utils/paginateCategories.js";
import { HERO_IMAGE_URL } from "./chartAssets.js";

// ─── Same DEFAULT_CONFIG as WardChartDetail ───────────────────────
const DEFAULT_CONFIG = {
    slotCounts: {
        patrons: 10,
        chairmenPage2: 4,
        chairmenPage3: 13,
        advisories: 3,
        mentors: 2,
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
        { key: "datascience", label: "Data Science", enabled: true },
        { key: "aiml", label: "AI ML", enabled: true },
        { key: "web3", label: "WEB 3", enabled: true },
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
        const advisoriesCount = config?.slotCounts?.advisories ?? 3;

        // When Advisories > 3 (2 rows of Advisory/Mentor), Page 4 fits 12 sectors & 8 UMS.
        // When Advisories <= 3 (1 row of Advisory/Mentor), Page 4 fits 15 sectors & 10 UMS.
        const p1SecCount = advisoriesCount > 3 ? 12 : 15;
        const p1UmsCount = advisoriesCount > 3 ? 8 : 10;

        const firstSecs = activeSectors.slice(0, p1SecCount);
        const firstUms = activeUms.slice(0, p1UmsCount);

        const remSecs = activeSectors.slice(p1SecCount);
        const remUms = activeUms.slice(p1UmsCount);

        return {
            firstPageSectors: firstSecs,
            firstPageUms: firstUms,
            remSectors: remSecs,
            remUms: remUms,
            continuationPages: [],
        };
    }, [activeSectors, activeUms, config?.slotCounts?.advisories, config?.slotCounts?.mentors]);

    const { firstPageSectors, firstPageUms, remSectors = [], remUms = [] } = sectorsAndUmsPagination;

    const activeBrandCategories = useMemo(() => {
        const baseCats = DEFAULT_CONFIG.brandTiles
            .map((defaultCat) => {
                const savedCat = config.brandTiles?.find((c) => c.key === defaultCat.key);
                const defaultProducts = defaultCat.products;
                const customProducts = (savedCat?.products || []).filter(
                    (sp) => !defaultProducts.some((dp) => dp.key === sp.key)
                );
                const allCatProducts = [...defaultProducts, ...customProducts];

                const mergedProducts = allCatProducts.map((p) => {
                    const savedProduct = savedCat?.products.find((sp) => sp.key === p.key);
                    return {
                        ...p,
                        name: savedProduct?.name || p.name,
                        enabled: savedProduct ? savedProduct.enabled : true,
                    };
                });
                const enabledProducts = mergedProducts.filter((p) => p.enabled);
                const countKey = CATEGORY_COUNT_MAP[defaultCat.key];
                const maxCount = countKey
                    ? (config.slotCounts[countKey] ?? enabledProducts.length)
                    : enabledProducts.length;
                const slots = [...enabledProducts];
                while (slots.length < maxCount) {
                    const idx = slots.length;
                    slots.push({ key: `placeholder-${idx}`, name: `${defaultCat.label} ${idx + 1}`, sub: "", enabled: true, isPlaceholder: true });
                }
                return { ...defaultCat, products: slots.slice(0, maxCount) };
            })
            .filter((cat) => cat.products.length > 0);

        if (remSectors.length > 0 || remUms.length > 0) {
            const sectorItems = remSectors.map((s) => ({
                key: `sector-${s.key}`,
                name: s.label,
                sub: "SECTOR",
                enabled: true,
                itemType: "sector",
            }));
            const umsItems = remUms.map((u) => ({
                key: `ums-${u.key}`,
                name: u.label,
                sub: "UMS",
                enabled: true,
                itemType: "ums",
            }));

            const numRows = Math.max(
                Math.ceil(sectorItems.length / 3),
                Math.ceil(umsItems.length / 2),
                1
            );

            const products = [];
            for (let r = 0; r < numRows; r++) {
                for (let i = 0; i < 3; i++) {
                    const sIdx = r * 3 + i;
                    if (sIdx < sectorItems.length) {
                        products.push(sectorItems[sIdx]);
                    } else {
                        products.push(null);
                    }
                }
                for (let i = 0; i < 2; i++) {
                    const uIdx = r * 2 + i;
                    if (uIdx < umsItems.length) {
                        products.push(umsItems[uIdx]);
                    } else {
                        products.push(null);
                    }
                }
            }

            const extraCat = {
                key: "extra-sectors-ums",
                label: "SECTORS & UMS",
                color: "#c8102e",
                products: products,
            };
            return [extraCat, ...baseCats];
        }

        return baseCats;
    }, [config.brandTiles, config.slotCounts, remSectors, remUms]);

    const productPages = useMemo(
        () => paginateBrandCategories(activeBrandCategories),
        [activeBrandCategories]
    );


    const reduxWards = useSelector(selectWards) || [];
    const constituencyWards = useMemo(() => {
        if (!ward?.constituency) return reduxWards;
        return reduxWards.filter((w) => w.constituency === ward.constituency);
    }, [reduxWards, ward?.constituency]);

    const reduxWardCount = constituencyWards.length > 0 ? constituencyWards.length : (reduxWards.length > 0 ? reduxWards.length : null);
    const apiWardCount = fetchedData?.data?.constituencyWardCount || fetchedData?.data?.wardsCount || fetchedData?.data?.totalWards || fetchedData?.data?.wardLength || (Array.isArray(fetchedData?.data?.wards) ? fetchedData.data.wards.length : null);

    const totalChairmenCount = Number(
        ward?.constituencyWardCount ||
        ward?.wardsCount ||
        ward?.wardLength ||
        ward?.totalWards ||
        reduxWardCount ||
        apiWardCount ||
        9
    );

    const totalPatrons = Number(config.slotCounts?.patrons ?? 10);
    const patronRows = Math.ceil(totalPatrons / 5);

    const patronRowsP2 = Math.min(patronRows, 3);
    const maxChairmanRowsP2 = Math.max(1, 4 - patronRowsP2);
    const maxChairmenP2 = maxChairmanRowsP2 * 5;

    const p2Count = Math.min(totalChairmenCount, maxChairmenP2);
    const chairmenP2 = Array.from({ length: p2Count }, (_, i) => i);
    const p3Count = Math.max(0, totalChairmenCount - p2Count);
    const chairmenP3 = Array.from({ length: p3Count }, (_, i) => i + p2Count);

    const chairmenRowsP3 = useMemo(() => {
        const rows = [];
        for (let i = 0; i < chairmenP3.length; i += 5) {
            rows.push(chairmenP3.slice(i, i + 5));
        }
        return rows;
    }, [chairmenP3]);

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
                        <div style={{ position: "relative", margin: "6px 0 4px" }}>
                            <div style={{ position: "absolute", left: "10%", right: "10%", top: 0, height: "1px", background: "rgba(27,36,48,0.4)" }} />
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", paddingTop: "4px" }}>
                                {Array.from({ length: 4 }).map((_, i) => {
                                    const slotId = `official-${i + 1}`;
                                    return (
                                        <div key={slotId} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                            <div style={{ width: "1px", height: "8px", background: "rgba(27,36,48,0.4)", marginBottom: "2px" }} />
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
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "6px 0", position: "relative" }}>
                            <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: "2px", background: "#1a2e5e" }} />
                            <div style={{ position: "relative", background: "#b5121b", color: "white", fontWeight: "bold", padding: "4px 32px", fontSize: "12px", textTransform: "uppercase", borderRadius: "2px 2px 12px 12px", minWidth: "200px", textAlign: "center" }}>
                                UDYAMI PATRON
                            </div>
                        </div>

                        {/* Patrons */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px 12px", marginBottom: "6px" }}>
                            {Array.from({ length: config.slotCounts.patrons }).map((_, i) => {
                                const slotId = `patron-${i + 1}`;
                                return (
                                    <ChartSlot key={slotId} slotId={slotId} tone="navy" nameCase="upper"
                                        assigned={assignments[slotId]} onAssignClick={noop} showPlus={false} isSuperAdmin={true} />
                                );
                            })}
                        </div>

                        <div style={{ borderTop: "1px solid rgba(27,36,48,0.2)", marginBottom: "6px" }} />

                        {/* Chairmen P2 */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px 12px" }}>
                            {chairmenP2.map((i) => {
                                const slotId = `chairman-${i + 1}`;
                                return (
                                    <div key={slotId}>
                                        <p style={{ fontSize: "8.5px", fontWeight: "bold", color: "#A23B2E", textAlign: "center", marginBottom: "2px", textTransform: "uppercase" }}>
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
            {chairmenP3.length > 0 && (
                <PdfPage>
                    <div style={{ display: "flex", flexDirection: "column", height: "1095px" }}>
                        <ChartHeaderBanner code={gCode} wardName={wardName} region={constituency} />
                        <div style={{ padding: "2% 3%", flex: 1 }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                {chairmenRowsP3.map((row, ri) => (
                                    <div key={ri} style={{ display: "flex", justifyContent: row.length === 5 ? "stretch" : "center", gap: "20px" }}>
                                        {row.map((i) => {
                                            const slotId = `chairman-${i + 1}`;
                                            return (
                                                <div key={slotId} style={{ flex: row.length === 5 ? 1 : "none", width: row.length < 5 ? "110px" : "auto" }}>
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
                            </div>
                        </div>
                    </div>
                    <PageFooter num={3} />
                </PdfPage>
            )}

            {/* ══════ PAGE 4 — Advisory + Leadership + Sectors + UMS ══════ */}
            <PdfPage>
                <div style={{ display: "flex", flexDirection: "column", height: "1095px" }}>
                    <ChartHeaderBanner code={gCode} wardName={wardName} region={constituency} />

                    {/* Advisory + Mentor row */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", padding: "14px 16px", background: "white", borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
                        {Array.from({
                            length: Math.max(
                                Math.ceil((config.slotCounts.advisories || 3) / 3),
                                Math.ceil((config.slotCounts.mentors || 2) / 2)
                            ),
                        }).map((_, r) => {
                            const totalAdv = config.slotCounts.advisories || 3;
                            const totalMen = config.slotCounts.mentors || 2;
                            const rowAdvisories = Array.from({ length: totalAdv }).slice(r * 3, (r + 1) * 3);
                            const rowMentors = Array.from({ length: totalMen }).slice(r * 2, (r + 1) * 2);

                            return (
                                <div key={r} style={{ display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
                                    {/* Advisories slice */}
                                    <div style={{ display: "flex", gap: "48px" }}>
                                        {rowAdvisories.map((_, idx) => {
                                            const i = r * 3 + idx;
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

                                    <div style={{ width: "1px", alignSelf: "stretch", background: "#cbd5e1", margin: "0 32px" }} />

                                    {/* Mentors slice */}
                                    <div style={{ display: "flex", gap: "56px" }}>
                                        {rowMentors.map((_, idx) => {
                                            const i = r * 2 + idx;
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
                            );
                        })}
                    </div>

                    {/* Chairman + Core roles */}
                    <div style={{ display: "flex", alignItems: "center", background: "#1a2e5e", flexShrink: 0, padding: "14px 16px", gap: "16px" }}>
                        <div style={{ width: "140px", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <ChairmanHighlightCard
                                wardNumber={gCode}
                                assigned={assignments["ward-chairman"]}
                                onAssignClick={noop}
                                showPlus={false}
                                isSuperAdmin={true}
                            />
                        </div>

                        <div style={{ flex: 1, display: "flex", justifyContent: "space-evenly", alignItems: "center" }}>
                            {CORE_ROLES.map((role) => {
                                const slotId = `core-${role.toLowerCase().replace(/\s+/g, "-")}`;
                                return (
                                    <div key={slotId} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "105px", gap: "4px" }}>
                                        <p style={{ fontSize: "11px", fontWeight: "bold", color: "white", textAlign: "center", marginBottom: "4px" }}>{role}</p>
                                        <div style={{ position: "relative", width: "95px", height: "95px", borderRadius: "8px", border: "2px solid #c8102e", background: "#d32f2f", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                                            {assignments[slotId]?.photoUrl ? (
                                                <img src={assignments[slotId].photoUrl} alt={assignments[slotId].name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            ) : (
                                                <svg viewBox="0 0 64 64" style={{ width: "85%", height: "85%", color: "white" }} fill="currentColor">
                                                    <circle cx="32" cy="22" r="12" />
                                                    <path d="M8 56 Q8 40 32 40 Q56 40 56 56 Z" />
                                                </svg>
                                            )}
                                        </div>
                                        <p style={{ marginTop: "6px", fontSize: "9.5px", fontWeight: "bold", color: "white", textTransform: "uppercase", textAlign: "center", lineHeight: 1.2 }}>
                                            {assignments[slotId]?.name || "NAME"}
                                        </p>
                                        <p style={{ fontSize: "7.5px", color: "rgba(255,255,255,0.7)", textAlign: "center", lineHeight: 1.2 }}>
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
                        {firstPageUms.length > 0 && (
                            <div style={{ width: "250px", borderRadius: "2px", border: "1px solid #1B2430", flexShrink: 0, background: "white", overflow: "hidden", display: "flex", flexDirection: "column", height: "100%", alignSelf: "stretch" }}>
                                <div style={{ background: "#1a2e5e", padding: "5px 0", textAlign: "center", flexShrink: 0 }}>
                                    <p style={{ fontSize: "7.5px", fontWeight: "bold", color: "white", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Udyami Management System</p>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", padding: "8px 12px", gap: "6px 12px", alignContent: "space-around", flex: 1 }}>
                                    {firstPageUms.map((s) => {
                                        const slotId = `ums-${s.key}`;
                                        const assigned = assignments[slotId];
                                        return (
                                            <div key={s.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 0 }}>
                                                <p style={{ fontSize: "6px", fontWeight: "500", color: "#b5121b", textAlign: "center", marginBottom: "3px", minHeight: "10px", lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>{s.label}</p>
                                                <div style={{ position: "relative", width: "100%", aspectRatio: "3/2", border: "1px solid #c8102e", borderRadius: "2px", background: "#d0d0d8", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    {assigned?.photoUrl ? (
                                                        <img src={assigned.photoUrl} alt={assigned.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                    ) : assigned?.name ? (
                                                        <svg viewBox="0 0 64 64" style={{ width: "50%", height: "50%", color: "#475569" }} fill="currentColor">
                                                            <circle cx="32" cy="22" r="12" />
                                                            <path d="M8 56 Q8 40 32 40 Q56 40 56 56 Z" />
                                                        </svg>
                                                    ) : null}
                                                </div>
                                                <p style={{ fontSize: "7.5px", fontWeight: "bold", color: "#1e293b", textAlign: "center", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%", lineHeight: 1.1, minHeight: "10px" }}>
                                                    {assigned?.name || ""}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <PageFooter num={chairmenP3.length > 0 ? 4 : 3} />
            </PdfPage>

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
                    <PageFooter num={(chairmenP3.length > 0 ? 5 : 4) + pageIdx} />
                </PdfPage>
            ))}

        </div>
    );
}