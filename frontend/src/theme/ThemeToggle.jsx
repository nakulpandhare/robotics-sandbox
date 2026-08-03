import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeContext";

export default function ThemeToggle({ size = "md" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      className={`theme-toggle theme-toggle--${size} ${isDark ? "theme-toggle--dark" : ""}`}
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="theme-toggle__dot">
        {isDark ? <Moon /> : <Sun />}
      </span>
    </button>
  );
}
