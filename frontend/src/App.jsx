import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import SimCanvas from "./SimCanvas";
import ApiRef from "./ApiRef";
import ChallengeSelector from "./ChallengeSelector";
import ResultsDrawer from "./ResultsDrawer";
import "./index.css";
import Auth from "./Auth";
import { saveRun, getPersonalBest, saveBot, listMyBots, togglePublic, getPublicGallery } from "./api/runs";
import Leaderboard from "./Leaderboard";
import { Routes, Route, useNavigate, useSearchParams } from "react-router-dom";
import KarooLandingPage from "./KarooLandingPage";
import ChallengePage from "./ChallengePage";
import { markChallengeComplete } from "./api/progress";
import ChallengeBrief from "./ChallengeBrief";
import { Routes, Route, useNavigate, useSearchParams, useLocation } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

const STARTER_CODE = `# Get the robot to the green goal zone!
# robot.move(speed, duration)  — speed: -1.0 to 1.0
# robot.turn(degrees)          — positive = clockwise
# robot.wait(duration)         — pause in seconds

robot.move(1.0, 3.0)
robot.turn(90)
robot.move(1.0, 3.0)
`;

function Sandbox() {
  const [searchParams] = useSearchParams();
  const challengeFromUrl = searchParams.get("challenge");
  const navigate = useNavigate();

  const [code, setCode] = useState(STARTER_CODE);
  const [frames, setFrames] = useState([]);
  const [obstacles, setObstacles] = useState([]);
  const [goal, setGoal] = useState(null);
  const [goals, setGoals] = useState([]);
  const [flags, setFlags] = useState([]);
  const [start, setStart] = useState(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("Ready");
  const [consoleOut, setConsoleOut] = useState([]);
  const [score, setScore] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [user, setUser] = useState(null);
  const [personalBest, setPersonalBest] = useState(null);
  const [myBots, setMyBots] = useState([]);
  const [botName, setBotName] = useState("");
  const [gallery, setGallery] = useState([]);
  const [drawer, setDrawer] = useState(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintPenalty, setHintPenalty] = useState(0);
  const [briefOpen, setBriefOpen] = useState(true);
  const [nextChallenge, setNextChallenge] = useState(null);

  // Load challenges — re-runs when URL param changes
  useEffect(() => {
    axios.get(`${API}/challenges`).then(res => {
      const list = res.data.challenges;
      setChallenges(list);
      if (challengeFromUrl) {
        const target = list.find(c => c.id === challengeFromUrl);
        setSelectedChallenge(target || list[0]);
      } else {
        setSelectedChallenge(list[0]);
      }
    });
  }, [challengeFromUrl]);

  // Reset canvas and editor when challenge changes
  useEffect(() => {
    if (!selectedChallenge) return;
    setFrames([]);
    setObstacles(selectedChallenge.obstacles || []);
    setGoals(selectedChallenge.goals || []);
    setFlags(selectedChallenge.flags || []);
    setGoal(selectedChallenge.goals?.[0] || null);
    setStart(selectedChallenge.start || null);
    setScore(null);
    setNextChallenge(null);
    setError(null);
    setConsoleOut([]);
    setStatus("Ready");
    setHintsUsed(0);
    setHintPenalty(0);
    if (selectedChallenge.starter_code) {
      setCode(selectedChallenge.starter_code);
    }
  }, [selectedChallenge]);

  useEffect(() => {
    if (!selectedChallenge) return;
    refreshGallery();
  }, [selectedChallenge]);

  useEffect(() => {
    if (!user || !selectedChallenge) return;
    getPersonalBest(user, selectedChallenge.id).then(setPersonalBest);
    listMyBots(user, selectedChallenge.id).then(setMyBots);
  }, [user, selectedChallenge]);

  async function refreshGallery() {
    if (!selectedChallenge) return;
    const data = await getPublicGallery(selectedChallenge.id);
    setGallery(data);
  }

  async function handleSaveBot() {
    if (!user || !botName.trim() || !selectedChallenge) return;
    await saveBot({ user, name: botName.trim(), code, challengeId: selectedChallenge.id });
    setBotName("");
    listMyBots(user, selectedChallenge.id).then(setMyBots);
  }

  async function handleTogglePublic(checked) {
    const lastBot = myBots[0];
    if (lastBot) {
      await togglePublic(lastBot.id, checked);
      await refreshGallery();
    }
  }

  function handleRevealHint(index, cost) {
    setHintsUsed(index + 1);
    setHintPenalty(p => p + cost);
  }

  function handleGoNext() {
    console.log("handleGoNext — nextChallenge:", nextChallenge);
    if (!nextChallenge?.id) return;
    setDrawer(null);
    setScore(null);
    setFrames([]);
    setConsoleOut([]);
    setError(null);
    setStatus("Ready");
    setNextChallenge(null);
    navigate(`/sandbox?challenge=${nextChallenge.id}`);
  }

  function handleRetry() {
    setScore(null);
    setFrames([]);
    setConsoleOut([]);
    setError(null);
    setStatus("Ready");
    setDrawer(null);
    if (selectedChallenge?.starter_code) {
      setCode(selectedChallenge.starter_code);
    }
  }

  async function handleRun() {
    if (!selectedChallenge) return;
    setRunning(true);
    setError(null);
    setConsoleOut([]);
    setScore(null);
    setNextChallenge(null);  // ← reset here, not below
    setStatus("Running...");

    try {
      const res = await axios.post(`${API}/run`, {
        code,
        challenge_id: selectedChallenge.id,
      });

      setFrames(res.data.frames);
      setObstacles(res.data.obstacles || []);
      setGoals(res.data.goals || []);
      setFlags(res.data.flags || []);
      setGoal(res.data.goal || res.data.goals?.[0] || null);
      setStart(res.data.start || null);
      setConsoleOut(res.data.console || []);

      // Store next challenge BEFORE setting score
      const next = res.data.next_challenge || null;
      setNextChallenge(next);

      const result = res.data.score;

      // Apply hint penalty
      let finalResult = result;
      if (hintPenalty > 0 && result) {
        const penalisedScore = Math.max(0, result.score - hintPenalty);
        finalResult = {
          ...result,
          score: penalisedScore,
          breakdown: {
            ...result.breakdown,
            hint_penalty: hintPenalty,
            total: penalisedScore,
          },
        };
      }
      setScore(finalResult);

      if (user && selectedChallenge) {
        await saveRun({
          user,
          challengeId: selectedChallenge.id,
          score: finalResult.score,
          timeTaken: finalResult.time_taken,
          passed: finalResult.passed,
          code,
        });
        getPersonalBest(user, selectedChallenge.id).then(setPersonalBest);

        if (finalResult.passed) {
          const nextIds = next ? [next.id] : [];
          await markChallengeComplete(user, selectedChallenge.id, finalResult.score, nextIds);
        }
      }

      setStatus(`Done — ${res.data.total_frames} frames`);
      setDrawer("results");
    } catch (err) {
      const msg = err.response?.data?.detail || "Something went wrong";
      setError(msg);
      setStatus("Error");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100vh", background: "#0f0f0f",
      color: "#eee", fontFamily: "monospace", overflow: "hidden",
      position: "relative"
    }}>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "10px 20px", borderBottom: "1px solid #222", flexShrink: 0
      }}>
        <button
          onClick={() => navigate("/challenges")}
          style={{
            background: "transparent", border: "1px solid #333",
            borderRadius: 6, padding: "5px 10px", color: "#666",
            cursor: "pointer", fontSize: 12
          }}
        >
          ← Challenges
        </button>
        <span style={{ fontSize: 17, fontWeight: 700 }}>🤖 Robotics Sandbox</span>
        <button
          onClick={handleRun}
          disabled={running}
          style={{
            background: running ? "#1a1a1a" : "#22c55e",
            color: running ? "#555" : "#000",
            border: "1px solid " + (running ? "#333" : "#22c55e"),
            borderRadius: 6, padding: "6px 18px",
            fontWeight: 700, fontSize: 13,
            cursor: running ? "not-allowed" : "pointer",
          }}
        >
          {running ? "⏳ Running..." : "▶ Run"}
        </button>
        <span style={{ fontSize: 12, color: "#555" }}>{status}</span>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          {score && (
            <span style={{
              fontSize: 12,
              color: score.passed ? "#22c55e" : "#f87171",
              padding: "4px 10px", border: "1px solid #222", borderRadius: 6
            }}>
              {score.passed
                ? `${score.breakdown?.total ?? score.score}/${selectedChallenge?.points_max ?? 100}`
                : "Not solved"}
            </span>
          )}
          <button
            onClick={() => setDrawer(d => d === "results" ? null : "results")}
            style={{
              background: drawer === "results" ? "#1a1a1a" : "transparent",
              color: "#888", border: "1px solid #333",
              borderRadius: 6, padding: "6px 12px", fontSize: 12, cursor: "pointer"
            }}
          >
            📊 Results
          </button>
          <button
            onClick={() => setDrawer(d => d === "leaderboard" ? null : "leaderboard")}
            style={{
              background: drawer === "leaderboard" ? "#1a1a1a" : "transparent",
              color: "#888", border: "1px solid #333",
              borderRadius: 6, padding: "6px 12px", fontSize: 12, cursor: "pointer"
            }}
          >
            🏆 Leaderboard
          </button>
          <Auth onUserChange={setUser} />
        </div>
      </div>

      {/* Challenge selector */}
      <ChallengeSelector
        challenges={challenges}
        selected={selectedChallenge}
        onSelect={ch => setSelectedChallenge(ch)}
      />

      {personalBest && (
        <div style={{
          padding: "5px 20px", fontSize: 11, color: "#4ade80",
          background: "#0a0a0a", borderBottom: "1px solid #1a1a1a"
        }}>
          Your best: {personalBest.score}/{selectedChallenge?.points_max ?? 100} in {personalBest.time_taken}s
        </div>
      )}

      {/* Main workspace */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>

        {/* Brief toggle */}
        <button
          onClick={() => setBriefOpen(o => !o)}
          title={briefOpen ? "Hide brief" : "Show brief"}
          style={{
            width: 20, flexShrink: 0, background: "#0d0d0d",
            border: "none", borderRight: "1px solid #1a1a1a",
            cursor: "pointer", color: "#444", fontSize: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            writingMode: "vertical-rl"
          }}
        >
          {briefOpen ? "◀" : "▶"}
        </button>

        {/* Challenge brief */}
        {briefOpen && (
          <ChallengeBrief
            challenge={selectedChallenge}
            hintsUsed={hintsUsed}
            onRevealHint={handleRevealHint}
          />
        )}

        {/* Editor + console */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          minWidth: 0, borderRight: "1px solid #222"
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
                padding: { top: 12 },
                fontFamily: "Menlo, Monaco, monospace",
              }}
            />
          </div>

          {/* Console */}
          <div style={{
            height: 110, flexShrink: 0,
            background: "#0a0a0a", borderTop: "1px solid #222",
            display: "flex", flexDirection: "column", overflow: "hidden"
          }}>
            <div style={{
              padding: "4px 14px", borderBottom: "1px solid #1a1a1a",
              fontSize: 10, color: "#444", letterSpacing: "0.08em", flexShrink: 0
            }}>
              CONSOLE
              {hintPenalty > 0 && (
                <span style={{ marginLeft: 12, color: "#f59e0b", fontSize: 10 }}>
                  hint penalty: -{hintPenalty} pts
                </span>
              )}
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "6px 14px", fontSize: 12, lineHeight: 1.6 }}>
              {error && <div style={{ color: "#f87171" }}>✖ {error}</div>}
              {!error && consoleOut.length === 0 && (
                <div style={{ color: "#333" }}>No output. Click Run.</div>
              )}
              {consoleOut.map((line, i) => (
                <div key={i} style={{ color: "#86efac" }}>
                  <span style={{ color: "#2d6a4f", marginRight: 8 }}>{">"}</span>{line}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div style={{
          width: 520, flexShrink: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          background: "#111", padding: 16, gap: 8, minHeight: 0
        }}>
          {selectedChallenge && (
            <div style={{ fontSize: 11, color: "#555", alignSelf: "flex-start" }}>
              <span style={{ color: "#5DCAA5" }}>
                {selectedChallenge.title || selectedChallenge.name}
              </span>
            </div>
          )}
          <SimCanvas
            frames={frames}
            obstacles={obstacles}
            goal={goal}
            goals={goals}
            flags={flags}
            start={start}
          />
          <div style={{ fontSize: 11, color: "#2a2a2a" }}>
            {frames.length > 0 ? `${frames.length} frames` : "waiting for run"}
          </div>
        </div>
      </div>

      <ApiRef />

      <ResultsDrawer
        isOpen={drawer === "results"}
        onClose={() => setDrawer(null)}
        score={score}
        challenge={selectedChallenge}
        nextChallenge={nextChallenge}
        user={user}
        botName={botName}
        setBotName={setBotName}
        onSaveBot={handleSaveBot}
        myBots={myBots}
        onLoadBot={(c) => setCode(c)}
        onTogglePublic={handleTogglePublic}
        gallery={gallery}
        onLoadGalleryCode={(c) => setCode(c)}
        onGoNext={handleGoNext}
        onRetry={handleRetry}
      />

      <LeaderboardDrawer
        challengeId={selectedChallenge?.id}
        isOpen={drawer === "leaderboard"}
        onClose={() => setDrawer(null)}
      />
    </div>
  );
}

function LeaderboardDrawer(props) {
  return <Leaderboard {...props} />;
}

export default function App() {
  const navigate  = useNavigate();
  const location  = useLocation();

  return (
    <Routes>
      <Route
        path="/"
        element={<KarooLandingPage onExploreCourses={() => navigate("/challenges")} />}
      />
      <Route
        path="/challenges"
        element={
          <ChallengePage
            onStartChallenge={(id) => navigate(`/sandbox?challenge=${id}`)}
            onBack={() => navigate("/")}
          />
        }
      />
      <Route
        path="/sandbox"
        element={<Sandbox key={location.search} />}
      />
    </Routes>
  );
}