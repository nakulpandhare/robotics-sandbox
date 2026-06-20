import { useRef } from "react";
import html2canvas from "html2canvas";

export default function ShareCard({ score, challengeName, canvasRef }) {
  const cardRef = useRef(null);

  async function handleDownload() {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { backgroundColor: "#0f0f0f" });
    const link = document.createElement("a");
    link.download = `robotics-sandbox-${challengeName.replace(/\s/g, "-")}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }

  if (!score || !score.passed) return null;

  return (
    <div>
      <div
        ref={cardRef}
        style={{
          background: "#0f0f0f", border: "1px solid #222", borderRadius: 12,
          padding: 24, width: 360, fontFamily: "monospace"
        }}
      >
        <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>🤖 ROBOTICS SANDBOX</div>
        <div style={{ fontSize: 14, color: "#ccc", marginBottom: 16 }}>{challengeName}</div>
        <div style={{ fontSize: 40, fontWeight: 700, color: "#22c55e", lineHeight: 1 }}>
          {score.breakdown.total}
          <span style={{ fontSize: 16, color: "#444" }}>/100</span>
        </div>
        <div style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
          Completed in {score.time_taken}s
        </div>
      </div>
      <button
        onClick={handleDownload}
        style={{
          marginTop: 10, background: "#1a1a1a", color: "#eee", border: "1px solid #333",
          borderRadius: 6, padding: "6px 14px", fontSize: 12, cursor: "pointer"
        }}
      >
        📥 Download share card
      </button>
    </div>
  );
}