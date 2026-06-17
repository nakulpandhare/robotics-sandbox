import { useState } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import SimCanvas from "./SimCanvas";
import "./index.css";

const STARTER_CODE = `# Control your robot!
# robot.move(speed, duration)  — speed: -1.0 to 1.0
# robot.turn(degrees)          — positive = clockwise
# robot.wait(duration)         — pause in seconds

print("Starting!")
robot.move(1.0, 2.0)
robot.turn(90)
print("Turned!")
robot.move(0.5, 1.0)
`;

export default function App() {
  const [code, setCode] = useState(STARTER_CODE);
  const [frames, setFrames] = useState([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("Ready");
  const [consoleOut, setConsoleOut] = useState([]);

  async function handleRun() {
    setRunning(true);
    setError(null);
    setConsoleOut([]);
    setStatus("Running...");
    try {
      const res = await axios.post("http://localhost:8000/api/run", { code });
      setFrames(res.data.frames);
      setConsoleOut(res.data.console || []);
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
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      background: "#0f0f0f",
      color: "#eee",
      fontFamily: "monospace",
      overflow: "hidden"
    }}>

      {/* ── Header ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "10px 20px",
        borderBottom: "1px solid #222",
        flexShrink: 0
      }}>
        <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.3px" }}>
          🤖 Robotics Sandbox
        </span>
        <button
          onClick={handleRun}
          disabled={running}
          style={{
            background: running ? "#1a1a1a" : "#22c55e",
            color: running ? "#555" : "#000",
            border: "1px solid " + (running ? "#333" : "#22c55e"),
            borderRadius: 6,
            padding: "6px 18px",
            fontWeight: 700,
            fontSize: 13,
            cursor: running ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: 6
          }}
        >
          {running ? "⏳ Running..." : "▶ Run"}
        </button>
        <span style={{ fontSize: 12, color: "#555" }}>{status}</span>
      </div>

      {/* ── Main content: editor + right panel ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Left: Editor + Console ── */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          borderRight: "1px solid #222"
        }}>

          {/* Editor — takes remaining height above console */}
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

          {/* Console panel — fixed height at bottom of editor column */}
          <div style={{
            height: 160,
            flexShrink: 0,
            background: "#0a0a0a",
            borderTop: "1px solid #222",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}>
            <div style={{
              padding: "6px 14px",
              borderBottom: "1px solid #1a1a1a",
              fontSize: 11,
              color: "#444",
              letterSpacing: "0.08em",
              flexShrink: 0
            }}>
              CONSOLE
            </div>
            <div style={{
              flex: 1,
              overflowY: "auto",
              padding: "8px 14px",
              fontSize: 13,
              lineHeight: 1.7
            }}>
              {error && (
                <div style={{ color: "#f87171" }}>✖ {error}</div>
              )}
              {consoleOut.length === 0 && !error && (
                <div style={{ color: "#333" }}>No output yet. Click Run.</div>
              )}
              {consoleOut.map((line, i) => (
                <div key={i} style={{ color: "#86efac" }}>
                  <span style={{ color: "#2d6a4f", marginRight: 8 }}>{">"}</span>
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Simulation canvas ── */}
        <div style={{
          width: 580,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#111",
          padding: 20,
          gap: 12
        }}>
          <SimCanvas frames={frames} />
          <div style={{ fontSize: 12, color: "#333" }}>
            {frames.length > 0
              ? `${frames.length} frames · click Run to replay`
              : "Write code and click Run"}
          </div>
        </div>

      </div>
    </div>
  );
}