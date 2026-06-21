import ThemeToggle from "./theme/ThemeToggle";
import TerminalHero from "./landing/TerminalHero";
import LearningPath from "./landing/LearningPath";

export default function LandingPage({ onStart }) {
  return (
    <div style={{ background: "var(--term-bg)", minHeight: "100vh", fontFamily: "var(--font-sans, sans-serif)" }}>

      {/* Nav */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 36px", borderBottom: "0.5px solid var(--term-border)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "monospace", fontSize: 14, color: "var(--term-text)" }}>
          <span style={{ color: "var(--term-accent)" }}>&lt;</span>
          robotics-sandbox
          <span style={{ color: "var(--term-accent)" }}>/&gt;</span>
        </div>
        <div style={{ display: "flex", gap: 28, fontFamily: "monospace", fontSize: 12, color: "var(--term-text-dim)" }}>
          <span style={{ cursor: "pointer" }}>challenges</span>
          <span style={{ cursor: "pointer" }}>curriculum</span>
          <span style={{ cursor: "pointer" }}>teachers</span>
          <span style={{ cursor: "pointer" }}>docs</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <ThemeToggle />
          <button style={{
            fontFamily: "monospace", fontSize: 12, color: "var(--term-accent-dark)",
            background: "var(--term-accent)", border: "none", borderRadius: 6,
            padding: "7px 14px", cursor: "pointer"
          }}>
            sign in
          </button>
        </div>
      </div>

      <TerminalHero onStart={onStart} />

      {/* Stats strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", borderBottom: "0.5px solid var(--term-border)" }}>
        {[["12", "guided challenges"], ["0min", "setup required"], ["100%", "runs in-browser"]].map(([num, label], i) => (
          <div
            key={label}
            style={{
              padding: "20px 28px", fontFamily: "monospace",
              borderRight: i < 2 ? "0.5px solid var(--term-border)" : "none"
            }}
          >
            <div style={{ fontSize: 22, color: "var(--term-text)", marginBottom: 2 }}>{num}</div>
            <div style={{ fontSize: 11, color: "var(--term-text-faint)" }}>{label}</div>
          </div>
        ))}
      </div>

      <LearningPath />

      {/* Footer CTA */}
      <div style={{ textAlign: "center", padding: "64px 36px", borderTop: "0.5px solid var(--term-border)" }}>
        <p style={{ fontFamily: "monospace", fontSize: 22, color: "var(--term-text)", margin: "0 0 20px" }}>
          $ ./start_first_challenge.py
        </p>
        <button
          onClick={onStart}
          style={{
            fontFamily: "monospace", margin: "0 auto", background: "var(--term-accent)",
            color: "var(--term-accent-dark)", border: "none", borderRadius: 6,
            padding: "11px 22px", fontSize: 13, fontWeight: 500, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8
          }}
        >
          Open the sandbox →
        </button>
      </div>

    </div>
  );
}