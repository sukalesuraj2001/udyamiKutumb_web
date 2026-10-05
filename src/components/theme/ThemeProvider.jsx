import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ThemeContext,
  THEME_MODES,
  THEME_STORAGE_KEY,
  applyTheme,
  readStoredMode,
  systemPrefersDark,
} from "./themeContext.js";

export default function ThemeProvider({ children }) {
  const [mode, setModeState] = useState(readStoredMode);
  const [systemDark, setSystemDark] = useState(systemPrefersDark);

  // Follow the OS setting live (only matters while mode === "system").
  useEffect(() => {
    let mq;
    try {
      mq = window.matchMedia("(prefers-color-scheme: dark)");
    } catch {
      return undefined;
    }
    const onChange = (e) => setSystemDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Keep several open tabs in sync.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === THEME_STORAGE_KEY) setModeState(readStoredMode());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const resolved = mode === "system" ? (systemDark ? "dark" : "light") : mode;

  useEffect(() => {
    applyTheme(resolved);
  }, [resolved]);

  const setMode = useCallback((next) => {
    if (!THEME_MODES.includes(next)) return;
    setModeState(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* private mode / storage blocked - theme still works for this session */
    }
  }, []);

  const value = useMemo(() => ({ mode, resolved, setMode }), [mode, resolved, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
