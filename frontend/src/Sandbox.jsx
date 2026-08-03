import { useState, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { useTheme } from "./theme/ThemeContext";
import ThemeToggle from "./theme/ThemeToggle";
import { saveRun, getPersonalBest, saveBot, listMyBots, togglePublic, getPublicGallery, getLeaderboard } from "./api/runs";
import { markChallengeComplete } from "./api/progress";
import SimCanvas from "./SimCanvas";
import MountainMark from "./BrandMark";

const API = import.meta.env.VITE_API_URL;

const ROBOT_EMOJIS = ["🤖", "🚗", "🚀", "🐢", "⚡", "🦾", "🛸", "🏎️"];

const STARTER_CODE = `# Get the robot to the green goal zone!
# robot.move(speed, duration)  — speed: -1.0 to 1.0
# robot.turn(degrees)          — positive = clockwise

robot.move(1.0, 3.0)
robot.turn(90)
robot.move(1.0, 3.0)
`;

// ── Drag handle ───────────────────────────────────────────────
function DragHandle({ direction, onPointerDown }) {
  const isH = direction === "horizontal";
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onPointerDown={onPointerDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flexShrink: 0,
        width:  isH ? 5 : "100%",
        height: isH ? "100%" : 5,
        cursor: isH ? "col-resize" : "row-resize",
        background: hovered ? "var(--amber)" : "var(--border)",
        transition: "background 0.15s",
        position: "relative",
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        touchAction: "none",
      }}
    >
      <div style={{ display: "flex", flexDirection: isH ? "column" : "row", gap: 3, pointerEvents: "none" }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: 3, height: 3, borderRadius: "50%",
            background: hovered ? "rgba(255,255,255,0.9)" : "var(--text-dim)",
            transition: "background 0.15s",
          }} />
        ))}
      </div>
    </div>
  );
}

// ── Leaderboard modal ─────────────────────────────────────────
function LeaderboardModal({ challenge, onClose }) {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!challenge) return;
    setLoading(true);
    getLeaderboard(challenge.id).then(data => {
      setRows(data || []);
      setLoading(false);
    });
  }, [challenge]);

  // Close on Escape key
  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    /* Backdrop */
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(3px)",
        zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      {/* Modal card — stop clicks bubbling to backdrop */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 440, maxHeight: "80vh",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}
      >

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <span style={{ fontSize: 18 }}>🏆</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                Leaderboard
              </span>
            </div>
            {challenge && (
              <div style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "monospace" }}>
                {challenge.id} · {challenge.title}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "var(--bg-dark)", border: "1px solid var(--border)",
              borderRadius: 8, width: 32, height: 32,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: 16, color: "var(--text-secondary)",
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading && (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-dim)", fontSize: 13 }}>
              Loading...
            </div>
          )}

          {!loading && rows.length === 0 && (
            <div style={{ padding: 48, textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🎯</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>
                No scores yet
              </div>
              <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
                Be the first to complete this challenge!
              </div>
            </div>
          )}

          {!loading && rows.map((row, i) => {
            const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
            const isTop = i === 0;
            return (
              <div
                key={row.user_id}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 20px",
                  borderBottom: "1px solid var(--border)",
                  background: isTop ? "var(--bg-amber)" : "transparent",
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => { if (!isTop) e.currentTarget.style.background = "var(--bg-dark)"; }}
                onMouseLeave={e => { if (!isTop) e.currentTarget.style.background = "transparent"; }}
              >
                {/* Rank */}
                <div style={{
                  width: 28, textAlign: "center", flexShrink: 0,
                  fontSize: medal ? 18 : 13, fontWeight: 700,
                  color: i === 0 ? "#f59e0b" : i === 1 ? "#9ca3af" : i === 2 ? "#d97706" : "var(--text-dim)",
                }}>
                  {medal || i + 1}
                </div>

                {/* Avatar */}
                {row.profiles?.avatar_url ? (
                  <img src={row.profiles.avatar_url} alt=""
                    style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, border: "2px solid var(--border)" }} />
                ) : (
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                    background: "var(--amber-bg)", border: "1.5px solid var(--border-amber)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, color: "var(--amber-text)",
                  }}>
                    {(row.profiles?.username || "?")[0].toUpperCase()}
                  </div>
                )}

                {/* Name */}
                <span style={{
                  fontSize: 13, color: "var(--text-primary)", flex: 1,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  fontWeight: isTop ? 600 : 400,
                }}>
                  {row.profiles?.username || "anonymous"}
                </span>

                {/* Score + time */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, flexShrink: 0 }}>
                  <span style={{
                    fontSize: 15, fontWeight: 800,
                    color: isTop ? "var(--amber)" : "var(--green)",
                  }}>
                    {row.score}
                  </span>
                  <span style={{ fontSize: 10, color: "var(--text-dim)" }}>
                    {row.time_taken}s
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: "12px 20px",
          borderTop: "1px solid var(--border)",
          fontSize: 11, color: "var(--text-dim)",
          flexShrink: 0, textAlign: "center",
          background: "var(--bg-dark)",
        }}>
          {rows.length > 0
            ? `${rows.length} student${rows.length !== 1 ? "s" : ""} have completed this challenge`
            : "Complete the challenge to appear here"}
          <span style={{ marginLeft: 8, color: "var(--text-dim)", opacity: 0.6 }}>· Esc to close</span>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export default function Sandbox() {
  const [searchParams]   = useSearchParams();
  const challengeFromUrl = searchParams.get("challenge");
  const navigate         = useNavigate();
  const { theme }        = useTheme();
  const isDark           = theme === "dark";
  const editorTheme      = isDark ? "vs-dark" : "vs";

  // Resizable panels
  const [rightWidth,    setRightWidth]    = useState(420);
  const [consoleHeight, setConsoleHeight] = useState(110);
  const dragState = useRef(null);

  const onHorizontalDragStart = useCallback((e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragState.current = { type: "horizontal", startPos: e.clientX, startSize: rightWidth };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [rightWidth]);

  const onVerticalDragStart = useCallback((e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragState.current = { type: "vertical", startPos: e.clientY, startSize: consoleHeight };
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  }, [consoleHeight]);

  useEffect(() => {
    function onPointerMove(e) {
      if (!dragState.current) return;
      const { type, startPos, startSize } = dragState.current;
      if (type === "horizontal") {
        setRightWidth(Math.max(280, Math.min(700, startSize + (startPos - e.clientX))));
      } else {
        setConsoleHeight(Math.max(40, Math.min(320, startSize - (e.clientY - startPos))));
      }
    }
    function onPointerUp() {
      if (!dragState.current) return;
      dragState.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup",   onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup",   onPointerUp);
    };
  }, []);

  // State
  const [code, setCode]               = useState(STARTER_CODE);
  const [frames, setFrames]           = useState([]);
  const [obstacles, setObstacles]     = useState([]);
  const [goals, setGoals]             = useState([]);
  const [goal, setGoal]               = useState(null);
  const [flags, setFlags]             = useState([]);
  const [start, setStart]             = useState(null);
  const [running, setRunning]         = useState(false);
  const [error, setError]             = useState(null);
  const [status, setStatus]           = useState("Ready");
  const [consoleOut, setConsoleOut]   = useState([]);
  const [score, setScore]             = useState(null);
  const [nextChallenge, setNextChallenge] = useState(null);
  const [challenges, setChallenges]   = useState([]);
  const [challenge, setChallenge]     = useState(null);
  const [user, setUser]               = useState(null);
  const [personalBest, setPersonalBest] = useState(null);
  const [myBots, setMyBots]           = useState([]);
  const [hintsUsed, setHintsUsed]     = useState(0);
  const [hintPenalty, setHintPenalty] = useState(0);
  const [robotEmoji, setRobotEmoji]   = useState("🤖");
  const [botName, setBotName]         = useState("");
  const [gallery, setGallery]         = useState([]);
  const [lbOpen, setLbOpen]           = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user || null));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    axios.get(`${API}/challenges`).then(res => {
      const list = res.data.challenges;
      setChallenges(list);
      if (challengeFromUrl) {
        const target = list.find(c => c.id === challengeFromUrl);
        setChallenge(target || list[0]);
      } else {
        setChallenge(list[0]);
      }
    });
  }, [challengeFromUrl]);

  useEffect(() => {
    if (!challenge) return;
    setFrames([]);
    setObstacles(challenge.obstacles || []);
    setGoals(challenge.goals || []);
    setGoal(challenge.goals?.[0] || null);
    setFlags(challenge.flags || []);
    setStart(challenge.start || null);
    setScore(null);
    setNextChallenge(null);
    setError(null);
    setConsoleOut([]);
    setStatus("Ready");
    setHintsUsed(0);
    setHintPenalty(0);
    if (challenge.starter_code) setCode(challenge.starter_code);
  }, [challenge]);

  useEffect(() => {
    if (!user || !challenge) return;
    getPersonalBest(user, challenge.id).then(setPersonalBest);
    listMyBots(user, challenge.id).then(setMyBots);
    getPublicGallery(challenge.id).then(setGallery);
  }, [user, challenge]);

  function revealHint(i, cost) {
    setHintsUsed(i + 1);
    setHintPenalty(p => p + cost);
  }

  async function handleSaveBot() {
    if (!user || !botName.trim() || !challenge) return;
    await saveBot({ user, name: botName.trim(), code, challengeId: challenge.id });
    setBotName("");
    listMyBots(user, challenge.id).then(setMyBots);
  }

  function handleRetry() {
    setScore(null);
    setFrames([]);
    setConsoleOut([]);
    setError(null);
    setStatus("Ready");
    if (challenge?.starter_code) setCode(challenge.starter_code);
  }

  function handleGoNext() {
    if (!nextChallenge?.id) return;
    navigate(`/sandbox?challenge=${nextChallenge.id}`);
  }

  async function handleRun() {
    if (!challenge) return;
    setRunning(true);
    setError(null);
    setConsoleOut([]);
    setScore(null);
    setNextChallenge(null);
    setStatus("Running...");
    try {
      const res = await axios.post(`${API}/run`, { code, challenge_id: challenge.id });
      setFrames(res.data.frames);
      setObstacles(res.data.obstacles || []);
      setGoals(res.data.goals || []);
      setGoal(res.data.goal || res.data.goals?.[0] || null);
      setFlags(res.data.flags || []);
      setStart(res.data.start || null);
      setConsoleOut(res.data.console || []);
      const next = res.data.next_challenge || null;
      setNextChallenge(next);
      let result = res.data.score;
      if (hintPenalty > 0 && result) {
        const penalised = Math.max(0, result.score - hintPenalty);
        result = { ...result, score: penalised, breakdown: { ...result.breakdown, hint_penalty: hintPenalty, total: penalised } };
      }
      setScore(result);
      if (user && challenge) {
        await saveRun({ user, challengeId: challenge.id, score: result.score, timeTaken: result.time_taken, passed: result.passed, code });
        getPersonalBest(user, challenge.id).then(setPersonalBest);
        if (result.passed) await markChallengeComplete(user, challenge.id, result.score, next ? [next.id] : []);
      }
      setStatus(`Done — ${res.data.total_frames} frames`);
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong");
      setStatus("Error");
    } finally {
      setRunning(false);
    }
  }

  const hints      = challenge?.hints || [];
  const isBoss     = challenge?.is_boss || false;
  const pointsMax  = challenge?.points_max || 100;
  const passThresh = challenge?.pass_threshold || 60;
  const passed     = score?.passed;
  const total      = score?.breakdown?.total ?? score?.score ?? 0;

  return (
    <div className="sandbox">

      {/* ── Leaderboard modal (portal-style, rendered above everything) ── */}
      {lbOpen && (
        <LeaderboardModal
          challenge={challenge}
          onClose={() => setLbOpen(false)}
        />
      )}

      {/* ── TOP NAV ── */}
      <nav className="sandbox__nav">
        <button className="nav__logo" onClick={() => navigate("/challenges")}>
          <MountainMark size={20} />KAROO
        </button>

        <div className="sandbox__divider" />

        {challenge && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
            <span className={`badge ${isBoss ? "badge--amber" : "badge--green"}`}>
              {challenge.id}{isBoss ? " · BOSS" : ""}
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {challenge.title}
            </span>
            <span style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "monospace", flexShrink: 0 }}>
              {challenge.concept}
            </span>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, marginLeft: "auto" }}>
          <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{status}</span>

          {personalBest && (
            <span style={{ fontSize: 11, color: "var(--green)", fontWeight: 600 }}>
              Best: {personalBest.score}/{pointsMax}
            </span>
          )}

          <button className="btn--run" onClick={handleRun} disabled={running}>
            {running ? "⏳ Running..." : "▶  Run"}
          </button>

          <button
            onClick={() => setLbOpen(true)}
            title="Open leaderboard"
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: 8, padding: "6px 12px",
              fontSize: 13, cursor: "pointer",
              color: "var(--text-secondary)",
              display: "flex", alignItems: "center", gap: 5,
            }}
          >
            🏆 <span style={{ fontSize: 12 }}>Leaderboard</span>
          </button>

          <ThemeToggle size="sm" />

          {user ? (
            <img
              src={user.user_metadata?.avatar_url}
              alt="" title="Click to sign out"
              onClick={() => supabase.auth.signOut()}
              style={{ width: 30, height: 30, borderRadius: "50%", border: "2px solid var(--border)", cursor: "pointer" }}
            />
          ) : (
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => supabase.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo: "https://nakulpandhare.github.io/robotics-sandbox/" }
              })}
            >
              Sign in
            </button>
          )}
        </div>
      </nav>

      {/* ── BRIEF BANNER ── */}
      {challenge && (
        <div className="sandbox__banner">
          <span className="sandbox__banner-label">🔧 Workshop</span>
          <span className="sandbox__banner-text">
            {challenge.workshop_link || challenge.description}
          </span>
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            {hints.map((hint, i) => {
              const cost     = i === 0 ? 0 : i === 1 ? 10 : 20;
              const revealed = i < hintsUsed;
              if (revealed) return (
                <span key={i} style={{ fontSize: 10, padding: "2px 10px", maxWidth: 240, background: "var(--amber-bg)", border: "0.5px solid var(--border-amber)", borderRadius: 20, color: "var(--amber-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  💡 {hint}
                </span>
              );
              if (i === hintsUsed) return (
                <button key={i} onClick={() => revealHint(i, cost)} style={{ fontSize: 10, padding: "2px 10px", background: "var(--bg-card)", border: "0.5px solid var(--border-amber)", borderRadius: 20, color: "var(--amber-text)", cursor: "pointer" }}>
                  💡 Hint {i + 1} {cost > 0 ? `(-${cost} pts)` : "(free)"}
                </button>
              );
              return null;
            })}
          </div>
          <span className={`badge ${isBoss ? "badge--amber" : "badge--green"}`}>
            {passThresh}+ to pass · {pointsMax} pts
            {hintPenalty > 0 && ` · -${hintPenalty} hint`}
          </span>
        </div>
      )}

      {/* ── WORKSPACE ── */}
      <div className="sandbox__workspace">

        {/* LEFT: editor + console */}
        <div className="sandbox__editor-col">
          <div style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
            <Editor
              height="100%"
              defaultLanguage="python"
              value={code}
              onChange={setCode}
              theme={editorTheme}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                padding: { top: 14 },
                fontFamily: "Menlo, Monaco, 'Courier New', monospace",
                renderLineHighlight: "line",
              }}
            />
          </div>

          <DragHandle direction="vertical" onPointerDown={onVerticalDragStart} />

          <div style={{
            height: consoleHeight, flexShrink: 0,
            background: "var(--console-bg)",
            borderTop: "1px solid var(--console-border)",
            display: "flex", flexDirection: "column", overflow: "hidden",
          }}>
            <div className="sandbox__console-label">
              CONSOLE
              {hintPenalty > 0 && (
                <span style={{ color: "var(--amber)", marginLeft: 8 }}>· hint penalty: -{hintPenalty} pts</span>
              )}
            </div>
            <div className="sandbox__console-body">
              {error && <span style={{ color: "var(--text-red)" }}>✖ {error}</span>}
              {!error && consoleOut.length === 0 && <span style={{ color: "var(--text-dim)" }}>No output. Click Run.</span>}
              {consoleOut.map((line, i) => (
                <div key={i} style={{ color: "var(--green)" }}>
                  <span style={{ color: "var(--green-text)", marginRight: 8 }}>{">"}</span>{line}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DragHandle direction="horizontal" onPointerDown={onHorizontalDragStart} />

        {/* RIGHT: canvas + result */}
        <div style={{ width: rightWidth, flexShrink: 0, display: "flex", flexDirection: "column", background: "var(--bg-dark)" }}>

          <div className="sandbox__canvas-area">
            <SimCanvas
              frames={frames} obstacles={obstacles}
              goal={goal} goals={goals} flags={flags} start={start}
              robotEmoji={robotEmoji} isDark={isDark}
            />
            <div className="sandbox__emoji-picker">
              <span className="sandbox__emoji-label">ROBOT</span>
              {ROBOT_EMOJIS.map(e => (
                <button key={e} onClick={() => setRobotEmoji(e)} title={e}
                  className={`sandbox__emoji-btn ${robotEmoji === e ? "sandbox__emoji-btn--active" : ""}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Inline result */}
          <div className={`sandbox__result ${score ? (passed ? "sandbox__result--pass" : "sandbox__result--fail") : ""}`}>
            {!score && !error && (
              <div className="sandbox__result-inner" style={{ fontSize: 12, color: "var(--text-dim)" }}>
                Write code and click ▶ Run to test your solution.
              </div>
            )}
            {error && !score && (
              <div className="sandbox__result-inner">
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-red)", marginBottom: 4 }}>Error</div>
                <div style={{ fontSize: 12, color: "var(--text-red)", marginBottom: 8 }}>{error}</div>
                <button onClick={handleRetry} className="btn btn--ghost btn--sm">Try again</button>
              </div>
            )}
            {score && (
              <div className="sandbox__result-inner">
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div className={`sandbox__score ${!passed ? "sandbox__score--fail" : ""}`}>
                    {total}<span className="sandbox__score-max">/{pointsMax}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: passed ? "var(--green-text)" : "var(--text-red)", marginBottom: 2 }}>
                      {passed ? "Goal reached!" : "Not passed yet"}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{score.message}</div>
                  </div>
                </div>
                {passed && score.breakdown && (
                  <div className="sandbox__breakdown">
                    {[
                      [`+${score.breakdown.completion}`, "completion"],
                      [`+${score.breakdown.time_bonus}`, "time bonus"],
                      [`${score.time_taken}s`, "your time"],
                      score.par_time && [`${score.par_time}s`, "par"],
                    ].filter(Boolean).map(([val, lbl]) => (
                      <span key={lbl} className="sandbox__pill">
                        <span className="sandbox__pill-val">{val}</span> {lbl}
                      </span>
                    ))}
                  </div>
                )}
                {score.code_feedback?.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    {score.code_feedback.map((line, i) => (
                      <div key={i} style={{ fontSize: 11, marginBottom: 2, color: line.startsWith("✓") ? "var(--green)" : "var(--amber)" }}>
                        {line}
                      </div>
                    ))}
                  </div>
                )}
                {passed && nextChallenge && (
                  <div className="sandbox__unlock">
                    <span>🔓</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--green)" }}>{nextChallenge.id} unlocked —</span>
                    <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{nextChallenge.title}</span>
                  </div>
                )}
                {passed && isBoss && (
                  <div style={{ padding: "7px 10px", marginBottom: 8, borderRadius: 6, background: "var(--amber-bg)", border: "0.5px solid var(--border-amber)", fontSize: 11, color: "var(--amber-text)", fontWeight: 600 }}>
                    🏆 Track {challenge.track} complete!{nextChallenge ? ` Track ${challenge.track + 1} unlocked.` : " More coming soon!"}
                  </div>
                )}
                <div className="sandbox__actions">
                  {passed && nextChallenge && (
                    <button onClick={handleGoNext} className="btn btn--green" style={{ flex: 1, padding: "9px", fontSize: 13, fontWeight: 700 }}>
                      Next challenge →
                    </button>
                  )}
                  <button onClick={handleRetry} className="btn btn--outline" style={{ flex: passed && nextChallenge ? 0 : 1, padding: "9px 13px", fontSize: 12 }}>
                    Try again
                  </button>
                  <button onClick={() => navigate("/challenges")} title="Back to challenge list" className="btn btn--ghost" style={{ padding: "9px 11px", fontSize: 12 }}>
                    ☰
                  </button>
                </div>
                {user && passed && (
                  <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                    <input value={botName} onChange={e => setBotName(e.target.value)}
                      placeholder="Name this solution to save..."
                      className="form-input" style={{ flex: 1, fontSize: 11 }} />
                    <button onClick={handleSaveBot} disabled={!botName.trim()} className="btn btn--green btn--sm">Save</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── API STRIP ── */}
      <div className="sandbox__api-strip">
        {[
          { fn: "robot.move(speed, duration)", note: "speed: −1.0 to 1.0 · duration: seconds" },
          { fn: "robot.turn(degrees)",         note: "positive = clockwise" },
          { fn: "robot.wait(duration)",        note: "pause in seconds (0–3)" },
        ].map(({ fn, note }) => (
          <div key={fn} className="sandbox__api-item">
            <code className="sandbox__api-fn">{fn}</code>
            <span className="sandbox__api-note">{note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
