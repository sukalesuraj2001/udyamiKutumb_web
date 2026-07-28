// ═══════════════════════════════════════════════════════════════════════════════
// ORG CHART — nodes, edges, legend, legacy tree & management matrix
// ═══════════════════════════════════════════════════════════════════════════════

export const NODE_W = 140;
export const NODE_H = 54;

export const ORG_NODES = [
  // Vertical spine
  { id: "national-head",      x: 530, y: 10  },
  { id: "state-head",         x: 530, y: 100 },
  { id: "district-head",      x: 530, y: 190 },
  { id: "taluk-head",         x: 530, y: 280 },
  { id: "ward-chairman",      x: 530, y: 370 },
  // Level-6 — spread horizontally
  { id: "sector-coordinator", x: 100,  y: 480 },
  { id: "president",          x: 275, y: 480 },
  { id: "vice-president",     x: 445, y: 480 },
  { id: "general-secretary",  x: 615, y: 480 },
  { id: "treasurer",          x: 785, y: 480 },
  { id: "functional-role",    x: 955, y: 480 },
  // Channel Partner & Member
  { id: "channel-partner",    x: 530, y: 580 },
  { id: "member",             x: 530, y: 670 },
];

export const ORG_EDGES = [
  { from: "national-head",   to: "state-head"        },
  { from: "state-head",      to: "district-head"     },
  { from: "district-head",   to: "taluk-head"        },
  { from: "taluk-head",      to: "ward-chairman"     },
  { from: "ward-chairman",   to: "sector-coordinator"},
  { from: "ward-chairman",   to: "president"         },
  { from: "ward-chairman",   to: "vice-president"    },
  { from: "ward-chairman",   to: "general-secretary" },
  { from: "ward-chairman",   to: "treasurer"         },
  { from: "ward-chairman",   to: "functional-role"   },
  { from: "ward-chairman",   to: "channel-partner"   }, // direct — per paper diagram
  { from: "channel-partner", to: "member"            },
];

export const ORG_LEGEND = [
  { color: "#6d28d9", label: "National" },
  { color: "#2563eb", label: "State / District / Taluk" },
  { color: "#059669", label: "Ward" },
  { color: "#0d9488", label: "Sector / Office Bearers" },
  { color: "#ea580c", label: "Channel Partner" },
  { color: "#e11d48", label: "Member" },
];

// ─── Legacy Tree ──────────────────────────────────────────────────────────────
export const TREE_DATA = {
  id: "national-head",
  children: [{
    id: "state-head",
    children: [{
      id: "district-head",
      children: [{
        id: "taluk-head",
        children: [{
          id: "ward-chairman",
          children: [
            {
              id: "sector-coordinator", note: "12 per ward",
              children: [{ id: "channel-partner", children: [{ id: "member", children: [] }] }],
            },
            { id: "president",         children: [] },
            { id: "vice-president",    children: [] },
            { id: "general-secretary", children: [] },
            { id: "treasurer",         children: [] },
            { id: "functional-role",   note: "10 per ward", children: [] },
          ],
        }],
      }],
    }],
  }],
};

// ─── Legacy Management Matrix ─────────────────────────────────────────────────
// Row = manager role, value = array of role IDs they can manage
export const CAN_MANAGE = {
};

// ─── Mock users for Assign Roles tab ─────────────────────────────────────────
export const MOCK_USERS = [
  { id: 1, name: "Ravi Kumar",    phone: "9876543210", currentRole: "ward-chairman",      scope: "Anekal Ward 4"       },
  { id: 2, name: "Meena Devi",    phone: "8765432109", currentRole: "sector-coordinator", scope: "Sector 3, Anekal"    },
  { id: 3, name: "Suresh Babu",   phone: "7654321098", currentRole: "channel-partner",    scope: "Ward 7, BTM"         },
  { id: 4, name: "Anitha R",      phone: "6543210987", currentRole: "member",             scope: "Self-Service"        },
  { id: 5, name: "Prakash Nayak", phone: "9988776655", currentRole: "treasurer",          scope: "Yelahanka Ward 2"    },
  { id: 6, name: "Kavya S",       phone: "9090909090", currentRole: "president",          scope: "Ward 12, Jayanagar"  },
];