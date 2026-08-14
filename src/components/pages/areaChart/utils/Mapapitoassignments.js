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
  const members = apiResponse?.data?.members || apiResponse?.data?.wardChart?.members || apiResponse?.members || apiResponse?.data;

  if (!members) {
    return {};
  }

  const assignments = {};

  // If members is a flat array
  if (Array.isArray(members)) {
    members.forEach((m) => {
      if (!m) return;
      const userType = (m.userType || "").toLowerCase();
      let slotId = m.slotId || null;

      if (!slotId) {
        if (m.umsKey) slotId = `ums-${m.umsKey}`;
        else if (m.sectorKey) slotId = `sector-${m.sectorKey}`;
        else if (userType === "mla") slotId = "mla";
        else if (userType === "wardchairman") slotId = "ward-chairman";
      }

      const name = m.name || m.memberName || m.assignedUserName || m.holder?.user?.name || "";

      if (slotId && name) {
        assignments[slotId] = {
          ...toAssignment(m),
          name,
          slotLabel: m.slotLabel || m.umsKey || m.sectorKey || slotId,
        };
      }
    });
    return assignments;
  }

  if (typeof members !== "object") {
    return {};
  }

  // ── MLA — always index 0 ──────────────────────────────────────
  if (Array.isArray(members.MLA || members.Mla || members.mla)) {
    (members.MLA || members.Mla || members.mla).forEach((m) => {
      if (m?.name) assignments["mla"] = { ...toAssignment(m), slotLabel: "MLA" };
    });
  }

  // ── WardChairman ─────────────────────────────────────────────
  if (Array.isArray(members.WardChairman || members.wardChairman || members.ward_chairman)) {
    (members.WardChairman || members.wardChairman || members.ward_chairman).forEach((m) => {
      if (m?.name) assignments["ward-chairman"] = { ...toAssignment(m), slotLabel: "Ward Chairman" };
    });
  }

  // ── Officials — index → official-1, official-2, … ────────────
  const officialList = members.Official || members.official || members.officials;
  if (Array.isArray(officialList)) {
    officialList.forEach((m, i) => {
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
  const patronList = members.Patron || members.patron || members.patrons;
  if (Array.isArray(patronList)) {
    patronList.forEach((m, i) => {
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
  const chairmanList = members.Chairman || members.chairman || members.chairmen;
  if (Array.isArray(chairmanList)) {
    chairmanList.forEach((m, i) => {
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
  const advisoryList = members.Advisory || members.advisory || members.advisories;
  if (Array.isArray(advisoryList)) {
    advisoryList.forEach((m, i) => {
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
  const mentorList = members.Mentor || members.mentor || members.mentors;
  if (Array.isArray(mentorList)) {
    mentorList.forEach((m, i) => {
      const slotId = m?.slotId || `mentor-${i + 1}`;
      if (m?.name) {
        assignments[slotId] = {
          ...toAssignment(m),
          slotLabel: m.slotLabel || `Mentor ${slotId.split("-")[1]}`
        };
      }
    });
  }

  // ── CoreTeam — uses coreRole field to pick the right slot ────
  const coreList = members.CoreTeam || members.coreTeam || members.core_team;
  if (Array.isArray(coreList)) {
    coreList.forEach((m) => {
      let slotId = null;
      if (m?.slotId) {
        slotId = m.slotId;
      } else if (m?.coreRole) {
        slotId = CORE_ROLE_TO_SLOT[m.coreRole];
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
  const heroList = members.HeroImage || members.heroImage;
  if (Array.isArray(heroList)) {
    heroList.forEach((m) => {
      if (m?.profileImage || m?.photoUrl) {
        assignments["hero-image"] = {
          ...toAssignment(m),
          slotLabel: "Cover Hero Image",
        };
      }
    });
  }

  // ── Member — product slots (product-ub-queens-*, etc.) ───────
  const memberList = members.Member || members.member || members.members;
  if (Array.isArray(memberList)) {
    memberList.forEach((m) => {
      if (m?.slotId && m?.name) {
        assignments[m.slotId] = {
          ...toAssignment(m),
          slotLabel: m.slotLabel || m.slotId,
        };
      }
    });
  }

  // ── Sector — uses sectorKey field ────────────────────────────
  const sectorList = members.Sector || members.sector || members.sectors;
  if (Array.isArray(sectorList)) {
    sectorList.forEach((m) => {
      let slotId = null;

      if (m?.slotId) {
        slotId = m.slotId;
      } else if (m?.sectorKey) {
        slotId = `sector-${m.sectorKey}`;
      } else if (m?.slotLabel) {
        slotId = `sector-${m.slotLabel}`;
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
  const umsList = members.UMS || members.Ums || members.ums || members.Management || members.management;
  if (Array.isArray(umsList)) {
    umsList.forEach((m) => {
      let slotId = null;

      if (m?.slotId) {
        slotId = m.slotId;
      } else if (m?.umsKey) {
        slotId = `ums-${m.umsKey}`;
      } else if (m?.slotLabel) {
        const lbl = (m.slotLabel || "").toLowerCase();
        if (lbl.includes("ai")) slotId = "ums-ai";
        else if (lbl.includes("circle")) slotId = "ums-circle";
        else if (lbl.includes("digital")) slotId = "ums-digital";
        else if (lbl.includes("ground")) slotId = "ums-ground";
        else if (lbl.includes("hall")) slotId = "ums-hall";
        else if (lbl.includes("comms") || lbl.includes("communicat")) slotId = "ums-comms";
        else if (lbl.includes("director")) slotId = "ums-directory";
        else if (lbl.includes("finance")) slotId = "ums-finance2";
        else if (lbl.includes("kutumba")) slotId = "ums-kutumba";
        else if (lbl.includes("arbitrat")) slotId = "ums-arbitration";
        else slotId = `ums-${m.slotLabel}`;
      }

      const name = m.name || m.memberName || m.assignedUserName || m.holder?.user?.name || "";

      if (slotId && name) {
        assignments[slotId] = {
          ...toAssignment(m),
          name: name,
          slotLabel: m.slotLabel || m.umsKey || slotId,
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

/**
 * mergeUmsMembersIntoAssignments
 * Merges management members array from GET /udyamimngt/getMngtMembers/:wardId API
 * into assignments state for UMS slots (ums-ai, ums-circle, ums-digital, etc.).
 */
export function mergeUmsMembersIntoAssignments(assignments, umsMembersList) {
  if (!Array.isArray(umsMembersList) || umsMembersList.length === 0) {
    return assignments || {};
  }

  const merged = { ...(assignments || {}) };

  const DESIGNATION_TO_UMS_SLOT = {
    "ai lead generation": "ums-ai",
    "circle meeting": "ums-circle",
    "digital management": "ums-digital",
    "ground intelligence": "ums-ground",
    "hall coordinator": "ums-hall",
    "communications": "ums-comms",
    "comms": "ums-comms",
    "directory management": "ums-directory",
    "directory": "ums-directory",
    "finance": "ums-finance2",
    "kutumba": "ums-kutumba",
    "arbitration": "ums-arbitration",
  };

  umsMembersList.forEach((item) => {
    if (!item) return;
    const desName = (item.designation?.designationName || item.positionName || item.slotLabel || "").toLowerCase().trim();
    let slotId = item.slotId || DESIGNATION_TO_UMS_SLOT[desName];

    if (!slotId) {
      if (desName.includes("ai")) slotId = "ums-ai";
      else if (desName.includes("circle")) slotId = "ums-circle";
      else if (desName.includes("digital")) slotId = "ums-digital";
      else if (desName.includes("ground")) slotId = "ums-ground";
      else if (desName.includes("hall")) slotId = "ums-hall";
      else if (desName.includes("comms") || desName.includes("communicat")) slotId = "ums-comms";
      else if (desName.includes("director")) slotId = "ums-directory";
      else if (desName.includes("finance")) slotId = "ums-finance2";
      else if (desName.includes("kutumba")) slotId = "ums-kutumba";
      else if (desName.includes("arbitrat")) slotId = "ums-arbitration";
      else if (item.umsKey) slotId = `ums-${item.umsKey}`;
      else if (item.assignmentType) {
        const at = item.assignmentType.toLowerCase().replace(/^ums[_-]/, "");
        slotId = `ums-${at}`;
      }
    }

    const holderUser = item.holder?.user || (item.user && item.user.name ? item.user : null);
    const rawName = holderUser?.name || item.assignedUserName || (item.name && item.name !== item.designation?.designationName ? item.name : "") || "";
    const name = rawName.trim();
    const memberId = holderUser?.userId || item.userId || item.memberId || null;

    if (slotId && name) {
      if (!merged[slotId] || !merged[slotId].name) {
        const photo =
          extractPhotoUrl(holderUser?.profileImage) ||
          extractPhotoUrl(holderUser?.photoUrl) ||
          extractPhotoUrl(holderUser?.profile?.profileImage) ||
          extractPhotoUrl(item.profileImage) ||
          extractPhotoUrl(item.photoUrl) ||
          null;

        merged[slotId] = {
          name: name,
          company: item.designation?.designationName || item.positionName || item.companyName || item.company || "",
          photoUrl: (typeof photo === "string" && photo.trim()) ? photo : null,
          mobileNumber: holderUser?.mobileNumber || item.mobileNumber || "",
          email: holderUser?.email || item.email || "",
          memberId: memberId,
          status: item.isActive === false || item.positionIsActive === false ? "inactive" : (item.status || "registered"),
          slotLabel: item.designation?.designationName || item.slotLabel || slotId,
          positionName: item.designation?.designationName || item.positionName || null,
        };
      }
    }
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

    const name = (member.name || member.assignedUserName || "").trim();

    if (slotId && name) {
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