/**
 * mapApiToAssignments
 * ─────────────────────────────────────────────────────────────────
 * Converts the GET /ward-chart/getWardChartData response into the
 * `assignments` shape used throughout WardChartDetail and PDF components.
 *
 * Actual API response shape:
 * {
 *   success: true,
 *   data: {
 *     wardChartId: "...",
 *     wardHeadId: "...",
 *     ward: "...",
 *     members: {
 *       MLA:        [ { memberId, name, mobileNumber, email, companyName, profileImage, isActive } ],
 *       Official:   [ ...same shape, order = official-1, official-2, … ],
 *       Patron:     [ … ],
 *       Chairman:   [ … ],
 *       Advisory:   [ … ],
 *       Mentor:     [ … ],
 *       WardChairman: [ … ],
 *       CoreTeam:   [ { …, coreRole: "President" | "Vice-President" | … } ],
 *       Sector:     [ { …, sectorKey: "msme" | "reality" | … } ],
 *       UMS:        [ { …, umsKey: "ai" | "comms" | … } ],
 *       Member:     [ … ]   ← generic, no fixed slot; skipped
 *     }
 *   }
 * }
 *
 * Key rule: members is a plain object keyed by userType, each value is
 * an array. Position within the array (0-based index) maps to slot number.
 * ─────────────────────────────────────────────────────────────────
 */

const CORE_ROLE_TO_SLOT = {
  "President": "core-president",
  "Vice-President": "core-vice-president",
  "General Secretary": "core-general-secretary",
  "Treasurer": "core-treasurer",
};

/** Converts one API member object → the UI assignment shape */
function toAssignment(member) {
  return {
    name: member.name || "",
    company: member.companyName || member.company || "",
    photoUrl: member.profileImage || member.photoUrl || null,
    mobileNumber: member.mobileNumber || "",
    email: member.email || "",
    memberId: member.memberId || null,
    location: member.location || null,
    district: member.district || null,
    state: member.state || null,
    reportsTo: member.reportsTo || null,
    directReports: member.directReports || null,
    membershipType: member.membershipType || null,
    joinedDate: member.joinedDate || null,
    assignedDate: member.assignedDate || null,
    status: member.isActive === false ? "inactive" : (member.status || "registered"),
    slotLabel: member.slotLabel || null,
  };
}

export function mapApiToAssignments(apiResponse) {
  // members is an object: { MLA: [...], Official: [...], ... }
  const members = apiResponse?.data?.members;

  if (!members || typeof members !== "object" || Array.isArray(members)) {
    return {};
  }

  const assignments = {};

  // ── MLA — always index 0 ──────────────────────────────────────
  if (Array.isArray(members.MLA)) {
    members.MLA.forEach((m, i) => {
      if (m?.name) assignments["mla"] = { ...toAssignment(m), slotLabel: "MLA" };
    });
  }

  // ── WardChairman ─────────────────────────────────────────────
  if (Array.isArray(members.WardChairman)) {
    members.WardChairman.forEach((m) => {
      if (m?.name) assignments["ward-chairman"] = { ...toAssignment(m), slotLabel: "Ward Chairman" };
    });
  }

  // ── Officials — index → official-1, official-2, … ────────────
  if (Array.isArray(members.Official)) {
    members.Official.forEach((m, i) => {
      const slotId = m?.slotId || `official-${i + 1}`;
      if (m?.name) {
        assignments[slotId] = {
          ...toAssignment(m),
          slotLabel: m.slotLabel || `Official ${slotId.split("-")[1]}`
        };
      }
    });
  }

  // ── Patrons ───────────────────────────────────────────────────
  if (Array.isArray(members.Patron)) {
    members.Patron.forEach((m, i) => {
      const slotId = m?.slotId || `patron-${i + 1}`;
      if (m?.name) {
        assignments[slotId] = {
          ...toAssignment(m),
          slotLabel: m.slotLabel || `Patron ${slotId.split("-")[1]}`
        };
      }
    });
  }


  // ── Chairmen ──────────────────────────────────────────────────
  if (Array.isArray(members.Chairman)) {
    members.Chairman.forEach((m, i) => {
      const slotId = m?.slotId || `chairman-${i + 1}`;
      if (m?.name) {
        assignments[slotId] = {
          ...toAssignment(m),
          slotLabel: m.slotLabel || `Chairman ${slotId.split("-")[1]}`
        };
      }
    });
  }

  // ── Advisory ─────────────────────────────────────────────────
  if (Array.isArray(members.Advisory)) {
    members.Advisory.forEach((m, i) => {
      const slotId = m?.slotId || `advisory-${i + 1}`;
      if (m?.name) {
        assignments[slotId] = {
          ...toAssignment(m),
          slotLabel: m.slotLabel || `Advisory ${slotId.split("-")[1]}`
        };
      }
    });
  }

  // ── Mentor ───────────────────────────────────────────────────
  if (Array.isArray(members.Mentor)) {
    members.Mentor.forEach((m) => {
      const slotId = m?.slotId || `mentor-${members.Mentor.indexOf(m) + 1}`;
      if (m?.name) {
        assignments[slotId] = {
          ...toAssignment(m),
          slotLabel: m.slotLabel || `Mentor ${slotId.split("-")[1]}`
        };
      }
    });
  }

  // ── CoreTeam — uses coreRole field to pick the right slot ────
  if (Array.isArray(members.CoreTeam)) {
    members.CoreTeam.forEach((m) => {
      let slotId = null;
      if (m?.slotId) {
        slotId = m.slotId;                       // "core-president" directly
      } else if (m?.coreRole) {
        slotId = CORE_ROLE_TO_SLOT[m.coreRole];  // coreRole map fallback
      }
      if (slotId && m?.name) {
        assignments[slotId] = {
          ...toAssignment(m),
          slotLabel: m.coreRole || slotId
        };
      }
    });
  }
  
  // ── Member — product slots (product-ub-queens-*, etc.) ───────
  if (Array.isArray(members.Member)) {
    members.Member.forEach((m) => {
      if (m?.slotId && m?.name) {
        assignments[m.slotId] = {
          ...toAssignment(m),
          slotLabel: m.slotLabel || m.slotId,
        };
      }
    });
  }

  // ── Sector — uses sectorKey field ────────────────────────────
  if (Array.isArray(members.Sector)) {
    members.Sector.forEach((m) => {
      // slotId → "sector-reality", sectorKey → "reality", both handle
      let slotId = null;

      if (m?.slotId) {
        // Backend returns full slotId directly
        slotId = m.slotId;                        // "sector-reality"
      } else if (m?.sectorKey) {
        slotId = `sector-${m.sectorKey}`;         // "sector-reality"
      } else if (m?.slotLabel) {
        slotId = `sector-${m.slotLabel}`;         // fallback
      }

      if (slotId && m?.name) {
        assignments[slotId] = {
          ...toAssignment(m),
          slotLabel: m.sectorKey || m.slotLabel || slotId,
        };
      }
    });
  }

  // ── UMS — uses umsKey field ───────────────────────────────────
  if (Array.isArray(members.UMS)) {
    members.UMS.forEach((m) => {
      let slotId = null;

      if (m?.slotId) {
        slotId = m.slotId;
      } else if (m?.umsKey) {
        slotId = `ums-${m.umsKey}`;
      } else if (m?.slotLabel) {
        slotId = `ums-${m.slotLabel}`;
      }

      if (slotId && m?.name) {
        assignments[slotId] = {
          ...toAssignment(m),
          slotLabel: m.umsKey || m.slotLabel || slotId,
        };
      }
    });
  }

  // ── Member — generic type, no fixed PDF slot; skip ───────────
  // (these appear in AllAssignmentsTable only if you choose to include them)

  return assignments;
}