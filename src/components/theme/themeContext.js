import { createContext } from "react";

export const THEME_STORAGE_KEY = "udyami-theme";
export const THEME_MODES = ["light", "dark", "system"];

export const ThemeContext = createContext({
  mode: "system",
  resolved: "light",
  setMode: () => { },
});

export function readStoredMode() {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    return THEME_MODES.includes(v) ? v : "system";
  } catch {
    return "system";
  }
}

export function systemPrefersDark() {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}

/** Apply a resolved theme ("light" | "dark") to <html>. */
export function applyTheme(resolved) {
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  // daisyUI components read data-theme
  root.setAttribute("data-theme", resolved);
  root.style.colorScheme = resolved;
}
