import { useTheme } from "./ThemeContext";

export default function ThemeToggle({ size = "md" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const dim = size === "sm" ? 28 : 34;
  const dotSize = size === "sm" ? 18 : 22;
  const fontSize = size === "sm" ? 11 : 13;

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        display: "flex", alignItems: "center",
        width: dim + 18, height: dim,
        borderRadius: dim,
        background: isDark ? "#2a2a28" : "#f4f0e8",
        border: `1px solid ${isDark ? "#3a3a38" : "#e8e4dc"}`,
        padding: 4,
        cursor: "pointer",
        justifyContent: isDark ? "flex-end" : "flex-start",
        flexShrink: 0,
        transition: "all 0.2s ease",
      }}
    >
      <div style={{
        width: dotSize, height: dotSize,
        borderRadius: "50%",
        background: isDark ? "#2a2a28" : "#ffffff",
        border: `1px solid ${isDark ? "#4a4a48" : "#e8e4dc"}`,
        display: "flex", alignItems: "center",
        justifyContent: "center", fontSize,
        boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
        transition: "all 0.2s ease",
      }}>
        {isDark ? "🌙" : "☀️"}
      </div>
    </button>
  );
}
