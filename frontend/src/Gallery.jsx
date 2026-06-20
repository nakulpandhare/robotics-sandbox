export default function Gallery({ bots, onLoadCode }) {
  if (!bots || bots.length === 0) return null;

  return (
    <div style={{
      padding: "10px 20px", borderTop: "1px solid #1a1a1a", background: "#0a0a0a"
    }}>
      <div style={{ fontSize: 11, color: "#444", marginBottom: 8, letterSpacing: "0.08em" }}>
        PUBLIC GALLERY
      </div>
      <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
        {bots.map(bot => (
          <button
            key={bot.id}
            onClick={() => onLoadCode(bot.code)}
            style={{
              flexShrink: 0, background: "#141414", border: "1px solid #222",
              borderRadius: 8, padding: "8px 12px", cursor: "pointer", textAlign: "left", minWidth: 140
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              {bot.profiles?.avatar_url && (
                <img src={bot.profiles.avatar_url} alt="" style={{ width: 16, height: 16, borderRadius: "50%" }} />
              )}
              <span style={{ fontSize: 10, color: "#666" }}>{bot.profiles?.username || "anon"}</span>
            </div>
            <div style={{ fontSize: 12, color: "#86efac" }}>{bot.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}