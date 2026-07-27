// ─────────────────────────────────────────────────────────────────────────────
// data/roleHierarchy.js
// Single source of truth for ALL role/hierarchy data.
// Every tab imports from here. Swap ROLES / HIERARCHY_EDGES / SAMPLE_USERS
// for real API responses without touching any component file.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Org-Chart node dimensions ───────────────────────────────────────────────
export const NODE_W = 140;
export const NODE_H = 54;
export const ORG_CANVAS = { width: 1020, height: 900 };

// ─── Master Role Registry ─────────────────────────────────────────────────────
// scopeLevel 0 = top of hierarchy, 7 = leaf
// x / y are org-chart canvas coordinates (top-left of node box)
//
// Actual Udyami Circle hierarchy (from design doc):
//   National Head (Super Admin)
//     └─ State Head
//         └─ District Head
//             └─ Taluk Head
//                 └─ Ward Chairman
//                     ├─ Sector Coordinators
//                     ├─ President
//                     ├─ Vice-President ─┐
//                     ├─ General Secretary│
//                     ├─ Treasurer       │
//                     └─ Functional Roles│
//                                 Channel Partner (GP)
//                                     └─ Member (Self-Service)
// ─────────────────────────────────────────────────────────────────────────────
export const ROLES = [
  {
    id: "national-head",
    label: "National Head",
    roleTag: "Super Admin",
    scope: "National",
    scopeLevel: 0,
    users: 1,
    // org-chart colour
    color: "#6366f1",
    bg: "#eef2ff",
    // org-chart position
    x: 440, y: 20,
    // role-card / badge styling (Tailwind class strings)
    scopeColor: "text-violet-600 bg-violet-50 border-violet-200",
    borderColor: "border-l-violet-500",
    textColor: "text-violet-700",
    bgColor: "bg-violet-50/60",
    userColor: "text-violet-600",
    description:
      "Full platform access. Manages national-level operations, all admins, and modules across all states.",
  },
  {
    id: "state-head",
    label: "State Head",
    scope: "State",
    scopeLevel: 1,
    users: 3,
    color: "#6366f1",
    bg: "#eef2ff",
    x: 440, y: 130,
    scopeColor: "text-violet-600 bg-violet-50 border-violet-200",
    borderColor: "border-l-violet-400",
    textColor: "text-violet-700",
    bgColor: "bg-violet-50/40",
    userColor: "text-violet-600",
    description:
      "Manages state-level configuration, district heads, and platform rollout.",
  },
  {
    id: "district-head",
    label: "District Head",
    scope: "District",
    scopeLevel: 2,
    users: 12,
    color: "#3b82f6",
    bg: "#eff6ff",
    x: 440, y: 240,
    scopeColor: "text-blue-600 bg-blue-50 border-blue-200",
    borderColor: "border-l-blue-500",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50/60",
    userColor: "text-blue-600",
    description:
      "Manages district-level assemblies, taluk heads, and local operations.",
  },
  {
    id: "taluk-head",
    label: "Taluk Head",
    scope: "Taluk",
    scopeLevel: 3,
    users: 48,
    color: "#3b82f6",
    bg: "#eff6ff",
    x: 440, y: 350,
    scopeColor: "text-blue-600 bg-blue-50 border-blue-200",
    borderColor: "border-l-blue-400",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50/40",
    userColor: "text-blue-600",
    description:
      "Oversees taluk-level ward operations and community programs.",
  },
  {
    id: "ward-chairman",
    label: "Ward Chairman",
    scope: "Ward",
    scopeLevel: 4,
    users: 185,
    color: "#10b981",
    bg: "#d1fae5",
    x: 440, y: 460,
    scopeColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
    borderColor: "border-l-emerald-500",
    textColor: "text-emerald-700",
    bgColor: "bg-emerald-50/60",
    userColor: "text-emerald-600",
    description:
      "Oversees ward-level members, ground data, and community engagement.",
  },
  // ── Level-5 siblings (children of Ward Chairman) ───────────────────────────
  {
    id: "sector-coordinators",
    label: "Sector Coordinators",
    scope: "Ward",
    scopeLevel: 5,
    users: 555,
    color: "#475569",
    bg: "#f1f5f9",
    x: 52, y: 585,
    scopeColor: "text-slate-600 bg-slate-50 border-slate-200",
    borderColor: "border-l-slate-500",
    textColor: "text-slate-700",
    bgColor: "bg-slate-50/60",
    userColor: "text-slate-600",
    description:
      "Coordinates sector-level field operations and member activities within the ward.",
  },
  {
    id: "president",
    label: "President",
    scope: "Ward",
    scopeLevel: 5,
    users: 185,
    color: "#475569",
    bg: "#f1f5f9",
    x: 207, y: 585,
    scopeColor: "text-slate-600 bg-slate-50 border-slate-200",
    borderColor: "border-l-slate-500",
    textColor: "text-slate-700",
    bgColor: "bg-slate-50/50",
    userColor: "text-slate-600",
    description:
      "Leads ward-level governance, member mobilisation, and local campaigns.",
  },
  {
    id: "vice-president",
    label: "Vice-President",
    scope: "Ward",
    scopeLevel: 5,
    users: 185,
    color: "#475569",
    bg: "#f1f5f9",
    x: 362, y: 585,
    scopeColor: "text-slate-600 bg-slate-50 border-slate-200",
    borderColor: "border-l-slate-400",
    textColor: "text-slate-700",
    bgColor: "bg-slate-50/40",
    userColor: "text-slate-600",
    description:
      "Supports the president and oversees channel-partner onboarding.",
  },
  {
    id: "general-secretary",
    label: "General Secretary",
    scope: "Ward",
    scopeLevel: 5,
    users: 185,
    color: "#475569",
    bg: "#f1f5f9",
    x: 517, y: 585,
    scopeColor: "text-slate-600 bg-slate-50 border-slate-200",
    borderColor: "border-l-slate-400",
    textColor: "text-slate-700",
    bgColor: "bg-slate-50/30",
    userColor: "text-slate-600",
    description:
      "Manages ward records, member communications, and meeting coordination.",
  },
  {
    id: "treasurer",
    label: "Treasurer",
    scope: "Ward",
    scopeLevel: 5,
    users: 185,
    color: "#475569",
    bg: "#f1f5f9",
    x: 672, y: 585,
    scopeColor: "text-slate-600 bg-slate-50 border-slate-200",
    borderColor: "border-l-slate-300",
    textColor: "text-slate-700",
    bgColor: "bg-slate-50/30",
    userColor: "text-slate-600",
    description:
      "Manages ward finances, collections, and financial reporting.",
  },
  {
    id: "functional-roles",
    label: "Functional Roles",
    scope: "Ward",
    scopeLevel: 5,
    users: 1850,
    color: "#64748b",
    bg: "#f8fafc",
    x: 827, y: 585,
    scopeColor: "text-slate-500 bg-slate-50 border-slate-200",
    borderColor: "border-l-slate-300",
    textColor: "text-slate-600",
    bgColor: "bg-slate-50/20",
    userColor: "text-slate-500",
    description:
      "10 specialised functional and system-administration roles per ward.",
  },
  // ── Level 6 & 7 ───────────────────────────────────────────────────────────
  {
    id: "channel-partner",
    label: "Channel Partner (GP)",
    scope: "Field",
    scopeLevel: 6,
    users: 2775,
    color: "#f59e0b",
    bg: "#fef3c7",
    x: 362, y: 715,
    scopeColor: "text-amber-600 bg-amber-50 border-amber-200",
    borderColor: "border-l-amber-500",
    textColor: "text-amber-700",
    bgColor: "bg-amber-50/60",
    userColor: "text-amber-600",
    description:
      "Invitation agent (~15 per Ward) who creates Udyami records from field visits within assigned areas.",
  },
  {
    id: "member",
    label: "Member (Self-Service)",
    scope: "Member",
    scopeLevel: 7,
    users: 14986,
    color: "#64748b",
    bg: "#f8fafc",
    x: 362, y: 815,
    scopeColor: "text-gray-500 bg-gray-50 border-gray-200",
    borderColor: "border-l-gray-400",
    textColor: "text-gray-700",
    bgColor: "bg-gray-50/60",
    userColor: "text-gray-600",
    description:
      "End beneficiary/entrepreneur onboarded via surveys. Limited platform access.",
  },
];

// ─── Org-Chart edges ──────────────────────────────────────────────────────────
export const HIERARCHY_EDGES = [
  { from: "national-head",      to: "state-head" },
  { from: "state-head",         to: "district-head" },
  { from: "district-head",      to: "taluk-head" },
  { from: "taluk-head",         to: "ward-chairman" },
  { from: "ward-chairman",      to: "sector-coordinators" },
  { from: "ward-chairman",      to: "president" },
  { from: "ward-chairman",      to: "vice-president" },
  { from: "ward-chairman",      to: "general-secretary" },
  { from: "ward-chairman",      to: "treasurer" },
  { from: "ward-chairman",      to: "functional-roles" },
  { from: "vice-president",     to: "channel-partner" },
  { from: "channel-partner",    to: "member" },
];

// ─── Stats (used by RoleStats) ────────────────────────────────────────────────
export const STATS = [
  { label: "Total Roles",      value: String(ROLES.length), iconKey: "shield",    iconBg: "bg-violet-50",  iconColor: "text-violet-500" },
  { label: "Total Users",      value: "21,155",             iconKey: "users",     iconBg: "bg-emerald-50", iconColor: "text-emerald-500" },
  { label: "Hierarchy Levels", value: "8",                  iconKey: "gitbranch", iconBg: "bg-blue-50",    iconColor: "text-blue-500" },
  { label: "Admin Roles",      value: "4",                  iconKey: "crown",     iconBg: "bg-amber-50",   iconColor: "text-amber-500" },
];

// ─── Modules (Permissions tab + Legacy Matrix tab) ────────────────────────────
export const MODULES = [
  "Database",
  "Campaigns",
  "Communications",
  "Analytics",
  "Media",
  "Membership",
  "Ground Intelligence",
  "Rewards",
  "Settings",
];

// ─── Default Permissions (Permissions tab: "write" | "read" | "none") ─────────
const _buildDefaultPermissions = () => {
  const map = {};
  ROLES.forEach((role) => {
    map[role.id] = {};
    MODULES.forEach((mod) => {
      const l = role.scopeLevel;
      if (l <= 1) {
        map[role.id][mod] = "write";
      } else if (l <= 3) {
        map[role.id][mod] = mod === "Settings" && l === 3 ? "read" : "write";
      } else if (l === 4) {
        map[role.id][mod] = ["Settings", "Membership"].includes(mod) ? "none" : "write";
      } else if (l === 5) {
        map[role.id][mod] = ["Analytics", "Media", "Membership", "Settings"].includes(mod)
          ? "none"
          : "read";
      } else if (role.id === "channel-partner") {
        map[role.id][mod] = ["Database", "Campaigns", "Communications", "Rewards"].includes(mod)
          ? "write"
          : "none";
      } else {
        map[role.id][mod] = "none";
      }
    });
  });
  return map;
};
export const DEFAULT_PERMISSIONS = _buildDefaultPermissions();

// ─── Legacy Matrix modules + defaults ─────────────────────────────────────────
export const LEGACY_MODULES = [
  "Udyami Database",
  "Roles",
  "Users",
  "AI Lead Management",
  "Communications",
  "Data Analytics",
];

const _buildLegacyPermissions = () => {
  const map = {};
  ROLES.forEach((role) => {
    const l = role.scopeLevel;
    map[role.id] = {};
    LEGACY_MODULES.forEach((mod) => {
      map[role.id][mod] = {
        view:   l <= 6,
        create: l <= 4,
        edit:   l <= 4,
        delete: l <= 2,
        export: l <= 5,
      };
    });
  });
  return map;
};
export const DEFAULT_LEGACY_PERMISSIONS = _buildLegacyPermissions();

// ─── Sample Users (Assign Roles tab) ─────────────────────────────────────────
export const SAMPLE_USERS = [
  { id: 1, username: "7349625941@udyamicircle.app", region: null, role: "Channel Partner (GP)",   assignedDate: "2026-07-15" },
  { id: 2, username: "9060142011@udyamicircle.app", region: null, role: "Member (Self-Service)",  assignedDate: "2026-07-14" },
  { id: 3, username: "6363343135@udyamicircle.app", region: null, role: "Member (Self-Service)",  assignedDate: "2026-07-14" },
  { id: 4, username: "6383436841@udyamicircle.app", region: null, role: "Ward Chairman",          assignedDate: "2026-07-13" },
  { id: 5, username: "8310231239@udyamicircle.app", region: null, role: "Member (Self-Service)",  assignedDate: "2026-07-12" },
  { id: 6, username: "9886333846@udyamicircle.app", region: null, role: "Member (Self-Service)",  assignedDate: "2026-07-08" },
];

// ─── Legacy Tree sample data ──────────────────────────────────────────────────
export const LEGACY_TREE_DATA = [
  {
    id: 1,
    name: "Vikram Singh",
    roleLabel: "National Head",
    roleTag: "Super Admin",
    region: "Karnataka",
    levelKey: "national",
    children: [
      {
        id: 2,
        name: "Priya Sharma",
        roleLabel: "State Head",
        roleTag: "State Head",
        region: "Bangalore South",
        levelKey: "state",
        children: [
          {
            id: 3,
            name: "Rajesh Kumar",
            roleLabel: "Ward Chairman",
            roleTag: "Ward Chairman",
            region: "Koramangala",
            levelKey: "ward",
            children: [
              {
                id: 4,
                name: "Anita Patel",
                roleLabel: "Channel Partner (GP)",
                roleTag: "Channel Partner",
                region: "Koramangala",
                levelKey: "field",
                children: [
                  {
                    id: 5,
                    name: "Ramesh Udyami",
                    roleLabel: "Member (Self-Service)",
                    roleTag: "Member",
                    region: "Koramangala",
                    levelKey: "member",
                    children: [],
                  },
                ],
              },
              {
                id: 6,
                name: "Suresh Yadav",
                roleLabel: "Channel Partner (GP)",
                roleTag: "Channel Partner",
                region: "Koramangala",
                levelKey: "field",
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
];

// ─── Level colour map (Legacy Tree) ──────────────────────────────────────────
export const LEVEL_COLORS = {
  national: { dot: "#6366f1", avatar: "bg-violet-500", badge: "bg-violet-100 text-violet-700" },
  state:    { dot: "#3b82f6", avatar: "bg-blue-500",   badge: "bg-blue-100 text-blue-700" },
  district: { dot: "#06b6d4", avatar: "bg-cyan-400",   badge: "bg-cyan-100 text-cyan-700" },
  taluk:    { dot: "#8b5cf6", avatar: "bg-purple-400", badge: "bg-purple-100 text-purple-700" },
  ward:     { dot: "#10b981", avatar: "bg-emerald-500",badge: "bg-emerald-100 text-emerald-700" },
  field:    { dot: "#f59e0b", avatar: "bg-amber-500",  badge: "bg-amber-100 text-amber-700" },
  member:   { dot: "#64748b", avatar: "bg-slate-400",  badge: "bg-slate-100 text-slate-700" },
};

export const TREE_LEGEND = [
  { key: "national", label: "National" },
  { key: "state",    label: "State" },
  { key: "ward",     label: "Ward" },
  { key: "field",    label: "Field" },
  { key: "member",   label: "Member" },
];