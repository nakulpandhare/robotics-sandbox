import { useState, useEffect } from "react";
import axios from "axios";
import { supabase } from "./supabaseClient";

const API = import.meta.env.VITE_API_URL;

const TRACK_META = {
  1: { label: "From hands to code",     icon: "🤖", color: "var(--color-background-info)",    text: "var(--color-text-info)" },
  2: { label: "Loops",                  icon: "🔁", color: "var(--color-background-success)", text: "var(--color-text-success)" },
  3: { label: "Decisions & sensors",    icon: "🧠", color: "var(--color-background-warning)", text: "var(--color-text-warning)" },
  4: { label: "Functions & structure",  icon: "⚙️", color: "var(--color-background-secondary)", text: "var(--color-text-secondary)" },
  5: { label: "Real robotics concepts", icon: "📡", color: "var(--color-background-info)",    text: "var(--color-text-info)" },
  6: { label: "Arduino: code to circuit", icon: "⚡", color: "var(--color-background-danger)", text: "var(--color-text-danger)" },
};

export default function ChallengePage({ onStartChallenge, onBack }) {
  const [curriculum, setCurriculum] = useState({});
  const [progress, setProgress]     = useState({ completed: [], unlocked: ["1.1"] });
  const [activeTrack, setActiveTrack] = useState(1);
  const [loading, setLoading]       = useState(true);
  const [user, setUser]             = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null));
  }, []);

  useEffect(() => {
    axios.get(`${API}/curriculum`).then(res => {
      setCurriculum(res.data.tracks);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("student_progress")
      .select("challenge_id, status, best_score")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (!data) return;
        const completed = data.filter(r => r.status === "completed").map(r => r.challenge_id);
        const unlocked  = data.map(r => r.challenge_id);
        setProgress({ completed, unlocked, scores: Object.fromEntries(data.map(r => [r.challenge_id, r.best_score])) });
      });
  }, [user]);

  const trackNums = Object.keys(TRACK_META).map(Number);

  function isTrackUnlocked(trackNum) {
    if (trackNum === 1) return true;
    const challenges = curriculum[trackNum - 1] || [];
    return challenges.every(c => progress.completed.includes(c.id));
  }

  function challengeState(ch) {
    if (progress.completed.includes(ch.id)) return "done";
    if (progress.unlocked.includes(ch.id))  return "unlocked";
    return "locked";
  }

  function trackProgress(trackNum) {
    const challenges = curriculum[trackNum] || [];
    const done = challenges.filter(c => progress.completed.includes(c.id)).length;
    return { done, total: challenges.length };
  }

  function totalPoints() {
    if (!progress.scores) return 0;
    return Object.values(progress.scores).reduce((a, b) => a + (b || 0), 0);
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--term-bg)", color: "var(--term-text-secondary)", fontFamily: "monospace", fontSize: 14 }}>
        Loading curriculum...
      </div>
    );
  }

  const trackChallenges = curriculum[activeTrack] || [];
  const meta = TRACK_META[activeTrack];
  const prog = trackProgress(activeTrack);

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100vh",
      background: "var(--term-bg)", color: "var(--term-text)", fontFamily: "monospace", overflow: "hidden"
    }}>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "12px 24px", borderBottom: `1px solid var(--term-border)`,
        background: "var(--term-bg)", flexShrink: 0
      }}>
        <button onClick={onBack} style={{
          background: "transparent", border: `0.5px solid var(--term-border)`,
          borderRadius: 6, padding: "6px 12px", color: "var(--term-text-dim)",
          cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 6
        }}>
          ← Back
        </button>
        <span style={{ fontSize: 15, fontWeight: 500, color: "var(--term-text)" }}>
          KA<span style={{ color: "var(--term-accent)" }}>ROO</span>
          <span style={{ color: "var(--term-text-faint)", marginLeft: 8, fontWeight: 400, fontSize: 12 }}>/ learning path</span>
        </span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
          {user && (
            <>
              <span style={{ fontSize: 12, color: "var(--term-text-faint)" }}>
                {totalPoints()} pts total
              </span>
              <img src={user.user_metadata?.avatar_url} alt="" style={{ width: 28, height: 28, borderRadius: "50%" }} />
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Sidebar */}
        <div style={{
          width: 240, flexShrink: 0, borderRight: `1px solid var(--term-border)`,
          background: "var(--term-bg-deep)", display: "flex", flexDirection: "column", overflow: "hidden"
        }}>
          <div style={{ padding: "14px 16px 10px", borderBottom: `0.5px solid var(--term-border)` }}>
            <div style={{ fontSize: 11, color: "var(--term-text-faint)", marginBottom: 2, letterSpacing: "0.05em" }}>
              LEARNING PATH
            </div>
            <div style={{ fontSize: 13, color: "var(--term-text-secondary)" }}>
              {Object.values(progress.completed || []).length} challenges complete
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {trackNums.map(t => {
              const tm    = TRACK_META[t];
              const tp    = trackProgress(t);
              const locked = !isTrackUnlocked(t);
              const isActive = t === activeTrack;
              return (
                <button
                  key={t}
                  onClick={() => !locked && setActiveTrack(t)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 16px", width: "100%", textAlign: "left",
                    background: isActive ? "var(--term-surface)" : "transparent",
                    border: "none",
                    borderRight: isActive ? `2px solid var(--term-accent)` : "2px solid transparent",
                    cursor: locked ? "not-allowed" : "pointer",
                    opacity: locked ? 0.45 : 1,
                  }}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%",
                    background: locked ? "var(--term-border)" : tm.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, flexShrink: 0
                  }}>
                    {locked ? "🔒" : tm.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "var(--term-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      Track {t}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--term-text-faint)" }}>
                      {locked ? "Locked" : `${tp.done} / ${tp.total} complete`}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>

          {/* Track header */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{
                fontSize: 11, fontWeight: 500, padding: "3px 10px",
                borderRadius: 4, background: meta.color, color: meta.text,
                letterSpacing: "0.05em"
              }}>
                TRACK {activeTrack}
              </span>
              <h1 style={{ fontSize: 18, fontWeight: 500, margin: 0, color: "var(--term-text)" }}>
                {meta.label}
              </h1>
            </div>

            {/* Progress bar */}
            <div style={{ height: 4, background: "var(--term-border)", borderRadius: 2, marginBottom: 6, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 2, background: "var(--term-accent)",
                width: prog.total > 0 ? `${Math.round((prog.done / prog.total) * 100)}%` : "0%",
                transition: "width .4s"
              }} />
            </div>
            <div style={{ fontSize: 11, color: "var(--term-text-faint)" }}>
              {prog.done} of {prog.total} challenges complete
            </div>
          </div>

          {/* Challenge list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {trackChallenges.map(ch => {
              const state = challengeState(ch);
              const score = progress.scores?.[ch.id];
              const isLocked   = state === "locked";
              const isDone     = state === "done";
              const isUnlocked = state === "unlocked";

              return (
                <div
                  key={ch.id}
                  onClick={() => !isLocked && onStartChallenge(ch.id)}
                  style={{
                    display: "grid", gridTemplateColumns: "36px 1fr auto",
                    gap: 12, alignItems: "center",
                    padding: "12px 14px",
                    borderRadius: 8,
                    border: isDone
                      ? `0.5px solid var(--color-border-success, #3B6D11)`
                      : isUnlocked && !ch.is_boss
                      ? `2px solid var(--term-accent)`
                      : ch.is_boss
                      ? `0.5px solid var(--color-border-warning, #854F0B)`
                      : `0.5px solid var(--term-border)`,
                    background: "var(--term-surface)",
                    cursor: isLocked ? "not-allowed" : "pointer",
                    opacity: isLocked ? 0.45 : 1,
                    transition: "border-color .15s",
                  }}
                  onMouseEnter={e => !isLocked && (e.currentTarget.style.borderColor = "var(--term-accent)")}
                  onMouseLeave={e => {
                    if (isLocked) return;
                    e.currentTarget.style.borderColor = isDone
                      ? "var(--color-border-success, #3B6D11)"
                      : isUnlocked && !ch.is_boss
                      ? "var(--term-accent)"
                      : ch.is_boss
                      ? "var(--color-border-warning, #854F0B)"
                      : "var(--term-border)";
                  }}
                >
                  {/* State icon */}
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", display: "flex",
                    alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0,
                    background: isDone
                      ? "var(--color-background-success)"
                      : ch.is_boss
                      ? "var(--color-background-warning)"
                      : isUnlocked
                      ? "var(--color-background-info)"
                      : "var(--term-border)",
                  }}>
                    {isDone    ? "✓"  :
                     ch.is_boss ? "🏆" :
                     isLocked  ? "🔒" : "▶"}
                  </div>

                  {/* Info */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--term-text)", marginBottom: 3 }}>
                      {ch.id} — {ch.title}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--term-text-faint)" }}>
                      {ch.concept}
                      {ch.is_boss && (
                        <span style={{
                          marginLeft: 8, fontSize: 10, padding: "1px 6px",
                          background: "var(--color-background-warning)",
                          color: "var(--color-text-warning)", borderRadius: 3
                        }}>
                          must score {ch.pass_threshold}+ to unlock next track
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score / points */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    {isDone && score != null && (
                      <span style={{
                        fontSize: 11, padding: "2px 8px", borderRadius: 4, fontWeight: 500,
                        background: "var(--color-background-success)",
                        color: "var(--color-text-success)"
                      }}>
                        {score} / {ch.points_max}
                      </span>
                    )}
                    {isUnlocked && !isDone && (
                      <span style={{
                        fontSize: 11, padding: "2px 8px", borderRadius: 4,
                        background: "var(--color-background-info)",
                        color: "var(--color-text-info)"
                      }}>
                        {ch.pass_threshold}+ to pass
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: "var(--term-text-faint)", fontFamily: "monospace" }}>
                      {ch.points_max} pts
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}