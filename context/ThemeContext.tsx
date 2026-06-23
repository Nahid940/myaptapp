import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

type Mode = "light" | "dark";

export type ThemeColors = {
  bg: string;
  card: string;
  cardAlt: string; // tinted header card
  text: string;
  muted: string;
  border: string;
  inputBg: string;
  primary: string;
};

const LIGHT: ThemeColors = {
  bg: "#f1f5f9",
  card: "#ffffff",
  cardAlt: "#eef5ff",
  text: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  inputBg: "#f8fafc",
  primary: "#159df8",
};

const DARK: ThemeColors = {
  bg: "#0b1220",
  card: "#1e293b",
  cardAlt: "#162338",
  text: "#f1f5f9",
  muted: "#94a3b8",
  border: "#334155",
  inputBg: "#0f1b2d",
  primary: "#3aa9f0",
};

type ThemeContextType = {
  mode: Mode;
  isDark: boolean;
  colors: ThemeColors;
  toggle: () => void;
  setMode: (m: Mode) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setModeState] = useState<Mode>("light");

  useEffect(() => {
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync("theme_mode");
        if (saved === "dark" || saved === "light") setModeState(saved);
      } catch {}
    })();
  }, []);

  const setMode = (m: Mode) => {
    setModeState(m);
    SecureStore.setItemAsync("theme_mode", m).catch(() => {});
  };

  const toggle = () => setMode(mode === "dark" ? "light" : "dark");

  const colors = mode === "dark" ? DARK : LIGHT;

  return (
    <ThemeContext.Provider value={{ mode, isDark: mode === "dark", colors, toggle, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
