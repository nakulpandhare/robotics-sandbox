import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import SimCanvas from "./SimCanvas";
import ApiRef from "./ApiRef";
import ChallengeSelector from "./ChallengeSelector";
import ScorePanel from "./ScorePanel";
import "./index.css";
import Auth from "./Auth";
import { saveRun, getPersonalBest, saveBot, listMyBots } from "./api/runs";

const API = "http://localhost:8000/api";

const STARTER_CODE = `# Get the robot to the green goal zone!
# robot.move(speed, duration)  — speed: -1.0 to 1.0
# robot.turn(degrees)          — positive = clockwise
# robot.wait(duration)         — pause in seconds

robot.move(1.0, 3.0)
robot.turn(90)
robot.move(1.0, 3.0)
`;

export default function App() {
  const [code, setCode] = useState(STARTER_CODE);
  const [frames, setFrames] = useState([]);
  const [obstacles, setObstacles] = useState([]);
  const [goal, setGoal] = useState(null);
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

  // Load challenges on mount
  useEffect(() => {
    axios.get(`${API}/challenges`).then(res => {
      const list = res.data.challenges;
      setChallenges(list);
      setSelectedChallenge(list[0]);
    });
  }, []);

  // When challenge changes, reset the canvas to show its layout
  useEffect(() => {
    if (!selectedChallenge) return;
    setFrames([]);
    setObstacles(selectedChallenge.obstacles || []);
    setGoal(selectedChallenge.goal || null);
    setStart(selectedChallenge.start || null);
    setScore(null);
    setError(null);
    setConsoleOut([]);
    setStatus("Ready");
  }, [selectedChallenge]);

  useEffect(() => {
  if (!user || !selectedChallenge) return;
  getPersonalBest(user, selectedChallenge.id).then(setPersonalBest);
  listMyBots(user, selectedChallenge.id).then(setMyBots);
  }, [user, selectedChallenge]);

  async function handleSaveBot() {
    if (!user || !botName.trim() || !selectedChallenge) return;
    await saveBot({ user, name: botName.trim(), code, challengeId: selectedChallenge.id });
    setBotName("");
    listMyBots(user, selectedChallenge.id).then(setMyBots);
  }

  async function handleRun() {
    if (!selectedChallenge) return;
    setRunning(true);
    setError(null);
    setConsoleOut([]);
    setScore(null);
    setStatus("Running...");

    try {
      const res = await axios.post(`${API}/run`, {
        code,
        challenge_id: selectedChallenge.id,
      });
      setFrames(res.data.frames);
      setObstacles(res.data.obstacles || []);
      setGoal(res.data.goal || null);
      setStart(res.data.start || null);
      setConsoleOut(res.data.console || []);
      setScore(res.data.score);
      const result = res.data.score;
      setScore(result);

      if (user && selectedChallenge) {
        await saveRun({
          user,
          challengeId: selectedChallenge.id,
          score: result.score,
          timeTaken: result.time_taken,
          passed: result.passed,
          code,
        });
        getPersonalBest(user, selectedChallenge.id).then(setPersonalBest);
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

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100vh", background: "#0f0f0f",
      color: "#eee", fontFamily: "monospace", overflow: "hidden"
    }}>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "10px 20px", borderBottom: "1px solid #222", flexShrink: 0
      }}>
        <span style={{ fontSize: 17, fontWeight: 700 }}>🤖 Robotics Sandbox</span>
        <button onClick={handleRun} disabled={running} style={{ /* ...unchanged... */ }}>
          {running ? "⏳ Running..." : "▶ Run"}
        </button>
        <span style={{ fontSize: 12, color: "#555" }}>{status}</span>
        <div style={{ marginLeft: "auto" }}>
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
          padding: "6px 20px", fontSize: 12, color: "#4ade80",
          background: "#0a0a0a", borderBottom: "1px solid #1a1a1a"
        }}>
          Your best: {personalBest.score}/100 in {personalBest.time_taken}s
        </div>
      )}

      {/* Main area */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Left: editor + console */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          minWidth: 0, borderRight: "1px solid #222"
        }}>
          <div style={{ flex: 1, overflow: "hidden" }}>
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
            height: 150, flexShrink: 0,
            background: "#0a0a0a", borderTop: "1px solid #222",
            display: "flex", flexDirection: "column", overflow: "hidden"
          }}>
            <div style={{
              padding: "5px 14px", borderBottom: "1px solid #1a1a1a",
              fontSize: 11, color: "#444", letterSpacing: "0.08em", flexShrink: 0
            }}>
              CONSOLE
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 14px", fontSize: 13, lineHeight: 1.7 }}>
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

        {/* Right: canvas */}
        <div style={{
          width: 580, flexShrink: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          background: "#111", padding: 20, gap: 10
        }}>
          {selectedChallenge && (
            <div style={{ fontSize: 12, color: "#555", alignSelf: "flex-start" }}>
              <span style={{ color: "#22c55e" }}>{selectedChallenge.name}</span>
              <span style={{ marginLeft: 8 }}>{selectedChallenge.description}</span>
            </div>
          )}
          <SimCanvas frames={frames} obstacles={obstacles} goal={goal} start={start} />
          <div style={{ fontSize: 11, color: "#2a2a2a" }}>
            {frames.length > 0 ? `${frames.length} frames` : "waiting for run"}
          </div>
        </div>
      </div>

      {/* Score panel — shown after a run */}
      <ScorePanel score={score} />

      {user && (
        <div style={{
          display: "flex", gap: 8, alignItems: "center",
          padding: "10px 20px", borderTop: "1px solid #1a1a1a", background: "#0d0d0d"
        }}>
          <input
            value={botName}
            onChange={e => setBotName(e.target.value)}
            placeholder="Name this bot to save it..."
            style={{
              background: "#161616", border: "1px solid #2a2a2a", borderRadius: 6,
              padding: "6px 10px", color: "#eee", fontSize: 12, fontFamily: "monospace", width: 220
            }}
          />
          <button
            onClick={handleSaveBot}
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
              onChange={e => {
                const bot = myBots.find(b => b.id === e.target.value);
                if (bot) setCode(bot.code);
              }}
              style={{
                background: "#161616", border: "1px solid #2a2a2a", borderRadius: 6,
                padding: "6px 10px", color: "#888", fontSize: 12, marginLeft: 8
              }}
            >
              <option value="">Load saved bot...</option>
              {myBots.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* API reference */}
      <ApiRef />

    </div>
  );
}