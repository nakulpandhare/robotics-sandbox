import { useState } from "react";

export default function ChallengeBrief({ challenge, hintsUsed, onRevealHint }) {
  if (!challenge) return null;

  const hints = challenge.hints || [];
  const tags  = challenge.tags  || [];

  return (
    <div style={{
      width: 280, flexShrink: 0,
      borderRight: "1px solid #222",
      display: "flex", flexDirection: "column",
      background: "#0d0d0d", overflow: "hidden"
    }}>

      {/* Header */}
      <div style={{
        padding: "14px 16px",
        borderBottom: "1px solid #1a1a1a",
        flexShrink: 0
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: "2px 8px",
            borderRadius: 4, background: "rgba(93,202,165,0.12)",
            color: "#5DCAA5", letterSpacing: "0.05em"
          }}>
            {challenge.id}
          </span>
          <span style={{ fontSize: 10, color: "#5a5e56" }}>
            Track {challenge.track} · Challenge {challenge.order}
          </span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 500, color: "#f0f1ee", marginBottom: 4 }}>
          {challenge.title}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {tags.slice(0, 3).map(tag => (
            <span key={tag} style={{
              fontSize: 10, padding: "1px 6px", borderRadius: 3,
              background: "#1a1a1a", color: "#7c8079",
              fontFamily: "monospace", border: "0.5px solid #2a2a2a"
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Description */}
        <div>
          <div style={{ fontSize: 10, color: "#5a5e56", letterSpacing: "0.08em", marginBottom: 6 }}>
            OBJECTIVE
          </div>
          <p style={{ fontSize: 13, color: "#9a9d95", lineHeight: 1.65, margin: 0 }}>
            {challenge.description}
          </p>
        </div>

        {/* Workshop link callout */}
        {challenge.workshop_link && (
          <div style={{
            background: "rgba(93,202,165,0.06)",
            border: "0.5px solid rgba(93,202,165,0.2)",
            borderLeft: "2px solid #5DCAA5",
            borderRadius: "0 4px 4px 0",
            padding: "10px 12px"
          }}>
            <div style={{
              fontSize: 10, fontWeight: 600, color: "#5DCAA5",
              letterSpacing: "0.08em", marginBottom: 5,
              display: "flex", alignItems: "center", gap: 5
            }}>
              🔧 WORKSHOP LINK
            </div>
            <p style={{ fontSize: 12, color: "#7c8079", lineHeight: 1.6, margin: 0 }}>
              {challenge.workshop_link}
            </p>
          </div>
        )}

        {/* Concept */}
        {challenge.concept && (
          <div style={{
            background: "#111", border: "0.5px solid #222",
            borderRadius: 6, padding: "8px 10px"
          }}>
            <div style={{ fontSize: 10, color: "#5a5e56", letterSpacing: "0.08em", marginBottom: 3 }}>
              CONCEPT
            </div>
            <div style={{ fontSize: 12, color: "#85B7EB", fontFamily: "monospace" }}>
              {challenge.concept}
            </div>
          </div>
        )}

        {/* Scoring */}
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1, background: "#111", border: "0.5px solid #222", borderRadius: 6, padding: "8px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#f59e0b" }}>{challenge.points_max}</div>
            <div style={{ fontSize: 10, color: "#5a5e56", marginTop: 1 }}>max points</div>
          </div>
          <div style={{ flex: 1, background: "#111", border: "0.5px solid #222", borderRadius: 6, padding: "8px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#5DCAA5" }}>{challenge.pass_threshold}+</div>
            <div style={{ fontSize: 10, color: "#5a5e56", marginTop: 1 }}>to pass</div>
          </div>
          {challenge.is_boss && (
            <div style={{ flex: 1, background: "rgba(245,158,11,0.08)", border: "0.5px solid rgba(245,158,11,0.3)", borderRadius: 6, padding: "8px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 16 }}>🏆</div>
              <div style={{ fontSize: 10, color: "#f59e0b", marginTop: 1 }}>boss</div>
            </div>
          )}
        </div>

        {/* Hints */}
        <div>
          <div style={{
            fontSize: 10, color: "#5a5e56", letterSpacing: "0.08em",
            marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <span>HINTS</span>
            <span>{hintsUsed}/{hints.length} revealed</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {hints.map((hint, i) => {
              const revealed = i < hintsUsed;
              const cost     = i === 0 ? 0 : i === 1 ? 10 : 20;
              const isNext   = i === hintsUsed;

              if (revealed) {
                return (
                  <div key={i} style={{
                    padding: "8px 10px", borderRadius: 6,
                    background: "#0f1210",
                    border: "0.5px solid #1e2421",
                    fontSize: 12, color: "#9a9d95", lineHeight: 1.5
                  }}>
                    <span style={{ color: "#f59e0b", marginRight: 5 }}>💡</span>
                    {hint}
                  </div>
                );
              }

              if (isNext) {
                return (
                  <button
                    key={i}
                    onClick={() => onRevealHint(i, cost)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "8px 10px", borderRadius: 6,
                      background: "transparent",
                      border: "0.5px dashed #2a2a2a",
                      cursor: "pointer", textAlign: "left", width: "100%"
                    }}
                  >
                    <span style={{ fontSize: 12 }}>🔒</span>
                    <span style={{ flex: 1, fontSize: 12, color: "#5a5e56" }}>
                      {cost === 0 ? "Reveal first hint (free)" : `Reveal hint ${i + 1}`}
                    </span>
                    {cost > 0 && (
                      <span style={{
                        fontSize: 10, padding: "1px 6px", borderRadius: 3,
                        background: "rgba(245,158,11,0.12)",
                        color: "#f59e0b", border: "0.5px solid rgba(245,158,11,0.2)"
                      }}>
                        -{cost} pts
                      </span>
                    )}
                  </button>
                );
              }

              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 10px", borderRadius: 6,
                  border: "0.5px dashed #1a1a1a", opacity: 0.4
                }}>
                  <span style={{ fontSize: 12 }}>🔒</span>
                  <span style={{ fontSize: 12, color: "#5a5e56" }}>Hint {i + 1} locked</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}