export default function ScorePanel({ score }) {
  if (!score) return null;

  const { passed, breakdown, message, time_taken, par_time } = score;

  return (
    <div style={{
      padding: "14px 20px",
      background: passed ? "#052e16" : "#2a0a0a",
      borderTop: "1px solid " + (passed ? "#166534" : "#500"),
      flexShrink: 0,
    }}>
      {/* Top row: result + total score */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: passed ? "#22c55e" : "#f87171" }}>
          {passed ? `${breakdown.total}` : "0"}
          <span style={{ fontSize: 13, fontWeight: 400, color: "#555", marginLeft: 4 }}>/100</span>
        </span>
        <span style={{ fontSize: 13, color: passed ? "#86efac" : "#fca5a5" }}>
          {message}
        </span>
      </div>

      {/* Score breakdown */}
      {passed && (
        <div style={{ display: "flex", gap: 24, fontSize: 12 }}>
          <div>
            <span style={{ color: "#444" }}>Completion  </span>
            <span style={{ color: "#22c55e", fontWeight: 600 }}>+{breakdown.completion}</span>
          </div>
          <div>
            <span style={{ color: "#444" }}>Time bonus  </span>
            <span style={{ color: "#4ade80", fontWeight: 600 }}>+{breakdown.time_bonus}</span>
          </div>
          <div>
            <span style={{ color: "#444" }}>Time  </span>
            <span style={{ color: "#86efac" }}>{time_taken}s</span>
            <span style={{ color: "#333" }}> / par {par_time}s</span>
          </div>
        </div>
      )}
    </div>
  );
}