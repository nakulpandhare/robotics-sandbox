import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { useTheme } from "./theme/ThemeContext";
import ThemeToggle from "./theme/ThemeToggle";
import { saveRun, getPersonalBest, saveBot, listMyBots, togglePublic, getPublicGallery } from "./api/runs";
import { markChallengeComplete } from "./api/progress";
import SimCanvas from "./SimCanvas";

const API = import.meta.env.VITE_API_URL;

const ROBOT_EMOJIS = ["🤖", "🚗", "🚀", "🐢", "⚡", "🦾", "🛸", "🏎️"];

const STARTER_CODE = `# Get the robot to the green goal zone!
# robot.move(speed, duration)  — speed: -1.0 to 1.0
# robot.turn(degrees)          — positive = clockwise

robot.move(1.0, 3.0)
robot.turn(90)
robot.move(1.0, 3.0)
`;

export default function Sandbox() {
  const [searchParams]  = useSearchParams();
  const challengeFromUrl = searchParams.get("challenge");
  const navigate         = useNavigate();
  const { theme }        = useTheme();
  const isDark           = theme === "dark";

  const editorTheme = isDark ? "vs-dark" : "vs";

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
        result = {
          ...result,
          score: penalised,
          breakdown: { ...result.breakdown, hint_penalty: hintPenalty, total: penalised }
        };
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

  const hints      = challenge?.hints || [];
  const isBoss     = challenge?.is_boss || false;
  const pointsMax  = challenge?.points_max || 100;
  const passThresh = challenge?.pass_threshold || 60;
  const passed     = score?.passed;
  const total      = score?.breakdown?.total ?? score?.score ?? 0;

  return (
    <div className="sandbox">

      {/* ── TOP NAV ── */}
      <nav className="sandbox__nav">
        <button className="nav__logo" onClick={() => navigate("/challenges")}>
          KA<span>ROO</span>
        </button>

        <div className="sandbox__divider" />

        {challenge && (
          <div className="sandbox__challenge-info">
            <span className={`badge ${isBoss ? "badge--amber" : "badge--green"}`}>
              {challenge.id}{isBoss ? " · BOSS" : ""}
            </span>
            <span className="sandbox__challenge-title">{challenge.title}</span>
            <span className="sandbox__challenge-concept">{challenge.concept}</span>
          </div>
        )}

        <div className="sandbox__nav-right">
          <span className="sandbox__status">{status}</span>

          {personalBest && (
            <span className="sandbox__best">
              Best: {personalBest.score}/{pointsMax}
            </span>
          )}

          <button className="btn--run" onClick={handleRun} disabled={running}>
            {running ? "⏳ Running..." : "▶  Run"}
          </button>

          <ThemeToggle size="sm" />

          {user ? (
            <img
              src={user.user_metadata?.avatar_url}
              alt=""
              className="nav__avatar"
              onClick={() => supabase.auth.signOut()}
              title="Click to sign out"
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

          <div className="sandbox__hints">
            {hints.map((hint, i) => {
              const cost     = i === 0 ? 0 : i === 1 ? 10 : 20;
              const revealed = i < hintsUsed;
              if (revealed) {
                return (
                  <span key={i} className="sandbox__hint sandbox__hint--revealed">
                    💡 {hint}
                  </span>
                );
              }
              if (i === hintsUsed) {
                return (
                  <button key={i} onClick={() => revealHint(i, cost)} className="sandbox__hint sandbox__hint--button">
                    💡 Hint {i + 1} {cost > 0 ? `(-${cost} pts)` : "(free)"}
                  </button>
                );
              }
              return null;
            })}
          </div>

          <span className={`badge ${isBoss ? "badge--amber" : "badge--green"} sandbox__pass-badge`}>
            {passThresh}+ to pass · {pointsMax} pts
            {hintPenalty > 0 && ` · -${hintPenalty} hint`}
          </span>
        </div>
      )}

      {/* ── WORKSPACE ── */}
      <div className="sandbox__workspace">

        {/* Editor + console */}
        <div className="sandbox__editor-col">
          <div className="sandbox__editor-wrap">
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

          {/* Console */}
          <div className="sandbox__console">
            <div className="sandbox__console-label">
              CONSOLE
              {hintPenalty > 0 && (
                <span className="sandbox__console-penalty"> · hint penalty: -{hintPenalty} pts</span>
              )}
            </div>
            <div className="sandbox__console-body">
              {error && <span className="sandbox__console-error">✖ {error}</span>}
              {!error && consoleOut.length === 0 && (
                <span className="sandbox__console-empty">No output. Click Run.</span>
              )}
              {consoleOut.map((line, i) => (
                <div key={i} className="sandbox__console-line">
                  <span className="sandbox__console-arrow">{">"}</span>
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="sandbox__right">

          {/* Canvas */}
          <div className="sandbox__canvas-area">
            <SimCanvas
              frames={frames}
              obstacles={obstacles}
              goal={goal}
              goals={goals}
              flags={flags}
              start={start}
              robotEmoji={robotEmoji}
              isDark={isDark}
            />

            <div className="sandbox__emoji-picker">
              <span className="sandbox__emoji-label">ROBOT</span>
              {ROBOT_EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => setRobotEmoji(e)}
                  title={e}
                  className={`sandbox__emoji-btn ${robotEmoji === e ? "sandbox__emoji-btn--active" : ""}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* ── INLINE RESULT ── */}
          <div className={`sandbox__result ${score ? (passed ? "sandbox__result--pass" : "sandbox__result--fail") : ""}`}>

            {!score && !error && (
              <div className="sandbox__result-inner sandbox__result-empty">
                Write code and click ▶ Run to test your solution.
              </div>
            )}

            {error && !score && (
              <div className="sandbox__result-inner">
                <div className="sandbox__error-title">Error</div>
                <div className="sandbox__error-msg">{error}</div>
                <button onClick={handleRetry} className="btn btn--ghost btn--sm sandbox__retry-btn">
                  Try again
                </button>
              </div>
            )}

            {score && (
              <div className="sandbox__result-inner">
                <div className="sandbox__score-row">
                  <div className={`sandbox__score ${!passed ? "sandbox__score--fail" : ""}`}>
                    {total}
                    <span className="sandbox__score-max">/{pointsMax}</span>
                  </div>
                  <div className="sandbox__score-info">
                    <div className={`sandbox__score-status ${!passed ? "sandbox__score-status--fail" : ""}`}>
                      {passed ? "Goal reached!" : "Not passed yet"}
                    </div>
                    <div className="sandbox__score-message">{score.message}</div>
                  </div>
                </div>

                {passed && score.breakdown && (
                  <div className="sandbox__breakdown">
                    {[
                      [`+${score.breakdown.completion}`, "completion"],
                      [`+${score.breakdown.time_bonus}`,  "time bonus"],
                      [`${score.time_taken}s`,             "your time"],
                      score.par_time && [`${score.par_time}s`, "par"],
                    ].filter(Boolean).map(([val, lbl]) => (
                      <span key={lbl} className="sandbox__pill">
                        <span className="sandbox__pill-val">{val}</span> {lbl}
                      </span>
                    ))}
                  </div>
                )}

                {score.code_feedback?.length > 0 && (
                  <div className="sandbox__feedback">
                    {score.code_feedback.map((line, i) => (
                      <div key={i} className={`sandbox__feedback-line ${line.startsWith("✓") ? "sandbox__feedback-line--good" : "sandbox__feedback-line--warn"}`}>
                        {line}
                      </div>
                    ))}
                  </div>
                )}

                {passed && nextChallenge && (
                  <div className="sandbox__unlock">
                    <span className="sandbox__unlock-icon">🔓</span>
                    <span className="sandbox__unlock-id">{nextChallenge.id} unlocked —</span>
                    <span className="sandbox__unlock-title">{nextChallenge.title}</span>
                  </div>
                )}

                {passed && isBoss && (
                  <div className="sandbox__boss-complete">
                    🏆 Track {challenge.track} complete!
                    {nextChallenge
                      ? ` Track ${challenge.track + 1} is now unlocked.`
                      : " More tracks coming soon!"}
                  </div>
                )}

                <div className="sandbox__actions">
                  {passed && nextChallenge && (
                    <button onClick={handleGoNext} className="btn btn--green sandbox__action-primary">
                      Next challenge →
                    </button>
                  )}
                  <button onClick={handleRetry} className={`btn btn--outline sandbox__action-secondary ${passed && nextChallenge ? "" : "sandbox__action-secondary--full"}`}>
                    Try again
                  </button>
                  <button
                    onClick={() => navigate("/challenges")}
                    title="Back to challenge list"
                    className="btn btn--ghost sandbox__action-icon"
                  >
                    ☰
                  </button>
                </div>

                {user && passed && (
                  <div className="sandbox__save-bot">
                    <input
                      value={botName}
                      onChange={e => setBotName(e.target.value)}
                      placeholder="Name this solution to save..."
                      className="form-input sandbox__save-input"
                    />
                    <button
                      onClick={handleSaveBot}
                      disabled={!botName.trim()}
                      className="btn btn--green btn--sm"
                    >
                      Save
                    </button>
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