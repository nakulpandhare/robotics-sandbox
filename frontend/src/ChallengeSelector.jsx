export default function ChallengeSelector({ challenges, selected, onSelect }) {
  return (
    <div style={{
      display: "flex",
      gap: 8,
      padding: "10px 20px",
      borderBottom: "1px solid #1a1a1a",
      background: "#0d0d0d",
      flexShrink: 0,
      overflowX: "auto",
    }}>
      <span style={{ fontSize: 12, color: "#444", alignSelf: "center", marginRight: 4 }}>
        CHALLENGE
      </span>
      {challenges.map(ch => (
        <button
          key={ch.id}
          onClick={() => onSelect(ch)}
          style={{
            background: selected?.id === ch.id ? "#14532d" : "transparent",
            color: selected?.id === ch.id ? "#86efac" : "#555",
            border: "1px solid " + (selected?.id === ch.id ? "#166534" : "#222"),
            borderRadius: 6,
            padding: "5px 14px",
            fontSize: 12,
            cursor: "pointer",
            whiteSpace: "nowrap",
            fontFamily: "monospace",
          }}
        >
          {ch.name}
        </button>
      ))}
    </div>
  );
}