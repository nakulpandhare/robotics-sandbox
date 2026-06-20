import { useState, useEffect } from "react";
import { getLeaderboard } from "./api/runs";

export default function Leaderboard({ challengeId, isOpen, onClose }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !challengeId) return;
    setLoading(true);
    getLeaderboard(challengeId).then(data => {
      setRows(data);
      setLoading(false);
    });
  }, [isOpen, challengeId]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: "absolute", top: 0, right: 0, bottom: 0,
      width: 320, background: "#0d0d0d", borderLeft: "1px solid #222",
      display: "flex", flexDirection: "column", zIndex: 10
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "12px 16px", borderBottom: "1px solid #1a1a1a"
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#eee" }}>🏆 Leaderboard</span>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 16 }}
        >
          ✕
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {loading && (
          <div style={{ padding: 16, fontSize: 12, color: "#444" }}>Loading...</div>
        )}
        {!loading && rows.length === 0 && (
          <div style={{ padding: 16, fontSize: 12, color: "#444" }}>
            No scores yet. Be the first!
          </div>
        )}
        {rows.map((row, i) => (
          <div
            key={row.user_id}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 16px", borderBottom: "1px solid #161616"
            }}
          >
            <span style={{
              width: 20, fontSize: 12, fontWeight: 700,
              color: i === 0 ? "#facc15" : i === 1 ? "#cbd5e1" : i === 2 ? "#d97706" : "#444"
            }}>
              {i + 1}
            </span>
            {row.profiles?.avatar_url && (
              <img
                src={row.profiles.avatar_url}
                alt=""
                style={{ width: 22, height: 22, borderRadius: "50%" }}
              />
            )}
            <span style={{ fontSize: 12, color: "#ccc", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {row.profiles?.username || "anonymous"}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#22c55e" }}>
              {row.score}
            </span>
            <span style={{ fontSize: 10, color: "#444" }}>
              {row.time_taken}s
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}