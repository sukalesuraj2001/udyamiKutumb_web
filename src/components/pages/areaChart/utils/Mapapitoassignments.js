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

function extractPhotoUrl(val) {
  if (!val) return null;
  if (typeof val === "string" && val.trim()) return val;
  if (typeof val === "object") {
    if (typeof val.image === "string" && val.image.trim()) return val.image;
    if (typeof val.url === "string" && val.url.trim()) return val.url;
  }
  return null;
}

/** Converts one API member object → the UI assignment shape */
function toAssignment(member) {
  const photo =
    extractPhotoUrl(member.profileImage) ||
    extractPhotoUrl(member.photoUrl) ||
    extractPhotoUrl(member.profile?.profileImage) ||
    extractPhotoUrl(member.profile?.businessDetails?.businessImage1) ||
    null;

  return {
    name: member.name || "",
    company: member.companyName || member.company || "",
    photoUrl: photo,
    mobileNumber: member.mobileNumber || "",
    email: member.email || "",
    memberId: member.memberId || member.userId || null,
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

  // ── HeroImage — cover page hero photo ────────────────────────
  if (Array.isArray(members.HeroImage)) {
    members.HeroImage.forEach((m) => {
      if (m?.profileImage || m?.photoUrl) {
        assignments["hero-image"] = {
          ...toAssignment(m),
          slotLabel: "Cover Hero Image",
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

/**
 * mergeTalukaChairmenIntoAssignments
 * Merges WardChairman objects from getAllWardChaimansBy response
 * into slots chairman-1, chairman-2, ..., chairman-N for Page 2 display.
 */
export function mergeTalukaChairmenIntoAssignments(assignments, wardChairmenList, constituencyWards, gCode) {
  if (!Array.isArray(wardChairmenList) || wardChairmenList.length === 0) {
    return assignments || {};
  }

  const merged = { ...(assignments || {}) };
  const targetWards = (Array.isArray(constituencyWards) && constituencyWards.length > 0)
    ? constituencyWards
    : wardChairmenList;

  targetWards.forEach((constituencyWard, index) => {
    const slotId = `chairman-${index + 1}`;

    const wardId = constituencyWard?.id || constituencyWard?.wardId;
    const wardNumber = constituencyWard?.ward_number || constituencyWard?.wardNumber;
    const wardName = constituencyWard?.ward_name || constituencyWard?.wardName;

    const matchedApiWard = wardChairmenList.find(
      (item) =>
        (wardId && item.wardId === wardId) ||
        (wardNumber && item.wardNumber === wardNumber) ||
        (wardName && item.wardName === wardName)
    ) || wardChairmenList[index];

    if (matchedApiWard && matchedApiWard.wardChart) {
      const chartMembers = matchedApiWard.wardChart.members || [];
      const chairmanMember = chartMembers.find(
        (m) => m?.userType === "WardChairman" || m?.slotId === "ward-chairman"
      ) || chartMembers[0];

      if (chairmanMember && (chairmanMember.name || chairmanMember.memberName)) {
        const photo =
          chairmanMember.profileImage ||
          chairmanMember.photoUrl ||
          chairmanMember.profile?.profileImage ||
          null;

        merged[slotId] = {
          name: chairmanMember.name || chairmanMember.memberName || "",
          company: chairmanMember.companyName || chairmanMember.company || "",
          photoUrl: (typeof photo === "string" && photo.trim()) ? photo : null,
          mobileNumber: chairmanMember.mobileNumber || "",
          email: chairmanMember.email || "",
          memberId: chairmanMember.memberId || chairmanMember.userId || null,
          status: chairmanMember.isActive === false ? "inactive" : (chairmanMember.status || "registered"),
          slotLabel: `${wardNumber || `${gCode}.${index + 1}`} Chairman`,
        };
      } else if (matchedApiWard.wardChart.wardHead) {
        const head = matchedApiWard.wardChart.wardHead;
        if (head.firstName || head.name) {
          merged[slotId] = {
            name: head.firstName || head.name || "",
            company: "",
            photoUrl: null,
            mobileNumber: head.mobileNumber || "",
            email: head.email || "",
            memberId: head.userId || null,
            status: "registered",
            slotLabel: `${wardNumber || `${gCode}.${index + 1}`} Chairman`,
          };
        }
      }
    }
  });

  return merged;
}

/**
 * mergePatronsIntoAssignments
 * Merges assigned patrons from all ward charts in the taluka (wardChairmenList)
 * into assignments state for patron-1 .. patron-10 slots.
 * Patrons assigned in any ward in the taluka show across all 10 wards.
 */
export function mergePatronsIntoAssignments(assignments, wardChairmenList) {
  const merged = { ...(assignments || {}) };

  if (!Array.isArray(wardChairmenList) || wardChairmenList.length === 0) {
    return merged;
  }

  wardChairmenList.forEach((wardItem) => {
    const chartMembers = wardItem?.wardChart?.members || [];
    chartMembers.forEach((m) => {
      if (!m) return;
      const isPatronMember = m.userType === "Patron" || (m.slotId && m.slotId.startsWith("patron-"));
      if (!isPatronMember) return;

      const slotId = m.slotId || "patron-1";

      if (!merged[slotId] || !merged[slotId].name) {
        const photo =
          extractPhotoUrl(m.profileImage) ||
          extractPhotoUrl(m.photoUrl) ||
          extractPhotoUrl(m.profile?.profileImage) ||
          extractPhotoUrl(m.profile?.photoUrl) ||
          extractPhotoUrl(m.profile?.businessDetails?.businessImage1) ||
          null;

        merged[slotId] = {
          name: m.name || m.memberName || "",
          company: m.companyName || m.company || "",
          photoUrl: (typeof photo === "string" && photo.trim()) ? photo : null,
          mobileNumber: m.mobileNumber || "",
          email: m.email || "",
          memberId: m.memberId || m.userId || null,
          status: m.isActive === false ? "inactive" : (m.status || "registered"),
          slotLabel: m.slotLabel || `Patron ${slotId.split("-")[1] || 1}`,
          positionName: m.positionName || null,
        };
      }
    });
  });

  return merged;
}

const UCN_ASSIGNMENT_TYPE_TO_SLOT = {
  "circle_leader": "core-president",
  "circle-leader": "core-president",
  "president": "core-president",
  "vice_president": "core-vice-president",
  "vice-president": "core-vice-president",
  "general_secretary": "core-general-secretary",
  "general-secretary": "core-general-secretary",
  "treasurer": "core-treasurer",
  "ward_chairman": "ward-chairman",
  "ward-chairman": "ward-chairman",
};

const UMS_KEYS = [
  "ai", "comms", "digital", "ground", "circle",
  "directory", "hall", "finance2", "kutumba", "arbitration"
];

/**
 * mergeUcnMembersIntoAssignments
 * Merges member array from GET /auth/ucn-members/:wardId API
 * into assignments state for President, VP, GS, Treasurer, UMS, and other roles.
 */
export function mergeUcnMembersIntoAssignments(assignments, ucnMembersList) {
  if (!Array.isArray(ucnMembersList) || ucnMembersList.length === 0) {
    return assignments || {};
  }

  const merged = { ...(assignments || {}) };

  ucnMembersList.forEach((member, index) => {
    if (!member) return;

    const assignmentType = (member.assignmentType || "").toLowerCase();
    let slotId = member.slotId || null;

    if (!slotId) {
      if (UCN_ASSIGNMENT_TYPE_TO_SLOT[assignmentType]) {
        slotId = UCN_ASSIGNMENT_TYPE_TO_SLOT[assignmentType];
      } else if (assignmentType.startsWith("ums_") || assignmentType.startsWith("ums-")) {
        slotId = `ums-${assignmentType.replace(/^ums[_-]/, "")}`;
      } else if (member.umsKey) {
        slotId = `ums-${member.umsKey}`;
      } else if (UMS_KEYS.includes(assignmentType)) {
        slotId = `ums-${assignmentType}`;
      } else if (member.sectorKey || assignmentType.startsWith("sector_") || assignmentType.startsWith("sector-")) {
        const sec = member.sectorKey || assignmentType.replace(/^sector[_-]/, "");
        slotId = `sector-${sec}`;
      } else if (assignmentType === "advisory") {
        slotId = `advisory-${index + 1}`;
      } else if (assignmentType === "mentor") {
        slotId = `mentor-${index + 1}`;
      }
    }

    if (slotId && (member.name || member.userId)) {
      const photo =
        extractPhotoUrl(member.profileImage) ||
        extractPhotoUrl(member.photoUrl) ||
        extractPhotoUrl(member.profile?.profileImage) ||
        null;

      merged[slotId] = {
        name: member.name || member.assignedUserName || "",
        company: member.companyName || member.company || "",
        photoUrl: photo,
        mobileNumber: member.mobileNumber || "",
        email: member.email || "",
        memberId: member.userId || member.memberId || null,
        location: member.location || member.positionName || null,
        district: member.districtId || member.district || null,
        state: member.state || null,
        status: member.positionIsActive === false ? "inactive" : (member.status || "registered"),
        slotLabel: member.positionName || member.slotLabel || slotId,
        positionName: member.positionName || null,
        positionDescription: member.positionDescription || null,
        assignedUserName: member.assignedUserName || null,
        fromDate: member.fromDate || null,
        assignmentType: member.assignmentType || null,
      };
    }
  });

  return merged;
}