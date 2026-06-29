import { useState, useEffect } from "react";
import axios from "axios";
import { supabase } from "./supabaseClient";

const API = import.meta.env.VITE_API_URL;

const TRACK_META = {
  1: { label: "From hands to code",      icon: "🤖", color: "var(--color-background-info)",    text: "var(--color-text-info)" },
  2: { label: "Loops",                   icon: "🔁", color: "var(--color-background-success)", text: "var(--color-text-success)" },
  3: { label: "Decisions & sensors",     icon: "🧠", color: "var(--color-background-warning)", text: "var(--color-text-warning)" },
  4: { label: "Functions & structure",   icon: "⚙️", color: "var(--color-background-secondary)", text: "var(--color-text-secondary)" },
  5: { label: "Real robotics concepts",  icon: "📡", color: "var(--color-background-info)",    text: "var(--color-text-info)" },
  6: { label: "Arduino: code to circuit",icon: "⚡", color: "var(--color-background-danger)", text: "var(--color-text-danger)" },
};

export default function ChallengePage({ onStartChallenge, onBack }) {
  const [curriculum, setCurriculum] = useState({});
  const [user, setUser]             = useState(undefined); // undefined = loading
  const [dbProgress, setDbProgress] = useState(null);      // null = not loaded
  const [activeTrack, setActiveTrack] = useState(1);
  const [loading, setLoading]       = useState(true);

  // Listen for auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Load curriculum
  useEffect(() => {
    axios.get(`${API}/curriculum`).then(res => {
      setCurriculum(res.data.tracks);
      setLoading(false);
    });
  }, []);

  // Load progress from Supabase when user is known
  useEffect(() => {
    if (user === undefined) return; // still loading auth
    if (!user) {
      setDbProgress(null); // logged out — use default
      return;
    }
    supabase
      .from("student_progress")
      .select("challenge_id, status, best_score")
      .eq("user_id", user.id)
      .then(({ data, error }) => {
        if (error) { console.error(error); return; }
        setDbProgress(data || []);
      });
  }, [user]);

  useEffect(() => {
    // Refetch progress whenever the page becomes visible again
    function onFocus() {
        if (!user) return;
        supabase
        .from("student_progress")
        .select("challenge_id, status, best_score")
        .eq("user_id", user.id)
        .then(({ data }) => { if (data) setDbProgress(data); });
    }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
    }, [user]);

  // Derived progress state
  const progress = (() => {
    if (!user || !dbProgress) {
      // Not logged in OR progress not loaded: only 1.1 unlocked
      return { completed: [], unlocked: ["1.1"], scores: {} };
    }
    const completed = dbProgress.filter(r => r.status === "completed").map(r => r.challenge_id);
    const unlocked  = dbProgress.map(r => r.challenge_id);
    const scores    = Object.fromEntries(dbProgress.map(r => [r.challenge_id, r.best_score]));
    // Always ensure 1.1 is unlocked
    if (!unlocked.includes("1.1")) unlocked.push("1.1");
    return { completed, unlocked, scores };
  })();

  const trackNums = Object.keys(TRACK_META).map(Number);

  function isTrackUnlocked(trackNum) {
    if (trackNum === 1) return true;
    const prev = curriculum[trackNum - 1] || [];
    return prev.length > 0 && prev.every(c => progress.completed.includes(c.id));
  }

  function challengeState(ch) {
    if (progress.completed.includes(ch.id)) return "done";
    if (progress.unlocked.includes(ch.id))  return "unlocked";
    return "locked";
  }

  function trackProgress(trackNum) {
    const chs  = curriculum[trackNum] || [];
    const done = chs.filter(c => progress.completed.includes(c.id)).length;
    return { done, total: chs.length };
  }

  function totalPoints() {
    return Object.values(progress.scores || {}).reduce((a, b) => a + (b || 0), 0);
  }

  if (loading || user === undefined) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", background: "#0d0f0e",
        color: "#7c8079", fontFamily: "monospace", fontSize: 13
      }}>
        Loading...
      </div>
    );
  }

  const trackChallenges = curriculum[activeTrack] || [];
  const meta = TRACK_META[activeTrack];
  const prog = trackProgress(activeTrack);

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100vh",
      background: "#0d0f0e", color: "#f0f1ee",
      fontFamily: "monospace", overflow: "hidden"
    }}>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "12px 24px", borderBottom: "1px solid #1e2421",
        flexShrink: 0, background: "#0a0c0b"
      }}>
        <button onClick={onBack} style={{
          background: "transparent", border: "0.5px solid #2a312c",
          borderRadius: 6, padding: "6px 12px", color: "#7c8079",
          cursor: "pointer", fontSize: 12
        }}>
          ← Back
        </button>
        <span style={{ fontSize: 15, fontWeight: 500 }}>
          KA<span style={{ color: "#5DCAA5" }}>ROO</span>
          <span style={{ color: "#5a5e56", marginLeft: 8, fontWeight: 400, fontSize: 12 }}>
            / learning path
          </span>
        </span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
          {user ? (
            <>
              <span style={{ fontSize: 12, color: "#5a5e56" }}>
                {totalPoints()} pts total
              </span>
              <img
                src={user.user_metadata?.avatar_url}
                alt=""
                style={{ width: 28, height: 28, borderRadius: "50%", cursor: "pointer" }}
                onClick={async () => {
                  await supabase.auth.signOut();
                  setUser(null);
                  setDbProgress(null);
                }}
                title="Click to sign out"
              />
            </>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => supabase.auth.signInWithOAuth({
                  provider: "github",
                  options: { redirectTo: "https://nakulpandhare.github.io/robotics-sandbox/" }
                })}
                style={{
                  background: "#1a1a1a", border: "0.5px solid #2a2a2a",
                  borderRadius: 6, padding: "6px 12px", color: "#eee",
                  cursor: "pointer", fontSize: 12
                }}
              >
                Sign in with GitHub
              </button>
              <button
                onClick={() => supabase.auth.signInWithOAuth({
                  provider: "google",
                  options: { redirectTo: "https://nakulpandhare.github.io/robotics-sandbox/" }
                })}
                style={{
                  background: "#1a1a1a", border: "0.5px solid #2a2a2a",
                  borderRadius: 6, padding: "6px 12px", color: "#eee",
                  cursor: "pointer", fontSize: 12
                }}
              >
                Sign in with Google
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Sidebar */}
        <div style={{
          width: 200, flexShrink: 0, borderRight: "1px solid #1e2421",
          background: "#0a0c0b", display: "flex", flexDirection: "column"
        }}>
          <div style={{
            padding: "12px 16px 10px", borderBottom: "0.5px solid #1e2421",
            fontSize: 10, color: "#5a5e56", letterSpacing: "0.05em"
          }}>
            LEARNING PATH
            <div style={{ fontSize: 12, color: "#9a9d95", marginTop: 2, letterSpacing: 0 }}>
              {progress.completed.length} challenges complete
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {trackNums.map(t => {
              const tm     = TRACK_META[t];
              const tp     = trackProgress(t);
              const locked = !isTrackUnlocked(t);
              const active = t === activeTrack;
              return (
                <button
                  key={t}
                  onClick={() => !locked && setActiveTrack(t)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 16px", width: "100%", textAlign: "left",
                    background: active ? "#0f1210" : "transparent",
                    border: "none",
                    borderRight: active ? "2px solid #5DCAA5" : "2px solid transparent",
                    cursor: locked ? "not-allowed" : "pointer",
                    opacity: locked ? 0.4 : 1,
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: locked ? "#1e2421" : tm.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, flexShrink: 0
                  }}>
                    {locked ? "🔒" : tm.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 12, fontWeight: active ? 500 : 400,
                      color: "#f0f1ee", whiteSpace: "nowrap",
                      overflow: "hidden", textOverflow: "ellipsis"
                    }}>
                      Track {t}
                    </div>
                    <div style={{ fontSize: 10, color: "#5a5e56" }}>
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

          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{
                fontSize: 11, fontWeight: 500, padding: "3px 10px",
                borderRadius: 4, background: meta.color, color: meta.text,
                letterSpacing: "0.05em"
              }}>
                TRACK {activeTrack}
              </span>
              <h1 style={{ fontSize: 18, fontWeight: 500, margin: 0, color: "#f0f1ee" }}>
                {meta.label}
              </h1>
            </div>

            <div style={{ height: 4, background: "#1e2421", borderRadius: 2, marginBottom: 6, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 2, background: "#5DCAA5",
                width: prog.total > 0 ? `${Math.round((prog.done / prog.total) * 100)}%` : "0%",
                transition: "width .4s"
              }} />
            </div>
            <div style={{ fontSize: 11, color: "#5a5e56" }}>
              {prog.done} of {prog.total} challenges complete
              {!user && (
                <span style={{ marginLeft: 12, color: "#f59e0b" }}>
                  · Sign in to save progress
                </span>
              )}
            </div>
          </div>

          {/* Challenge list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {trackChallenges.map(ch => {
              const state    = challengeState(ch);
              const isLocked = state === "locked";
              const isDone   = state === "done";
              const score    = progress.scores?.[ch.id];

              return (
                <div
                  key={ch.id}
                  onClick={() => !isLocked && onStartChallenge(ch.id)}
                  style={{
                    display: "grid", gridTemplateColumns: "36px 1fr auto",
                    gap: 12, alignItems: "center",
                    padding: "12px 14px", borderRadius: 8,
                    border: isDone
                      ? "0.5px solid #3B6D11"
                      : ch.is_boss
                      ? "0.5px solid #854F0B"
                      : state === "unlocked"
                      ? "1.5px solid #5DCAA5"
                      : "0.5px solid #1e2421",
                    background: "#0f1210",
                    cursor: isLocked ? "not-allowed" : "pointer",
                    opacity: isLocked ? 0.4 : 1,
                    transition: "opacity .15s",
                  }}
                  onMouseEnter={e => { if (!isLocked) e.currentTarget.style.opacity = "0.85" }}
                  onMouseLeave={e => { if (!isLocked) e.currentTarget.style.opacity = "1" }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, flexShrink: 0,
                    background: isDone ? "#1a3a1a"
                      : ch.is_boss ? "#2a1a0a"
                      : state === "unlocked" ? "#0a2a1a"
                      : "#1a1a1a",
                  }}>
                    {isDone ? "✓" : ch.is_boss ? "🏆" : isLocked ? "🔒" : "▶"}
                  </div>

                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#f0f1ee", marginBottom: 2 }}>
                      {ch.id} — {ch.title}
                    </div>
                    <div style={{ fontSize: 11, color: "#5a5e56" }}>
                      {ch.concept}
                      {ch.is_boss && (
                        <span style={{
                          marginLeft: 8, fontSize: 10, padding: "1px 6px",
                          background: "#2a1a0a", color: "#f59e0b", borderRadius: 3
                        }}>
                          must score {ch.pass_threshold}+ to unlock next track
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                    {isDone && score != null && (
                      <span style={{
                        fontSize: 11, padding: "2px 8px", borderRadius: 4,
                        background: "#1a3a1a", color: "#5DCAA5", fontWeight: 500
                      }}>
                        {score} / {ch.points_max}
                      </span>
                    )}
                    {state === "unlocked" && !isDone && (
                      <span style={{
                        fontSize: 11, padding: "2px 8px", borderRadius: 4,
                        background: "#0a2a1a", color: "#5DCAA5"
                      }}>
                        {ch.pass_threshold}+ to pass
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: "#5a5e56", fontFamily: "monospace" }}>
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