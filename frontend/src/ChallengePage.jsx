import { useState, useEffect } from "react";
import axios from "axios";
import { supabase } from "./supabaseClient";
import ThemeToggle from "./theme/ThemeToggle";

const API = import.meta.env.VITE_API_URL;

const TRACK_META = {
  1: { label: "From hands to code",       icon: "🤖" },
  2: { label: "Loops",                    icon: "🔁" },
  3: { label: "Decisions & sensors",      icon: "🧠" },
  4: { label: "Functions & structure",    icon: "⚙️" },
  5: { label: "Real robotics concepts",   icon: "📡" },
  6: { label: "Arduino: code to circuit", icon: "⚡" },
};

export default function ChallengePage({ onStartChallenge, onBack }) {
  const [curriculum, setCurriculum]   = useState({});
  const [user, setUser]               = useState(undefined);
  const [dbProgress, setDbProgress]   = useState(null);
  const [activeTrack, setActiveTrack] = useState(1);
  const [loading, setLoading]         = useState(true);

  // ── Auth ──────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user || null));
    return () => listener.subscription.unsubscribe();
  }, []);

  // ── Curriculum ────────────────────────────────────────────
  useEffect(() => {
    axios.get(`${API}/curriculum`).then(res => {
      setCurriculum(res.data.tracks);
      setLoading(false);
    });
  }, []);

  // ── Progress ──────────────────────────────────────────────
  useEffect(() => {
    if (user === undefined) return;
    if (!user) { setDbProgress(null); return; }
    fetchProgress();
  }, [user]);

  async function fetchProgress() {
    const { data } = await supabase
      .from("student_progress")
      .select("challenge_id, status, best_score")
      .eq("user_id", user.id);
    setDbProgress(data || []);
  }

  // Refetch when tab regains focus
  useEffect(() => {
    const onFocus = () => { if (user) fetchProgress(); };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [user]);

  // ── Derived state ─────────────────────────────────────────
  const progress = (() => {
    if (!user || !dbProgress) return { completed: [], unlocked: ["1.1"], scores: {} };
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
        height: "100vh", background: "var(--bg-primary)", color: "var(--text-dim)",
        fontFamily: "inherit", fontSize: 13
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
      background: "var(--bg-primary)", color: "var(--text-primary)", overflow: "hidden"
    }}>

      {/* ── NAV ── */}
      <nav style={{
        display: "flex", alignItems: "center",
        padding: "0 24px", height: 52,
        borderBottom: "1px solid var(--border)",
        background: "var(--nav-bg)",
        backdropFilter: "blur(10px)",
        flexShrink: 0
      }}>
        <button onClick={onBack} style={{
          display: "flex", alignItems: "center", gap: 0,
          background: "transparent", border: "none",
          cursor: "pointer", fontWeight: 800, fontSize: 16,
          color: "var(--text-primary)", padding: 0
        }}>
          KA<span style={{ color: "var(--amber)" }}>ROO</span>
        </button>

        <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 16px" }} />
        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>/ learning path</span>

        <div style={{ flex: 1 }} />

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {user ? (
            <>
              <span style={{ fontSize: 12, color: "var(--amber)", fontWeight: 600 }}>
                {totalPoints()} pts
              </span>
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                {user.user_metadata?.user_name || user.user_metadata?.full_name || user.email}
              </span>
              <img
                src={user.user_metadata?.avatar_url}
                alt=""
                style={{ width: 30, height: 30, borderRadius: "50%", border: "2px solid var(--border)", cursor: "pointer" }}
                onClick={() => supabase.auth.signOut()}
                title="Click to sign out"
              />
            </>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => supabase.auth.signInWithOAuth({ provider: "github", options: { redirectTo: "https://nakulpandhare.github.io/robotics-sandbox/" } })}
                style={{
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  borderRadius: 6, padding: "6px 14px", fontSize: 12,
                  color: "var(--text-primary)", cursor: "pointer", fontWeight: 500
                }}
              >
                Sign in with GitHub
              </button>
              <button
                onClick={() => supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: "https://nakulpandhare.github.io/robotics-sandbox/" } })}
                style={{
                  background: "var(--amber)", border: "none",
                  borderRadius: 6, padding: "6px 14px", fontSize: 12,
                  color: "#ffffff", cursor: "pointer", fontWeight: 600
                }}
              >
                Sign in with Google
              </button>
            </div>
          )}
          <ThemeToggle size="sm" />
        </div>
      </nav>

      {/* ── BODY ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── SIDEBAR ── */}
        <div style={{
          width: 220, flexShrink: 0,
          borderRight: "1px solid var(--border)",
          background: "var(--bg-card)",
          display: "flex", flexDirection: "column", overflow: "hidden"
        }}>
          <div style={{
            padding: "16px 20px 12px",
            borderBottom: "1px solid var(--border)"
          }}>
            <div style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.08em", marginBottom: 4 }}>
              LEARNING PATH
            </div>
            <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>
              {progress.completed.length} challenges complete
            </div>
            {!user && (
              <div style={{ fontSize: 11, color: "var(--amber)", marginTop: 4 }}>
                Sign in to save progress
              </div>
            )}
          </div>

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
                    background: active ? "var(--bg-amber)" : "transparent",
                    border: "none",
                    borderLeft: active ? "3px solid var(--amber)" : "3px solid transparent",
                    cursor: locked ? "not-allowed" : "pointer",
                    opacity: locked ? 0.45 : 1,
                    transition: "background .12s"
                  }}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
                    background: allDone ? "var(--bg-green)" : "var(--bg-dark)",
                    border: `1.5px solid ${allDone ? "var(--border-green)" : "var(--border)"}`
                  }}>
                    {locked ? "🔒" : allDone ? "✓" : tm.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 12, fontWeight: active ? 600 : 400,
                      color: active ? "var(--amber)" : "var(--text-primary)",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                    }}>
                      Track {t}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 1 }}>
                      {locked ? "Locked" : `${tp.done} / ${tp.total} complete`}
                    </div>
                  </div>
                  {allDone && !locked && (
                    <span style={{ fontSize: 10, color: "var(--green)", fontWeight: 700 }}>✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── MAIN ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>

          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "3px 10px",
                borderRadius: 20, letterSpacing: "0.05em",
                background: "var(--amber-bg)", color: "var(--amber-text)"
              }}>
                TRACK {activeTrack}
              </span>
              <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
                {meta.label}
              </h1>
              <span style={{ fontSize: 20 }}>{meta.icon}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                flex: 1, maxWidth: 320, height: 5,
                background: "var(--border)", borderRadius: 3, overflow: "hidden"
              }}>
                <div style={{
                  height: "100%", borderRadius: 3,
                  background: prog.done === prog.total && prog.total > 0
                    ? "var(--green)"
                    : "var(--amber)",
                  width: prog.total > 0 ? `${Math.round((prog.done / prog.total) * 100)}%` : "0%",
                  transition: "width .4s"
                }} />
              </div>
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                {prog.done} of {prog.total} complete
              </span>
            </div>
          </div>

          {/* Challenge list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {trackChallenges.map(ch => {
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
                      ? "var(--bg-green)"
                      : isNext
                      ? "var(--bg-amber)"
                      : "var(--bg-card)",
                    border: `1px solid ${
                      isDone   ? "var(--border-green)"
                      : isNext  ? "var(--border-amber)"
                      : ch.is_boss ? "var(--border-amber)"
                      : "var(--border)"
                    }`,
                    cursor: isLocked ? "not-allowed" : "pointer",
                    opacity: isLocked ? 0.5 : 1,
                    transition: "box-shadow .12s, opacity .12s",
                    boxShadow: isNext ? "0 1px 4px rgba(217,119,6,0.08)" : "none"
                  }}
                  onMouseEnter={e => { if (!isLocked) e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = isNext ? "0 1px 4px rgba(217,119,6,0.08)" : "none"; }}
                >
                  {/* Icon */}
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                    background: isDone
                      ? "var(--bg-green)"
                      : ch.is_boss || isNext
                      ? "var(--amber-bg)"
                      : "var(--bg-dark)",
                    border: `1.5px solid ${
                      isDone   ? "var(--border-green)"
                      : ch.is_boss || isNext ? "var(--border-amber)"
                      : "var(--border)"
                    }`
                  }}>
                    {isDone ? "✓" : ch.is_boss ? "🏆" : isLocked ? "🔒" : "▶"}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 14, fontWeight: isDone || isNext ? 600 : 400,
                      color: isDone
                        ? "var(--green-text)"
                        : isNext
                        ? "var(--amber-text)"
                        : "var(--text-primary)",
                      marginBottom: 2
                    }}>
                      <span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-dim)", marginRight: 6 }}>
                        {ch.id}
                      </span>
                      {ch.title}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-dim)", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      {ch.concept}
                      {ch.is_boss && (
                        <span style={{
                          fontSize: 10, padding: "1px 7px",
                          background: "var(--amber-bg)", color: "var(--amber-text)",
                          borderRadius: 20, fontWeight: 600
                        }}>
                          score {ch.pass_threshold}+ to unlock Track {ch.track + 1}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score / points */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
                    {isDone && score != null ? (
                      <span style={{
                        fontSize: 12, fontWeight: 700, padding: "3px 10px",
                        background: "var(--bg-green)", color: "var(--green-text)",
                        borderRadius: 20, border: "1px solid var(--border-green)"
                      }}>
                        {score} / {ch.points_max}
                      </span>
                    ) : isNext ? (
                      <span style={{
                        fontSize: 11, padding: "2px 8px",
                        background: "var(--amber-bg)", color: "var(--amber-text)",
                        borderRadius: 20, fontWeight: 600
                      }}>
                        {ch.pass_threshold}+ to pass
                      </span>
                    ) : null}
                    <span style={{ fontSize: 11, color: "var(--text-dim)" }}>
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
