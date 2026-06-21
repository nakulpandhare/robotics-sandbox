import { useTheme } from "./ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      style={{
        display: "flex", alignItems: "center",
        border: "0.5px solid var(--border-secondary)",
        borderRadius: 20, padding: 3, width: 52, height: 28,
        background: "var(--bg-tertiary)", cursor: "pointer",
        justifyContent: isDark ? "flex-end" : "flex-start",
      }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: "50%",
        background: "var(--bg-primary)", display: "flex",
        alignItems: "center", justifyContent: "center", fontSize: 11,
        color: "var(--text-secondary)"
      }}>
        {isDark ? "🌙" : "☀️"}
      </div>
    </button>
  );
}