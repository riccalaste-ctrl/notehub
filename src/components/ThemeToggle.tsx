"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid Hydration Mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl bg-white/5 dark:bg-black/20 border border-black/10 dark:border-white/10 flex items-center justify-center animate-pulse" />
    );
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="relative w-10 h-10 rounded-xl bg-white/40 dark:bg-black/40 hover:bg-white/60 dark:hover:bg-black/60 border border-black/10 dark:border-white/10 flex items-center justify-center transition-all overflow-hidden group"
      aria-label="Toggle theme"
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <Sun className="absolute size-5 text-amber-500 transition-all duration-500 scale-100 rotate-0 dark:scale-0 dark:-rotate-90 group-hover:text-amber-600" />
        <Moon className="absolute size-5 text-neon-blue transition-all duration-500 scale-0 rotate-90 dark:scale-100 dark:rotate-0 group-hover:text-blue-400" />
      </div>
    </button>
  );
}
