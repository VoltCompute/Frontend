import { createContext, useContext, useEffect, type ReactNode } from "react";

type Theme = "light";
const theme: Theme = "light";
const ThemeCtx = createContext<{ theme: Theme }>({ theme });

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
    try { localStorage.removeItem("vc-theme"); } catch {}
  }, []);

  return <ThemeCtx.Provider value={{ theme }}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
