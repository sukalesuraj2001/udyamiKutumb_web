import L from "leaflet";

// ─────────────────────────────────────────────────────────────────
// ROLE CONFIG — colors matching Image 2 exactly
// ─────────────────────────────────────────────────────────────────
const ROLE_CONFIG = {
  // Row 1 — Teardrop pins
  super_admin:             { pinColor: "#7B3FA0", pinDark: "#4A1070", pinLight: "#B066D4", shape: "pin"    },
  district_head:           { pinColor: "#C8962A", pinDark: "#8B6010", pinLight: "#F0C050", shape: "pin"    },
  state_head:              { pinColor: "#C8962A", pinDark: "#8B6010", pinLight: "#F0C050", shape: "pin"    },
  taluk_head:              { pinColor: "#C8962A", pinDark: "#8B6010", pinLight: "#F0C050", shape: "pin"    },
  ward_chairman:           { pinColor: "#A08828", pinDark: "#6B5A10", pinLight: "#D4B040", shape: "pin"    },

  // Row 2 — Circle pins (flat round)
  circle_leader:           { pinColor: "#1E7EC8", pinDark: "#0D4E8B", pinLight: "#4AAAF0", shape: "circle" },
  circle_leader_president: { pinColor: "#1E7EC8", pinDark: "#0D4E8B", pinLight: "#4AAAF0", shape: "circle" },
  vice_president:          { pinColor: "#1E7EC8", pinDark: "#0D4E8B", pinLight: "#4AAAF0", shape: "circle" },
  general_secretary:       { pinColor: "#1E7EC8", pinDark: "#0D4E8B", pinLight: "#4AAAF0", shape: "circle" },
  treasurer:               { pinColor: "#1E7EC8", pinDark: "#0D4E8B", pinLight: "#4AAAF0", shape: "circle" },

  // Row 3 — Teardrop pins (green)
  assembly_president:      { pinColor: "#2E8B3A", pinDark: "#1A5A22", pinLight: "#50C060", shape: "pin"    },
  assembly_vice_president: { pinColor: "#2E8B3A", pinDark: "#1A5A22", pinLight: "#50C060", shape: "pin"    },
  assembly_gen_sec:        { pinColor: "#2E8B3A", pinDark: "#1A5A22", pinLight: "#50C060", shape: "pin"    },
  assembly_treasurer:      { pinColor: "#2E8B3A", pinDark: "#1A5A22", pinLight: "#50C060", shape: "pin"    },

  // Row 4 — Teardrop pins
  sector_head:             { pinColor: "#2060A0", pinDark: "#103870", pinLight: "#4090D0", shape: "pin"    },
  channel_partner:         { pinColor: "#2060A0", pinDark: "#103870", pinLight: "#4090D0", shape: "pin"    },
  member:                  { pinColor: "#8090A0", pinDark: "#506070", pinLight: "#B0C0D0", shape: "pin"    },
  ucn_member:              { pinColor: "#7080A0", pinDark: "#405070", pinLight: "#A0B0C8", shape: "pin"    },

  // Row 5 — Teardrop pins
  free_member:             { pinColor: "#A0A8B0", pinDark: "#707880", pinLight: "#D0D8E0", shape: "pin"    },
  basic_member:            { pinColor: "#C87848", pinDark: "#884828", pinLight: "#E8A870", shape: "pin"    },
  prime_member:            { pinColor: "#7A5030", pinDark: "#4A2810", pinLight: "#A07850", shape: "pin"    },
  patron_vip:              { pinColor: "#C8962A", pinDark: "#8B6010", pinLight: "#F0C050", shape: "pin"    },

  // Aliases
  udyami:                  { pinColor: "#8090A0", pinDark: "#506070", pinLight: "#B0C0D0", shape: "pin"    },
  janata:                  { pinColor: "#8090A0", pinDark: "#506070", pinLight: "#B0C0D0", shape: "pin"    },
  devotee:                 { pinColor: "#8090A0", pinDark: "#506070", pinLight: "#B0C0D0", shape: "pin"    },
};

// ─────────────────────────────────────────────────────────────────
// ICONS — white SVG paths, drawn on 40x40 viewBox inner circle
// ─────────────────────────────────────────────────────────────────
const ICONS = {
  // Crown
  super_admin: `
    <path d="M9 28 L9 22 L31 22 L31 28 Z" fill="white" opacity="0.95" rx="1"/>
    <path d="M9 22 L13 12 L20 19 L27 10 L31 22 Z" fill="white" opacity="0.95"/>
    <circle cx="13" cy="12" r="2.5" fill="white"/>
    <circle cx="27" cy="10" r="2.5" fill="white"/>
    <circle cx="20" cy="19" r="2" fill="white"/>`,

  // Classical building / pillars
  district_head: `
    <polygon points="20,8 8,16 32,16" fill="white" opacity="0.95"/>
    <rect x="10" y="16" width="3" height="11" rx="1" fill="white" opacity="0.9"/>
    <rect x="15.5" y="16" width="3" height="11" rx="1" fill="white" opacity="0.9"/>
    <rect x="21" y="16" width="3" height="11" rx="1" fill="white" opacity="0.9"/>
    <rect x="26.5" y="16" width="3" height="11" rx="1" fill="white" opacity="0.9"/>
    <rect x="8" y="27" width="24" height="3" rx="1" fill="white" opacity="0.95"/>`,

  // White house
  state_head: `
    <polygon points="20,7 8,16 32,16" fill="white" opacity="0.95"/>
    <rect x="10" y="16" width="20" height="13" rx="1" fill="white" opacity="0.9"/>
    <rect x="17" y="22" width="6" height="7" rx="0.5" fill="white" opacity="0.5"/>
    <rect x="17" y="7" width="6" height="8" rx="1" fill="white" opacity="0.8"/>
    <rect x="8" y="29" width="24" height="2" rx="1" fill="white" opacity="0.95"/>`,

  // Building + shield with check
  taluk_head: `
    <rect x="9" y="13" width="14" height="16" rx="1" fill="white" opacity="0.85"/>
    <polygon points="16,8 9,13 23,13" fill="white" opacity="0.95"/>
    <rect x="11" y="16" width="3" height="5" rx="0.5" fill="white" opacity="0.5"/>
    <rect x="16" y="16" width="3" height="5" rx="0.5" fill="white" opacity="0.5"/>
    <path d="M24 14 L30 17 L30 23 Q30 28 24 31 Q18 28 18 23 L18 17 Z" fill="white" opacity="0.95"/>
    <path d="M21 22 L23.5 25 L28 19" stroke="#C8962A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,

  // Scales of justice / gavel
  ward_chairman: `
    <circle cx="20" cy="10" r="3" fill="white" opacity="0.9"/>
    <line x1="20" y1="13" x2="20" y2="30" stroke="white" stroke-width="2.5" stroke-linecap="round" opacity="0.9"/>
    <line x1="12" y1="18" x2="28" y2="18" stroke="white" stroke-width="2" stroke-linecap="round" opacity="0.9"/>
    <path d="M12 18 L10 24 Q12 27 14 24 Z" fill="white" opacity="0.85"/>
    <path d="M28 18 L26 24 Q28 27 30 24 Z" fill="white" opacity="0.85"/>
    <rect x="16" y="29" width="8" height="2.5" rx="1" fill="white" opacity="0.9"/>`,

  // Handshake
  circle_leader: `
    <path d="M8 22 C10 18 13 17 16 19 L20 17 C22 16 24 17 24 19 L28 17 C30 16 32 18 30 21 L24 25 C22 26 20 26 18 24 L14 26 C11 27 8 25 8 22Z" fill="white" opacity="0.9"/>
    <path d="M16 19 L20 17" stroke="white" stroke-width="1.5" fill="none" opacity="0.7"/>`,

  // Podium with person
  circle_leader_president: `
    <circle cx="20" cy="11" r="4" fill="white" opacity="0.9"/>
    <rect x="15" y="15" width="10" height="8" rx="1" fill="white" opacity="0.85"/>
    <rect x="10" y="23" width="20" height="3" rx="1" fill="white" opacity="0.9"/>
    <rect x="8" y="26" width="24" height="3" rx="1.5" fill="white" opacity="0.85"/>`,

  // W letter stylized
  vice_president: `
    <path d="M8 12 L12 26 L20 16 L28 26 L32 12" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.95"/>
    <circle cx="20" cy="12" r="3" fill="white" opacity="0.8"/>`,

  // Scroll / quill
  general_secretary: `
    <rect x="11" y="10" width="18" height="20" rx="2" fill="white" opacity="0.85"/>
    <path d="M26 10 C28 8 32 10 30 14 L24 20 L21 21 L22 18 Z" fill="white" opacity="0.95"/>
    <line x1="14" y1="16" x2="22" y2="16" stroke="#1E7EC8" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="14" y1="20" x2="20" y2="20" stroke="#1E7EC8" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="14" y1="24" x2="22" y2="24" stroke="#1E7EC8" stroke-width="1.5" stroke-linecap="round"/>`,

  // Coin bag
  treasurer: `
    <ellipse cx="20" cy="24" rx="9" ry="7" fill="white" opacity="0.9"/>
    <path d="M15 17 Q15 12 20 12 Q25 12 25 17" fill="white" opacity="0.85" stroke="white" stroke-width="1"/>
    <text x="20" y="27" font-size="9" text-anchor="middle" fill="#1E7EC8" font-weight="900" font-family="Arial,sans-serif">$</text>`,

  // Assembly building with emblem
  assembly_president: `
    <polygon points="20,8 9,16 31,16" fill="white" opacity="0.95"/>
    <rect x="10" y="16" width="20" height="13" rx="1" fill="white" opacity="0.85"/>
    <rect x="12" y="19" width="3.5" height="7" rx="0.5" fill="white" opacity="0.5"/>
    <rect x="17" y="19" width="3.5" height="7" rx="0.5" fill="white" opacity="0.5"/>
    <rect x="22" y="19" width="3.5" height="7" rx="0.5" fill="white" opacity="0.5"/>
    <rect x="8" y="29" width="24" height="2.5" rx="1" fill="white" opacity="0.95"/>`,

  assembly_vice_president: `
    <polygon points="20,8 9,16 31,16" fill="white" opacity="0.95"/>
    <rect x="10" y="16" width="20" height="13" rx="1" fill="white" opacity="0.85"/>
    <rect x="8" y="29" width="24" height="2.5" rx="1" fill="white" opacity="0.95"/>
    <path d="M14 20 L18 26 L26 18" stroke="#2E8B3A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,

  assembly_gen_sec: `
    <polygon points="20,8 9,16 31,16" fill="white" opacity="0.95"/>
    <rect x="10" y="16" width="20" height="13" rx="1" fill="white" opacity="0.85"/>
    <rect x="8" y="29" width="24" height="2.5" rx="1" fill="white" opacity="0.95"/>
    <line x1="13" y1="20" x2="27" y2="20" stroke="#2E8B3A" stroke-width="2" stroke-linecap="round"/>
    <line x1="13" y1="24" x2="22" y2="24" stroke="#2E8B3A" stroke-width="2" stroke-linecap="round"/>`,

  assembly_treasurer: `
    <polygon points="20,8 9,16 31,16" fill="white" opacity="0.95"/>
    <rect x="10" y="16" width="20" height="13" rx="1" fill="white" opacity="0.85"/>
    <rect x="8" y="29" width="24" height="2.5" rx="1" fill="white" opacity="0.95"/>
    <text x="20" y="27" font-size="9" text-anchor="middle" fill="#2E8B3A" font-weight="900" font-family="Arial,sans-serif">₹</text>`,

  // Gear
  sector_head: `
    <circle cx="20" cy="20" r="5" fill="white" opacity="0.9"/>
    <circle cx="20" cy="20" r="2.5" fill="#2060A0" opacity="0.8"/>
    ${[0,40,80,120,160,200,240,280,320].map(deg => {
      const r = deg * Math.PI / 180;
      const x1 = (20 + 6.5 * Math.sin(r)).toFixed(2);
      const y1 = (20 - 6.5 * Math.cos(r)).toFixed(2);
      const x2 = (20 + 9.5 * Math.sin(r)).toFixed(2);
      const y2 = (20 - 9.5 * Math.cos(r)).toFixed(2);
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="white" stroke-width="3" stroke-linecap="round" opacity="0.9"/>`;
    }).join('')}`,

  // Network / nodes
  channel_partner: `
    <circle cx="20" cy="10" r="3.5" fill="white" opacity="0.9"/>
    <circle cx="10" cy="26" r="3.5" fill="white" opacity="0.9"/>
    <circle cx="30" cy="26" r="3.5" fill="white" opacity="0.9"/>
    <circle cx="20" cy="20" r="3" fill="white" opacity="0.85"/>
    <line x1="20" y1="13" x2="20" y2="17" stroke="white" stroke-width="2" stroke-linecap="round" opacity="0.8"/>
    <line x1="20" y1="23" x2="12" y2="23" stroke="white" stroke-width="2" stroke-linecap="round" opacity="0.8"/>
    <line x1="20" y1="23" x2="28" y2="23" stroke="white" stroke-width="2" stroke-linecap="round" opacity="0.8"/>
    <line x1="12" y1="23" x2="12" y2="22.5" stroke="white" stroke-width="2" stroke-linecap="round" opacity="0.8"/>
    <line x1="28" y1="23" x2="28" y2="22.5" stroke="white" stroke-width="2" stroke-linecap="round" opacity="0.8"/>`,

  // Person silhouette
  member: `
    <circle cx="20" cy="13" r="6" fill="white" opacity="0.9"/>
    <path d="M9 32 Q9 22 20 22 Q31 22 31 32" fill="white" opacity="0.85"/>`,

  ucn_member: `
    <circle cx="20" cy="13" r="6" fill="white" opacity="0.9"/>
    <path d="M9 32 Q9 22 20 22 Q31 22 31 32" fill="white" opacity="0.85"/>
    <circle cx="28" cy="24" r="5" fill="white" opacity="0.9"/>
    <path d="M25 24 Q26 22 28 22 Q30 22 31 24 L31 27 Q29 29 28 28 Q27 27 25 27 Z" fill="#7080A0" opacity="0.8"/>`,

  free_member: `
    <circle cx="20" cy="13" r="6" fill="white" opacity="0.75"/>
    <path d="M9 32 Q9 22 20 22 Q31 22 31 32" fill="white" opacity="0.7"/>`,

  // Person + star
  basic_member: `
    <circle cx="20" cy="12" r="5.5" fill="white" opacity="0.9"/>
    <path d="M9 30 Q9 21 20 21 Q31 21 31 30" fill="white" opacity="0.85"/>
    <polygon points="20,30 21,33 24,33 22,35 23,38 20,36 17,38 18,35 16,33 19,33" fill="white" opacity="0.9"/>`,

  prime_member: `
    <circle cx="20" cy="12" r="5.5" fill="white" opacity="0.9"/>
    <path d="M9 30 Q9 21 20 21 Q31 21 31 30" fill="white" opacity="0.85"/>
    <polygon points="20,29 21.5,33 26,33 22.5,35.5 24,39 20,37 16,39 17.5,35.5 14,33 18.5,33" fill="white" opacity="0.95"/>`,

  // Diamond
  patron_vip: `
    <polygon points="20,7 30,17 20,35 10,17" fill="white" opacity="0.9"/>
    <polygon points="20,11 27,17 20,30 13,17" fill="none" stroke="#C8962A" stroke-width="1.5" opacity="0.6"/>
    <line x1="10" y1="17" x2="30" y2="17" stroke="#C8962A" stroke-width="1.2" opacity="0.5"/>
    <line x1="14" y1="12" x2="26" y2="12" stroke="white" stroke-width="1" opacity="0.5"/>`,
};

ICONS.udyami  = ICONS.member;
ICONS.janata  = ICONS.member;
ICONS.devotee = ICONS.member;

// ─────────────────────────────────────────────────────────────────
// ROLE KEY RESOLVER
// ─────────────────────────────────────────────────────────────────
const ALIASES = {
  menmber:          "member",
  "user-business":  "member",
  user_business:    "member",
  districthead:     "district_head",
  talukhead:        "taluk_head",
  wardchairman:     "ward_chairman",
  superadmin:       "super_admin",
  channelpartner:   "channel_partner",
  sectorhead:       "sector_head",
  udyami:           "member",
  janata:           "member",
  devotee:          "member",
};

export function resolveRoleKey(props) {
  const raw = (
    props?.user?.position?.assignmentType ||
    props?.role ||
    props?.type ||
    "member"
  )
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");
  return ALIASES[raw] ?? raw;
}

// ─────────────────────────────────────────────────────────────────
// PIN SVG BUILDER — exact Image 2 style
// ─────────────────────────────────────────────────────────────────
export function makeRolePinIcon(roleKey, isSelected = false) {
  const cfg     = ROLE_CONFIG[roleKey] ?? ROLE_CONFIG["member"];
  const iconSvg = ICONS[roleKey] ?? ICONS["member"];
  const isCircle = cfg.shape === "circle";

  const baseSize = isSelected ? 52 : 42;
  const uid = `pin_${roleKey}_${isSelected ? "s" : "n"}_${Math.random().toString(36).slice(2,6)}`;

  // ── Teardrop pin SVG ──────────────────────────────────────────
  const pinWidth  = baseSize;
  const pinHeight = isCircle ? baseSize : Math.round(baseSize * 1.4);

  let pinBody;

  if (isCircle) {
    // Round circle badge (for circle leader row)
    pinBody = `
      <!-- Outer ring -->
      <circle cx="21" cy="21" r="20"
        fill="url(#grad_${uid})"
        stroke="${isSelected ? "white" : cfg.pinLight}"
        stroke-width="${isSelected ? 2 : 1.2}"
        filter="url(#shadow_${uid})"/>
      <!-- Shine -->
      <ellipse cx="15" cy="13" rx="9" ry="6"
        fill="white" opacity="0.2"/>
      <!-- Inner circle -->
      <circle cx="21" cy="21" r="14"
        fill="url(#inner_${uid})" opacity="0.9"/>
      <!-- Icon -->
      <g transform="translate(1,1) scale(1.05)">
        ${iconSvg}
      </g>`;
  } else {
    // Classic teardrop location pin
    pinBody = `
      <!-- Pin body -->
      <path d="M21 2
        C10 2 2 10 2 21
        C2 32 21 46 21 46
        C21 46 40 32 40 21
        C40 10 32 2 21 2 Z"
        fill="url(#grad_${uid})"
        stroke="${isSelected ? "white" : cfg.pinDark}"
        stroke-width="${isSelected ? 2 : 1}"
        filter="url(#shadow_${uid})"/>
      <!-- Top-left shine -->
      <ellipse cx="14" cy="12" rx="8" ry="5"
        fill="white" opacity="0.22" transform="rotate(-20 14 12)"/>
      <!-- Inner circle (white ring + slightly lighter bg) -->
      <circle cx="21" cy="19" r="14"
        fill="url(#inner_${uid})"
        stroke="white"
        stroke-width="1.5"
        opacity="0.95"/>
      <!-- Icon centered in inner circle, scaled to 40x40 -->
      <g transform="translate(1, -1)">
        ${iconSvg}
      </g>`;
  }

  const svgWidth  = isCircle ? 42 : 42;
  const svgHeight = isCircle ? 42 : 52;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 ${isCircle ? 42 : 42} ${isCircle ? 42 : 52}"
    width="${pinWidth}" height="${pinHeight}"
    style="overflow:visible">
    <defs>
      <!-- Pin gradient -->
      <radialGradient id="grad_${uid}" cx="38%" cy="25%" r="72%">
        <stop offset="0%"   stop-color="${cfg.pinLight}"/>
        <stop offset="50%"  stop-color="${cfg.pinColor}"/>
        <stop offset="100%" stop-color="${cfg.pinDark}"/>
      </radialGradient>
      <!-- Inner circle gradient -->
      <radialGradient id="inner_${uid}" cx="40%" cy="30%" r="70%">
        <stop offset="0%"   stop-color="${cfg.pinColor}" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="${cfg.pinDark}"  stop-opacity="0.95"/>
      </radialGradient>
      <!-- Drop shadow -->
      <filter id="shadow_${uid}" x="-30%" y="-10%" width="180%" height="160%">
        <feDropShadow dx="0" dy="${isSelected ? 4 : 2.5}"
          stdDeviation="${isSelected ? 5 : 3}"
          flood-color="rgba(0,0,0,${isSelected ? 0.55 : 0.40})"/>
      </filter>
    </defs>

    ${pinBody}

    ${isSelected ? `
    <!-- Selected: outer glow ring -->
    <${isCircle ? `circle cx="21" cy="21" r="20"` : `path d="M21 2 C10 2 2 10 2 21 C2 32 21 46 21 46 C21 46 40 32 40 21 C40 10 32 2 21 2 Z"`}
      fill="none"
      stroke="white"
      stroke-width="2.5"
      stroke-opacity="0.7"
      stroke-dasharray="4 3"/>
    ` : ""}
  </svg>`;

  return L.divIcon({
    className:   "",
    html:        svg,
    iconSize:    [pinWidth,  pinHeight],
    iconAnchor:  [pinWidth / 2, pinHeight],
    popupAnchor: [0, -(pinHeight + 4)],
  });
}