// Sandbox.jsx — Option C layout
// Drop this into frontend/src/ and import in App.jsx as the /sandbox route component.
// Uses Karoo palette: #fafaf8 bg, #d97706 amber, #0f6e56 green, #0a0a0a text

import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { saveRun, getPersonalBest, saveBot, listMyBots, togglePublic, getPublicGallery } from "./api/runs";
import { markChallengeComplete } from "./api/progress";
import SimCanvas from "./SimCanvas";

const API = import.meta.env.VITE_API_URL;

const ROBOT_EMOJIS = ["🤖", "🚗", "🚀", "🐢", "🛫"];

const STARTER_CODE = `# Get the robot to the green goal zone!
# robot.move(speed, duration)  — speed: -1.0 to 1.0
# robot.turn(degrees)          — positive = clockwise

robot.move(1.0, 3.0)
robot.turn(90)
robot.move(1.0, 3.0)
`;

// ── Colours ──────────────────────────────────────────────────
const C = {
  bg:        "#fafaf8",
  bgDark:    "#f4f0e8",
  white:     "#ffffff",
  border:    "#e8e4dc",
  text:      "#0a0a0a",
  textSec:   "#6b7280",
  textDim:   "#9ca3af",
  amber:     "#d97706",
  amberBg:   "#fef3c7",
  amberText: "#92400e",
  green:     "#0f6e56",
  greenBg:   "#f0fdf4",
  greenText: "#065f46",
  red:       "#dc2626",
  redBg:     "#fef2f2",
  editor:    "#1a1a18",
};

export default function Sandbox() {
  const [searchParams]     = useSearchParams();
  const challengeFromUrl   = searchParams.get("challenge");
  const navigate           = useNavigate();

  // ── State ─────────────────────────────────────────────────
  const [code, setCode]                 = useState(STARTER_CODE);
  const [frames, setFrames]             = useState([]);
  const [obstacles, setObstacles]       = useState([]);
  const [goals, setGoals]               = useState([]);
  const [goal, setGoal]                 = useState(null);
  const [flags, setFlags]               = useState([]);
  const [start, setStart]               = useState(null);
  const [running, setRunning]           = useState(false);
  const [error, setError]               = useState(null);
  const [status, setStatus]             = useState("Ready");
  const [consoleOut, setConsoleOut]     = useState([]);
  const [score, setScore]               = useState(null);
  const [nextChallenge, setNextChallenge] = useState(null);
  const [challenges, setChallenges]     = useState([]);
  const [challenge, setChallenge]       = useState(null);
  const [user, setUser]                 = useState(null);
  const [personalBest, setPersonalBest] = useState(null);
  const [myBots, setMyBots]             = useState([]);
  const [gallery, setGallery]           = useState([]);
  const [hintsUsed, setHintsUsed]       = useState(0);
  const [hintPenalty, setHintPenalty]   = useState(0);
  const [robotEmoji, setRobotEmoji]     = useState("🤖");
  const [hintOpen, setHintOpen]         = useState(false);
  const [botName, setBotName]           = useState("");

  // ── Auth ──────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user || null));
    return () => listener.subscription.unsubscribe();
  }, []);

  // ── Load challenges ───────────────────────────────────────
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

  // ── Reset when challenge changes ──────────────────────────
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
    setHintOpen(false);
    if (challenge.starter_code) setCode(challenge.starter_code);
  }, [challenge]);

  useEffect(() => {
    if (!user || !challenge) return;
    getPersonalBest(user, challenge.id).then(setPersonalBest);
    listMyBots(user, challenge.id).then(setMyBots);
    getPublicGallery(challenge.id).then(setGallery);
  }, [user, challenge]);

  // ── Handlers ─────────────────────────────────────────────
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
      const res = await axios.post(`${API}/run`, {
        code,
        challenge_id: challenge.id,
      });

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
        if (result.passed) {
          await markChallengeComplete(user, challenge.id, result.score, next ? [next.id] : []);
        }
      }
      setStatus(`Done — ${res.data.total_frames} frames`);
    } catch (err) {
      const msg = err.response?.data?.detail || "Something went wrong";
      setError(msg);
      setStatus("Error");
    } finally {
      setRunning(false);
    }
  }

  // ── Derived ───────────────────────────────────────────────
  const hints       = challenge?.hints || [];
  const isBoss      = challenge?.is_boss || false;
  const pointsMax   = challenge?.points_max || 100;
  const passThresh  = challenge?.pass_threshold || 60;
  const passed      = score?.passed;
  const total       = score?.breakdown?.total ?? score?.score ?? 0;

  // ── Render ────────────────────────────────────────────────
  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100vh",
      background: C.bg, color: C.text, fontFamily: "'Inter', system-ui, sans-serif",
      overflow: "hidden"
    }}>

      {/* ── TOP NAV ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "0 20px", height: 52,
        borderBottom: `1px solid ${C.border}`,
        background: C.white, flexShrink: 0
      }}>
        {/* Logo + back */}
        <button
          onClick={() => navigate("/challenges")}
          style={{
            display: "flex", alignItems: "center", gap: 0,
            background: "transparent", border: "none", cursor: "pointer",
            fontWeight: 800, fontSize: 16, color: C.text, padding: 0
          }}
        >
           KA<span style={{color:C.amber}}>ROO</span>
        </button>

        <div style={{ width: 1, height: 20, background: C.border }} />

        {/* Challenge identity */}
        {challenge && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: "2px 8px",
              background: isBoss ? "#fef3c7" : "#f0fdf4",
              color: isBoss ? C.amberText : C.greenText,
              borderRadius: 20, letterSpacing: "0.04em"
            }}>
              {challenge.id}{isBoss ? " · BOSS" : ""}
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
              {challenge.title}
            </span>
            <span style={{ fontSize: 11, color: C.textDim, fontFamily: "monospace" }}>
              {challenge.concept}
            </span>
          </div>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Status + run */}
        <span style={{ fontSize: 11, color: C.textDim }}>{status}</span>
        {personalBest && (
          <span style={{ fontSize: 11, color: C.green }}>
            Best: {personalBest.score}/{pointsMax}
          </span>
        )}
        <button
          onClick={handleRun}
          disabled={running}
          style={{
            background: running ? C.textDim : C.amber,
            color: running ? C.white : C.white,
            border: "none", borderRadius: 8,
            padding: "8px 20px", fontSize: 13, fontWeight: 700,
            cursor: running ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: 6
          }}
        >
          {running ? "⏳ Running..." : "▶  Run"}
        </button>

        {/* User avatar */}
        {user ? (
          <div style={{ position: "relative" }}>
            <img
              src={user.user_metadata?.avatar_url}
              alt=""
              style={{ width: 30, height: 30, borderRadius: "50%", cursor: "pointer", border: `2px solid ${C.border}` }}
              onClick={() => supabase.auth.signOut()}
              title="Click to sign out"
            />
          </div>
        ) : (
          <button
            onClick={() => supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: "https://nakulpandhare.github.io/robotics-sandbox/" } })}
            style={{
              background: "transparent", border: `1px solid ${C.border}`,
              borderRadius: 6, padding: "5px 12px", fontSize: 12,
              color: C.textSec, cursor: "pointer"
            }}
          >
            Sign in
          </button>
        )}
      </div>

      {/* ── BRIEF BANNER ── */}
      {challenge && (
        <div style={{
          display: "flex", alignItems: "center", gap: 16,
          padding: "0 20px", height: 40,
          background: "#fffbeb",
          borderBottom: `1px solid #fde68a`,
          flexShrink: 0, overflow: "hidden"
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.amberText, flexShrink: 0 }}>
            🔧 Workshop
          </span>
          <span style={{
            fontSize: 11, color: C.textSec, fontStyle: "italic",
            flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
          }}>
            {challenge.workshop_link || challenge.description}
          </span>

          {/* Hints */}
          <div style={{ display: "flex", gap: 6, flexShrink: 0, alignItems: "center" }}>
            {hints.map((hint, i) => {
              const cost    = i === 0 ? 0 : i === 1 ? 10 : 20;
              const revealed = i < hintsUsed;
              if (revealed) {
                return (
                  <span key={i} style={{
                    fontSize: 10, padding: "2px 8px",
                    background: "#fef9c3", border: `0.5px solid #fde047`,
                    borderRadius: 20, color: "#854d0e", cursor: "default"
                  }}>
                    💡 {hint}
                  </span>
                );
              }
              if (i === hintsUsed) {
                return (
                  <button key={i} onClick={() => revealHint(i, cost)} style={{
                    fontSize: 10, padding: "2px 10px",
                    background: "#fffbeb", border: `0.5px solid #fcd34d`,
                    borderRadius: 20, color: "#92400e", cursor: "pointer"
                  }}>
                    💡 Hint {i + 1} {cost > 0 ? `(-${cost} pts)` : "(free)"}
                  </button>
                );
              }
              return null;
            })}
          </div>

          {/* Pass threshold */}
          <span style={{
            fontSize: 10, fontWeight: 700, padding: "2px 8px",
            background: isBoss ? "#fef3c7" : "#f0fdf4",
            color: isBoss ? C.amberText : C.greenText,
            borderRadius: 20, flexShrink: 0
          }}>
            {passThresh}+ to pass · {pointsMax} pts
            {hintPenalty > 0 && ` · -${hintPenalty} hint`}
          </span>
        </div>
      )}

      {/* ── MAIN WORKSPACE ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>

        {/* Editor + console */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          minWidth: 0, borderRight: `1px solid ${C.border}`
        }}>
          <div style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
            <Editor
              height="100%"
              defaultLanguage="python"
              value={code}
              onChange={setCode}
              theme="vs-dark"
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

          {/* Console */}
          <div style={{
            height: 90, flexShrink: 0, background: "#111",
            borderTop: `1px solid #2a2a28`,
            display: "flex", flexDirection: "column"
          }}>
            <div style={{
              padding: "4px 16px",
              fontSize: 10, color: "#4b5563",
              letterSpacing: "0.08em", flexShrink: 0,
              borderBottom: "1px solid #1f1f1d"
            }}>
              CONSOLE {hintPenalty > 0 && <span style={{ color: C.amber }}>· hint penalty: -{hintPenalty} pts</span>}
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "6px 16px", fontSize: 12, lineHeight: 1.7, fontFamily: "monospace" }}>
              {error && <span style={{ color: "#f87171" }}>✖ {error}</span>}
              {!error && consoleOut.length === 0 && <span style={{ color: "#374151" }}>No output. Click Run.</span>}
              {consoleOut.map((line, i) => (
                <div key={i} style={{ color: "#34d399" }}>
                  <span style={{ color: "#065f46", marginRight: 8 }}>{">"}</span>{line}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL: canvas + result ── */}
        <div style={{
          width: 420, flexShrink: 0,
          display: "flex", flexDirection: "column",
          background: C.bgDark
        }}>

          {/* Canvas area */}
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: 16, gap: 10, minHeight: 0
          }}>
            <SimCanvas
              frames={frames}
              obstacles={obstacles}
              goal={goal}
              goals={goals}
              flags={flags}
              start={start}
              robotEmoji={robotEmoji}
            />

            {/* Robot emoji picker */}
            <div style={{
              display: "flex", gap: 6, alignItems: "center",
              background: C.white, border: `0.5px solid ${C.border}`,
              borderRadius: 20, padding: "4px 10px"
            }}>
              <span style={{ fontSize: 9, color: C.textDim, marginRight: 4, letterSpacing: ".06em" }}>Choose your Robot</span>
              {ROBOT_EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => setRobotEmoji(e)}
                  style={{
                    background: robotEmoji === e ? C.amberBg : "transparent",
                    border: robotEmoji === e ? `1.5px solid ${C.amber}` : "1.5px solid transparent",
                    borderRadius: 6, padding: "2px 5px",
                    fontSize: 16, cursor: "pointer", lineHeight: 1
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* ── INLINE RESULT ── */}
          <div style={{
            borderTop: `1px solid ${C.border}`,
            background: score
              ? passed ? C.greenBg : C.redBg
              : C.white,
            flexShrink: 0
          }}>
            {!score && !error && (
              <div style={{
                padding: "14px 16px",
                display: "flex", alignItems: "center", gap: 10
              }}>
                <div style={{ flex: 1, fontSize: 12, color: C.textDim }}>
                  Write code and click Run to test your solution.
                </div>
                {/* Code quality feedback visible before running if hints revealed */}
                {hintsUsed > 0 && (
                  <span style={{ fontSize: 10, color: C.amber }}>
                    {hints[hintsUsed - 1]}
                  </span>
                )}
              </div>
            )}

            {error && !score && (
              <div style={{ padding: "14px 16px", background: C.redBg }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.red, marginBottom: 4 }}>
                  Error
                </div>
                <div style={{ fontSize: 12, color: "#7f1d1d" }}>{error}</div>
                <button onClick={handleRetry} style={{
                  marginTop: 10, background: "transparent", border: `1px solid ${C.red}`,
                  color: C.red, borderRadius: 6, padding: "5px 12px",
                  fontSize: 11, cursor: "pointer"
                }}>
                  Try again
                </button>
              </div>
            )}

            {score && (
              <div style={{ padding: "14px 16px" }}>
                {/* Score row */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div style={{
                    fontSize: 28, fontWeight: 800,
                    color: passed ? C.green : C.red, lineHeight: 1
                  }}>
                    {total}
                    <span style={{ fontSize: 13, fontWeight: 400, color: C.textDim }}>
                      /{pointsMax}
                    </span>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 12, fontWeight: 600,
                      color: passed ? C.greenText : C.red, marginBottom: 2
                    }}>
                      {passed ? "Goal reached!" : "Not passed yet"}
                    </div>
                    <div style={{ fontSize: 11, color: C.textSec }}>{score.message}</div>
                  </div>
                </div>

                {/* Breakdown pills */}
                {passed && score.breakdown && (
                  <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                    {[
                      [`+${score.breakdown.completion}`, "completion"],
                      [`+${score.breakdown.time_bonus}`, "time bonus"],
                      [`${score.time_taken}s`, "your time"],
                      score.par_time && [`${score.par_time}s`, "par"],
                    ].filter(Boolean).map(([val, lbl]) => (
                      <span key={lbl} style={{
                        fontSize: 10, padding: "2px 8px",
                        background: C.white, border: `0.5px solid ${C.border}`,
                        borderRadius: 20, color: C.textSec
                      }}>
                        <span style={{ fontWeight: 600, color: C.green }}>{val}</span>{" "}{lbl}
                      </span>
                    ))}
                  </div>
                )}

                {/* Code quality feedback */}
                {score.code_feedback?.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    {score.code_feedback.map((line, i) => (
                      <div key={i} style={{
                        fontSize: 11, color: line.startsWith("✓") ? C.green : C.amber,
                        marginBottom: 2
                      }}>
                        {line}
                      </div>
                    ))}
                  </div>
                )}

                {/* Unlock notification */}
                {passed && nextChallenge && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "6px 10px", marginBottom: 10,
                    background: C.white, border: `0.5px solid ${C.border}`,
                    borderRadius: 6
                  }}>
                    <span style={{ fontSize: 14 }}>🔓</span>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.green }}>
                        {nextChallenge.id} unlocked —{" "}
                      </span>
                      <span style={{ fontSize: 11, color: C.textSec }}>
                        {nextChallenge.title}
                      </span>
                    </div>
                  </div>
                )}

                {/* Boss complete */}
                {passed && isBoss && (
                  <div style={{
                    padding: "8px 10px", marginBottom: 10, borderRadius: 6,
                    background: C.amberBg, border: `0.5px solid #fcd34d`,
                    fontSize: 11, color: C.amberText, fontWeight: 600,
                    display: "flex", alignItems: "center", gap: 6
                  }}>
                    🏆 Track {challenge.track} complete!
                    {nextChallenge
                      ? ` Track ${challenge.track + 1} is now unlocked.`
                      : " More tracks coming soon!"}
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 8 }}>
                  {passed && nextChallenge && (
                    <button onClick={handleGoNext} style={{
                      flex: 1, background: C.green, color: C.white,
                      border: "none", borderRadius: 8, padding: "10px",
                      fontSize: 13, fontWeight: 700, cursor: "pointer"
                    }}>
                      Next challenge →
                    </button>
                  )}
                  <button onClick={handleRetry} style={{
                    flex: passed && nextChallenge ? 0 : 1,
                    background: "transparent", color: C.textSec,
                    border: `1px solid ${C.border}`, borderRadius: 8,
                    padding: "10px 14px", fontSize: 12, cursor: "pointer"
                  }}>
                    Try again
                  </button>
                  <button
                    onClick={() => navigate("/challenges")}
                    style={{
                      background: "transparent", color: C.textDim,
                      border: `1px solid ${C.border}`, borderRadius: 8,
                      padding: "10px 12px", fontSize: 12, cursor: "pointer"
                    }}
                    title="Back to challenge list"
                  >
                    ☰
                  </button>
                </div>

                {/* Save bot — only if user and passed */}
                {user && passed && (
                  <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
                    <input
                      value={botName}
                      onChange={e => setBotName(e.target.value)}
                      placeholder="Name this solution to save..."
                      style={{
                        flex: 1, background: C.white, border: `1px solid ${C.border}`,
                        borderRadius: 6, padding: "6px 10px",
                        fontSize: 11, color: C.text, fontFamily: "inherit"
                      }}
                    />
                    <button onClick={handleSaveBot} disabled={!botName.trim()} style={{
                      background: C.green, color: C.white, border: "none",
                      borderRadius: 6, padding: "6px 12px",
                      fontSize: 11, fontWeight: 600, cursor: "pointer"
                    }}>
                      Save
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── BOTTOM API STRIP ── */}
      <div style={{
        borderTop: `1px solid ${C.border}`,
        background: C.white, padding: "6px 20px",
        display: "flex", gap: 32, flexShrink: 0
      }}>
        {[
          { fn: "robot.move(speed, duration)", note: "speed: −1.0 to 1.0 · duration: seconds" },
          { fn: "robot.turn(degrees)",          note: "positive = clockwise" },
          { fn: "robot.wait(duration)",         note: "pause in seconds (0–3)" },
        ].map(({ fn, note }) => (
          <div key={fn} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
            <code style={{ fontSize: 11, color: C.green, fontFamily: "monospace", fontWeight: 600 }}>
              {fn}
            </code>
            <span style={{ fontSize: 10, color: C.textDim }}>{note}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
