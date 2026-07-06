import { useState, useEffect } from "react";
import axios from "axios";
import { supabase } from "./supabaseClient";

const API = import.meta.env.VITE_API_URL;

// ── Karoo palette ─────────────────────────────────────────────
const C = {
  bg:        "#fafaf8",
  bgCard:    "#ffffff",
  bgDark:    "#f4f0e8",
  bgAmber:   "#fffbeb",
  bgGreen:   "#f0fdf4",
  border:    "#e8e4dc",
  borderAmber: "#fde68a",
  text:      "#0a0a0a",
  textSec:   "#6b7280",
  textDim:   "#9ca3af",
  amber:     "#d97706",
  amberBg:   "#fef3c7",
  amberText: "#92400e",
  green:     "#0f6e56",
  greenBg:   "#f0fdf4",
  greenText: "#065f46",
};

const TRACK_META = {
  1: { label: "From hands to code",       icon: "🤖", accent: C.green  },
  2: { label: "Loops",                    icon: "🔁", accent: C.amber  },
  3: { label: "Decisions & sensors",      icon: "🧠", accent: "#7c3aed" },
  4: { label: "Functions & structure",    icon: "⚙️", accent: "#0369a1" },
  5: { label: "Real robotics concepts",   icon: "📡", accent: "#be185d" },
  6: { label: "Arduino: code to circuit", icon: "⚡", accent: "#b45309" },
};

export default function ChallengePage({ onStartChallenge, onBack }) {
  const [curriculum, setCurriculum]     = useState({});
  const [user, setUser]                 = useState(undefined);
  const [dbProgress, setDbProgress]     = useState(null);
  const [activeTrack, setActiveTrack]   = useState(1);
  const [loading, setLoading]           = useState(true);

  // ── Auth ──────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user || null));
    return () => listener.subscription.unsubscribe();
  }, []);

  // ── Load curriculum ───────────────────────────────────────
  useEffect(() => {
    axios.get(`${API}/curriculum`).then(res => {
      setCurriculum(res.data.tracks);
      setLoading(false);
    });
  }, []);

  // ── Load progress ─────────────────────────────────────────
  useEffect(() => {
    if (user === undefined) return;
    if (!user) { setDbProgress(null); return; }
    supabase
      .from("student_progress")
      .select("challenge_id, status, best_score")
      .eq("user_id", user.id)
      .then(({ data }) => setDbProgress(data || []));
  }, [user]);

  // ── Refetch on window focus ───────────────────────────────
  useEffect(() => {
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

  // ── Derived progress ──────────────────────────────────────
  const progress = (() => {
    if (!user || !dbProgress) {
      return { completed: [], unlocked: ["1.1"], scores: {} };
    }
    const completed = dbProgress.filter(r => r.status === "completed").map(r => r.challenge_id);
    const unlocked  = dbProgress.map(r => r.challenge_id);
    const scores    = Object.fromEntries(dbProgress.map(r => [r.challenge_id, r.best_score]));
    if (!unlocked.includes("1.1")) unlocked.push("1.1");
    return { completed, unlocked, scores };
  })();

  const trackNums = Object.keys(TRACK_META).map(Number);

  function isTrackUnlocked(t) {
    if (t === 1) return true;
    const prev = curriculum[t - 1] || [];
    return prev.length > 0 && prev.every(c => progress.completed.includes(c.id));
  }

  function challengeState(ch) {
    if (progress.completed.includes(ch.id)) return "done";
    if (progress.unlocked.includes(ch.id))  return "unlocked";
    return "locked";
  }

  function trackProgress(t) {
    const chs  = curriculum[t] || [];
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
        height: "100vh", background: C.bg, color: C.textDim,
        fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13
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
      background: C.bg, color: C.text,
      fontFamily: "'Inter', system-ui, sans-serif", overflow: "hidden"
    }}>

      {/* ── NAV ── */}
      <div style={{
        display: "flex", alignItems: "center",
        padding: "0 24px", height: 52,
        borderBottom: `1px solid ${C.border}`,
        background: C.bgCard, flexShrink: 0
      }}>
        <button onClick={onBack} style={{
          display: "flex", alignItems: "center", gap: 0,
          background: "transparent", border: "none", cursor: "pointer",
          fontWeight: 800, fontSize: 16, color: C.text, padding: 0
        }}>
          KA<span style={{ color: C.amber }}>ROO</span>
        </button>

        <div style={{ width: 1, height: 20, background: C.border, margin: "0 16px" }} />

        <span style={{ fontSize: 13, color: C.textSec }}>/ learning path</span>

        <div style={{ flex: 1 }} />

        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, color: C.amber, fontWeight: 600 }}>
              {totalPoints()} pts
            </span>
            <img
              src={user.user_metadata?.avatar_url}
              alt=""
              style={{ width: 30, height: 30, borderRadius: "50%", border: `2px solid ${C.border}`, cursor: "pointer" }}
              onClick={() => supabase.auth.signOut()}
              title="Click to sign out"
            />
            <span style={{ fontSize: 12, color: C.textSec }}>
              {user.user_metadata?.user_name || user.user_metadata?.full_name || user.email}
            </span>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => supabase.auth.signInWithOAuth({ provider: "github", options: { redirectTo: "https://nakulpandhare.github.io/robotics-sandbox/" } })}
              style={{
                background: C.bgCard, border: `1px solid ${C.border}`,
                borderRadius: 6, padding: "6px 14px", fontSize: 12,
                color: C.text, cursor: "pointer", fontWeight: 500
              }}
            >
              Sign in with GitHub
            </button>
            <button
              onClick={() => supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: "https://nakulpandhare.github.io/robotics-sandbox/" } })}
              style={{
                background: C.amber, border: "none",
                borderRadius: 6, padding: "6px 14px", fontSize: 12,
                color: C.bgCard, cursor: "pointer", fontWeight: 600
              }}
            >
              Sign in with Google
            </button>
          </div>
        )}
      </div>

      {/* ── BODY ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── SIDEBAR ── */}
        <div style={{
          width: 220, flexShrink: 0,
          borderRight: `1px solid ${C.border}`,
          background: C.bgCard,
          display: "flex", flexDirection: "column",
          overflow: "hidden"
        }}>
          {/* Sidebar header */}
          <div style={{
            padding: "16px 20px 12px",
            borderBottom: `1px solid ${C.border}`
          }}>
            <div style={{ fontSize: 10, color: C.textDim, letterSpacing: "0.08em", marginBottom: 4 }}>
              LEARNING PATH
            </div>
            <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>
              {progress.completed.length} challenges complete
            </div>
            {!user && (
              <div style={{ fontSize: 11, color: C.amber, marginTop: 4 }}>
                Sign in to save progress
              </div>
            )}
          </div>

          {/* Track list */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {trackNums.map(t => {
              const tm     = TRACK_META[t];
              const tp     = trackProgress(t);
              const locked = !isTrackUnlocked(t);
              const active = t === activeTrack;
              const allDone = tp.done === tp.total && tp.total > 0;

              return (
                <button
                  key={t}
                  onClick={() => !locked && setActiveTrack(t)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "12px 20px", width: "100%", textAlign: "left",
                    background: active ? C.bgAmber : "transparent",
                    border: "none",
                    borderLeft: active ? `3px solid ${C.amber}` : "3px solid transparent",
                    cursor: locked ? "not-allowed" : "pointer",
                    opacity: locked ? 0.45 : 1,
                    transition: "background .12s"
                  }}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 15,
                    background: locked ? C.bgDark : allDone ? C.greenBg : C.bgDark,
                    border: allDone ? `1.5px solid ${C.green}` : `1px solid ${C.border}`
                  }}>
                    {locked ? "🔒" : allDone ? "✓" : tm.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 12, fontWeight: active ? 600 : 400,
                      color: active ? C.amber : C.text,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                    }}>
                      Track {t}
                    </div>
                    <div style={{ fontSize: 10, color: C.textDim, marginTop: 1 }}>
                      {locked ? "Locked" : `${tp.done} / ${tp.total} complete`}
                    </div>
                  </div>
                  {allDone && !locked && (
                    <span style={{ fontSize: 10, color: C.green, fontWeight: 700 }}>✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── MAIN ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>

          {/* Track header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "3px 10px",
                borderRadius: 20, letterSpacing: "0.05em",
                background: C.amberBg, color: C.amberText
              }}>
                TRACK {activeTrack}
              </span>
              <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: C.text }}>
                {meta.label}
              </h1>
              <span style={{ fontSize: 20 }}>{meta.icon}</span>
            </div>

            {/* Progress bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                flex: 1, maxWidth: 320, height: 5,
                background: C.border, borderRadius: 3, overflow: "hidden"
              }}>
                <div style={{
                  height: "100%", borderRadius: 3,
                  background: prog.done === prog.total && prog.total > 0 ? C.green : C.amber,
                  width: prog.total > 0 ? `${Math.round((prog.done / prog.total) * 100)}%` : "0%",
                  transition: "width .4s"
                }} />
              </div>
              <span style={{ fontSize: 12, color: C.textSec }}>
                {prog.done} of {prog.total} complete
              </span>
            </div>
          </div>

          {/* Challenge list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {trackChallenges.map((ch, idx) => {
              const state    = challengeState(ch);
              const isLocked = state === "locked";
              const isDone   = state === "done";
              const isNext   = state === "unlocked" && !isDone;
              const score    = progress.scores?.[ch.id];

              return (
                <div
                  key={ch.id}
                  onClick={() => !isLocked && onStartChallenge(ch.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 18px", borderRadius: 10,
                    background: isDone
                      ? C.bgGreen
                      : isNext
                      ? C.bgAmber
                      : C.bgCard,
                    border: `1px solid ${
                      isDone   ? "#bbf7d0"
                      : isNext  ? C.borderAmber
                      : ch.is_boss ? "#fde68a"
                      : C.border
                    }`,
                    cursor: isLocked ? "not-allowed" : "pointer",
                    opacity: isLocked ? 0.5 : 1,
                    transition: "box-shadow .12s, opacity .12s",
                    boxShadow: isNext ? "0 1px 4px rgba(217,119,6,0.12)" : "none"
                  }}
                  onMouseEnter={e => { if (!isLocked) e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = isNext ? "0 1px 4px rgba(217,119,6,0.12)" : "none"; }}
                >
                  {/* State icon */}
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16,
                    background: isDone
                      ? C.greenBg
                      : ch.is_boss
                      ? C.amberBg
                      : isNext
                      ? C.amberBg
                      : C.bgDark,
                    border: `1.5px solid ${
                      isDone   ? "#86efac"
                      : ch.is_boss ? C.borderAmber
                      : isNext  ? C.borderAmber
                      : C.border
                    }`
                  }}>
                    {isDone ? "✓" : ch.is_boss ? "🏆" : isLocked ? "🔒" : "▶"}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 14, fontWeight: isDone || isNext ? 600 : 400,
                      color: isDone ? C.greenText : isNext ? C.amberText : C.text,
                      marginBottom: 2
                    }}>
                      <span style={{ fontFamily: "monospace", fontSize: 12, color: C.textDim, marginRight: 6 }}>
                        {ch.id}
                      </span>
                      {ch.title}
                    </div>
                    <div style={{ fontSize: 11, color: C.textDim, display: "flex", alignItems: "center", gap: 8 }}>
                      {ch.concept}
                      {ch.is_boss && (
                        <span style={{
                          fontSize: 10, padding: "1px 7px",
                          background: C.amberBg, color: C.amberText,
                          borderRadius: 20, fontWeight: 600
                        }}>
                          must score {ch.pass_threshold}+ to unlock Track {ch.track + 1}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: score or points */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
                    {isDone && score != null ? (
                      <span style={{
                        fontSize: 12, fontWeight: 700, padding: "3px 10px",
                        background: C.greenBg, color: C.greenText,
                        borderRadius: 20, border: `1px solid #86efac`
                      }}>
                        {score} / {ch.points_max}
                      </span>
                    ) : isNext ? (
                      <span style={{
                        fontSize: 11, padding: "2px 8px",
                        background: C.amberBg, color: C.amberText,
                        borderRadius: 20, fontWeight: 600
                      }}>
                        {ch.pass_threshold}+ to pass
                      </span>
                    ) : null}
                    <span style={{ fontSize: 11, color: C.textDim }}>
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
