import React, { useMemo, useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { UserPlus, SlidersHorizontal, Printer, Download, Pencil, FileCheck2 } from "lucide-react";
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
import { deleteWardChartMember, selectWardInfo } from "../../redux/slices/Areachartslice.js";
import {
  createWardChartData,
  getWardChartData,
  selectAreaChartStatus,
  selectAreaChartError,
  selectFetchStatus,
  selectFetchedData,
} from "../../redux/slices/Areachartslice.js";
import { mapApiToAssignments } from "./utils/Mapapitoassignments.js";

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
    chairmenPage2: 10,
    chairmenPage3: 13,
    advisories: 3,
    mentors: 3,
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

function buildSingleMemberPayload(ward, user, slotId, assignmentData) {
  return {
    wardHeadId: user?.userId || "",
    ward: ward.ward_name || ward.ward_number || "",
    members: [
      {
        userType: userTypeFromSlotId(slotId),
        slotId,
        name: assignmentData.name || "",
        mobileNumber: assignmentData.mobileNumber || "",
        email: assignmentData.email || "",
        companyName: assignmentData.company || "",
        profileImage: assignmentData.photoUrl || "",
        status: assignmentData.status || "registered",
        slotLabel: assignmentData.slotLabel || slotId,
      },
    ],
  };
}

function PageFooter({ num }) {
  return (
    <div className="bg-ink h-[28px] flex items-center px-3 shrink-0">
      <span className="w-[22px] h-[22px] rounded-full border-2 border-white text-white text-[8px] font-bold flex items-center justify-center tabular-nums">
        {String(num).padStart(2, "0")}
      </span>
    </div>
  );
}

function ChartPage({ pageLabel, pageNum, ward, children }) {
  return (
    <ChartPreviewFrame pageLabel={pageLabel}>
      <div className="flex flex-col min-h-full bg-white">
        <ChartHeaderBanner
          code={ward.g_code || ward.ward_number}
          wardName={ward.ward_name}
          region={ward.region || ward.district || ward.constituency}
        />
        <div className="flex-1 overflow-hidden">{children}</div>
        <PageFooter num={pageNum} />
      </div>
    </ChartPreviewFrame>
  );
}

// ── PdfSlot: showPlus controls plus icon; onAssignClick always wired ──
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

  const handleRemove = (row) => {
    console.log("ward:", ward);
    if (!row.memberId) {
      console.warn("memberId இல்லை:", row);
      return;
    }
    dispatch(deleteWardChartMember(row.memberId))
      .unwrap()
      .then(() => {
        const wardParam = ward.ward_name || ward.ward_number;
        console.log("re-fetch ward:", wardParam);
        dispatch(getWardChartData({ userId: user?.userId, wardId: ward.id }));
      })
      .catch((err) => console.error("Delete failed:", err));
  };

  const isWardChairman = user?.role === "WardChairman";
  const isSuperAdmin = user?.role === "SuperAdmin";

  const [assignments, setAssignments] = useState({});
  const [tab, setTab] = useState(user?.role === "WardChairman" ? "build" : "preview");
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [showCustomize, setShowCustomize] = useState(false);
  const [modal, setModal] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [search] = useState("");
  const [sectionFilter] = useState("all");

  // ── Preview mode flag ─────────────────────────────────────────
  // true  → print preview tab: no assign modal, no plus icon
  // false → build tab: full assign interaction
  const isPreviewMode = tab === "preview";

  useEffect(() => {
    if (user?.userId && ward.id) {
      dispatch(getWardChartData({ userId: user.userId, wardId: ward.id }));
    }
  }, []);

  useEffect(() => {
    if (fetchStatus === "succeeded" && fetchedData) {
      const mapped = mapApiToAssignments(fetchedData);
      setAssignments(mapped);
    }
  }, [fetchStatus, fetchedData]);

  // ── Assign handler ────────────────────────────────────────────
  const handleAssign = (data) => {
    const slotId = modal.slotId;
    const photoFile = data.photoFile;
    const photoUrl = data.photoUrl;   
    setModal(null);

    const { photoFile: _f, photoUrl: _u, ...restData } = data;

    const payload = buildSingleMemberPayload(ward, user, slotId, {
      ...restData,
      photoUrl,
      slotLabel: modal.label,
    });

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        wardHeadId: payload.wardHeadId,
        wardId: ward.id,
        ward: payload.ward,
        members: payload.members.map(({ profileImage, ...m }) => ({
          ...m,
          ...(photoFile ? {} : { profileImage: profileImage || "" }),
        })),
      })
    );

    if (photoFile) {
      formData.append("profileImages", photoFile);
    }

    dispatch(createWardChartData(formData));
  };

  // ── Open details modal (shared helper) ───────────────────────
  const openDetails = (id, label) => {
    const a = assignments[id];
    setSelectedPosition({
      slotId: id,
      role: label,
      memberName: a?.name || null,
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
      status: a?.status || null,
      profileImage: a?.photoUrl || a?.profileImage || null,
    });
  };

  // ── Slot click handler ────────────────────────────────────────
  // Preview mode → show details only if slot is already assigned
  // Build mode   → WardChairman opens assign modal; others see details
  const handleSlotClick = (id, label) => {
    const a = assignments[id];
    if (isPreviewMode) {
      if (a?.name) openDetails(id, label);
      return;
    }
    if (isWardChairman) {
      setModal({ slotId: id, label });
    } else {
      if (a?.name) openDetails(id, label);
    }
  };

  // Always pass the handler — ChartSlot uses showPlus prop separately
  const slotClickProp = handleSlotClick;

  const isDimmed = (slotId, section, name) => {
    if (sectionFilter !== "all" && sectionFilter !== section) return true;
    if (search.trim() && !(name || "").toLowerCase().includes(search.trim().toLowerCase()))
      return true;
    return false;
  };

  const activeSectors = config.sectors.filter((s) => s.enabled);
  const activeUms = config.umsRoles.filter((s) => s.enabled);
  const activeBrandCategories = useMemo(
    () =>
      config.brandTiles
        .map((cat) => ({ ...cat, products: cat.products.filter((p) => p.enabled) }))
        .filter((cat) => cat.products.length > 0),
    [config.brandTiles]
  );

  const rows = useMemo(
    () =>
      Object.entries(assignments).map(([slotId, a]) => ({
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
    [assignments]
  );

  const gCode = ward.g_code || ward.ward_number;

  const chairmenP2 = Array.from({ length: config.slotCounts.chairmenPage2 }, (_, i) => i);
  const chairmenP3 = Array.from(
    { length: config.slotCounts.chairmenPage3 },
    (_, i) => i + config.slotCounts.chairmenPage2
  );

  const firstRow = chairmenP3.slice(0, 5);
  const secondRow = chairmenP3.slice(5, 10);
  const thirdRow = chairmenP3.slice(10);

  const isBusy = apiStatus === "loading" || fetchStatus === "loading";

  return (
    <div className="space-y-5 bg-[#f4f5f7] -m-6 p-6 min-h-full">

      {/* ── Admin Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-[12.5px] text-gray-500 hover:text-gray-900 mb-1 transition-colors"
          >
            ← Back to Area Chart Builder
          </button>
          <h1 className="text-[20px] font-bold text-gray-900 leading-tight tracking-tight">
            Area Chart Builder
          </h1>
        </div>
        <div className="flex items-center gap-2 text-[12.5px] text-gray-500">
          <span className="font-medium text-gray-900">All Constituencies</span>
          <span>·</span>
          <span className="font-medium text-gray-900">
            {ward.ward_number} - {ward.ward_name}
          </span>
        </div>
      </div>

      {/* ── API status feedback ── */}
      {isWardChairman && isBusy && (
        <p className="text-[12px] text-blue-600 font-medium">Saving chart…</p>
      )}
      {isWardChairman && apiStatus === "succeeded" && fetchStatus === "succeeded" && (
        <p className="text-[12px] text-green-600 font-medium">Chart saved successfully.</p>
      )}
      {isWardChairman && apiStatus === "failed" && apiError && (
        <p className="text-[12px] text-red-600 font-medium">Save failed: {apiError}</p>
      )}

      {/* ── Action Buttons ── */}
      <div className="flex flex-wrap gap-2">
        {isWardChairman && (
          <>
            <button
              onClick={() => setModal({ slotId: `extra-${Date.now()}`, label: "Member" })}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[12.5px] font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <UserPlus size={14} /> Invite Member
            </button>
            <button
              onClick={() => setShowCustomize(true)}
              className="flex items-center gap-2 bg-white border border-gray-200 text-[12.5px] font-medium text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <SlidersHorizontal size={14} /> Customize Layout
            </button>
          </>
        )}
        <button className="flex items-center gap-2 bg-white border border-gray-200 text-[12.5px] font-medium text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          <Printer size={14} /> Print Chart
        </button>
        <button className="flex items-center gap-2 bg-white border border-gray-200 text-[12.5px] font-medium text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          <Download size={14} /> Download PDF
        </button>
      </div>

      {/* ── Build / Preview Tabs ── */}
      {isWardChairman && (
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
          {[
            { id: "build", icon: Pencil, label: "Build Chart" },
            { id: "preview", icon: FileCheck2, label: "Print Preview" },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-[12.5px] font-semibold transition-colors ${tab === id ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-900"
                }`}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          PAGE 1 — COVER
      ══════════════════════════════════════════════ */}
      <ChartPreviewFrame pageLabel="Page 1 — Cover">
        <CoverPage code={wardInfo?.wardNumber ?? ""}
          regionName={wardInfo?.wardName ?? ""} wardNumber={ward.ward_number} wardName={ward.ward_name} />
      </ChartPreviewFrame>

      {/* ══════════════════════════════════════════════
          PAGE 2 — MLA + Officials + Patrons + First 10 Chairmen
      ══════════════════════════════════════════════ */}
      <ChartPage pageLabel="Page 2 — MLA · Patrons · Chairmen (1–10)" pageNum={2} ward={ward}>
        <div className="px-[3%] py-[2%] space-y-[2%]">
          <div className="flex justify-center pt-[1%]">
            <MlaCard
              mlaLabel={`MLA - ${ward.ward_name} Assembly constituency`}
              assigned={assignments.mla}
              dimmed={isDimmed("mla", "core", assignments.mla?.name)}
              onAssignClick={slotClickProp}
              showPlus={!isPreviewMode}
              isSuperAdmin={isSuperAdmin}
            />
          </div>

          <div className="relative">
            <div className="absolute left-1/2 -translate-x-1/2 -top-[2%] w-px h-[2%] bg-ink/40" />
            <div className="absolute left-[10%] right-[10%] top-0 h-px bg-ink/40" />
            <div className="grid grid-cols-4 gap-4 pt-2">
              {Array.from({ length: 4 }).map((_, i) => {
                const slotId = `official-${i + 1}`;
                return (
                  <div key={slotId} className="flex flex-col items-center">
                    <div className="w-px h-3 bg-ink/40 mb-1" />
                    <PdfSlot
                      slotId={slotId}
                      topLabel={`Official ${i + 1}`}
                      tone="navy"
                      assigned={assignments[slotId]}
                      dimmed={isDimmed(slotId, "core", assignments[slotId]?.name)}
                      onAssignClick={slotClickProp}
                      showPlus={!isPreviewMode}
                      isSuperAdmin={isSuperAdmin}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative flex justify-center items-center py-2">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#1a2e5e]" />
            <div className="relative z-10">
              <div className="relative bg-[#b5121b] text-white text-[13px] font-bold uppercase px-10 py-[6px] w-[210px] text-center rounded-t-sm rounded-b-xl">
                UDYAMI PATRON
              </div>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4">
            {Array.from({ length: config.slotCounts.patrons }).map((_, i) => {
              const slotId = `patron-${i + 1}`;
              return (
                <PdfSlot
                  key={slotId}
                  slotId={slotId}
                  // topLabel="NAME"
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

          <div className="border-t border-ink/20" />

          <div className="grid grid-cols-5 gap-4">
            {chairmenP2.map((i) => {
              const slotId = `chairman-${i + 1}`;
              const label = `${gCode}.${i + 1} Chairman`;
              return (
                <div key={slotId}>
                  <p className="text-[9px] font-bold text-brick text-center mb-1 uppercase">
                    {label}
                  </p>
                  <PdfSlot
                    slotId={slotId}
                    // topLabel="NAME"
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

      {/* ══════════════════════════════════════════════
          PAGE 3 — Chairmen continued (11–23)
      ══════════════════════════════════════════════ */}
      <ChartPage pageLabel="Page 3 — Chairmen (11–23)" pageNum={2} ward={ward}>
        <div className="flex-1 h-full px-[3%] py-[2%]">
          <div className="space-y-6">
            {[firstRow, secondRow].map((row, ri) => (
              <div key={ri} className="grid grid-cols-5 gap-5">
                {row.map((i) => {
                  const slotId = `chairman-${i + 1}`;
                  const label = `${gCode}.${i + 1} Chairman`;
                  return (
                    <div key={slotId}>
                      <p className="text-[9px] font-bold text-brick text-center mb-1 uppercase">
                        {label}
                      </p>
                      <PdfSlot
                        slotId={slotId}
                        // topLabel="NAME"
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

            <div className="flex justify-center gap-5">
              {thirdRow.map((i) => {
                const slotId = `chairman-${i + 1}`;
                const label = `${gCode}.${i + 1} Chairman`;
                return (
                  <div key={slotId}>
                    <p className="text-[9px] font-bold text-brick text-center mb-1 uppercase">
                      {label}
                    </p>
                    <PdfSlot
                      slotId={slotId}
                      // topLabel="NAME"
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
        </div>
      </ChartPage>

      {/* ══════════════════════════════════════════════
          PAGE 4 — Advisory/Mentor + Leadership + Sectors/UMS
      ══════════════════════════════════════════════ */}
      <ChartPage pageLabel="Page 4 — Advisory · Leadership · Sectors · UMS" pageNum={2} ward={ward}>
        <div className="flex flex-col min-h-full">

          <div className="flex items-start justify-center gap-3 px-[2%] py-[1.5%] bg-white border-b border-slate-100">
            <div className="flex gap-4">
              {Array.from({ length: config.slotCounts.advisories }).map((_, i) => {
                const slotId = `advisory-${i + 1}`;
                return (
                  <div key={slotId} className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-5 h-5 rounded-full border-2 border-[#c8102e] text-[#c8102e] text-[9px] font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-[11px] font-bold text-[#c8102e]">Advisory</span>
                    </div>
                    <ChartSlot
                      slotId={slotId}
                      label={`${i + 1} Advisory`}
                      tone="navy"
                      variant="default"
                      showPlaceholderName={false}
                      assigned={assignments[slotId]}
                      dimmed={isDimmed(slotId, "advisories", assignments[slotId]?.name)}
                      onAssignClick={slotClickProp}
                      showPlus={!isPreviewMode}
                      isSuperAdmin={isSuperAdmin}
                    />
                  </div>
                );
              })}
            </div>

            <div className="w-px self-stretch bg-slate-300 mx-1" />

            <div className="flex gap-4">
              {Array.from({ length: config.slotCounts.mentors }).map((_, i) => {
                const slotId = `mentor-${i + 1}`;
                return (
                  <div key={slotId} className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-5 h-5 rounded-full border-2 border-ink text-ink text-[9px] font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-[11px] font-bold text-ink">Mentor</span>
                    </div>
                    <ChartSlot
                      slotId={slotId}
                      label={`${i + 1} Mentor`}
                      tone="navy"
                      variant="default"
                      showPlaceholderName={false}
                      assigned={assignments[slotId]}
                      dimmed={isDimmed(slotId, "mentors", assignments[slotId]?.name)}
                      onAssignClick={slotClickProp}
                      showPlus={!isPreviewMode}
                      isSuperAdmin={isSuperAdmin}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-stretch bg-[#1a2e5e]">
            <div className="flex flex-col items-center justify-start shrink-0 w-[180px]">
              <ChairmanHighlightCard
                wardNumber={gCode}
                assigned={assignments["ward-chairman"]}
                dimmed={isDimmed("ward-chairman", "core", assignments["ward-chairman"]?.name)}
                onAssignClick={slotClickProp}
                showPlus={!isPreviewMode}
                isSuperAdmin={isSuperAdmin}
              />
            </div>

            <div className="flex flex-1 justify-evenly items-start">
              {CORE_ROLES.map((role) => {
                const slotId = `core-${role.toLowerCase().replace(/\s+/g, "-")}`;
                return (
                  <div key={slotId} className="flex flex-col items-center w-[105px]">
                    <p className="h-[18px] flex items-center justify-center text-[10px] font-bold text-white text-center mb-3">
                      {role}
                    </p>
                    {/* Core role: always clickable; plus overlay only in build mode */}
                    <div
                      onClick={() => handleSlotClick(slotId, role)}
                      className={`relative w-[90px] h-[90px] rounded-lg border-2 border-[#c8102e] bg-[#d32f2f] flex items-center justify-center overflow-hidden ${!isPreviewMode && !isSuperAdmin ? "cursor-pointer group" : "cursor-default"
                        }`}
                    >
                      {assignments[slotId]?.photoUrl ? (
                        <img
                          src={assignments[slotId].photoUrl}
                          alt={assignments[slotId].name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg
                          viewBox="0 0 64 64"
                          className="w-[85%] h-[85%] text-white"
                          fill="currentColor"
                        >
                          <circle cx="32" cy="22" r="12" />
                          <path d="M8 56 Q8 40 32 40 Q56 40 56 56 Z" />
                        </svg>
                      )}
                      {!isPreviewMode && !isSuperAdmin && (
                        <span className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      )}
                    </div>
                    <p className="mt-2 text-[8px] font-bold text-white uppercase text-center leading-none">
                      {assignments[slotId]?.name || "NAME"}
                    </p>
                    <p className="text-[6px] text-white/60 text-center leading-none mt-1">
                      {assignments[slotId]?.company || "Company Name"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2.5 px-[2%] py-[3%] bg-[#c8102e] flex-1 mt-4">
            <div className="flex-1 flex flex-col gap-2.5 mt-9">
              {Array.from({ length: Math.ceil(activeSectors.length / 3) }).map((_, rowIdx) => {
                const rowSectors = activeSectors.slice(rowIdx * 3, rowIdx * 3 + 3);
                return (
                  <div key={rowIdx} className="flex justify-center gap-6 px-4">
                    {rowSectors.map((s) => {
                      const slotId = `sector-${s.key}`;
                      return (
                        <div key={s.key} className="w-[118px] shrink-0">
                          <SectorCard
                            slotId={slotId}
                            label={s.label}
                            assigned={assignments[slotId]}
                            dimmed={isDimmed(slotId, "sectors", assignments[slotId]?.name)}
                            onAssignClick={slotClickProp}
                            showPlus={!isPreviewMode}
                            isSuperAdmin={isSuperAdmin}
                          />
                        </div>
                      );
                    })}
                    {rowSectors.length < 3 &&
                      Array.from({ length: 3 - rowSectors.length }).map((_, fi) => (
                        <div key={`fill-${fi}`} className="flex-1" />
                      ))}
                  </div>
                );
              })}
            </div>

            {activeUms.length > 0 && (
              <div className="w-[250px] rounded-sm border border-ink shrink-0 bg-white overflow-hidden">
                <div className="bg-[#1a2e5e] py-[5px] text-center">
                  <p className="text-[7px] font-medium text-white">Udyami Management System</p>
                </div>
                <div className="grid grid-cols-2 px-3 pt-3 pb-4 gap-y-7 gap-x-5">
                  {activeUms.map((s) => {
                    const slotId = `ums-${s.key}`;
                    return (
                      <div key={s.key} className="flex flex-col items-center">
                        <p className="text-[6px] font-medium text-[#b5121b] text-center mb-2 min-h-[14px] leading-tight">
                          {s.label}
                        </p>
                        {/* UMS: always clickable; hover only in build mode */}
                        <div
                          onClick={() => handleSlotClick(slotId, s.label)}
                          className={`relative w-full aspect-[3/2] border border-[#c8102e] rounded-sm bg-[#d0d0d8] overflow-hidden flex items-center justify-center ${!isPreviewMode ? "cursor-pointer group" : "cursor-default"
                            }`}
                        >
                          {assignments[slotId]?.photoUrl && (
                            <img
                              src={assignments[slotId].photoUrl}
                              alt={assignments[slotId].name}
                              className="w-full h-full object-cover"
                            />
                          )}
                          {!isPreviewMode && !isSuperAdmin && (
                            <span className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
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
      </ChartPage>

      {/* ══════════════════════════════════════════════
          PAGE 5 — Products
      ══════════════════════════════════════════════ */}
      <ChartPreviewFrame pageLabel="Page 5 — Products">
        <ProductsPage
          code={gCode}
          wardName={ward.ward_name}
          region={ward.region || ward.district || ward.constituency}
          categories={activeBrandCategories}
          assignments={assignments}
          onAssignClick={slotClickProp}
          showPlus={!isPreviewMode}
          isSuperAdmin={isSuperAdmin}
        />
      </ChartPreviewFrame>

      {/* ── All Assignments Table ── */}
      <AllAssignmentsTable rows={rows} onRemove={handleRemove} />

      {/* ── Modals ── */}
      {modal && (
        <AssignPositionModal
          position={modal.label}
          wardName={ward.ward_name}
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
          onSave={(next) => {
            setConfig(next);
            setShowCustomize(false);
          }}
        />
      )}
    </div>
  );
}