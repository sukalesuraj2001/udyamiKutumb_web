/**
 * Generates src/theme-dark.generated.css
 *
 * Dark mode for this app is done with *explicit overrides*, not by touching
 * 300 component files. This script scans the source for every colour utility
 * (bg-white, text-slate-700, hover:bg-gray-50, border-[#E5E7EB], ...), every
 * inline `style={{ background: "#fff" }}` colour and every hard-coded colour
 * in index.css, and emits a `.dark …` override for each one that is "light
 * theme only" (white / light-gray surfaces, dark text, pastel tints ...).
 *
 *  - Solid brand buttons (bg-blue-600 text-white, bg-ink …) are left alone.
 *  - Anything inside an element with the `force-light` class (A4 chart pages,
 *    PDF preview) is excluded, so print/PDF output never goes dark.
 *
 * Re-run after adding NEW colour classes:  npm run theme:gen
 * (it also runs automatically before `npm run dev` / `npm run build`).
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const OUT = path.join(SRC, "theme-dark.generated.css");
const LIGHT_ZONE = ":not(.force-light, .force-light *)";

/* ───────────────────────── palette ───────────────────────── */
const P = {
  page: "#0d1117",
  card: "#161b22",
  sunken: "#11161d", // gray-50 style subtle areas (darker than a card)
  raised: "#1c232c", // gray-100
  raised2: "#252d38", // gray-200
  raised3: "#2f3945", // gray-300
  line1: "#1c232c",
  line2: "#232b36",
  line3: "#2d3641",
  line4: "#3a4553",
  t950: "#f6f8fa",
  t900: "#f0f4f8",
  t800: "#e6edf3",
  t700: "#d3dbe3",
  t600: "#b4bfca",
  t500: "#98a4b1",
};

const NEUTRAL = new Set(["gray", "slate", "zinc", "neutral", "stone"]);

/* Tailwind default palette (oklch literals) */
const themeCss = fs.readFileSync(path.join(ROOT, "node_modules/tailwindcss/theme.css"), "utf8");
const TW = {};
for (const m of themeCss.matchAll(/--color-([a-z]+)-(\d{2,3}):\s*([^;]+);/g)) {
  (TW[m[1]] ||= {})[m[2]] = m[3].trim();
}

/* project colour tokens from index.css @theme */
const BRAND = { amber: "#B5730B", "amber-soft": "#E8B768", "amber-tint": "#FBF1DF" };

/* ───────────────────────── helpers ───────────────────────── */
const esc = (s) => s.replace(/[^A-Za-z0-9_-]/g, (c) => "\\" + c);
const mix = (c, pct) => `color-mix(in oklab, ${c} ${pct}%, transparent)`;

function parseHex(h) {
  h = h.replace("#", "");
  if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join("");
  if (h.length !== 6 && h.length !== 8) return null;
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const L = (max + min) / 2;
  const C = max - min;
  let H = 0;
  if (C) {
    if (max === r) H = ((g - b) / C) % 6;
    else if (max === g) H = (b - r) / C + 2;
    else H = (r - g) / C + 4;
    H = Math.round(H * 60);
    if (H < 0) H += 360;
  }
  const S = C === 0 ? 0 : C / (1 - Math.abs(2 * L - 1));
  return { r, g, b, a, L, C, H, S };
}
const hsl = (h, s, l) => `hsl(${h} ${Math.round(s * 100)}% ${Math.round(l * 1000) / 10}%)`;
const withAlpha = (val, a) => (a < 1 ? mix(val, Math.round(a * 100)) : val);

/** Map an arbitrary colour (hex) for a role. Returns null when it should stay as is. */
function mapHex(hex, role) {
  const c = parseHex(hex);
  if (!c) return null;
  const { L, C, H, S, a } = c;
  let out = null;
  if (role === "surface") {
    if (L >= 0.8) {
      if (C < 0.045) {
        out = L >= 0.995 ? P.card : L >= 0.975 ? P.sunken : L >= 0.94 ? P.raised : L >= 0.88 ? P.raised2 : P.raised3;
      } else {
        out = hsl(H, 0.4, 0.12 + (1 - L) * 0.55);
      }
    }
  } else if (role === "line") {
    if (L >= 0.78) {
      if (C < 0.08) out = L >= 0.97 ? P.line1 : L >= 0.94 ? P.line2 : L >= 0.88 ? P.line3 : P.line4;
      else out = hsl(H, 0.3, 0.26);
    }
  } else if (role === "text") {
    if (L <= 0.58 && (S < 0.3 || L < 0.25)) {
      out = L <= 0.13 ? P.t900 : L <= 0.22 ? P.t800 : L <= 0.32 ? P.t700 : L <= 0.42 ? P.t600 : P.t500;
    } else if (L < 0.62 && S >= 0.25) {
      out = hsl(H, Math.min(S, 0.9), 0.68);
    }
  }
  return out ? withAlpha(out, a) : null;
}

/* ─────────────── class-token → dark value ─────────────── */
function roleOf(util) {
  if (util === "bg" || util === "from" || util === "via" || util === "to") return "surface";
  if (util === "text" || util === "fill" || util === "stroke") return "text";
  return "line"; // border*, divide, ring, outline
}

function mapNamed(role, name, shade) {
  // returns dark value or null
  if (name === "white") return role === "text" ? null : P.card;
  if (name === "black") return role === "text" ? P.t900 : null;
  if (name === "paper") return role === "surface" ? P.page : role === "line" ? P.line3 : P.t800;
  if (name === "hairline") return role === "text" ? null : role === "surface" ? P.raised2 : P.line3;
  if (name === "ink") return role === "text" ? P.t800 : null;
  if (name === "amber-tint") return role === "surface" ? mix(BRAND.amber, 18) : null;
  if (!shade) return null;

  if (NEUTRAL.has(name)) {
    const s = +shade;
    if (role === "surface") return { 50: P.sunken, 100: P.raised, 200: P.raised2, 300: P.raised3 }[s] ?? null;
    if (role === "line") return { 50: P.line1, 100: P.line2, 200: P.line3, 300: P.line4 }[s] ?? null;
    return { 500: P.t500, 600: P.t600, 700: P.t700, 800: P.t800, 900: P.t900, 950: P.t950 }[s] ?? null;
  }

  const fam = TW[name];
  if (!fam) return null;
  const s = +shade;
  if (role === "surface") {
    const pct = { 50: 14, 100: 20, 200: 28 }[s];
    return pct ? mix(fam["500"], pct) : null;
  }
  if (role === "line") {
    const pct = { 100: 26, 200: 32, 300: 42 }[s];
    return pct ? mix(fam["400"], pct) : null;
  }
  const to = { 600: "400", 700: "300", 800: "300", 900: "200" }[s];
  return to ? fam[to] : null;
}

/* ─────────────── variants → selector parts ─────────────── */
const MEDIA = { sm: "40rem", md: "48rem", lg: "64rem", xl: "80rem", "2xl": "96rem" };
const PSEUDO = {
  hover: ":hover",
  focus: ":focus",
  "focus-visible": ":focus-visible",
  "focus-within": ":focus-within",
  active: ":active",
  disabled: ":disabled",
  odd: ":nth-child(odd)",
  even: ":nth-child(even)",
  first: ":first-child",
  last: ":last-child",
  checked: ":checked",
};
const unknownVariants = new Map();

function buildSelector(variants, util, token) {
  let pre = "";
  let pseudo = "";
  let element = "";
  let media = null;
  for (const v of variants) {
    if (MEDIA[v]) media = MEDIA[v];
    else if (PSEUDO[v]) pseudo += PSEUDO[v];
    else if (v === "placeholder") element = "::placeholder";
    else if (v === "group-hover") pre = ".group:hover ";
    else if (v === "group-focus") pre = ".group:focus ";
    else {
      unknownVariants.set(v, (unknownVariants.get(v) || 0) + 1);
      return null;
    }
  }
  const base = `.dark ${pre}.${esc(token)}${LIGHT_ZONE}${pseudo}`;
  const sel = util === "divide" ? `${base} > :not(:last-child)` : `${base}${element}`;
  return { sel, media };
}

function propFor(util) {
  switch (util) {
    case "bg": return ["background-color"];
    case "text": return ["color"];
    case "fill": return ["fill"];
    case "stroke": return ["stroke"];
    case "ring": return ["--tw-ring-color"];
    case "outline": return ["outline-color"];
    case "from": return ["--tw-gradient-from"];
    case "via": return ["--tw-gradient-via"];
    case "to": return ["--tw-gradient-to"];
    case "divide": return ["border-color"];
    case "border": return ["border-color"];
    case "border-t": return ["border-top-color"];
    case "border-r": return ["border-right-color"];
    case "border-b": return ["border-bottom-color"];
    case "border-l": return ["border-left-color"];
    case "border-x": return ["border-left-color", "border-right-color"];
    case "border-y": return ["border-top-color", "border-bottom-color"];
    default: return null;
  }
}

/* ───────────────────────── scan sources ───────────────────────── */
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) {
      if (e.name !== "assets") walk(p);
    } else if (/\.(jsx?|css)$/.test(e.name) && p !== OUT) files.push(p);
  }
})(SRC);

const jsSrc = files.filter((f) => /\.jsx?$/.test(f)).map((f) => fs.readFileSync(f, "utf8")).join("\n");

const COLOR_NAMES =
  "white|black|ink|paper|hairline|amber-tint|(?:gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\\d{2,3}|\\[#[0-9a-fA-F]{3,8}\\]";
const TOKEN_RE = new RegExp(
  `(?<![\\w\\-:\\[\\]#/.])((?:[a-z0-9\\-]+:)*)(bg|text|border-[trblxy]|border|divide|ring|outline|from|via|to|fill|stroke)-(${COLOR_NAMES})(?:/(\\d{1,3}))?(?![\\w\\-])`,
  "g"
);

const rules = new Map(); // key = media||'' -> Set of css strings
const addRule = (media, css) => {
  const k = media || "";
  if (!rules.has(k)) rules.set(k, new Set());
  rules.get(k).add(css);
};

let tokenCount = 0;
let passCount = 0;
function origValue(colorRaw, alphaRaw) {
  let v;
  if (colorRaw === "white") v = "#fff";
  else if (colorRaw === "black") v = "#000";
  else if (colorRaw.startsWith("[#")) v = colorRaw.slice(1, -1);
  else v = `var(--color-${colorRaw})`;
  return alphaRaw ? mix(v, +alphaRaw) : v;
}
const seenTokens = new Set();
for (const m of jsSrc.matchAll(TOKEN_RE)) {
  const [full, variantStr, util, colorRaw, alphaRaw] = m;
  const token = full;
  if (seenTokens.has(token)) continue;
  seenTokens.add(token);
  const variants = variantStr ? variantStr.slice(0, -1).split(":") : [];
  if (variants.includes("dark") || variants.includes("print")) continue;

  const role = roleOf(util);
  let value = null;
  if (colorRaw.startsWith("[#")) {
    value = mapHex(colorRaw.slice(1, -1), role);
  } else {
    const dm = colorRaw.match(/^([a-z\-]+?)-(\d{2,3})$/);
    value = dm && !["amber-tint"].includes(colorRaw) ? mapNamed(role, dm[1], dm[2]) : mapNamed(role, colorRaw, null);
  }
  if (!value) {
    // Unmapped colour used in a hover/focus/active/... state: a mapped base class
    // (e.g. `.dark .bg-white`) has higher specificity than the plain state utility,
    // so re-assert the original colour at state level or the state would be lost.
    if (variants.length && variants.every((v) => PSEUDO[v] || v.startsWith("group-") || MEDIA[v] || v === "placeholder")) {
      const orig = origValue(colorRaw, alphaRaw);
      const props = propFor(util);
      const built = buildSelector(variants, util, token);
      if (orig && props && built) {
        addRule(built.media, `${built.sel} { ${props.map((p) => `${p}: ${orig}`).join("; ")}; }`);
        passCount++;
      }
    }
    continue;
  }

  if (alphaRaw) {
    const a = +alphaRaw;
    // translucent white/gray overlays on top of coloured things (bg-white/10 …) stay as they are
    if (role === "surface" && a < 40 && /^(white|black)$/.test(colorRaw)) continue;
    value = mix(value, a);
  }

  const props = propFor(util);
  if (!props) continue;
  const built = buildSelector(variants, util, token);
  if (!built) continue;
  const decl = props.map((p) => `${p}: ${value}`).join("; ");
  addRule(built.media, `${built.sel} { ${decl}; }`);
  tokenCount++;
}

/* ───────────── inline style={{ … }} colours ───────────── */
const rgbStr = (hex) => {
  const c = parseHex(hex);
  return c ? `rgb(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)})` : null;
};
const inline = new Map(); // `${kind}|${rgb}` -> value
const HEX = "#[0-9a-fA-F]{3,6}";
const STYLE_RE = new RegExp(
  `\\b(background|backgroundColor|color|borderColor|border|borderTop|borderBottom|borderLeft|borderRight)\\s*:\\s*(["'\`])((?:[^"'\`$]*?\\s)?(?:${HEX}|white))\\2`,
  "g"
);
for (const m of jsSrc.matchAll(STYLE_RE)) {
  const [, prop, , val] = m;
  const colorPart = val.trim().split(/\s+/).pop();
  const isBorder = /^border/.test(prop) && prop !== "borderColor";
  if (isBorder && !/solid|dashed/.test(val)) continue;
  const hex = colorPart === "white" ? "#ffffff" : colorPart;
  if (!/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(hex)) continue;
  const role = prop === "color" ? "text" : prop.startsWith("border") ? "line" : "surface";
  const mapped = mapHex(hex, role);
  if (!mapped) continue;
  const forms = colorPart === "white" ? ["white", rgbStr(hex)] : [rgbStr(hex)];
  for (const f of forms) inline.set(`${role}|${f}`, mapped);
}
let inlineCount = 0;
for (const [k, mapped] of inline) {
  const [role, f] = k.split("|");
  const z = LIGHT_ZONE;
  let css;
  if (role === "surface") {
    css = `.dark [style*="background: ${f}"]${z}, .dark [style*="background-color: ${f}"]${z} { background-color: ${mapped} !important; }`;
  } else if (role === "text") {
    css = `.dark [style^="color: ${f}"]${z}, .dark [style*="; color: ${f}"]${z} { color: ${mapped} !important; }`;
  } else {
    css = `.dark [style*="solid ${f}"]${z}, .dark [style*="dashed ${f}"]${z}, .dark [style*="border-color: ${f}"]${z} { border-color: ${mapped} !important; }`;
  }
  addRule(null, css);
  inlineCount++;
}

/* ───────────── hard-coded colours in plain .css files ───────────── */
function stripComments(s) { return s.replace(/\/\*[\s\S]*?\*\//g, ""); }
let cssRuleCount = 0;
for (const f of files.filter((x) => x.endsWith(".css"))) {
  const css = stripComments(fs.readFileSync(f, "utf8"));
  let depth = 0, buf = "", sel = "";
  const blocks = [];
  for (const ch of css) {
    if (ch === "{") {
      if (depth === 0) { sel = buf.trim(); buf = ""; } else buf += ch;
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0) { blocks.push([sel, buf]); buf = ""; } else buf += ch;
    } else buf += ch;
  }
  for (const [selector, body] of blocks) {
    if (!selector || selector.startsWith("@") || /^(from|to|\d+%)/.test(selector)) continue;
    const out = [];
    for (const decl of body.split(";")) {
      const i = decl.indexOf(":");
      if (i < 0) continue;
      const prop = decl.slice(0, i).trim();
      const val = decl.slice(i + 1).trim();
      if (/gradient|url\(/.test(val)) continue;
      const role = prop === "color" ? "text" : /^background/.test(prop) ? "surface" : /^(border|outline)/.test(prop) ? "line" : null;
      if (!role) continue;
      let changed = false;
      const nv = val.replace(/#[0-9a-fA-F]{3,8}\b/g, (h) => {
        const mp = mapHex(h, role);
        if (mp) { changed = true; return mp; }
        return h;
      });
      if (changed) out.push(`${prop}: ${nv}`);
    }
    if (out.length) {
      const sels = selector.split(",").map((s) => `.dark ${s.trim()}`).join(", ");
      addRule(null, `${sels} { ${out.join("; ")}; }`);
      cssRuleCount++;
    }
  }
}

/* ───────────────────────── write output ───────────────────────── */
let css = `/* AUTO-GENERATED by scripts/gen-dark-css.mjs - do not edit by hand.
 * Re-generate with:  npm run theme:gen
 * ${tokenCount} utility overrides, ${passCount} state pass-throughs, ${inlineCount} inline-style overrides, ${cssRuleCount} css-file overrides
 */
:root { color-scheme: light; }
.dark { color-scheme: dark; }
html.dark body { background-color: ${P.page}; color: ${P.t800}; }
html.dark ::placeholder { color: ${P.t500}; opacity: 0.8; }
html.dark ::selection { background: rgba(96, 165, 250, 0.35); }
html.dark { scrollbar-color: ${P.line4} ${P.page}; }

`;
for (const [media, set] of [...rules.entries()].sort((a, b) => (a[0] === "" ? -1 : b[0] === "" ? 1 : parseFloat(a[0]) - parseFloat(b[0])))) {
  const body = [...set].join("\n");
  css += media ? `@media (min-width: ${media}) {\n${body}\n}\n\n` : `${body}\n\n`;
}
fs.writeFileSync(OUT, css);
console.log(`[theme] wrote ${path.relative(ROOT, OUT)} - ${tokenCount} utilities, ${passCount} state pass-throughs, ${inlineCount} inline, ${cssRuleCount} css rules`);
if (unknownVariants.size) console.log("[theme] skipped unknown variants:", Object.fromEntries(unknownVariants));
