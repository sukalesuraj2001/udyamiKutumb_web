import { useContext } from "react";
import { ThemeContext } from "./themeContext.js";

/** { mode: "light"|"dark"|"system", resolved: "light"|"dark", setMode(mode) } */
export default function useTheme() {
  return useContext(ThemeContext);
}
