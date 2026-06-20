import { useRef } from "react";
import html2canvas from "html2canvas";

export default function ResultsDrawer({
  isOpen, onClose, score, challengeName,
  user, botName, setBotName, onSaveBot,
  myBots, onLoadBot, onTogglePublic,
  gallery, onLoadGalleryCode
}) {
  const cardRef = useRef(null);

  async function handleDownload() {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { backgroundColor: "#0f0f0f" });
    const link = document.createElement("a");
    link.download = `robotics-sandbox-${challengeName.replace(/\s/g, "-")}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }

  if (!isOpen) return null;

  return (
    <div style={{
      position: "absolute", top: 0, right: 0, bottom: 0,
      width: 340, background: "#0d0d0d", borderLeft: "1px solid #222",
      display: "flex", flexDirection: "column", zIndex: 10
    }}>
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "12px 16px", borderBottom: "1px solid #1a1a1a", flexShrink: 0
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#eee" }}>🎉 Results</span>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 16 }}
        >
          ✕
        </button>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Score breakdown */}
        {score ? (
          <div style={{
            padding: 14, borderRadius: 8,
            background: score.passed ? "#052e16" : "#2a0a0a",
            border: "1px solid " + (score.passed ? "#166534" : "#500")
          }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 26, fontWeight: 700, color: score.passed ? "#22c55e" : "#f87171" }}>
                {score.passed ? score.breakdown.total : 0}
              </span>
              <span style={{ fontSize: 12, color: "#555" }}>/100</span>
            </div>
            <div style={{ fontSize: 12, color: score.passed ? "#86efac" : "#fca5a5", marginBottom: 10 }}>
              {score.message}
            </div>
            {score.passed && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11 }}>
                <div><span style={{ color: "#444" }}>Completion </span><span style={{ color: "#22c55e" }}>+{score.breakdown.completion}</span></div>
                <div><span style={{ color: "#444" }}>Time bonus </span><span style={{ color: "#4ade80" }}>+{score.breakdown.time_bonus}</span></div>
                <div><span style={{ color: "#444" }}>Time </span><span style={{ color: "#86efac" }}>{score.time_taken}s</span><span style={{ color: "#333" }}> / par {score.par_time}s</span></div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: "#444" }}>Run your code to see results here.</div>
        )}

        {/* Share card */}
        {score?.passed && (
          <div>
            <div style={{ fontSize: 11, color: "#444", marginBottom: 8, letterSpacing: "0.08em" }}>SHARE</div>
            <div
              ref={cardRef}
              style={{
                background: "#0f0f0f", border: "1px solid #222", borderRadius: 10,
                padding: 18, fontFamily: "monospace"
              }}
            >
              <div style={{ fontSize: 11, color: "#666", marginBottom: 6 }}>🤖 ROBOTICS SANDBOX</div>
              <div style={{ fontSize: 12, color: "#ccc", marginBottom: 12 }}>{challengeName}</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: "#22c55e", lineHeight: 1 }}>
                {score.breakdown.total}<span style={{ fontSize: 14, color: "#444" }}>/100</span>
              </div>
              <div style={{ fontSize: 11, color: "#666", marginTop: 6 }}>
                Completed in {score.time_taken}s
              </div>
            </div>
            <button
              onClick={handleDownload}
              style={{
                marginTop: 8, background: "#1a1a1a", color: "#eee", border: "1px solid #333",
                borderRadius: 6, padding: "6px 12px", fontSize: 11, cursor: "pointer", width: "100%"
              }}
            >
              📥 Download share card
            </button>
          </div>
        )}

        {/* Save bot */}
        {user && (
          <div>
            <div style={{ fontSize: 11, color: "#444", marginBottom: 8, letterSpacing: "0.08em" }}>SAVE BOT</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input
                value={botName}
                onChange={e => setBotName(e.target.value)}
                placeholder="Name this bot..."
                style={{
                  background: "#161616", border: "1px solid #2a2a2a", borderRadius: 6,
                  padding: "6px 10px", color: "#eee", fontSize: 12, fontFamily: "monospace"
                }}
              />
              <button
                onClick={onSaveBot}
                disabled={!botName.trim()}
                style={{
                  background: "#14532d", color: "#86efac", border: "1px solid #166534",
                  borderRadius: 6, padding: "6px 14px", fontSize: 12, cursor: "pointer"
                }}
              >
                Save bot
              </button>

              {myBots.length > 0 && (
                <select
                  defaultValue=""
                  onChange={e => {
                    const bot = myBots.find(b => b.id === e.target.value);
                    if (bot) onLoadBot(bot.code);
                  }}
                  style={{
                    background: "#161616", border: "1px solid #2a2a2a", borderRadius: 6,
                    padding: "6px 10px", color: "#888", fontSize: 12
                  }}
                >
                  <option value="">Load saved bot...</option>
                  {myBots.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              )}

              {myBots.length > 0 && (
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#666" }}>
                  <input type="checkbox" onChange={e => onTogglePublic(e.target.checked)} />
                  Make latest bot public
                </label>
              )}
            </div>
          </div>
        )}

        {/* Public gallery */}
        {gallery.length > 0 && (
          <div>
            <div style={{ fontSize: 11, color: "#444", marginBottom: 8, letterSpacing: "0.08em" }}>PUBLIC GALLERY</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {gallery.map(bot => (
                <button
                  key={bot.id}
                  onClick={() => onLoadGalleryCode(bot.code)}
                  style={{
                    background: "#141414", border: "1px solid #222",
                    borderRadius: 8, padding: "8px 12px", cursor: "pointer", textAlign: "left"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    {bot.profiles?.avatar_url && (
                      <img src={bot.profiles.avatar_url} alt="" style={{ width: 16, height: 16, borderRadius: "50%" }} />
                    )}
                    <span style={{ fontSize: 10, color: "#666" }}>{bot.profiles?.username || "anon"}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#86efac" }}>{bot.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}