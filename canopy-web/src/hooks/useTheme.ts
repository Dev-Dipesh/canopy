import { useEffect, useCallback, useMemo } from "react";
import type { ThemeMode } from "../types";
import { useLocalStorage } from "./useLocalStorage";

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function useTheme() {
  const [mode, setMode] = useLocalStorage<ThemeMode>("theme", "system");

  const resolved = useMemo(
    () => (mode === "system" ? getSystemTheme() : mode),
    [mode]
  );

  useEffect(() => {
    const root = document.documentElement;
    if (resolved === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [resolved]);

  // Listen for system theme changes when in "system" mode
  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setMode("system"); // triggers re-render
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mode, setMode]);

  const cycle = useCallback(() => {
    setMode((prev) => {
      if (prev === "light") return "dark";
      if (prev === "dark") return "system";
      return "light";
    });
  }, [setMode]);

  return { mode, resolved, setMode, cycle };
}
