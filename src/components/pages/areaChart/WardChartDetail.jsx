import React, { useMemo, useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { User, UserPlus, SlidersHorizontal, Send, Download, Pencil, FileCheck2 } from "lucide-react";
import ChartSlot from "./components/ChartSlot.jsx";
import MlaCard from "./components/Mlacard.jsx";
import ChairmanHighlightCard from "./components/Chairmanhighlightcard.jsx";
import SectorCard from "./components/Sectorcard.jsx";
import UmsCard from "./components/Umscard.jsx";
import ProductsPage, { SAMPLE_PRODUCT_CATEGORIES } from "./components/Productspage.jsx";
import ChartHeaderBanner from "./components/Chartheaderbanner.jsx";
import CustomizeLayoutModal from "./models/CustomizeLayoutModal.jsx";
import AssignPositionModal from "./models/AssignPositionModal.jsx";
import InviteMemberModal from "./models/InviteMemberModal.jsx";
import AllAssignmentsTable from "./components/AllAssignmentsTable.jsx";
import CoverPage from "./components/CoverPage.jsx";
import ChartPreviewFrame from "./components/ChartPreviewFrame.jsx";
import { useSelector, useDispatch } from "react-redux";
import PositionDetailsModal from "./models/PositionDetailsModal.jsx";
import UcnMembersSidePanel from "./models/UcnMembersSidePanel.jsx";
import { deleteWardChartMember, selectLayoutConfig, selectWardInfo } from "../../redux/slices/areaChartSlice.js";
import { HERO_IMAGE_URL } from "./chartAssets.js";
import ErrorModal from "../../common/ErrorModal.jsx";
import {
  clearAreaChartError,
  createWardChartData,
  getWardChartData,
  getLocationByWardHeadId,
  getAllWardChaimansBy,
  fetchUcnMembers,
  fetchChannelPartners,
  fetchPatrons,
  fetchUmsMembers,
  selectWards,
  selectWardChairmenList,
  selectAreaChartStatus,
  selectAreaChartError,
  selectFetchStatus,
  selectFetchedData,
  selectFetchedWardId,
  selectWardChairmenTalukaId,
  selectWardChairmenFetchedAt,
  invalidateTalukaWardChartCache,
  selectUcnMembers,
  selectChannelPartners,
  selectPatrons,
  selectUmsMembers,
} from "../../redux/slices/areaChartSlice.js";
import { mapApiToAssignments, mergeTalukaChairmenIntoAssignments, mergePatronsIntoAssignments, mergeUcnMembersIntoAssignments, mergeUmsMembersIntoAssignments } from "./utils/Mapapitoassignments.js";
import { paginateBrandCategories } from "./utils/paginateCategories.js";
import { getLayoutCountString } from "./utils/calculateLayoutCount.js";
import ImageCropModal from "./models/ImageCropModal.jsx";
import api from "../../service/api.js";

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
    officials: 4,
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

// Rejected thunks can resolve to a plain string, or to an object like
// { message, error, statusCode } (e.g. a 409 Conflict from
// createWardChartData). Rendering that object directly as a JSX child
// throws "Objects are not valid as a React child" and — with no error
// boundary above it — blanks the entire page instead of showing the error.
// Always coerce through this before putting an error value into text.
function getErrorMessage(err) {
  if (!err) return "";
  if (typeof err === "string") return err;
  if (typeof err === "object") {
    return (
      err.message ||
      (typeof err.error === "string" ? err.error : null) ||
      "Something went wrong"
    );
  }
  return String(err);
}

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

// How long the taluka roster (the MLA / Patron members of every ward in the
// taluka) may be reused before it is refetched. Kept at module scope, together
// with the Date.now() call, so the component body stays pure.
const ROSTER_MAX_AGE_MS = 30_000;

function isRosterStale(fetchedAt) {
  return !fetchedAt || Date.now() - fetchedAt > ROSTER_MAX_AGE_MS;
}

// Looks up the current Ward Chairman for `ward` inside the freshly-fetched
// taluka roster (GET /talukas/getAllWardChaimansBy/:talukaId, exposed here
// as `wardChairmenList`). This list is refetched every time `talukaId`
// changes (see the effect in WardChartDetail), so — unlike the `ward`
// object sitting in the `wards` Redux list, which is only loaded once per
// session — it reflects whoever currently holds the seat. Matching logic
// mirrors mergeTalukaChairmenIntoAssignments in utils/Mapapitoassignments.js
// so both stay in agreement about which record belongs to this ward.
function findCurrentWardHeadIdFromRoster(ward, wardChairmenList) {
  if (!Array.isArray(wardChairmenList) || wardChairmenList.length === 0) return null;

  const wardId = ward?.id;
  const wardNumber = ward?.ward_number;
  const wardName = ward?.ward_name;

  const matchedApiWard = wardChairmenList.find(
    (item) =>
      (wardId && item?.wardId === wardId) ||
      (wardNumber && item?.wardNumber === wardNumber) ||
      (wardName && item?.wardName === wardName)
  );
  if (!matchedApiWard) return null;

  const rawMembers = matchedApiWard.wardChart?.members;
  let chairmanMember = null;
  if (Array.isArray(rawMembers)) {
    chairmanMember = rawMembers.find(
      (m) => m?.userType === "WardChairman" || m?.slotId === "ward-chairman"
    );
  } else if (rawMembers && typeof rawMembers === "object") {
    const wcList = rawMembers.WardChairman || rawMembers.wardChairman || rawMembers.ward_chairman;
    if (Array.isArray(wcList) && wcList.length > 0) chairmanMember = wcList[0];
  }

  return (
    chairmanMember?.userId ||
    chairmanMember?.memberId ||
    matchedApiWard.wardChart?.wardHead?.userId ||
    null
  );
}

// Resolves the userId of the CURRENT Ward Chairman for `ward`. This must
// always reflect who holds the seat right now, not whoever held it when an
// earlier page load happened to run.
//
// This used to fall back to `localStorage.getItem("wardChartMeta")`, a
// blob written once by getWardChartData.fulfilled (areaChartSlice.js) and
// never invalidated afterwards. Once any GET for a ward had ever resolved
// a wardHeadId, that value sat in localStorage indefinitely — surviving
// page reloads, new sessions, even backend restarts — and every subsequent
// createWardChartData call kept silently resending it. That's exactly why
// Divya's id kept showing up in ward-chart POST payloads long after Kavya
// had become Keragodu's Ward Chairman. That fallback, and the final
// "just use whoever is logged in" fallback, are both removed: every
// source below is re-derived from live data for THIS specific ward, and if
// none resolve, this throws instead of guessing.
const getEffectiveWardHeadId = (user, ward, wardChairmenList) => {
  // 1. Freshest per-ward source: the taluka's current chairman roster.
  const fromRoster = findCurrentWardHeadIdFromRoster(ward, wardChairmenList);
  if (fromRoster) return fromRoster;

  // 2. The ward record currently loaded for this page (live app state, not
  // a persisted cache).
  const wardChairmanId = ward?.wardChairmanUserId || ward?.wardHeadId || ward?.wardChairman?.userId;
  if (wardChairmanId) return wardChairmanId;

  // 3. The logged-in user IS the Ward Chairman viewing their own chart.
  if (user?.role === "WardChairman" && user?.userId) {
    return user.userId;
  }

  // No stale cache, no hardcoded id: fail loudly so the caller shows a
  // clear error instead of silently sending the wrong person's id.
  throw new Error(
    "Could not determine the current Ward Chairman for this ward. Please refresh the page and try again."
  );
};

function buildSingleMemberPayload(ward, user, slotId, assignmentData, wardChairmenList) {
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

  const assignerUserId = user?.userId || user?._id || user?.id || "";

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
    isAssigned: true,
    assignedBy: assignerUserId,
  };

  const assignedUserId = assignmentData.userId || assignmentData.memberId || "";
  if (assignedUserId) memberObj.userId = assignedUserId;
  if (assignmentData.memberId) memberObj.memberId = assignmentData.memberId;
  if (coreRoleMap[slotId]) memberObj.coreRole = coreRoleMap[slotId];
  if (sectorKey) memberObj.sectorKey = sectorKey;
  if (umsKey) memberObj.umsKey = umsKey;

  return {
    wardHeadId: getEffectiveWardHeadId(user, ward, wardChairmenList),
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

function ChartPage({ pageLabel, pageNum, ward, children, hideWardCode = false, wardNameOverride }) {
  return (
    <ChartPreviewFrame pageLabel={pageLabel}>
      <div className="flex flex-col h-full bg-white">
        <ChartHeaderBanner
          code={ward.g_code || ward.ward_number}
          wardName={wardNameOverride ?? ward.ward_name}
          region={ward.region || ward.district || ward.constituency}
          hideCode={hideWardCode}
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

  const wards = useSelector(selectWards);

  const wardFromStateOrStore = useMemo(() => {
    if (state?.ward) return state.ward;
    if (wards && wards.length > 0) {
      const found = wards.find((w) => String(w.id) === String(wardId));
      if (found) return found;
    }
    return null;
  }, [state?.ward, wards, wardId]);

  const ward = wardFromStateOrStore || { id: wardId, ward_name: "Ward", ward_number: "—", constituency: "" };
  const { user } = useSelector((s) => s.auth);

  const targetUserId =
    ward.wardChairmanUserId ||
    ward.wardHeadId ||
    ward.wardChairman?.userId ||
    (user?.role === "WardChairman" ? user?.userId : null) ||
    user?.userId;

  const apiStatus = useSelector(selectAreaChartStatus);
  const apiError = useSelector(selectAreaChartError);
  const fetchStatus = useSelector(selectFetchStatus);
  const fetchedDataRaw = useSelector(selectFetchedData);
  const fetchedWardId = useSelector(selectFetchedWardId);
  const wardChairmenTalukaId = useSelector(selectWardChairmenTalukaId);
  const wardChairmenFetchedAt = useSelector(selectWardChairmenFetchedAt);

  // Only ever read the cached payload when it belongs to the ward currently on
  // screen. `fetchedData` is a single un-keyed slot in Redux, so while a new
  // ward's request is in flight the previous ward's payload is still sitting
  // there — and every consumer below (assignments, layout config, talukaId)
  // would happily render it as if it were this ward's data.
  const fetchedData =
    fetchedDataRaw && (!fetchedWardId || fetchedWardId === ward.id)
      ? fetchedDataRaw
      : null;
  const wardInfo = useSelector(selectWardInfo);
  const layoutConfig = useSelector(selectLayoutConfig);
  const ucnMembers = useSelector(selectUcnMembers);
  const channelPartners = useSelector(selectChannelPartners);
  const patrons = useSelector(selectPatrons);
  const umsMembers = useSelector(selectUmsMembers);

  // Taluka name for the "MLA · Patrons · Chairmen" page banner (Page 2),
  // which shows the taluka instead of the ward code/name shown elsewhere.
  // Confirmed API shape: `ward.taluka` is a plain string (e.g. "Malleshwaram"),
  // not an object — read it directly. The `.talukaName` fallbacks are kept
  // only for any older/alternate response shape that still nests it.
  const talukaName =
    (typeof ward?.taluka === "string" && ward.taluka) ||
    (typeof fetchedData?.data?.taluka === "string" && fetchedData.data.taluka) ||
    fetchedData?.data?.taluka?.talukaName ||
    ward?.taluka?.talukaName ||
    ward?.talukaName ||
    "";

  const [errorModalData, setErrorModalData] = useState(null);
  const activeError = errorModalData || apiError;

  const [assignments, setAssignments] = useState({});
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  const heroImageUrl = assignments["hero-image"]?.photoUrl || HERO_IMAGE_URL;
  const [heroCropFile, setHeroCropFile] = useState(null);
  const [showHeroCrop, setShowHeroCrop] = useState(false);
  const heroCropImageUrl = heroCropFile ? URL.createObjectURL(heroCropFile) : null;
  const measureRef = useRef(null);

  const handleRemove = (row) => {
    if (!row.memberId) { console.warn("memberId:", row); return; }
    dispatch(deleteWardChartMember(row.memberId))
      .unwrap()
      .then(() => {
        if (row.slotId) {
          setAssignments((prev) => {
            const next = { ...prev };
            delete next[row.slotId];
            return next;
          });
        }
        if (targetUserId && ward.id) {
          dispatch(getWardChartData({ userId: targetUserId, wardId: ward.id }));
        }
        if (talukaId) {
          dispatch(getAllWardChaimansBy(talukaId));
        }
      })
      .catch((err) => console.error("Delete failed:", err));
  };

  const handleHeroImageSelect = (file) => {
    setHeroCropFile(file);
    setShowHeroCrop(true);
  };

  const handleHeroCropDone = (blob) => {
    let wardHeadId;
    try {
      wardHeadId = getEffectiveWardHeadId(user, ward, wardChairmenList);
    } catch (err) {
      setErrorModalData({ message: err.message });
      return;
    }
    const croppedFile = new File([blob], "hero-image.jpg", { type: "image/jpeg" });
    const formData = new FormData();
    formData.append("data", JSON.stringify({
      wardHeadId,
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
    dispatch(createWardChartData(formData))
      .unwrap()
      .catch((err) => setErrorModalData(err));
  };

  const isWardChairman = user?.role === "WardChairman";
  const isSuperAdmin = user?.role === "SuperAdmin";

  const [tab, setTab] = useState(user?.role === "WardChairman" ? "build" : "build");
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const pdfRef = useRef(null);
  const [showCustomize, setShowCustomize] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [modal, setModal] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [sidePanelSlot, setSidePanelSlot] = useState(null);
  const [search] = useState("");
  const [sectionFilter] = useState("all");

  const isPreviewMode = tab === "preview";

  const lastWardIdRef = useRef(null);
  const lastTalukaIdRef = useRef(null);
  // Tracks which ward the taluka roster was last (re)fetched for, so switching
  // wards inside one taluka still refreshes the shared MLA/Patron data.
  const lastWardIdForRosterRef = useRef(null);

  useEffect(() => {
    if (targetUserId && ward.id) {
      dispatch(getWardChartData({ userId: targetUserId, wardId: ward.id }));
    }
    if (ward.id && lastWardIdRef.current !== ward.id) {
      dispatch(fetchUcnMembers(ward.id));
      dispatch(fetchUmsMembers(ward.id));
      dispatch(fetchChannelPartners({ wardId: ward.id }));
      lastWardIdRef.current = ward.id;
    }
    if (user?.userId && (!wards || wards.length === 0)) {
      const positionId = user?.position?.positionId || localStorage.getItem("positionId") || user.userId;
      dispatch(getLocationByWardHeadId(positionId));
    }
  }, [dispatch, targetUserId, ward.id, user?.userId, user?.position?.positionId]);

  // Wipe the previous ward's rendered state the moment the selected ward
  // changes, so nothing from it lingers while the new ward's data loads. The
  // fresh fetch is dispatched by the effect above; this just makes sure the
  // page doesn't keep showing the old ward's slots/patron count in between.
  //
  // Done during render (React's documented "adjust state when a prop changes"
  // pattern) rather than in an effect: it discards the stale view in the same
  // render instead of after a paint, so the old ward's data never flashes.
  const [renderedWardId, setRenderedWardId] = useState(ward.id);
  if (renderedWardId !== ward.id) {
    setRenderedWardId(ward.id);
    setAssignments({});
    setConfig(DEFAULT_CONFIG);
  }

  useEffect(() => {
    // `fetchedData` is already ward-scoped (see the guard where it is derived),
    // so reaching here means the payload really is for the ward on screen.
    if (fetchStatus === "succeeded" && fetchedData) {
      const mapped = mapApiToAssignments(fetchedData);
      setAssignments(mapped);
      const apiData = fetchedData?.data || {};
      const apiLayoutConfig = apiData.layoutConfig;

      if (apiLayoutConfig && typeof apiLayoutConfig === "object") {
        setConfig({
          ...DEFAULT_CONFIG,
          ...apiLayoutConfig,
          slotCounts: { ...DEFAULT_CONFIG.slotCounts, ...(apiLayoutConfig.slotCounts || {}) },
        });
      } else {
        // This ward has no saved layoutConfig (a brand-new or never-customised
        // chart stores null). Without this branch the config from the PREVIOUS
        // ward stayed on screen — that is why a sibling ward kept showing the
        // patron count of whichever ward was opened before it.
        setConfig(DEFAULT_CONFIG);
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


  // ── PDF download (rendered by the backend) ────────────────────────────
  // The pages that are on screen (.pdf-capture-page) are sent to the backend
  // as HTML + the app's compiled CSS. The backend prints them with headless
  // Chrome, so the PDF keeps exactly this design but has real (vector) text
  // and full-resolution photos - nothing is screenshotted in the browser.

  const sanitizeFileName = (raw) =>
    (raw || "Ward Chart")
      .toString()
      .replace(/[\\/:*?"<>|]/g, "-")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/[. ]+$/g, "") || "Ward Chart";

  const blobToDataUrl = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  // Compiled CSS of the app. Sheets from other origins (e.g. web fonts) can't
  // be read, so those are sent as plain links for the backend to load itself.
  const collectPageStyles = () => {
    let css = "";
    const links = [];
    Array.from(document.styleSheets).forEach((sheet) => {
      try {
        css += Array.from(sheet.cssRules).map((rule) => rule.cssText).join("\n") + "\n";
      } catch {
        if (sheet.href && sheet.href.startsWith("https://")) links.push(sheet.href);
      }
    });
    return { css, links };
  };

  // outerHTML of one page with every image pointing at an absolute URL the
  // backend can download (blob: URLs only exist in this browser, so those are
  // inlined as data: URLs).
  //
  // Images served by this web app itself (the Udyami Bharat logo, the default
  // cover hero image, product logos - bundled assets) are inlined as data:
  // URLs as well. The backend cannot always reach the web app's own origin
  // (e.g. a localhost dev server), which is why only those images went missing.
  const serializePageForPdf = async (page, inlineCache = new Map()) => {
    const clone = page.cloneNode(true);
    clone.querySelectorAll(".no-print").forEach((el) => el.remove());

    const liveImgs = Array.from(page.querySelectorAll("img"));
    const cloneImgs = Array.from(clone.querySelectorAll("img"));

    await Promise.all(
      cloneImgs.map(async (img, i) => {
        const live = liveImgs[i];
        const src = live?.currentSrc || live?.src || img.getAttribute("src") || "";

        img.removeAttribute("srcset");
        img.removeAttribute("loading");
        img.removeAttribute("crossorigin");

        // Same-origin images, and images on a local/private host (e.g. a dev
        // backend serving /uploads), are not reachable from the PDF server.
        let isSameOrigin = false;
        try {
          const parsed = new URL(src, window.location.href);
          isSameOrigin =
            parsed.origin === window.location.origin ||
            /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(parsed.hostname);
        } catch {
          // not a parseable URL - treated as external below
        }

        if (src.startsWith("blob:") || (isSameOrigin && !src.startsWith("data:"))) {
          if (!inlineCache.has(src)) {
            inlineCache.set(
              src,
              fetch(src)
                .then((res) => (res.ok ? res.blob() : Promise.reject(new Error(`HTTP ${res.status}`))))
                .then(blobToDataUrl)
                .catch(() => null)
            );
          }
          const dataUrl = await inlineCache.get(src);
          // If it can't be inlined fall back to the absolute URL.
          img.setAttribute("src", dataUrl || src);
        } else if (src) {
          img.setAttribute("src", src);
        }
      })
    );

    return clone.outerHTML;
  };

  // The backend answers errors as JSON, but because the request asks for a
  // blob the body arrives as a Blob - read it back into a message.
  const readPdfError = async (err) => {
    const data = err?.response?.data;
    if (data instanceof Blob) {
      try {
        const parsed = JSON.parse(await data.text());
        const msg = Array.isArray(parsed?.message) ? parsed.message.join(", ") : parsed?.message;
        if (msg) return msg;
      } catch {
        // not JSON - fall through
      }
    }
    return err?.message || "The PDF could not be generated. Please try again, and check your connection if the problem continues.";
  };

  const handleDownloadPdf = async () => {
    // Printing while ward/member data is still in flight would bake the empty
    // placeholder state ("NAME", blank avatars, blank sector boxes) into the
    // PDF. Refuse rather than export a chart full of placeholders.
    if (apiStatus === "loading" || fetchStatus === "loading") {
      setErrorModalData({
        title: "Chart Still Loading",
        message: "Ward and member data is still loading. Wait for the chart to finish loading on screen, then try Download PDF again.",
      });
      return;
    }

    const pages = document.querySelectorAll(".pdf-capture-page");
    if (!pages.length) {
      setErrorModalData({
        title: "Nothing to Export",
        message: "The chart hasn't finished rendering yet. Please wait for the page to fully load, then try Download PDF again.",
      });
      return;
    }

    setIsPdfGenerating(true);
    try {
      // The file is named after the TALUKA of the opened ward (the chart covers
      // the whole taluka), not the ward. Names are free text and can contain
      // "/", ":" etc. which make <a download> silently drop the download -
      // sanitize it first.
      const fileName = `${sanitizeFileName(talukaName || ward.constituency || ward.ward_name)}.pdf`;

      const { css, links } = collectPageStyles();
      const inlineCache = new Map();
      const pagesHtml = (
        await Promise.all(Array.from(pages).map((page) => serializePageForPdf(page, inlineCache)))
      ).join("\n");

      const response = await api.post(
        "/ward-chart/downloadPdf",
        {
          fileName,
          pagesHtml,
          css,
          stylesheetLinks: links,
          baseUrl: window.location.origin,
          htmlClass: document.documentElement.className,
          bodyClass: document.body.className,
        },
        { responseType: "blob", timeout: 180000 }
      );

      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      if (!pdfBlob.size) {
        setErrorModalData({
          title: "PDF Download Failed",
          message: "The generated PDF was empty, so the download was skipped. Please try again.",
        });
        return;
      }

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      console.error("PDF generation failed:", err);
      setErrorModalData({
        title: "PDF Download Failed",
        message: await readPdfError(err),
      });
    } finally {
      setIsPdfGenerating(false);
    }
  };

  // ── Duplicate mobile/email guard ───────────────────────────────
  // Prevents the same person (matched by mobile number or email) from being
  // assigned to more than one slot — e.g. the Ward Head being re-assigned as
  // President with the same contact details.
  const normalizeContact = (val) => (val || "").toString().trim().toLowerCase();

  const findDuplicateContact = (mobileNumber, email, slotId) => {
    const mobile = normalizeContact(mobileNumber);
    const mail = normalizeContact(email);
    if (!mobile && !mail) return null;

    const isSameContact = (candMobile, candEmail) => {
      const cm = normalizeContact(candMobile);
      const ce = normalizeContact(candEmail);
      return (mobile && cm && cm === mobile) || (mail && ce && ce === mail);
    };

    // 1) The Ward Head who owns this chart
    const wardHead = fetchedData?.data?.wardHead;
    if (wardHead && isSameContact(wardHead.mobileNumber, wardHead.email)) {
      return { name: wardHead.name, role: "Ward Head" };
    }

    // 2) Members already saved on the server for this chart
    // (guarded with Array.isArray — the API can return `members` as `{}`/null
    // instead of `[]` when the chart has no members yet, which isn't iterable)
    const savedMembers = Array.isArray(fetchedData?.data?.members) ? fetchedData.data.members : [];
    for (const m of savedMembers) {
      if (!m || m.slotId === slotId) continue;
      if (isSameContact(m.mobileNumber, m.email)) {
        return { name: m.name, role: m.slotLabel || m.coreRole || m.slotId };
      }
    }

    // 3) Slots currently held in local UI state (covers chairmen/patrons
    //    merged in on the client that may not be in `members` yet)
    for (const [sid, a] of Object.entries(effectiveAssignments || {})) {
      if (!a || sid === slotId) continue;
      if (isSameContact(a.mobileNumber, a.email)) {
        return { name: a.name, role: a.slotLabel || sid };
      }
    }

    return null;
  };

  const duplicateContactError = (duplicate) => ({
    message: `${duplicate.name || "This member"} is already assigned as ${duplicate.role}. The same mobile number / email cannot be assigned to another position.`,
    error: "Duplicate Member",
    statusCode: 409,
  });

  // ── Assign handler ────────────────────────────────────────────
  const handleAssign = (data) => {
    const slotId = modal.slotId;
    const photoFile = data.photoFile;
    const photoUrl = data.photoUrl;

    const duplicate = findDuplicateContact(data.mobileNumber, data.email, slotId);
    if (duplicate) {
      setErrorModalData(duplicateContactError(duplicate));
      return;
    }

    setModal(null);

    const isCommon = isBlockedForWardChairman(slotId);
    const { photoFile: _f, photoUrl: _u, ...restData } = data;
    let payload;
    try {
      payload = buildSingleMemberPayload(ward, user, slotId, { ...restData, photoUrl, slotLabel: modal.label }, wardChairmenList);
    } catch (err) {
      setErrorModalData({ message: err.message });
      return;
    }

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
    dispatch(createWardChartData(formData))
      .unwrap()
      .then(() => {
        // A common-page slot (MLA / Patron / Chairmen) is written by the backend
        // into every ward of this taluka, so the roster these slots are rendered
        // from is now stale for every sibling ward — drop it and refetch.
        if (isCommon) {
          dispatch(invalidateTalukaWardChartCache());
          if (talukaId) dispatch(getAllWardChaimansBy(talukaId));
        }
      })
      .catch((err) => setErrorModalData(err));
  };

  const openDetails = (id, label, override = null) => {
    const a = override || effectiveAssignments[id] || assignments[id];
    setSelectedPosition({
      slotId: id,
      role: a?.positionName || a?.slotLabel || label,
      memberName: a?.name || a?.memberName || null,
      company: a?.company || null,
      mobileNumber: a?.mobileNumber || null,
      email: a?.email || null,
      location: a?.location || null,
      district: a?.district || null,
      reportsTo: a?.reportsTo || null,
      directReports: a?.directReports || null,
      assignedDate: a?.assignedDate || null,
      memberId: a?.memberId || null,
      memberNumber: a?.memberNumber || null,
      status: a?.status || "registered",
      profileImage: a?.photoUrl || a?.profileImage || null,
      positionDescription: a?.positionDescription || null,
      assignedUserName: a?.assignedUserName || null,
      fromDate: a?.fromDate || null,
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

  const handleAssignMemberFromPanel = (selectedMember) => {
    if (!sidePanelSlot) return;
    const slotId = sidePanelSlot.slotId;
    const label = sidePanelSlot.label;

    const isCommon = isBlockedForWardChairman(slotId);

    const nameToAssign =
      selectedMember.holder?.user?.name ||
      selectedMember.name ||
      selectedMember.assignedUserName ||
      "";

    const mobileToAssign =
      selectedMember.holder?.user?.mobileNumber ||
      selectedMember.mobileNumber ||
      "";

    const emailToAssign =
      selectedMember.holder?.user?.email ||
      selectedMember.email ||
      "";

    const companyToAssign =
      selectedMember.designation?.designationName ||
      selectedMember.companyName ||
      selectedMember.company ||
      "";

    const photoUrl =
      selectedMember.holder?.user?.profile?.profileImage ||
      selectedMember.profileImage ||
      selectedMember.photoUrl ||
      selectedMember.profile?.profileImage ||
      selectedMember.profile?.photoUrl ||
      selectedMember.profile?.businessDetails?.businessImage1 ||
      "";

    const memberIdToAssign =
      selectedMember.holder?.user?.userId ||
      selectedMember.userId ||
      selectedMember.memberId ||
      selectedMember.assignmentId ||
      null;

    const duplicate = findDuplicateContact(mobileToAssign, emailToAssign, slotId);
    if (duplicate) {
      setErrorModalData(duplicateContactError(duplicate));
      setSidePanelSlot(null);
      return;
    }

    let payload;
    try {
      payload = buildSingleMemberPayload(ward, user, slotId, {
        name: nameToAssign,
        mobileNumber: mobileToAssign,
        email: emailToAssign,
        company: companyToAssign,
        photoUrl,
        status: "registered",
        slotLabel: label,
        memberId: memberIdToAssign,
        userId: memberIdToAssign,
      }, wardChairmenList);
    } catch (err) {
      setErrorModalData({ message: err.message });
      setSidePanelSlot(null);
      return;
    }

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
        profileImage: profileImage || "",
      })),
    }));

    dispatch(createWardChartData(formData))
      .unwrap()
      .then(() => {
        setAssignments((prev) => ({
          ...prev,
          [slotId]: {
            name: nameToAssign,
            company: companyToAssign,
            photoUrl: (typeof photoUrl === "string" && photoUrl.trim()) ? photoUrl : null,
            mobileNumber: mobileToAssign,
            email: emailToAssign,
            memberId: memberIdToAssign,
            status: "registered",
            slotLabel: label,
            positionName: selectedMember.positionName || selectedMember.designation?.designationName || null,
            positionDescription: selectedMember.positionDescription || selectedMember.designation?.description || null,
            assignedUserName: nameToAssign,
          },
        }));

        // Same as handleAssign: a common-page slot was just synced across the
        // whole taluka, so every sibling ward's cached view is now stale.
        if (isCommon) dispatch(invalidateTalukaWardChartCache());
        if (targetUserId && ward.id) {
          dispatch(getWardChartData({ userId: targetUserId, wardId: ward.id }));
        }
        if (talukaId) dispatch(getAllWardChaimansBy(talukaId));
      })
      .catch((err) => {
        console.error("Create ward chart data error:", err);
        setErrorModalData(err);
      });

    setSidePanelSlot(null);
  };

  const isUcnSidePanelSlot = (slotId) => {
    if (!slotId) return false;
    return (
      slotId === "core-president" ||
      slotId === "core-vice-president" ||
      slotId === "core-general-secretary" ||
      slotId === "core-treasurer"
    );
  };

  const isUmsSidePanelSlot = (slotId) => {
    if (!slotId) return false;
    return slotId.startsWith("ums-");
  };

  const isChannelPartnerSlot = (slotId) => {
    if (!slotId) return false;
    return slotId.startsWith("product-");
  };

  const isPatronSlot = (slotId) => {
    if (!slotId) return false;
    return slotId.startsWith("patron-");
  };

  const isWardLevelSlot = (slotId) => {
    if (!slotId) return false;
    return (
      slotId.startsWith("advisory-") ||
      slotId.startsWith("mentor-") ||
      slotId.startsWith("core-") ||
      slotId.startsWith("sector-") ||
      slotId.startsWith("ums-") ||
      slotId.startsWith("product-")
    );
  };

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
    if (id?.startsWith("chairman-")) {
      const eff = effectiveAssignments[id] || a;
      if (eff?.name) openDetails(id, label);
      return;
    }
    if (a?.name) {
      openDetails(id, label);
    } else if (isUcnSidePanelSlot(id)) {
      setSidePanelSlot({ slotId: id, label, panelType: "ucn" });
    } else if (isUmsSidePanelSlot(id)) {
      setSidePanelSlot({ slotId: id, label, panelType: "ums" });
    } else if (isChannelPartnerSlot(id)) {
      setSidePanelSlot({ slotId: id, label, panelType: "channelPartner" });
    } else if (isPatronSlot(id)) {
      setSidePanelSlot({ slotId: id, label, panelType: "patron" });
    } else {
      setModal({ slotId: id, label });
    }
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

    const customCatsInConfig = (config.brandTiles || []).filter(
      (c) => !DEFAULT_CONFIG.brandTiles.some((dc) => dc.key === c.key)
    );

    const customCats = customCatsInConfig.map((cat) => {
      const countKey = CATEGORY_COUNT_MAP[cat.key] || cat.countKey || `count_${cat.key}`;
      const enabledProducts = (cat.products || []).filter((p) => p.enabled !== false);
      const maxCount = config.slotCounts?.[countKey] ?? (enabledProducts.length || 5);

      const slots = [...enabledProducts];
      while (slots.length < maxCount) {
        const idx = slots.length;
        slots.push({
          key: `placeholder-${cat.key}-${idx}`,
          name: `${cat.label} ${idx + 1}`,
          sub: cat.label,
          enabled: true,
          isPlaceholder: true,
        });
      }

      return {
        ...cat,
        color: cat.color || "#2563EB",
        products: slots.slice(0, maxCount),
      };
    }).filter((cat) => cat.products.length > 0);

    const allBrandCats = [...baseCats, ...customCats];

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
      return [extraCat, ...allBrandCats];
    }

    return allBrandCats;
  }, [config.brandTiles, config.slotCounts, remSectors, remUms]);

  const productPages = useMemo(
    () => paginateBrandCategories(activeBrandCategories),
    [activeBrandCategories]
  );



  const gCode = ward.g_code || ward.ward_number || ward.wardNumber || "G5.48";

  const reduxWards = useSelector(selectWards) || [];
  const constituencyWards = useMemo(() => {
    const filtered = !ward.constituency
      ? reduxWards
      : reduxWards.filter((w) => w.constituency === ward.constituency);

    // De-dupe: `reduxWards` (wardSlice) has been observed to contain more
    // than one row for the same physical ward. Every downstream consumer
    // here — the chairman slot count, the chairman-slot matching in
    // mergeTalukaChairmenIntoAssignments, and the per-ward Advisory/
    // Leadership page loop below — assumes one entry per ward, so a
    // duplicate silently doubles that ward's chairman card and bumps a
    // different, genuinely-unmatched ward's chairman out of its rightful
    // slot (the "API returns 10, UI shows 11 with one duplicated" bug).
    // Key on wardId when present (most reliable), else fall back to a
    // normalized ward name.
    const seen = new Set();
    const deduped = [];
    for (const w of filtered) {
      const key = w?.id || w?.wardId || `${w?.ward_name || w?.wardName || ""}`.trim().toLowerCase();
      if (key && seen.has(key)) continue;
      if (key) seen.add(key);
      deduped.push(w);
    }
    return deduped;
  }, [reduxWards, ward.constituency]);

  const wardChairmenList = useSelector(selectWardChairmenList);

  const talukaId = useMemo(() => {
    return (
      fetchedData?.data?.taluka?.talukaId ||
      ward?.talukaId ||
      ward?.taluka?.talukaId ||
      (constituencyWards[0] && constituencyWards[0].talukaId) ||
      (wardFromStateOrStore && wardFromStateOrStore.talukaId) ||
      null
    );
  }, [fetchedData, ward, constituencyWards, wardFromStateOrStore]);

  // The taluka roster (`wardChairmenList`) is what actually renders the MLA and
  // Patron slots — `effectiveAssignments` below merges them in from it, for
  // EVERY ward in the taluka. It used to be fetched once per taluka and gated
  // behind `lastTalukaIdRef`, so switching between wards of the SAME taluka
  // never refetched it: the sibling ward rendered the snapshot taken when the
  // taluka was first opened, which is exactly the data a cross-ward save has
  // just made stale.
  //
  // Refetch when the taluka changes, when the selected WARD changes, when the
  // cache was explicitly invalidated after a save, or when the snapshot is more
  // than ROSTER_MAX_AGE_MS old.
  useEffect(() => {
    if (!talukaId) return;

    const wardChanged = lastWardIdForRosterRef.current !== ward.id;
    const talukaChanged = lastTalukaIdRef.current !== talukaId;
    const rosterIsForAnotherTaluka = wardChairmenTalukaId !== talukaId;
    const rosterIsStale = isRosterStale(wardChairmenFetchedAt);

    if (wardChanged || talukaChanged || rosterIsForAnotherTaluka || rosterIsStale) {
      dispatch(getAllWardChaimansBy(talukaId));
      dispatch(fetchPatrons(talukaId));
      lastTalukaIdRef.current = talukaId;
      lastWardIdForRosterRef.current = ward.id;
    }
    // `wardChairmenFetchedAt` is deliberately not a dependency: it changes on
    // every fulfilled fetch and would otherwise re-trigger this effect in a loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, talukaId, ward.id, wardChairmenTalukaId]);

  const effectiveAssignments = useMemo(() => {
    const withChairmen = mergeTalukaChairmenIntoAssignments(assignments, wardChairmenList, constituencyWards, gCode);
    return mergePatronsIntoAssignments(withChairmen, wardChairmenList);
  }, [assignments, wardChairmenList, constituencyWards, gCode]);

  const rows = useMemo(
    () =>
      Object.entries(effectiveAssignments)
        .filter(
          ([slotId, a]) =>
            !slotId.startsWith("chairman-") &&
            slotId !== "hero-image" &&
            a &&
            a.name &&
            // For the WardChairman role, the All Assignments table should
            // only list this ward's own positions (Sector, Advisory,
            // Mentor, UMS, Leadership...) — MLA/Official/Patron/Chairman
            // are constituency-level assignments managed elsewhere, not
            // something a ward chairman assigns or should see listed here.
            !(isWardChairman && isBlockedForWardChairman(slotId))
        )
        .map(([slotId, a]) => ({
          name: a.name,
          company: a.company || "—",
          position: a.slotLabel || slotId,
          status: a.status || "registered",
          slotId,
          memberId: a.memberId || a.id || null,
          memberNumber: a.memberNumber || null,
          mobileNumber: a.mobileNumber || null,
          email: a.email || null,
          profileImage: a.photoUrl || a.profileImage || null,
        })),
    [effectiveAssignments, isWardChairman]
  );

  const reduxWardCount = constituencyWards.length > 0 ? constituencyWards.length : (reduxWards.length > 0 ? reduxWards.length : null);
  const apiWardCount = fetchedData?.data?.constituencyWardCount || fetchedData?.data?.wardsCount || fetchedData?.data?.totalWards || fetchedData?.data?.wardLength || (Array.isArray(fetchedData?.data?.wards) ? fetchedData.data.wards.length : null);

  // Root cause of the "API returns 10, UI shows 11 chairmen" bug: this count
  // used to prefer `ward.constituencyWardCount` / `ward.wardsCount` / etc. —
  // numbers captured on the `ward` object from an earlier, undeduped ward
  // list — over the actual taluka-chairmen response. When that stale count
  // was one higher than the real (deduped) ward count, an extra empty
  // chairman slot got rendered even though only 10 chairman records exist.
  // `wardChairmenList` (GET /talukas/getAllWardChaimansBy/:talukaId) is the
  // authoritative source for "how many chairmen did the API return" — dedupe
  // it the same way `constituencyWards` is deduped (by wardId, else
  // normalized ward name) and use that first.
  const dedupedWardChairmenCount = useMemo(() => {
    if (!Array.isArray(wardChairmenList) || wardChairmenList.length === 0) return 0;
    const seen = new Set();
    let count = 0;
    for (const w of wardChairmenList) {
      const key = w?.wardId || w?.id || `${w?.wardName || w?.ward_name || ""}`.trim().toLowerCase();
      if (key && seen.has(key)) continue;
      if (key) seen.add(key);
      count += 1;
    }
    return count;
  }, [wardChairmenList]);

  const totalChairmenCount = Number(
    dedupedWardChairmenCount ||
    reduxWardCount ||
    ward.constituencyWardCount ||
    ward.wardsCount ||
    ward.wardLength ||
    ward.totalWards ||
    apiWardCount ||
    9
  );

  const officialsCount = Number(config.slotCounts?.officials ?? 4);
  const officialRows = Math.ceil(officialsCount / 4);

  const totalPatrons = Number(config.slotCounts?.patrons ?? 10);
  const patronRows = Math.ceil(totalPatrons / 5);

  // Page 2 max capacity is 7 total rows (1 MLA + officialRows + patronRows + chairmanRows)
  const fixedRows = 1 + officialRows + patronRows;
  const availableChairmanRows = Math.max(0, 7 - fixedRows);
  const maxChairmanRowsP2 = Math.min(2, availableChairmanRows);
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

  const displayWardsList = useMemo(() => {
    if (constituencyWards && constituencyWards.length > 0) return constituencyWards;
    if (reduxWards && reduxWards.length > 0) return reduxWards;
    return [ward];
  }, [constituencyWards, reduxWards, ward]);

  const wardsToRender = useMemo(() => {
    if (isPreviewMode && !isWardChairman && displayWardsList.length > 0) {
      return displayWardsList;
    }
    return [ward];
  }, [isPreviewMode, isWardChairman, displayWardsList, ward]);

  // ── Print Preview cover: taluka heading + its wards ──────────────────
  // "G33. 2 Nelamangala  108" - the ward number split at the dot, the ward name
  // and the ward's card total. Same list the Area Chart shows (one row per ward).
  const coverSummary = useMemo(() => {
    const list = constituencyWards.length > 0 ? constituencyWards : [ward];
    const codeOf = (w) => String(w?.ward_number || w?.wardNumber || "").split(".")[0].trim();
    const talukaCode = codeOf(ward) || codeOf(list[0]);
    const name = (talukaName || ward.constituency || "").toString().trim();

    const wards = [...list]
      .sort((a, b) =>
        String(a?.ward_number || "").localeCompare(String(b?.ward_number || ""), undefined, { numeric: true })
      )
      .map((w) => {
        const [prefix, ...rest] = String(w?.ward_number || w?.wardNumber || "").split(".");
        return {
          code: rest.length ? `${prefix}. ${rest.join(".")}` : prefix,
          name: w?.ward_name || w?.wardName || "",
          count: w?.booths_total ?? w?.layoutCount ?? "",
        };
      });

    return { title: `${talukaCode} ${name.toUpperCase()}`.trim(), wards };
  }, [constituencyWards, ward, talukaName]);

  // ── Print Preview: every other ward's OWN chart data ─────────────────
  // Print Preview renders the Advisory / Leadership / Sectors / UMS and
  // Products pages for every ward of the constituency. The Redux slot
  // (`fetchedData`) and `assignments` only ever hold the ONE ward that was
  // opened, so every other ward used to render empty placeholders. Fetch each
  // sibling ward's chart here (kept in local state so the opened ward's Redux
  // data is never overwritten) and render its pages from that.
  const [wardChartsById, setWardChartsById] = useState({});

  const otherWardIds = useMemo(
    () =>
      wardsToRender
        .filter((w) => w?.id && w.id !== ward.id)
        .map((w) => w.id),
    [wardsToRender, ward.id]
  );

  // Wards whose request is currently in flight. Results are keyed by ward id,
  // so a finished request is always safe to store - even if the effect below
  // re-ran meanwhile (e.g. the ward list got a new identity). Dropping those
  // results is what could leave a ward permanently "empty".
  const inFlightWardIdsRef = useRef(new Set());
  const otherWardIdsKey = otherWardIds.join("|");

  useEffect(() => {
    if (!isPreviewMode || !otherWardIdsKey) return;
    const queue = otherWardIdsKey
      .split("|")
      .filter((id) => !inFlightWardIdsRef.current.has(id));
    queue.forEach((id) => inFlightWardIdsRef.current.add(id));

    const worker = async () => {
      while (queue.length > 0) {
        const id = queue.shift();
        let entry;
        try {
          const res = await api.get(`/ward-chart/getWardChartData/${targetUserId || "0"}/${id}`);
          entry = { data: res.data, error: null };
        } catch (err) {
          console.error("Print Preview: could not load ward chart", id, err);
          entry = {
            data: null,
            error: err?.response?.data?.message || err?.message || "Failed to load",
          };
        } finally {
          inFlightWardIdsRef.current.delete(id);
        }
        setWardChartsById((prev) => ({ ...prev, [id]: entry }));
      }
    };

    // A few requests at a time - a taluka can have 20+ wards.
    Array.from({ length: Math.min(4, queue.length) }, () => worker());
  }, [isPreviewMode, otherWardIdsKey, targetUserId]);

  const wardAssignmentsById = useMemo(() => {
    const out = {};
    otherWardIds.forEach((id) => {
      const entry = wardChartsById[id];
      out[id] = entry?.data ? mapApiToAssignments(entry.data) : {};
    });
    return out;
  }, [otherWardIds, wardChartsById]);

  const isWardChartsLoading = isPreviewMode && otherWardIds.some((id) => !wardChartsById[id]);

  const isBusy = apiStatus === "loading" || fetchStatus === "loading" || isWardChartsLoading;

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
        <p className="text-[12px] text-red-600 font-medium">
          Save failed: {getErrorMessage(apiError)}
        </p>
      )}

      {/* ── Action Buttons ── */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setModal({ slotId: `extra-${Date.now()}`, label: "Member" })}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[12.5px] font-semibold px-4 py-2 rounded-lg transition-colors w-full sm:w-auto"
        >
          <UserPlus size={14} /> Add Member
        </button>
        <button
          onClick={() => setShowCustomize(true)}
          className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-[12.5px] font-medium text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto"
        >
          <SlidersHorizontal size={14} /> Customize Layout
        </button>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-[12.5px] font-medium text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto"
        >
          <Send size={14} /> Invite Member
        </button>
        <button
          onClick={handleDownloadPdf}
          disabled={isPdfGenerating || isBusy}
          title={isBusy ? "Waiting for ward and member data to finish loading" : "Download PDF"}
          className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-[12.5px] font-medium text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={14} />
          {isPdfGenerating ? "Generating…" : isBusy ? "Loading data…" : "Download PDF"}
        </button>
      </div>

      {/* ── Build / Preview Tabs ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
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

        {isPreviewMode && (
          <button
            onClick={handleDownloadPdf}
            disabled={isPdfGenerating || isBusy}
            title={isBusy ? "Waiting for ward and member data to finish loading" : "Download this Print Preview as PDF"}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[12.5px] font-semibold px-4 py-2 rounded-lg transition-colors w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={14} />
            {isPdfGenerating ? "Generating…" : isBusy ? "Loading data…" : "Download PDF"}
          </button>
        )}
      </div>

      <div ref={pdfRef} className="pdf-container-wrapper space-y-6">
        {/* ══════ PAGE 1 — COVER (SINGLE COMMON COVER) ══════ */}
        <ChartPreviewFrame pageLabel="Cover Page">
          <CoverPage
            code={wardInfo?.wardNumber ?? ward.ward_number ?? ""}
            regionName={ward.constituency || wardInfo?.wardName || ward.ward_name}
            wardNumber={ward.ward_number}
            wardName={ward.ward_name}
            heroImageUrl={heroImageUrl}
            onHeroImageSelect={handleHeroImageSelect}
            showHeroUpload={!isPreviewMode}
            summaryTitle={isPreviewMode ? coverSummary.title : ""}
            summaryWards={isPreviewMode ? coverSummary.wards : null}
          />
        </ChartPreviewFrame>

        {/* ══════ PAGES 2 & 3 — MLA · PATRONS · CHAIRMEN (COMMON FOR CONSTITUENCY) ══════ */}
        {!isWardChairman && (
          <>
            {/* ══════ PAGE 2 — MLA + Officials + Patrons + Chairmen ══════ */}
            <ChartPage
              pageLabel={`MLA · Patrons · Chairmen (1–${p2Count})`}
              pageNum={2}
              ward={ward}
              hideWardCode
              wardNameOverride={talukaName || ward.ward_name}
            >
              <div className="px-6 py-1 space-y-1">
                <div className="flex justify-center pt-0">
                  <MlaCard
                    mlaLabel={`${talukaName || ward.ward_name} Assembly constituency`}
                    assigned={assignments.mla}
                    dimmed={isDimmed("mla", "core", assignments.mla?.name)}
                    onAssignClick={slotClickProp}
                    showPlus={!isPreviewMode && !isWardChairman}
                    isSuperAdmin={isSuperAdmin}
                  />
                </div>

                <div className="relative">
                  <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-px h-1.5 bg-ink/40" />
                  <div className="absolute left-[10%] right-[10%] top-0 h-px bg-ink/40" />
                  <div className="grid grid-cols-4 gap-2 pt-0.5">
                    {Array.from({ length: config.slotCounts?.officials ?? 4 }).map((_, i) => {
                      const slotId = `official-${i + 1}`;
                      return (
                        <div key={slotId} className="flex flex-col items-center">
                          <div className="w-px h-1.5 bg-ink/40 mb-0.5" />
                          <PdfSlot
                            slotId={slotId}
                            // topLabel={`Official ${i + 1}`}
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

                <div className="relative flex justify-center items-center py-0.5">
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#1a2e5e]" />
                  <div className="relative z-10">
                    <div className="relative bg-[#b5121b] text-white text-[11px] font-bold uppercase px-6 py-[2px] w-[180px] text-center rounded-t-sm rounded-b-xl">
                      UDYAMI PATRON
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-x-2.5 gap-y-1">
                  {Array.from({ length: config.slotCounts.patrons }).map((_, i) => {
                    const slotId = `patron-${i + 1}`;
                    return (
                      <PdfSlot
                        key={slotId}
                        slotId={slotId}
                        tone="navy"
                        assigned={effectiveAssignments[slotId]}
                        dimmed={isDimmed(slotId, "patrons", effectiveAssignments[slotId]?.name)}
                        onAssignClick={slotClickProp}
                        showPlus={!isPreviewMode}
                        isSuperAdmin={isSuperAdmin}
                      />
                    );
                  })}
                </div>

                <div className="relative flex justify-center items-center py-0.5">
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#1a2e5e]" />
                  <div className="relative z-10">
                    <div className="relative bg-[#b5121b] text-white text-[11px] font-bold uppercase px-6 py-[2px] w-[180px] text-center rounded-t-sm rounded-b-xl">
                      Chairmans
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-x-2.5 gap-y-1">
                  {chairmenP2.map((i) => {
                    const slotId = `chairman-${i + 1}`;
                    // Prefer the label baked into the matched chairman record
                    // (mergeTalukaChairmenIntoAssignments) over `constituencyWards[i]`
                    // — that keeps the ward name shown always in sync with
                    // whichever chairman actually got assigned to this slot,
                    // even if `constituencyWards` and the API list ever
                    // disagree on ordering.
                    const label = `${effectiveAssignments[slotId]?.wardLabel || constituencyWards[i]?.ward_name || `${gCode}.${i + 1}`} Chairman`;
                    return (
                      <div key={slotId}>
                        <p className="text-[8px] font-bold text-brick text-center mb-[1px] uppercase truncate">{label}</p>
                        <PdfSlot
                          slotId={slotId}
                          tone="brick"
                          assigned={effectiveAssignments[slotId]}
                          dimmed={isDimmed(slotId, "chairmen", effectiveAssignments[slotId]?.name)}
                          onAssignClick={slotClickProp}
                          showPlus={false}
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
              <ChartPage
                pageLabel={`Chairmen (${p2Count + 1}–${totalChairmenCount})`}
                pageNum={3}
                ward={ward}
                wardNameOverride={talukaName || ward.ward_name}
              >
                <div className="flex-1 h-full px-[3%] py-[2%]">
                  <div className="space-y-6">
                    {chairmenRowsP3.map((row, ri) => (
                      <div key={ri} className={row.length === 5 ? "grid grid-cols-5 gap-5" : "flex justify-center gap-5"}>
                        {row.map((i) => {
                          const slotId = `chairman-${i + 1}`;
                          // Reuse the label already computed onto the matched
                          // chairman record — see the page-2 comment above for why.
                          const label = effectiveAssignments[slotId]?.slotLabel
                            || `${constituencyWards[i]?.ward_number || `${gCode}.${i + 1}`} Chairman`;
                          return (
                            <div key={slotId} className={row.length < 5 ? "w-[110px]" : ""}>
                              <p className="text-[9px] font-bold text-brick text-center mb-1 uppercase">{label}</p>
                              <PdfSlot
                                slotId={slotId}
                                tone="brick"
                                assigned={effectiveAssignments[slotId]}
                                dimmed={isDimmed(slotId, "chairmen", effectiveAssignments[slotId]?.name)}
                                onAssignClick={slotClickProp}
                                showPlus={false}
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

        {/* ══════ PER-WARD PAGES (ADVISORY/LEADERSHIP/SECTORS/UMS + PRODUCTS FOR EACH WARD) ══════ */}
        {wardsToRender.map((w, wardIdx) => {
          const currentGCode = w.g_code || w.ward_number || w.wardNumber || gCode;
          const currentWardName = w.ward_name || w.wardName || "Ward";
          const currentRegion = w.region || w.district || w.constituency || ward.constituency;

          const currentWardChairman = (
            w.id === ward.id && assignments["ward-chairman"]?.name
          ) ? assignments["ward-chairman"] : (
            effectiveAssignments[`chairman-${wardIdx + 1}`] ||
            (w.id !== ward.id ? wardAssignmentsById[w.id]?.["ward-chairman"] : null) ||
            (wardChairmenList || []).find(item => item.wardId === w.id || item.wardNumber === w.ward_number || item.wardName === w.ward_name)?.wardChart?.members?.find(m => m?.userType === "WardChairman" || m?.slotId === "ward-chairman") ||
            null
          );

          // This ward's own slots. The opened ward keeps its live (editable) state;
          // every other ward uses the chart data fetched for it above.
          const wardAssignments = w.id === ward.id ? effectiveAssignments : (wardAssignmentsById[w.id] || {});
          const wardSlotClick = (id, label) => {
            if (isPreviewMode && w.id !== ward.id) {
              const a = wardAssignments[id];
              if (a?.name) openDetails(id, label, a);
              return;
            }
            handleSlotClick(id, label);
          };

          const wardHeaderPrefix = wardsToRender.length > 1 ? `[Ward ${w.ward_number || wardIdx + 1} - ${currentWardName}] ` : "";

          return (
            <React.Fragment key={w.id || `ward-block-${wardIdx}`}>
              {/* Screen-only status for this ward's members (never part of the PDF) */}
              {isPreviewMode && w.id !== ward.id && (
                <div className="no-print text-[12px] font-medium px-1">
                  {!wardChartsById[w.id] ? (
                    <span className="text-blue-600">Loading {currentWardName} members…</span>
                  ) : wardChartsById[w.id].error ? (
                    <span className="text-red-600">
                      Could not load members for {currentWardName}: {String(wardChartsById[w.id].error)}
                    </span>
                  ) : (
                    <span className="text-gray-500">
                      {currentWardName}: {Object.keys(wardAssignments).filter((k) => wardAssignments[k]?.name).length} assigned members loaded
                    </span>
                  )}
                </div>
              )}
              {/* ══════ PAGE 4 — Advisory/Mentor + Leadership + Sectors/UMS ══════ */}
              <ChartPage pageLabel={`${wardHeaderPrefix}Advisory · Leadership · Sectors · UMS`} pageNum={chairmenP3.length > 0 ? 4 : 3} ward={w}>
                <div className="flex flex-col h-full min-h-full">
                  {/* Advisory / Mentor row */}
                  <div className="flex flex-col items-center justify-center gap-3 px-4 py-2 bg-white border-b border-slate-100 shrink-0">
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
                                    assigned={wardAssignments[slotId]}
                                    dimmed={isDimmed(
                                      slotId,
                                      "advisories",
                                      wardAssignments[slotId]?.name
                                    )}
                                    onAssignClick={wardSlotClick}
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
                                    assigned={wardAssignments[slotId]}
                                    dimmed={isDimmed(
                                      slotId,
                                      "mentors",
                                      wardAssignments[slotId]?.name
                                    )}
                                    onAssignClick={wardSlotClick}
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
                  <div className="flex items-center bg-[#1a2e5e] shrink-0 px-4 gap-4 h-[150px]">
                    <div className="flex flex-col items-center justify-center shrink-0 w-[140px] h-[142px]">
                      <ChairmanHighlightCard
                        wardNumber={currentGCode}
                        assigned={currentWardChairman}
                        dimmed={isDimmed("ward-chairman", "core", currentWardChairman?.name)}
                        onAssignClick={wardSlotClick} showPlus={!isPreviewMode} isSuperAdmin={isSuperAdmin}
                      />
                    </div>

                    <div className="flex flex-1 justify-evenly items-center">
                      {CORE_ROLES.map((role) => {
                        const slotId = `core-${role.toLowerCase().replace(/\s+/g, "-")}`;
                        return (
                          <div key={slotId} className="flex flex-col items-center w-[105px] gap-1">
                            <p className="text-[11px] font-bold text-white text-center mb-1">{role}</p>
                            <div
                              onClick={() => wardSlotClick(slotId, role)}
                              className={`relative w-[95px] h-[95px] rounded-lg border-2 border-[#c8102e] bg-[#d32f2f] flex items-center justify-center overflow-hidden shrink-0 shadow-sm ${!isPreviewMode && !isSuperAdmin ? "cursor-pointer group" : "cursor-default"}`}
                            >
                              {wardAssignments[slotId]?.photoUrl ? (
                                <img src={wardAssignments[slotId].photoUrl} alt={wardAssignments[slotId].name} className="w-full h-full object-cover" />
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
                              {wardAssignments[slotId]?.name || "NAME"}
                            </p>
                            <p className="text-[7.5px] text-white/70 text-center leading-tight truncate max-w-[100px]">
                              {wardAssignments[slotId]?.company}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Red container: Sectors + UMS */}
                  <div className="flex gap-2.5 px-[2%] py-[2%] bg-[#c8102e] flex-1 min-h-0">
                    {/* Sectors flex column */}
                    <div className="flex-1 flex flex-col justify-evenly gap-1.5 pt-[30px]">
                      {Array.from({ length: Math.ceil(firstPageSectors.length / 3) }).map((_, rowIdx) => {
                        const rowSectors = firstPageSectors.slice(rowIdx * 3, rowIdx * 3 + 3);
                        return (
                          <div key={rowIdx} className="flex justify-center gap-6 px-4">
                            {rowSectors.map((s) => {
                              const slotId = `sector-${s.key}`;
                              return (
                                <div key={s.key} className="w-[118px] shrink-0">
                                  <SectorCard
                                    slotId={slotId} label={s.label} assigned={wardAssignments[slotId]}
                                    dimmed={isDimmed(slotId, "sectors", wardAssignments[slotId]?.name)}
                                    onAssignClick={wardSlotClick} showPlus={!isPreviewMode} isSuperAdmin={isSuperAdmin}
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
                      <div className="w-[250px] rounded-sm border border-ink shrink-0 bg-white overflow-hidden flex flex-col h-full self-stretch mt-2">
                        <div className="bg-[#1a2e5e] py-[5px] text-center shrink-0">
                          <p className="text-[7.5px] font-bold text-white uppercase tracking-wider">Udyami Management System</p>
                        </div>
                        <div className="flex-1 grid grid-cols-2 px-3 py-2 gap-x-3 gap-y-1.5 content-evenly">
                          {firstPageUms.map((s) => {
                            const slotId = `ums-${s.key}`;
                            const assigned = wardAssignments[slotId];
                            return (
                              <div key={s.key} className="flex flex-col items-center min-w-0">
                                <p className="text-[6px] font-medium text-[#b5121b] text-center mb-0.5 min-h-[10px] leading-tight truncate w-full">{s.label}</p>
                                <div
                                  onClick={() => wardSlotClick(slotId, s.label)}
                                  className={`group relative w-[104px] h-[104px] bg-white border-[3px] rounded-xl flex flex-col items-center justify-center gap-0.5 px-1 overflow-hidden cursor-pointer shrink-0 ${!isPreviewMode ? "cursor-pointer group" : "cursor-default"}`}
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

              {/* ══════ PRODUCT PAGES FOR WARD ══════ */}
              {(productPages.length > 0 ? productPages : [activeBrandCategories]).map((pageCats, pageIdx) => (
                <ChartPreviewFrame
                  key={`products-page-${w.id || wardIdx}-${pageIdx}`}
                  pageLabel={`${wardHeaderPrefix}Products`}
                >
                  <ProductsPage
                    code={currentGCode}
                    wardName={currentWardName}
                    region={currentRegion}
                    categories={pageCats}
                    assignments={wardAssignments}
                    onAssignClick={wardSlotClick}
                    showPlus={!isPreviewMode}
                    isSuperAdmin={isSuperAdmin}
                  />
                </ChartPreviewFrame>
              ))}
            </React.Fragment>
          );
        })}
      </div>

      {/* Floating download button so it stays reachable while scrolling a long preview */}
      {isPreviewMode && (
        <button
          onClick={handleDownloadPdf}
          disabled={isPdfGenerating || isBusy}
          title={isBusy ? "Waiting for ward and member data to finish loading" : "Download this Print Preview as PDF"}
          className="no-print fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold px-5 py-3 rounded-full shadow-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Download size={15} />
          {isPdfGenerating ? "Generating…" : isBusy ? "Loading data…" : "Download PDF"}
        </button>
      )}

      {/* ── All Assignments Table ── */}
      <AllAssignmentsTable rows={rows} onRemove={handleRemove} />

      {/* ── Modals ── */}
      {modal && (
        <AssignPositionModal
          position={modal.label}
          slotId={modal.slotId}
          wardName={ward.ward_name}
          talukaId={ward.talukaId || ward.taluka_id}
          districtId={ward.districtId || ward.district_id}
          role={user?.role}
          constituency={ward.constituency}
          hideWardFilter={isWardLevelSlot(modal.slotId)}
          onClose={() => setModal(null)}
          onAssign={(data) => handleAssign({ ...data, slotLabel: modal.label })}
        />
      )}

      {selectedPosition && (
        <PositionDetailsModal
          open={!!selectedPosition}
          position={selectedPosition}
          onClose={() => setSelectedPosition(null)}
          onReassign={(slotId, role) => {
            setSelectedPosition(null);
            if (isUcnSidePanelSlot(slotId)) {
              setSidePanelSlot({ slotId, label: role, panelType: "ucn" });
            } else if (isUmsSidePanelSlot(slotId)) {
              setSidePanelSlot({ slotId, label: role, panelType: "ums" });
            } else if (isChannelPartnerSlot(slotId)) {
              setSidePanelSlot({ slotId, label: role, panelType: "channelPartner" });
            } else if (isPatronSlot(slotId)) {
              setSidePanelSlot({ slotId, label: role, panelType: "patron" });
            } else {
              setModal({ slotId, label: role });
            }
          }}
        />
      )}

      <UcnMembersSidePanel
        open={Boolean(sidePanelSlot)}
        onClose={() => setSidePanelSlot(null)}
        slotId={sidePanelSlot?.slotId}
        slotLabel={sidePanelSlot?.label}
        wardName={ward.ward_name}
        talukaId={ward.talukaId || ward.taluka_id || ward.taluka?.talukaId}
        districtId={ward.districtId || ward.district_id || ward.district?.districtId}
        role={user?.role}
        ucnMembers={ucnMembers}
        channelPartners={channelPartners}
        patrons={patrons}
        umsMembers={umsMembers}
        panelType={sidePanelSlot?.panelType || "ucn"}
        hideWardFilter={isWardLevelSlot(sidePanelSlot?.slotId)}
        onSearchBusiness={(businessName) => dispatch(fetchChannelPartners({ wardId: ward.id, businessName }))}
        onAssignMember={handleAssignMemberFromPanel}
      />

      {showInvite && (
        <InviteMemberModal ward={ward} onClose={() => setShowInvite(false)} />
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

            let wardHeadId;
            try {
              wardHeadId = getEffectiveWardHeadId(user, ward, wardChairmenList);
            } catch (err) {
              setErrorModalData({ message: err.message });
              return;
            }

            const formData = new FormData();
            formData.append("data", JSON.stringify({
              wardHeadId,
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
            dispatch(createWardChartData(formData))
              .unwrap()
              .then(() => {
                // This save is common-page (applyToAllWards/isCommonPage),
                // so the officials/patrons slot counts were just synced
                // to every other ward in the taluka too. Invalidate the
                // taluka-wide cache first, then refresh this ward's own data
                // and the roster, so sibling wards opened afterwards fetch
                // the new counts instead of the pre-save snapshot.
                dispatch(invalidateTalukaWardChartCache());
                if (targetUserId && ward.id) {
                  dispatch(getWardChartData({ userId: targetUserId, wardId: ward.id }));
                }
                if (talukaId) dispatch(getAllWardChaimansBy(talukaId));
              })
              .catch((err) => setErrorModalData(err));
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
              Creating your PDF - this takes a few seconds…
            </p>
          </div>
        </div>
      )}
      {/* ── API Error Response Modal Popup (Only for errors) ── */}
      {activeError && (
        <ErrorModal
          isOpen={!!activeError}
          error={activeError}
          onClose={() => {
            setErrorModalData(null);
            dispatch(clearAreaChartError());
          }}
        />
      )}
    </div>
  );
}