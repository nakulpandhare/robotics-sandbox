const COMMANDS = [
  {
    fn: "robot.move(speed, duration)",
    desc: "Move forward or backward",
    params: [
      { name: "speed", type: "float", note: "-1.0 to 1.0 · negative = reverse" },
      { name: "duration", type: "float", note: "seconds (0 – 5)" },
    ],
    example: "robot.move(0.8, 2.0)",
  },
  {
    fn: "robot.turn(degrees)",
    desc: "Rotate in place",
    params: [
      { name: "degrees", type: "float", note: "positive = clockwise" },
    ],
    example: "robot.turn(90)",
  },
  {
    fn: "robot.wait(duration)",
    desc: "Pause the robot",
    params: [
      { name: "duration", type: "float", note: "seconds (0 – 3)" },
    ],
    example: "robot.wait(0.5)",
  },
];

export default function ApiRef() {
  return (
    <div style={{
      background: "#0d0d0d",
      borderTop: "1px solid #1a1a1a",
      padding: "10px 16px",
      fontSize: 12,
      color: "#555",
      flexShrink: 0,
    }}>
      <div style={{ color: "#333", marginBottom: 8, letterSpacing: "0.08em", fontSize: 11 }}>
        API REFERENCE
      </div>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        {COMMANDS.map(cmd => (
          <div key={cmd.fn} style={{ minWidth: 180 }}>
            <div style={{ color: "#22c55e", fontFamily: "monospace", marginBottom: 2 }}>
              {cmd.fn}
            </div>
            <div style={{ color: "#444", marginBottom: 4 }}>{cmd.desc}</div>
            {cmd.params.map(p => (
              <div key={p.name} style={{ paddingLeft: 8, color: "#383838", lineHeight: 1.8 }}>
                <span style={{ color: "#4ade80" }}>{p.name}</span>
                <span style={{ color: "#2d4a35" }}> {p.type}</span>
                <span> · {p.note}</span>
              </div>
            ))}
            <div style={{ color: "#2d6a4f", marginTop: 4, fontFamily: "monospace" }}>
              # {cmd.example}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}