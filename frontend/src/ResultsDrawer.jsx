import { useRef } from "react";
import html2canvas from "html2canvas";

export default function ResultsDrawer({
  isOpen, onClose, score, challenge, nextChallenge,
  user, botName, setBotName, onSaveBot,
  myBots, onLoadBot, onTogglePublic,
  gallery, onLoadGalleryCode, onGoNext, onRetry
}) {
  const cardRef = useRef(null);

  async function handleDownload() {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { backgroundColor: "#0f0f0f" });
    const link = document.createElement("a");
    link.download = `karoo-${challenge?.id || "result"}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }

  if (!isOpen) return null;

  const passed   = score?.passed;
  const total    = score?.breakdown?.total ?? score?.score ?? 0;
  const pointsMax = challenge?.points_max ?? 100;

  return (
    <div style={{
      position: "absolute", top: 0, right: 0, bottom: 0,
      width: 340, background: "#0d0d0d",
      borderLeft: "1px solid #1e2421",
      display: "flex", flexDirection: "column", zIndex: 10
    }}>

      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "12px 16px", borderBottom: "1px solid #1e2421", flexShrink: 0
      }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: "#f0f1ee" }}>
          {passed ? "Challenge passed!" : "📊 Results"}
        </span>
        <button onClick={onClose} style={{
          background: "none", border: "none", color: "#5a5e56",
          cursor: "pointer", fontSize: 18, lineHeight: 1
        }}>✕</button>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Score */}
        {score ? (
          <div style={{
            padding: 16, borderRadius: 10,
            background: passed ? "rgba(93,202,165,0.06)" : "rgba(239,68,68,0.06)",
            border: `0.5px solid ${passed ? "rgba(93,202,165,0.25)" : "rgba(239,68,68,0.25)"}`
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 54, height: 54, borderRadius: "50%", flexShrink: 0,
                background: passed ? "rgba(93,202,165,0.1)" : "rgba(239,68,68,0.1)",
                border: `2px solid ${passed ? "#5DCAA5" : "#ef4444"}`,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center"
              }}>
                <span style={{ fontSize: 17, fontWeight: 500, color: passed ? "#5DCAA5" : "#ef4444", lineHeight: 1 }}>
                  {total}
                </span>
                <span style={{ fontSize: 9, color: passed ? "#5DCAA5" : "#ef4444", opacity: 0.7 }}>
                  /{pointsMax}
                </span>
              </div>
              <div>
                <div style={{ fontSize: 13, color: passed ? "#5DCAA5" : "#f87171", marginBottom: 4 }}>
                  {score.message}
                </div>
              </div>
            </div>

            {passed && score.breakdown && (
              <div style={{
                display: "flex", gap: 0,
                borderTop: "0.5px solid rgba(93,202,165,0.15)",
                paddingTop: 10, marginTop: 4
              }}>
                {[
                  ["+" + score.breakdown.completion, "Completion"],
                  ["+" + score.breakdown.time_bonus,  "Time bonus"],
                  [score.time_taken + "s",             "Your time"],
                  [score.par_time + "s",               "Par time"],
                ].map(([val, lbl]) => (
                  <div key={lbl} style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#5DCAA5" }}>{val}</div>
                    <div style={{ fontSize: 10, color: "#5a5e56", marginTop: 1 }}>{lbl}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: "#5a5e56" }}>Run your code to see results.</div>
        )}

        {/* Unlock notification + Next challenge */}
        {passed && nextChallenge && (
          <>
            <div style={{
              padding: "10px 12px", borderRadius: 8,
              background: "rgba(93,202,165,0.06)",
              border: "0.5px solid rgba(93,202,165,0.2)",
              display: "flex", alignItems: "center", gap: 10
            }}>
              <span style={{ fontSize: 16 }}>🔓</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#5DCAA5" }}>
                  Challenge {nextChallenge.id} unlocked!
                </div>
                <div style={{ fontSize: 11, color: "#5a5e56", marginTop: 1 }}>
                  {nextChallenge.title}
                </div>
              </div>
            </div>

            <div style={{
              background: "#0f1210", border: "0.5px solid #1e2421",
              borderRadius: 8, padding: "12px 14px",
              display: "flex", alignItems: "center", gap: 10
            }}>
              <span style={{
                fontFamily: "monospace", fontSize: 11, color: "#5a5e56",
                background: "#1a1a1a", border: "0.5px solid #2a2a2a",
                borderRadius: 4, padding: "2px 7px", flexShrink: 0
              }}>
                {nextChallenge.id}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#f0f1ee", marginBottom: 2 }}>
                  {nextChallenge.title}
                </div>
                <div style={{ fontSize: 11, color: "#5a5e56" }}>{nextChallenge.concept}</div>
              </div>
              <span style={{ fontSize: 11, color: "#5a5e56", fontFamily: "monospace" }}>
                {nextChallenge.points_max} pts
              </span>
            </div>
          </>
        )}

        {/* Boss level — track complete message */}
        {passed && challenge?.is_boss && (
          <div style={{
            padding: "12px 14px", borderRadius: 8, textAlign: "center",
            background: "rgba(245,158,11,0.06)",
            border: "0.5px solid rgba(245,158,11,0.2)"
          }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>🏆</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#f59e0b", marginBottom: 4 }}>
              Track {challenge.track} complete!
            </div>
            <div style={{ fontSize: 11, color: "#7c8079" }}>
              {nextChallenge
                ? `Track ${parseInt(challenge.id) + 1} is now unlocked.`
                : "You've completed all available tracks — more coming soon!"}
            </div>
          </div>
        )}

        {/* Action buttons */}
        {score && (
          <div style={{ display: "flex", gap: 8 }}>
            {passed && nextChallenge && (
              <button
                onClick={onGoNext}
                style={{
                  flex: 1, background: "#5DCAA5", color: "#04342C",
                  border: "none", borderRadius: 8, padding: "11px 14px",
                  fontSize: 14, fontWeight: 500, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                }}
              >
                Next challenge →
              </button>
            )}
            <button
              onClick={onRetry}
              style={{
                flex: passed && nextChallenge ? 0 : 1,
                background: "transparent", color: "#9a9d95",
                border: "0.5px solid #2a312c", borderRadius: 8,
                padding: "11px 14px", fontSize: 13, cursor: "pointer"
              }}
            >
              {passed ? "Try again" : "Try again"}
            </button>
            <button
              onClick={onClose}
              title="Back to challenge list"
              style={{
                background: "transparent", color: "#5a5e56",
                border: "0.5px solid #1e2421", borderRadius: 8,
                padding: "11px 12px", fontSize: 13, cursor: "pointer"
              }}
            >
              ☰
            </button>
          </div>
        )}

        {/* Share card */}
        {passed && (
          <div>
            <div style={{ fontSize: 10, color: "#5a5e56", letterSpacing: "0.08em", marginBottom: 8 }}>
              SHARE
            </div>
            <div ref={cardRef} style={{
              background: "#0d0f0e", border: "0.5px solid #1e2421",
              borderRadius: 10, padding: 16, fontFamily: "monospace"
            }}>
              <div style={{ fontSize: 10, color: "#5a5e56", marginBottom: 4 }}>🤖 KAROO ROBOTICS</div>
              <div style={{ fontSize: 12, color: "#9a9d95", marginBottom: 10 }}>
                {challenge?.id} — {challenge?.title}
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#5DCAA5", lineHeight: 1 }}>
                {total}<span style={{ fontSize: 13, color: "#5a5e56" }}>/{pointsMax}</span>
              </div>
              <div style={{ fontSize: 10, color: "#5a5e56", marginTop: 4 }}>
                Completed in {score.time_taken}s
              </div>
            </div>
            <button onClick={handleDownload} style={{
              marginTop: 8, width: "100%", background: "#1a1a1a",
              color: "#9a9d95", border: "0.5px solid #1e2421",
              borderRadius: 6, padding: "7px", fontSize: 11, cursor: "pointer"
            }}>
              📥 Download share card
            </button>
          </div>
        )}

        {/* Save bot */}
        {user && (
          <div>
            <div style={{ fontSize: 10, color: "#5a5e56", letterSpacing: "0.08em", marginBottom: 8 }}>
              SAVE BOT
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input
                value={botName}
                onChange={e => setBotName(e.target.value)}
                placeholder="Name this bot..."
                style={{
                  background: "#161616", border: "0.5px solid #2a2a2a",
                  borderRadius: 6, padding: "6px 10px", color: "#f0f1ee",
                  fontSize: 12, fontFamily: "monospace"
                }}
              />
              <button onClick={onSaveBot} disabled={!botName.trim()} style={{
                background: "#14532d", color: "#5DCAA5",
                border: "0.5px solid #166534", borderRadius: 6,
                padding: "7px", fontSize: 12, cursor: "pointer"
              }}>
                Save bot
              </button>
              {myBots.length > 0 && (
                <>
                  <select
                    defaultValue=""
                    onChange={e => { const b = myBots.find(b => b.id === e.target.value); if (b) onLoadBot(b.code); }}
                    style={{
                      background: "#161616", border: "0.5px solid #2a2a2a",
                      borderRadius: 6, padding: "6px 10px", color: "#7c8079", fontSize: 12
                    }}
                  >
                    <option value="">Load saved bot...</option>
                    {myBots.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#5a5e56" }}>
                    <input type="checkbox" onChange={e => onTogglePublic(e.target.checked)} />
                    Make latest bot public
                  </label>
                </>
              )}
            </div>
          </div>
        )}

        {/* Gallery */}
        {gallery?.length > 0 && (
          <div>
            <div style={{ fontSize: 10, color: "#5a5e56", letterSpacing: "0.08em", marginBottom: 8 }}>
              PUBLIC GALLERY
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {gallery.map(bot => (
                <button key={bot.id} onClick={() => onLoadGalleryCode(bot.code)} style={{
                  background: "#0f1210", border: "0.5px solid #1e2421",
                  borderRadius: 8, padding: "8px 12px", cursor: "pointer", textAlign: "left"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    {bot.profiles?.avatar_url && (
                      <img src={bot.profiles.avatar_url} alt="" style={{ width: 14, height: 14, borderRadius: "50%" }} />
                    )}
                    <span style={{ fontSize: 10, color: "#5a5e56" }}>{bot.profiles?.username || "anon"}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#5DCAA5" }}>{bot.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}