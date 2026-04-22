import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { STORAGE_KEYS } from "../lib/constants";

const STORAGE_KEY = STORAGE_KEYS.THEME;

export const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem(STORAGE_KEY) || "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return (
    <div
      className="glass rounded-full p-1 flex items-center gap-1"
      data-testid="theme-toggle-group"
    >
      <button
        type="button"
        aria-label="Light mode"
        onClick={() => setTheme("light")}
        data-testid="theme-toggle-light"
        className={`h-9 w-9 rounded-full grid place-items-center transition-all ${
          theme === "light"
            ? "bg-white/80 text-amber-500 shadow-inner"
            : "text-foreground/60 hover:text-foreground"
        }`}
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Dark mode"
        onClick={() => setTheme("dark")}
        data-testid="theme-toggle-dark"
        className={`h-9 w-9 rounded-full grid place-items-center transition-all ${
          theme === "dark"
            ? "bg-white/15 text-indigo-200 shadow-inner"
            : "text-foreground/60 hover:text-foreground"
        }`}
      >
        <Moon className="h-4 w-4" />
      </button>
    </div>
  );
};

export default ThemeToggle;
