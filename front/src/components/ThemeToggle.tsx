"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect } from "react";
import { Button } from "./ui/button";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "d" && (e.metaKey || e.shiftKey)) {
        e.preventDefault();
        toggleTheme();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleTheme]);

  return (
    <Button
      variant="ghost"
      onClick={toggleTheme}
      className="hover:bg-accent aria-expanded:bg-accent dark:hover:bg-accent/50"
    >
      <Sun className="scale-100 transition-all dark:scale-0" />
      <Moon className="absolute scale-0 transition-all dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};
export default ThemeToggle;
