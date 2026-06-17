import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import SimCanvas from "./SimCanvas";
import "./index.css";

const STARTER_CODE = `# Control your robot!
# Commands: robot.move(speed, duration), robot.turn(degrees), robot.wait(duration)

robot.move(0.8, 1.5)   # move forward
robot.turn(90)          # turn right
robot.move(0.8, 1.5)   # move forward again
robot.turn(-90)         # turn left
robot.move(0.5, 1.0)   # slow forward
`;

export default function App() {
  const [code, setCode] = useState(STARTER_CODE);
  const [frames, setFrames] = useState([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("Ready");

  async function handleRun() {
    setRunning(true);
    setError(null);
    setStatus("Running simulation...");
    try {
      const res = await axios.post("http://localhost:8000/api/run", { code });
      setFrames(res.data.frames);
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
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#0f0f0f", color: "#eee", fontFamily: "monospace" }}>
      <header style={{ padding: "12px 20px", borderBottom: "1px solid #222", display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontSize: 18, fontWeight: 600 }}>Robotics Sandbox</span>
        <button
          onClick={handleRun}
          disabled={running}
          style={{ background: running ? "#333" : "#22c55e", color: running ? "#888" : "#000", border: "none", borderRadius: 6, padding: "6px 20px", fontWeight: 600, cursor: running ? "not-allowed" : "pointer", fontSize: 14 }}
        >
          {running ? "Running..." : "▶ Run"}
        </button>
        <span style={{ fontSize: 12, color: "#666" }}>{status}</span>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Editor
            height="100%"
            defaultLanguage="python"
            value={code}
            onChange={setCode}
            theme="vs-dark"
            options={{ fontSize: 14, minimap: { enabled: false }, lineNumbers: "on", scrollBeyondLastLine: false }}
          />
          {error && (
            <div style={{ background: "#2a0a0a", borderTop: "1px solid #500", padding: "10px 16px", fontSize: 13, color: "#f87171" }}>
              {error}
            </div>
          )}
        </div>

        <div style={{ width: 600, borderLeft: "1px solid #222", display: "flex", alignItems: "center", justifyContent: "center", background: "#111" }}>
          <SimCanvas frames={frames} />
        </div>
      </div>
    </div>
  );
}