import React, { useMemo, useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { User, UserPlus, SlidersHorizontal, Printer, Download, Pencil, FileCheck2 } from "lucide-react";
import ChartSlot from "./components/ChartSlot.jsx";
import MlaCard from "./components/Mlacard.jsx";
import ChairmanHighlightCard from "./components/Chairmanhighlightcard.jsx";
import SectorCard from "./components/Sectorcard.jsx";
import UmsCard from "./components/Umscard.jsx";
import ProductsPage, { SAMPLE_PRODUCT_CATEGORIES } from "./components/Productspage.jsx";
import ChartHeaderBanner from "./components/Chartheaderbanner.jsx";
import CustomizeLayoutModal from "./models/CustomizeLayoutModal.jsx";
import AssignPositionModal from "./models/AssignPositionModal.jsx";
import AllAssignmentsTable from "./components/AllAssignmentsTable.jsx";
import CoverPage from "./components/CoverPage.jsx";
import ChartPreviewFrame from "./components/ChartPreviewFrame.jsx";
import { useSelector, useDispatch } from "react-redux";
import PositionDetailsModal from "./models/PositionDetailsModal.jsx";
import { deleteWardChartMember, selectLayoutConfig, selectWardInfo } from "../../redux/slices/areaChartSlice.js";
import { HERO_IMAGE_URL } from "./chartAssets.js";
import {
  createWardChartData,
  getWardChartData,
  getLocationByWardHeadId,
  selectWards,
  selectAreaChartStatus,
  selectAreaChartError,
  selectFetchStatus,
  selectFetchedData,
} from "../../redux/slices/areaChartSlice.js";
import { mapApiToAssignments } from "./utils/Mapapitoassignments.js";
import { paginateBrandCategories } from "./utils/paginateCategories.js";
import { getLayoutCountString } from "./utils/calculateLayoutCount.js";
import ImageCropModal from "./models/ImageCropModal.jsx";
import domtoimage from "dom-to-image-more";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import axios from "axios";

const BASE_URL = "https://udyami-circle-db.onrender.com";

// ─── PDF Structure ────────────────────────────────────────────────
// Page 1  : Cover (CoverPage component)
// Page 2  : Header + MLA (center, top) + 4 Officials below +
//           "UDYAMI PATRON" banner + 10 Patrons (2 rows × 5) +
//           G19.xx.1–G19.xx.10 Chairmen (2 rows × 5)
// Page 3  : Header + G19.xx.11–G19.xx.23 Chairmen (continue)
// Page 4  : Header + Advisory(3)/Mentor(3) row +
//           Leadership row (Chairman G19.xx + President/VP/GS/Treasurer) +
//           Red content area: Sectors (4×3 grid) + UMS panel (2-col)
// Page 5  : Products (ProductsPage)
// ─────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG = {
  slotCounts: {
    patrons: 10,
    chairmenPage2: 4,
    chairmenPage3: 13,
    advisories: 3,
    mentors: 2,
    udyamiQueens: 20,
    ubRealtyConstruction: 5,
    yuvaUdyami: 5,   // ← ADD
    ec: 5,           // ← ADD
    ubFinanceIT: 5,
    ubSocialBrand: 5,
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

function userTypeFromSlotId(slotId) {
  if (slotId === "mla") return "MLA";
  if (slotId === "ward-chairman") return "WardChairman";
  if (slotId.startsWith("official-")) return "Official";
  if (slotId.startsWith("patron-")) return "Patron";
  if (slotId.startsWith("chairman-")) return "Chairman";
  if (slotId.startsWith("advisory-")) return "Advisory";
  if (slotId.startsWith("mentor-")) return "Mentor";
  if (slotId.startsWith("core-")) return "CoreTeam";
  if (slotId.startsWith("sector-")) return "Sector";
  if (slotId.startsWith("ums-")) return "UMS";
  return "Member";
}

const getEffectiveWardHeadId = (user) => {
  if (user?.role === "WardChairman") {
    return user?.userId || "";
  }
  try {
    const meta = JSON.parse(localStorage.getItem("wardChartMeta") || "{}");
    if (meta && meta.wardHeadId) {
      return meta.wardHeadId;
    }
  } catch (e) {
    // fallback if JSON parse fails
  }
  return user?.userId || "";
};

function buildSingleMemberPayload(ward, user, slotId, assignmentData) {
  const coreRoleMap = {
    "core-president": "President",
    "core-vice-president": "Vice-President",
    "core-general-secretary": "General Secretary",
    "core-treasurer": "Treasurer",
  };

  let sectorKey = null;
  let umsKey = null;
  if (slotId.startsWith("sector-")) sectorKey = slotId.replace("sector-", "");
  if (slotId.startsWith("ums-")) umsKey = slotId.replace("ums-", "");

  const memberObj = {
    userType: userTypeFromSlotId(slotId),
    slotId,
    name: assignmentData.name || "",
    mobileNumber: assignmentData.mobileNumber || "",
    email: assignmentData.email || "",
    companyName: assignmentData.company || "",
    profileImage: assignmentData.photoUrl || "",
    status: assignmentData.status || "registered",
    slotLabel: assignmentData.slotLabel || slotId,
  };

  if (coreRoleMap[slotId]) memberObj.coreRole = coreRoleMap[slotId];
  if (sectorKey) memberObj.sectorKey = sectorKey;
  if (umsKey) memberObj.umsKey = umsKey;

  return {
    wardHeadId: getEffectiveWardHeadId(user),
    ward: ward.ward_name || ward.ward_number || "",
    members: [memberObj],
  };
}

function PageFooter({ num }) {
  return (
    <div className="bg-ink h-[25px] flex items-center px-3 shrink-0">
      <span className="w-[22px] h-[22px] rounded-full border-2 border-white text-white text-[8px] font-bold flex items-center justify-center tabular-nums">
        {String(num).padStart(2, "0")}
      </span>
    </div>
  );
}

function ChartPage({ pageLabel, pageNum, ward, children }) {
  return (
    <ChartPreviewFrame pageLabel={pageLabel}>
      <div className="flex flex-col h-full bg-white">
        <ChartHeaderBanner
          code={ward.g_code || ward.ward_number}
          wardName={ward.ward_name}
          region={ward.region || ward.district || ward.constituency}
        />
        <div className="flex-1 flex flex-col min-h-0 overflow-visible">{children}</div>
        <PageFooter num={pageNum} />
      </div>
    </ChartPreviewFrame>
  );
}

function PdfSlot({ slotId, topLabel, tone = "brick", assigned, onAssignClick, isSuperAdmin, dimmed, showPlus }) {
  return (
    <ChartSlot
      slotId={slotId}
      label={topLabel}
      topLabel={topLabel}
      tone={tone}
      nameCase="upper"
      assigned={assigned}
      dimmed={dimmed}
      onAssignClick={onAssignClick}
      isSuperAdmin={isSuperAdmin}
      showPlus={showPlus}
    />
  );
}

export default function WardChartDetail() {
  const { wardId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const ward = state?.ward || { id: wardId, ward_name: "Ward", ward_number: "—", constituency: "" };
  const { user } = useSelector((s) => s.auth);

  const apiStatus = useSelector(selectAreaChartStatus);
  const apiError = useSelector(selectAreaChartError);
  const fetchStatus = useSelector(selectFetchStatus);
  const fetchedData = useSelector(selectFetchedData);
  const wardInfo = useSelector(selectWardInfo);
  const layoutConfig = useSelector(selectLayoutConfig);

  const [assignments, setAssignments] = useState({});
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [pdfProgress, setPdfProgress] = useState({ current: 0, total: 0 });

  const heroImageUrl = assignments["hero-image"]?.photoUrl || HERO_IMAGE_URL;
  const [heroCropFile, setHeroCropFile] = useState(null);
  const [showHeroCrop, setShowHeroCrop] = useState(false);
  const heroCropImageUrl = heroCropFile ? URL.createObjectURL(heroCropFile) : null;
  const measureRef = useRef(null);

  const handleRemove = (row) => {
    if (!row.memberId) { console.warn("memberId:", row); return; }
    dispatch(deleteWardChartMember(row.memberId))
      .unwrap()
      .then(() => dispatch(getWardChartData({ userId: user?.userId, wardId: ward.id })))
      .catch((err) => console.error("Delete failed:", err));
  };

  const handleHeroImageSelect = (file) => {
    setHeroCropFile(file);
    setShowHeroCrop(true);
  };

  const handleHeroCropDone = (blob) => {
    const croppedFile = new File([blob], "hero-image.jpg", { type: "image/jpeg" });
    const formData = new FormData();
    formData.append("data", JSON.stringify({
      wardHeadId: getEffectiveWardHeadId(user),
      wardId: ward.id,
      ward: ward.ward_name || ward.ward_number || "",
      layoutCount: getLayoutCountString(config),
      members: [{
        userType: "HeroImage",
        slotId: "hero-image",
        name: "Hero Image",
        mobileNumber: "",
        // email: "",
        companyName: "",
        profileImage: "",
        status: "active",
        slotLabel: "Cover Hero Image",
      }],
    }));
    formData.append("profileImages", croppedFile);
    dispatch(createWardChartData(formData));
  };

  const isWardChairman = user?.role === "WardChairman";
  const isSuperAdmin = user?.role === "SuperAdmin";

  const [tab, setTab] = useState(user?.role === "WardChairman" ? "build" : "preview");
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const pdfRef = useRef(null);
  const [showCustomize, setShowCustomize] = useState(false);
  const [modal, setModal] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [search] = useState("");
  const [sectionFilter] = useState("all");

  const isPreviewMode = tab === "preview";

  useEffect(() => {
    if (user?.userId && ward.id) {
      dispatch(getWardChartData({ userId: user.userId, wardId: ward.id }));
      dispatch(getLocationByWardHeadId(user.userId));
    }
  }, []);

  useEffect(() => {
    if (fetchStatus === "succeeded" && fetchedData) {
      const mapped = mapApiToAssignments(fetchedData);
      setAssignments(mapped);

      const apiData = fetchedData?.data || {};
      const apiLayoutConfig = apiData.layoutConfig;
      const apiLayoutCount = apiData.layoutCount || apiLayoutConfig?.layoutCount;

      if (apiLayoutConfig && typeof apiLayoutConfig === "object") {
        setConfig({
          ...DEFAULT_CONFIG,
          ...apiLayoutConfig,
          slotCounts: { ...DEFAULT_CONFIG.slotCounts, ...(apiLayoutConfig.slotCounts || {}) },
        });
      }
    }
  }, [fetchStatus, fetchedData, layoutConfig]);

  const CATEGORY_COUNT_MAP = {
    "ub-queens": "udyamiQueens",
    "ub-realty": "ubRealtyConstruction",
    "yuva-udyami": "yuvaUdyami",
    "ec": "ec",
    "ub-finance-it": "ubFinanceIT",
    "ub-social": "ubSocialBrand",
  };


// ── Modern CSS Color (OKLAB, OKLCH, etc.) to RGB Sanitizer Helpers ────────
function convertModernColorToRgb(colorStr) {
  if (!colorStr || typeof colorStr !== "string") return colorStr;

  if (!/(?:oklch|oklab|color\(|color-mix\(|light-dark\()/i.test(colorStr)) {
    return colorStr;
  }

  // 1. Try native browser 2D canvas context for exact sRGB conversion
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = colorStr;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    if (a !== 0 || colorStr.includes("0%")) {
      const alpha = +(a / 255).toFixed(3);
      return alpha === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  } catch (e) {
    // fallback below
  }

  // 2. Mathematical OKLAB -> sRGB fallback conversion
  if (colorStr.includes("oklab")) {
    try {
      const match = colorStr.match(/oklab\(\s*([\d.%]+)\s+([-\d.]+)\s+([-\d.]+)(?:\s*\/\s*([\d.%]+))?\s*\)/i);
      if (match) {
        let [, lStr, aStr, bStr, alphaStr] = match;
        let L = lStr.endsWith("%") ? parseFloat(lStr) / 100 : parseFloat(lStr);
        let aLab = parseFloat(aStr);
        let bLab = parseFloat(bStr);
        let A = alphaStr ? (alphaStr.endsWith("%") ? parseFloat(alphaStr) / 100 : parseFloat(alphaStr)) : 1;

        const l_ = L + 0.3963377774 * aLab + 0.2158037573 * bLab;
        const m_ = L - 0.1055613458 * aLab - 0.0638541728 * bLab;
        const s_ = L - 0.0894841775 * aLab - 1.291485548 * bLab;

        const l = l_ * l_ * l_;
        const m = m_ * m_ * m_;
        const s = s_ * s_ * s_;

        let rLin = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
        let gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
        let bLin = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

        const gamma = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
        let r = Math.min(255, Math.max(0, Math.round(gamma(rLin) * 255)));
        let g = Math.min(255, Math.max(0, Math.round(gamma(gLin) * 255)));
        let b = Math.min(255, Math.max(0, Math.round(gamma(bLin) * 255)));

        return A === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${A})`;
      }
    } catch (e) {}
  }

  // 3. Mathematical OKLCH -> sRGB fallback conversion
  if (colorStr.includes("oklch")) {
    try {
      const match = colorStr.match(/oklch\(\s*([\d.%]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.%]+))?\s*\)/i);
      if (match) {
        let [, lStr, cStr, hStr, aStr] = match;
        let L = lStr.endsWith("%") ? parseFloat(lStr) / 100 : parseFloat(lStr);
        let C = parseFloat(cStr);
        let H = parseFloat(hStr);
        let A = aStr ? (aStr.endsWith("%") ? parseFloat(aStr) / 100 : parseFloat(aStr)) : 1;

        const hRad = (H * Math.PI) / 180;
        const aLab = C * Math.cos(hRad);
        const bLab = C * Math.sin(hRad);

        const l_ = L + 0.3963377774 * aLab + 0.2158037573 * bLab;
        const m_ = L - 0.1055613458 * aLab - 0.0638541728 * bLab;
        const s_ = L - 0.0894841775 * aLab - 1.291485548 * bLab;

        const l = l_ * l_ * l_;
        const m = m_ * m_ * m_;
        const s = s_ * s_ * s_;

        let rLin = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
        let gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
        let bLin = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

        const gamma = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
        let r = Math.min(255, Math.max(0, Math.round(gamma(rLin) * 255)));
        let g = Math.min(255, Math.max(0, Math.round(gamma(gLin) * 255)));
        let b = Math.min(255, Math.max(0, Math.round(gamma(bLin) * 255)));

        return A === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${A})`;
      }
    } catch (e) {}
  }

  return colorStr;
}

function replaceModernColorsInCssText(cssText) {
  if (!cssText || typeof cssText !== "string" || !/(?:oklch|oklab|color|color-mix|light-dark)/i.test(cssText)) {
    return cssText;
  }

  let prev;
  let result = cssText;
  let iterations = 0;

  while (result !== prev && iterations < 5) {
    prev = result;
    result = result.replace(/(?:oklch|oklab|color-mix|light-dark|color)\((?:[^()]+|\([^()]*\))*\)/gi, (match) => {
      return convertModernColorToRgb(match);
    });
    iterations++;
  }
  return result;
}

function sanitizeModernColorsNodeTree(rootNode, doc) {
  const defaultView = doc?.defaultView || window;

  if (doc) {
    // 1. Sanitize style tags
    const styleEls = doc.querySelectorAll("style");
    styleEls.forEach((styleEl) => {
      if (styleEl.textContent && /(?:oklch|oklab|color|color-mix|light-dark)/i.test(styleEl.textContent)) {
        styleEl.textContent = replaceModernColorsInCssText(styleEl.textContent);
      }
    });

    // 2. Sanitize stylesheet rules
    try {
      Array.from(doc.styleSheets || []).forEach((sheet) => {
        try {
          Array.from(sheet.cssRules || []).forEach((rule) => {
            if (rule.style && rule.style.cssText && /(?:oklch|oklab|color|color-mix|light-dark)/i.test(rule.style.cssText)) {
              rule.style.cssText = replaceModernColorsInCssText(rule.style.cssText);
            }
          });
        } catch (e) {
          // ignore cross-origin sheet errors
        }
      });
    } catch (e) {}
  }

  // 3. Sanitize all elements in tree
  const elements = [rootNode, ...rootNode.querySelectorAll("*")];
  const colorProps = [
    "color",
    "backgroundColor",
    "borderColor",
    "borderTopColor",
    "borderRightColor",
    "borderBottomColor",
    "borderLeftColor",
    "outlineColor",
    "fill",
    "stroke",
  ];

  elements.forEach((el) => {
    const inlineStyle = el.getAttribute("style");
    if (inlineStyle && /(?:oklch|oklab|color|color-mix|light-dark)/i.test(inlineStyle)) {
      el.setAttribute("style", replaceModernColorsInCssText(inlineStyle));
    }

    try {
      const computed = defaultView.getComputedStyle(el);
      colorProps.forEach((prop) => {
        const val = computed[prop];
        if (val && typeof val === "string" && /(?:oklch|oklab|color|color-mix|light-dark)/i.test(val)) {
          el.style[prop] = convertModernColorToRgb(val);
        }
      });

      const boxShadow = computed.boxShadow;
      if (boxShadow && typeof boxShadow === "string" && /(?:oklch|oklab|color|color-mix|light-dark)/i.test(boxShadow)) {
        el.style.boxShadow = replaceModernColorsInCssText(boxShadow);
      }

      const textShadow = computed.textShadow;
      if (textShadow && typeof textShadow === "string" && /(?:oklch|oklab|color|color-mix|light-dark)/i.test(textShadow)) {
        el.style.textShadow = replaceModernColorsInCssText(textShadow);
      }
    } catch (e) {
      // ignore non-element nodes
    }
  });
}

  const handleDownloadPdf = async () => {
    setIsPdfGenerating(true);
    try {
      const pages = document.querySelectorAll(".pdf-capture-page");
      if (!pages || !pages.length) {
        setIsPdfGenerating(false);
        return;
      }

      const totalPages = pages.length;
      setPdfProgress({ current: 1, total: totalPages });
      const fileName = `${ward.ward_name || "Ward Chart"}.pdf`;

      const elementWidth = 794;
      const elementHeight = 1123;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [elementWidth, elementHeight],
        hotfixes: ["px_scaling"],
      });

      for (let i = 0; i < totalPages; i++) {
        // Update progress state for UI overlay
        setPdfProgress({ current: i + 1, total: totalPages });

        // Yield main thread to allow browser UI repaint & keep page interactive
        await new Promise((r) => setTimeout(r, 40));

        const page = pages[i];
        const prevTransform = page.style.transform;
        const prevWidth = page.style.width;
        const prevHeight = page.style.height;
        const prevMarginBottom = page.style.marginBottom;
        const prevMarginRight = page.style.marginRight;
        const prevOverflow = page.style.overflow;
        const prevBoxShadow = page.style.boxShadow;
        const prevBorderRadius = page.style.borderRadius;
        const prevBorder = page.style.border;

        page.style.transform = "none";
        page.style.width = `${elementWidth}px`;
        page.style.height = `${elementHeight}px`;
        page.style.marginBottom = "0px";
        page.style.marginRight = "0px";
        page.style.overflow = "visible";
        page.style.boxShadow = "none";
        page.style.borderRadius = "0px";
        page.style.border = "none";

        const elementStyleMap = new Map();
        const allLiveElements = [page, ...page.querySelectorAll("*")];
        allLiveElements.forEach((el) => {
          elementStyleMap.set(el, el.getAttribute("style"));
        });

        sanitizeModernColorsNodeTree(page, document);

        try {
          let canvas = await html2canvas(page, {
            scale: 2, // Scale 2: Desktop optimized scale (200+ DPI print sharp, 56% lower RAM)
            useCORS: true,
            allowTaint: false,
            backgroundColor: "#ffffff",
            imageTimeout: 0,
            logging: false,
            width: elementWidth,
            height: elementHeight,
            windowWidth: elementWidth,
            windowHeight: elementHeight,
            scrollX: 0,
            scrollY: 0,
            onclone: (clonedDoc, clonedElement) => {
              sanitizeModernColorsNodeTree(clonedElement, clonedDoc);
            },
          });

          // Compress to JPEG @ 0.92 (5x faster CPU encoding & 70% smaller memory allocation)
          const imgData = canvas.toDataURL("image/jpeg", 0.92);
          if (i > 0) pdf.addPage([elementWidth, elementHeight], "portrait");
          pdf.addImage(imgData, "JPEG", 0, 0, elementWidth, elementHeight);

          // Immediate canvas surface dereference to trigger garbage collection
          canvas.width = 0;
          canvas.height = 0;
          canvas = null;
        } finally {
          allLiveElements.forEach((el) => {
            const origStyle = elementStyleMap.get(el);
            if (origStyle !== null && origStyle !== undefined) {
              el.setAttribute("style", origStyle);
            } else {
              el.removeAttribute("style");
            }
          });

          page.style.transform = prevTransform;
          page.style.width = prevWidth;
          page.style.height = prevHeight;
          page.style.marginBottom = prevMarginBottom;
          page.style.marginRight = prevMarginRight;
          page.style.overflow = prevOverflow;
          page.style.boxShadow = prevBoxShadow;
          page.style.borderRadius = prevBorderRadius;
          page.style.border = prevBorder;
        }
      }
      pdf.save(fileName);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsPdfGenerating(false);
      setPdfProgress({ current: 0, total: 0 });
    }
  };

  // ── Assign handler ────────────────────────────────────────────
  const handleAssign = (data) => {
    const slotId = modal.slotId;
    const photoFile = data.photoFile;
    const photoUrl = data.photoUrl;
    setModal(null);

    const isCommon = isBlockedForWardChairman(slotId);
    const { photoFile: _f, photoUrl: _u, ...restData } = data;
    const payload = buildSingleMemberPayload(ward, user, slotId, { ...restData, photoUrl, slotLabel: modal.label });

    const formData = new FormData();
    formData.append("data", JSON.stringify({
      wardHeadId: payload.wardHeadId,
      wardId: ward.id,
      ward: payload.ward,
      layoutCount: getLayoutCountString(config),
      applyToAllWards: isCommon,
      isCommonPage: isCommon,
      members: payload.members.map(({ profileImage, ...m }) => ({
        ...m,
        ...(photoFile ? {} : { profileImage: profileImage || "" }),
      })),
    }));

    if (photoFile) formData.append("profileImages", photoFile);
    dispatch(createWardChartData(formData));
  };

  const openDetails = (id, label) => {
    const a = assignments[id];
    setSelectedPosition({
      slotId: id, role: label,
      memberName: a?.name || null, company: a?.company || null,
      mobileNumber: a?.mobileNumber || null, email: a?.email || null,
      location: a?.location || null, district: a?.district || null,
      reportsTo: a?.reportsTo || null, directReports: a?.directReports || null,
      assignedDate: a?.assignedDate || null, memberId: a?.memberId || null,
      memberNumber: a?.memberNumber || null, status: a?.status || null,
      profileImage: a?.photoUrl || a?.profileImage || null,
    });
  };

  function isBlockedForWardChairman(slotId) {
    return (
      slotId === "mla" ||
      slotId.startsWith("official-") ||
      slotId.startsWith("patron-") ||
      slotId.startsWith("chairman-")
    );
  }

  const handleSlotClick = (id, label) => {
    const a = assignments[id];
    if (isWardChairman && (id === "ward-chairman" || isBlockedForWardChairman(id))) {
      if (a?.name) openDetails(id, label);
      return;
    }
    if (isPreviewMode) {
      if (a?.name) openDetails(id, label);
      return;
    }
    if (a?.name) { openDetails(id, label); }
    else { setModal({ slotId: id, label }); }
  };

  const slotClickProp = handleSlotClick;

  const isDimmed = (slotId, section, name) => {
    if (sectionFilter !== "all" && sectionFilter !== section) return true;
    if (search.trim() && !(name || "").toLowerCase().includes(search.trim().toLowerCase())) return true;
    return false;
  };

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
        const maxCount = countKey ? (config.slotCounts[countKey] ?? enabledProducts.length) : enabledProducts.length;

        const slots = [...enabledProducts];
        while (slots.length < maxCount) {
          const idx = slots.length;
          slots.push({ key: `placeholder-${idx}`, name: `${defaultCat.label} ${idx + 1}`, sub: `Position ${idx + 1}`, enabled: true, isPlaceholder: true });
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



  const rows = useMemo(
    () => Object.entries(assignments).map(([slotId, a]) => ({
      name: a.name, company: a.company || "—", position: a.slotLabel || slotId,
      status: a.status || "registered", slotId,
      memberId: a.memberId || a.id || null, memberNumber: a.memberNumber || null,
      mobileNumber: a.mobileNumber || null, email: a.email || null,
      profileImage: a.photoUrl || a.profileImage || null,
    })),
    [assignments]
  );

  const gCode = ward.g_code || ward.ward_number || ward.wardNumber || "G5.48";

  const reduxWards = useSelector(selectWards) || [];
  const constituencyWards = useMemo(() => {
    if (!ward.constituency) return reduxWards;
    return reduxWards.filter((w) => w.constituency === ward.constituency);
  }, [reduxWards, ward.constituency]);

  const reduxWardCount = constituencyWards.length > 0 ? constituencyWards.length : (reduxWards.length > 0 ? reduxWards.length : null);
  const apiWardCount = fetchedData?.data?.constituencyWardCount || fetchedData?.data?.wardsCount || fetchedData?.data?.totalWards || fetchedData?.data?.wardLength || (Array.isArray(fetchedData?.data?.wards) ? fetchedData.data.wards.length : null);

  const totalChairmenCount = Number(
    ward.constituencyWardCount ||
    ward.wardsCount ||
    ward.wardLength ||
    ward.totalWards ||
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

  const isBusy = apiStatus === "loading" || fetchStatus === "loading";

  return (
    <div className="space-y-5 bg-[#f4f5f7] -m-4 sm:-m-6 p-4 sm:p-6 min-h-full overflow-x-hidden">

      {/* ── Admin Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button onClick={() => navigate(-1)} className="text-[12.5px] text-gray-500 hover:text-gray-900 mb-1 transition-colors">
            ← Back to Area Chart Builder
          </button>
          <h1 className="text-[20px] font-bold text-gray-900 leading-tight tracking-tight">Area Chart Builder</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-gray-500">
          <span className="font-medium text-gray-900">All Constituencies</span>
          <span>·</span>
          <span className="font-medium text-gray-900">{ward.ward_number} - {ward.ward_name}</span>
        </div>
      </div>

      {/* ── API status feedback ── */}
      {isBusy && <p className="text-[12px] text-blue-600 font-medium">Loading…</p>}
      {isWardChairman && apiStatus === "succeeded" && fetchStatus === "succeeded" && (
        <p className="text-[12px] text-green-600 font-medium">Chart saved successfully.</p>
      )}
      {isWardChairman && apiStatus === "failed" && apiError && (
        <p className="text-[12px] text-red-600 font-medium">Save failed: {apiError}</p>
      )}

      {/* ── Action Buttons ── */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setModal({ slotId: `extra-${Date.now()}`, label: "Member" })}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[12.5px] font-semibold px-4 py-2 rounded-lg transition-colors w-full sm:w-auto"
        >
          <UserPlus size={14} /> Invite Member
        </button>
        <button
          onClick={() => setShowCustomize(true)}
          className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-[12.5px] font-medium text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto"
        >
          <SlidersHorizontal size={14} /> Customize Layout
        </button>
        <button className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-[12.5px] font-medium text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto">
          <Printer size={14} /> Print Chart
        </button>
        <button
          onClick={handleDownloadPdf}
          disabled={isPdfGenerating}
          className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-[12.5px] font-medium text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={14} />
          {isPdfGenerating ? "Generating…" : "Download PDF"}
        </button>
      </div>

      {/* ── Build / Preview Tabs ── */}
      <div className="flex flex-wrap sm:inline-flex rounded-lg border border-gray-200 bg-white p-1 w-full sm:w-auto">
        {[
          { id: "build", icon: Pencil, label: "Build Chart" },
          { id: "preview", icon: FileCheck2, label: "Print Preview" },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-md text-[12.5px] font-semibold transition-colors ${tab === id ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-900"}`}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      <div ref={pdfRef} className="pdf-container-wrapper space-y-6">
        {/* ══════ PAGE 1 — COVER ══════ */}
        <ChartPreviewFrame pageLabel="Cover Page">
          <CoverPage
            code={wardInfo?.wardNumber ?? ""}
            regionName={wardInfo?.wardName ?? ""}
            wardNumber={ward.ward_number}
            wardName={ward.ward_name}
            heroImageUrl={heroImageUrl}
            onHeroImageSelect={handleHeroImageSelect}
            showHeroUpload={!isPreviewMode}
          />
        </ChartPreviewFrame>

        {!isWardChairman && (
          <>
            {/* ══════ PAGE 2 — MLA + Officials + Patrons + Chairmen ══════ */}
            <ChartPage pageLabel={`MLA · Patrons · Chairmen (1–${p2Count})`} pageNum={2} ward={ward}>
              <div className="px-6 py-2 space-y-1.5">
                <div className="flex justify-center pt-0.5">
                  <MlaCard
                    mlaLabel={`MLA - ${ward.ward_name} Assembly constituency`}
                    assigned={assignments.mla}
                    dimmed={isDimmed("mla", "core", assignments.mla?.name)}
                    onAssignClick={slotClickProp}
                    showPlus={!isPreviewMode && !isWardChairman}
                    isSuperAdmin={isSuperAdmin}
                  />
                </div>

                <div className="relative">
                  <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-px h-2 bg-ink/40" />
                  <div className="absolute left-[10%] right-[10%] top-0 h-px bg-ink/40" />
                  <div className="grid grid-cols-4 gap-3 pt-1">
                    {Array.from({ length: 4 }).map((_, i) => {
                      const slotId = `official-${i + 1}`;
                      return (
                        <div key={slotId} className="flex flex-col items-center">
                          <div className="w-px h-2 bg-ink/40 mb-0.5" />
                          <PdfSlot
                            slotId={slotId}
                            topLabel={`Official ${i + 1}`}
                            tone="navy"
                            assigned={assignments[slotId]}
                            dimmed={isDimmed(slotId, "patrons", assignments[slotId]?.name)}
                            onAssignClick={slotClickProp}
                            showPlus={!isPreviewMode && !isWardChairman}
                            isSuperAdmin={isSuperAdmin}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="relative flex justify-center items-center py-1">
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#1a2e5e]" />
                  <div className="relative z-10">
                    <div className="relative bg-[#b5121b] text-white text-[12px] font-bold uppercase px-8 py-[4px] w-[200px] text-center rounded-t-sm rounded-b-xl">
                      UDYAMI PATRON
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-x-3 gap-y-1.5">
                  {Array.from({ length: config.slotCounts.patrons }).map((_, i) => {
                    const slotId = `patron-${i + 1}`;
                    return (
                      <PdfSlot
                        key={slotId}
                        slotId={slotId}
                        tone="navy"
                        assigned={assignments[slotId]}
                        dimmed={isDimmed(slotId, "patrons", assignments[slotId]?.name)}
                        onAssignClick={slotClickProp}
                        showPlus={!isPreviewMode}
                        isSuperAdmin={isSuperAdmin}
                      />
                    );
                  })}
                </div>

                <div className="border-t border-ink/20 my-0.5" />

                <div className="grid grid-cols-5 gap-x-3 gap-y-1.5">
                  {chairmenP2.map((i) => {
                    const slotId = `chairman-${i + 1}`;
                    const label = `${constituencyWards[i]?.ward_number || `${gCode}.${i + 1}`} Chairman`;
                    return (
                      <div key={slotId}>
                        <p className="text-[8.5px] font-bold text-brick text-center mb-0.5 uppercase truncate">{label}</p>
                        <PdfSlot
                          slotId={slotId}
                          tone="brick"
                          assigned={assignments[slotId]}
                          dimmed={isDimmed(slotId, "chairmen", assignments[slotId]?.name)}
                          onAssignClick={slotClickProp}
                          showPlus={!isPreviewMode}
                          isSuperAdmin={isSuperAdmin}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </ChartPage>

            {/* ══════ PAGE 3 — Chairmen continued ══════ */}
            {chairmenP3.length > 0 && (
              <ChartPage pageLabel={`Chairmen (${p2Count + 1}–${totalChairmenCount})`} pageNum={3} ward={ward}>
                <div className="flex-1 h-full px-[3%] py-[2%]">
                  <div className="space-y-6">
                    {chairmenRowsP3.map((row, ri) => (
                      <div key={ri} className={row.length === 5 ? "grid grid-cols-5 gap-5" : "flex justify-center gap-5"}>
                        {row.map((i) => {
                          const slotId = `chairman-${i + 1}`;
                          const label = `${constituencyWards[i]?.ward_number || `${gCode}.${i + 1}`} Chairman`;
                          return (
                            <div key={slotId} className={row.length < 5 ? "w-[110px]" : ""}>
                              <p className="text-[9px] font-bold text-brick text-center mb-1 uppercase">{label}</p>
                              <PdfSlot
                                slotId={slotId}
                                tone="brick"
                                assigned={assignments[slotId]}
                                dimmed={isDimmed(slotId, "chairmen", assignments[slotId]?.name)}
                                onAssignClick={slotClickProp}
                                showPlus={!isPreviewMode}
                                isSuperAdmin={isSuperAdmin}
                              />
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </ChartPage>
            )}
          </>
        )}

        {/* ══════ PAGE 4 — Advisory/Mentor + Leadership + Sectors/UMS ══════ */}
        <ChartPage pageLabel="Advisory · Leadership · Sectors · UMS" pageNum={chairmenP3.length > 0 ? 4 : 3} ward={ward}>
          <div className="flex flex-col h-full min-h-full">
            {/* Advisory / Mentor row */}
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-3.5 bg-white border-b border-slate-100 shrink-0">
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
                  <div key={r} className="flex items-start justify-center">
                    {/* Advisories slice */}
                    <div className="flex gap-12">
                      {rowAdvisories.map((_, idx) => {
                        const i = r * 3 + idx;
                        const slotId = `advisory-${i + 1}`;
                        return (
                          <div key={slotId} className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="w-5 h-5 rounded-full border-2 border-[#c8102e] text-[#c8102e] text-[9px] font-bold flex items-center justify-center shrink-0">
                                {i + 1}
                              </span>
                              <span className="text-[11px] font-bold text-[#c8102e]">
                                Advisory
                              </span>
                            </div>
                            <ChartSlot
                              slotId={slotId}
                              label={`${i + 1} Advisory`}
                              tone="navy"
                              variant="default"
                              showPlaceholderName={false}
                              assigned={assignments[slotId]}
                              dimmed={isDimmed(
                                slotId,
                                "advisories",
                                assignments[slotId]?.name
                              )}
                              onAssignClick={slotClickProp}
                              showPlus={!isPreviewMode}
                              isSuperAdmin={isSuperAdmin}
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div className="w-px self-stretch bg-slate-300 mx-8" />

                    {/* Mentors slice */}
                    <div className="flex gap-14">
                      {rowMentors.map((_, idx) => {
                        const i = r * 2 + idx;
                        const slotId = `mentor-${i + 1}`;
                        return (
                          <div key={slotId} className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="w-5 h-5 rounded-full border-2 border-ink text-ink text-[9px] font-bold flex items-center justify-center shrink-0">
                                {i + 1}
                              </span>
                              <span className="text-[11px] font-bold text-ink">
                                Mentor
                              </span>
                            </div>
                            <ChartSlot
                              slotId={slotId}
                              label={`${i + 1} Mentor`}
                              tone="navy"
                              variant="default"
                              showPlaceholderName={false}
                              assigned={assignments[slotId]}
                              dimmed={isDimmed(
                                slotId,
                                "mentors",
                                assignments[slotId]?.name
                              )}
                              onAssignClick={slotClickProp}
                              showPlus={!isPreviewMode}
                              isSuperAdmin={isSuperAdmin}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Leadership strip */}
            <div className="flex items-center bg-[#1a2e5e] shrink-0 py-3.5 px-4 gap-4">
              <div className="flex flex-col items-center justify-center shrink-0 w-[140px]">
                <ChairmanHighlightCard
                  wardNumber={gCode} assigned={assignments["ward-chairman"]}
                  dimmed={isDimmed("ward-chairman", "core", assignments["ward-chairman"]?.name)}
                  onAssignClick={slotClickProp} showPlus={!isPreviewMode} isSuperAdmin={isSuperAdmin}
                />
              </div>

              <div className="flex flex-1 justify-evenly items-center">
                {CORE_ROLES.map((role) => {
                  const slotId = `core-${role.toLowerCase().replace(/\s+/g, "-")}`;
                  return (
                    <div key={slotId} className="flex flex-col items-center w-[105px] gap-1">
                      <p className="text-[11px] font-bold text-white text-center mb-1">{role}</p>
                      <div
                        onClick={() => handleSlotClick(slotId, role)}
                        className={`relative w-[95px] h-[95px] rounded-lg border-2 border-[#c8102e] bg-[#d32f2f] flex items-center justify-center overflow-hidden shrink-0 shadow-sm ${!isPreviewMode && !isSuperAdmin ? "cursor-pointer group" : "cursor-default"}`}
                      >
                        {assignments[slotId]?.photoUrl ? (
                          <img src={assignments[slotId].photoUrl} alt={assignments[slotId].name} className="w-full h-full object-cover" />
                        ) : (
                          <svg viewBox="0 0 64 64" className="w-[85%] h-[85%] text-white" fill="currentColor">
                            <circle cx="32" cy="22" r="12" />
                            <path d="M8 56 Q8 40 32 40 Q56 40 56 56 Z" />
                          </svg>
                        )}
                        {!isPreviewMode && !isSuperAdmin && (
                          <span className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        )}
                      </div>
                      <p className="mt-1.5 text-[9.5px] font-bold text-white uppercase text-center leading-tight truncate max-w-[100px]">
                        {assignments[slotId]?.name || "NAME"}
                      </p>
                      <p className="text-[7.5px] text-white/70 text-center leading-tight truncate max-w-[100px]">
                        {assignments[slotId]?.company}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Red container: Sectors + UMS (Fills remaining Page 4 height to footer) */}
            <div className="flex gap-2.5 px-[2%] py-[2%] bg-[#c8102e] flex-1 min-h-0">
              {/* Sectors flex column */}
              <div className="flex-1 flex flex-col justify-evenly gap-1.5">
                {Array.from({ length: Math.ceil(firstPageSectors.length / 3) }).map((_, rowIdx) => {
                  const rowSectors = firstPageSectors.slice(rowIdx * 3, rowIdx * 3 + 3);
                  return (
                    <div key={rowIdx} className="flex justify-center gap-6 px-4">
                      {rowSectors.map((s) => {
                        const slotId = `sector-${s.key}`;
                        return (
                          <div key={s.key} className="w-[118px] shrink-0">
                            <SectorCard
                              slotId={slotId} label={s.label} assigned={assignments[slotId]}
                              dimmed={isDimmed(slotId, "sectors", assignments[slotId]?.name)}
                              onAssignClick={slotClickProp} showPlus={!isPreviewMode} isSuperAdmin={isSuperAdmin}
                            />
                          </div>
                        );
                      })}
                      {rowSectors.length < 3 && Array.from({ length: 3 - rowSectors.length }).map((_, fi) => (
                        <div key={`fill-${fi}`} className="w-[118px] shrink-0 opacity-0" />
                      ))}
                    </div>
                  );
                })}
              </div>

              {/* UMS panel */}
              {firstPageUms.length > 0 && (
                <div className="w-[250px] rounded-sm border border-ink shrink-0 bg-white overflow-hidden flex flex-col h-full self-stretch">
                  <div className="bg-[#1a2e5e] py-[5px] text-center shrink-0">
                    <p className="text-[7.5px] font-bold text-white uppercase tracking-wider">Udyami Management System</p>
                  </div>
                  <div className="flex-1 grid grid-cols-2 px-3 py-2 gap-x-3 gap-y-1.5 content-evenly">
                    {firstPageUms.map((s) => {
                      const slotId = `ums-${s.key}`;
                      const assigned = assignments[slotId];
                      return (
                        <div key={s.key} className="flex flex-col items-center min-w-0">
                          <p className="text-[6px] font-medium text-[#b5121b] text-center mb-0.5 min-h-[10px] leading-tight truncate w-full">{s.label}</p>
                          <div
                            onClick={() => handleSlotClick(slotId, s.label)}
                            className={`relative w-full aspect-[3/2] border border-[#c8102e] rounded-sm bg-[#d0d0d8] overflow-hidden flex items-center justify-center ${!isPreviewMode ? "cursor-pointer group" : "cursor-default"}`}
                          >
                            {assigned?.photoUrl ? (
                              <img src={assigned.photoUrl} alt={assigned.name} className="w-full h-full object-cover" />
                            ) : assigned?.name ? (
                              <User size={18} className="text-slate-600" />
                            ) : null}
                            {!isPreviewMode && !isSuperAdmin && (
                              <span className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            )}
                          </div>
                          <p className="text-[7.5px] font-bold text-slate-800 text-center mt-0.5 truncate w-full leading-tight min-h-[10px]">
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
        </ChartPage>

        {/* ══════ PRODUCT PAGES ══════ */}
        {/* Hidden measure div */}
        <div
          ref={measureRef}
          style={{
            position: "fixed", top: "-9999px", left: "-9999px",
            width: "855px", opacity: 0, pointerEvents: "none", zIndex: -1,
          }}
        >
          <div data-banner="true">
            <ChartHeaderBanner
              code={gCode}
              wardName={ward.ward_name}
              region={ward.region || ward.district || ward.constituency}
            />
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

        {/* ─── FIX: Products page rendering with single label ─── */}
        {(productPages.length > 0 ? productPages : [activeBrandCategories]).map((pageCats, pageIdx) => (
          <ChartPreviewFrame
            key={`products-page-${pageIdx}`}
            // ─── FIX: Always show "Products" without page number ───
            pageLabel={pageIdx === 0 ? "Products" : "Products"} // Removed (${pageIdx + 1})
          >
            <ProductsPage
              code={gCode}
              wardName={ward.ward_name}
              region={ward.region || ward.district || ward.constituency}
              categories={pageCats}
              assignments={assignments}
              onAssignClick={slotClickProp}
              showPlus={!isPreviewMode}
              isSuperAdmin={isSuperAdmin}
            />
          </ChartPreviewFrame>
        ))}
      </div>

      {/* ── All Assignments Table ── */}
      <AllAssignmentsTable rows={rows} onRemove={handleRemove} />

      {/* ── Modals ── */}
      {modal && (
        <AssignPositionModal
          position={modal.label}
          wardName={ward.ward_name}
          constituency={ward.constituency}
          onClose={() => setModal(null)}
          onAssign={(data) => handleAssign({ ...data, slotLabel: modal.label })}
        />
      )}

      {selectedPosition && (
        <PositionDetailsModal
          open={!!selectedPosition}
          position={selectedPosition}
          onClose={() => setSelectedPosition(null)}
        />
      )}

      {showCustomize && (
        <CustomizeLayoutModal
          wardName={ward.ward_name}
          config={config}
          onClose={() => setShowCustomize(false)}
          isWardChairman={isWardChairman}
          onSave={(next) => {
            const merged = {
              ...DEFAULT_CONFIG,
              ...next,
              slotCounts: { ...DEFAULT_CONFIG.slotCounts, ...next.slotCounts },
            };
            setConfig(merged);
            setShowCustomize(false);

            const layoutCountStr = getLayoutCountString(merged);

            const formData = new FormData();
            formData.append("data", JSON.stringify({
              wardHeadId: getEffectiveWardHeadId(user),
              wardId: ward.id,
              ward: ward.ward_name || ward.ward_number || "",
              layoutCount: layoutCountStr,
              applyToAllWards: true,
              isCommonPage: true,
              members: [],
              layoutConfig: {
                layoutCount: layoutCountStr,
                slotCounts: merged.slotCounts,
                sectors: merged.sectors,
                umsRoles: merged.umsRoles,
                brandTiles: merged.brandTiles,
              },
            }));
            dispatch(createWardChartData(formData));
          }}
        />
      )}

      {showHeroCrop && heroCropImageUrl && (
        <ImageCropModal
          image={heroCropImageUrl}
          open={showHeroCrop}
          onClose={() => { setShowHeroCrop(false); setHeroCropFile(null); }}
          onComplete={handleHeroCropDone}
        />
      )}

      {/* ── PDF Progress Loading Overlay ── */}
      {isPdfGenerating && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-3 min-w-[280px] max-w-sm text-center">
            <div className="w-9 h-9 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <h3 className="text-[14px] font-bold text-gray-900 leading-tight">Generating PDF</h3>
            <p className="text-[12.5px] text-gray-500 font-medium">
              {pdfProgress.total > 0
                ? `Page ${pdfProgress.current} of ${pdfProgress.total}`
                : "Preparing pages…"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}