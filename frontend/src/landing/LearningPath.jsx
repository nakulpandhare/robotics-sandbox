const STEPS = [
  { n: "01", title: "Sequencing", desc: "Commands run in order, one after another." },
  { n: "02", title: "Loops", desc: "Repeat a pattern without copy-pasting code." },
  { n: "03", title: "Conditionals", desc: "React to sensors — if this, then that." },
  { n: "04", title: "Functions", desc: "Name a behavior once, reuse it everywhere." },
];

export default function LearningPath() {
  return (
    <div style={{ padding: "56px 36px" }}>
      <div style={{
        fontFamily: "monospace", fontSize: 11, color: "var(--term-accent)",
        marginBottom: 8, letterSpacing: "0.05em"
      }}>
        // THE LEARNING PATH
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 500, color: "var(--term-text)", margin: "0 0 36px" }}>
        Every challenge builds on the last
      </h2>
      <div style={{ display: "flex", alignItems: "stretch", maxWidth: 760 }}>
        {STEPS.map((s, i) => (
          <div
            key={s.n}
            style={{
              flex: 1, border: "0.5px solid " + (i === 0 ? "var(--term-accent)" : "var(--term-border)"),
              borderRadius: 8, padding: 18,
              marginRight: i < STEPS.length - 1 ? 14 : 0,
              background: "var(--term-surface)"
            }}
          >
            <div style={{ fontFamily: "monospace", fontSize: 10, color: "var(--term-line-num)", marginBottom: 10 }}>
              {s.n}
            </div>
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--term-text)", margin: "0 0 6px" }}>
              {s.title}
            </p>
            <p style={{ fontSize: 12, color: "var(--term-text-dim)", lineHeight: 1.6, margin: 0 }}>
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}