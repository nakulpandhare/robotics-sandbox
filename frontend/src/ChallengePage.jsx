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

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user || null));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    axios.get(`${API}/curriculum`).then(res => {
      setCurriculum(res.data.tracks);
      setLoading(false);
    });
  }, []);

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

  useEffect(() => {
    const onFocus = () => { if (user) fetchProgress(); };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [user]);

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
    return <div className="page-loading">Loading...</div>;
  }

  const trackChallenges = curriculum[activeTrack] || [];
  const meta = TRACK_META[activeTrack];
  const prog = trackProgress(activeTrack);

  return (
    <div className="challenge-page">

      {/* ── NAV ── */}
      <nav className="nav challenge-page__nav">
        <button className="nav__logo" onClick={onBack}>
          KA<span>ROO</span>
        </button>

        <div className="divider" style={{ margin: "0 16px" }} />
        <span className="nav__crumb">/ learning path</span>

        <div style={{ flex: 1 }} />

        <div className="nav__right">
          {user ? (
            <>
              <span className="nav__points">{totalPoints()} pts</span>
              <span className="nav__username">
                {user.user_metadata?.user_name || user.user_metadata?.full_name || user.email}
              </span>
              <img
                src={user.user_metadata?.avatar_url}
                alt=""
                className="nav__avatar"
                onClick={() => supabase.auth.signOut()}
                title="Click to sign out"
              />
            </>
          ) : (
            <div className="auth-buttons">
              <button
                className="btn btn--ghost btn--sm"
                onClick={() => supabase.auth.signInWithOAuth({ provider: "github", options: { redirectTo: "https://nakulpandhare.github.io/robotics-sandbox/" } })}
              >
                Sign in with GitHub
              </button>
              <button
                className="btn btn--primary btn--sm"
                onClick={() => supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: "https://nakulpandhare.github.io/robotics-sandbox/" } })}
              >
                Sign in with Google
              </button>
            </div>
          )}
          <ThemeToggle size="sm" />
        </div>
      </nav>

      {/* ── BODY ── */}
      <div className="challenge-page__body">

        {/* ── SIDEBAR ── */}
        <div className="sidebar">
          <div className="sidebar__header">
            <div className="sidebar__label">LEARNING PATH</div>
            <div className="sidebar__count">{progress.completed.length} challenges complete</div>
            {!user && <div className="sidebar__signin-hint">Sign in to save progress</div>}
          </div>

          <div className="sidebar__list">
            {trackNums.map(t => {
              const tm      = TRACK_META[t];
              const tp      = trackProgress(t);
              const locked  = !isTrackUnlocked(t);
              const active  = t === activeTrack;
              const allDone = tp.done === tp.total && tp.total > 0;

              return (
                <button
                  key={t}
                  onClick={() => !locked && setActiveTrack(t)}
                  className={`sidebar__track ${active ? "sidebar__track--active" : ""} ${locked ? "sidebar__track--locked" : ""}`}
                >
                  <div className={`sidebar__track-icon ${allDone ? "sidebar__track-icon--done" : ""}`}>
                    {locked ? "🔒" : allDone ? "✓" : tm.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="sidebar__track-name">Track {t}</div>
                    <div className="sidebar__track-meta">
                      {locked ? "Locked" : `${tp.done} / ${tp.total} complete`}
                    </div>
                  </div>
                  {allDone && !locked && <span className="sidebar__track-check">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── MAIN ── */}
        <div className="challenge-main">

          <div className="track-header">
            <div className="track-header__row">
              <span className="badge badge--amber">TRACK {activeTrack}</span>
              <h1 className="section__h2" style={{ margin: 0, fontSize: 22 }}>{meta.label}</h1>
              <span style={{ fontSize: 20 }}>{meta.icon}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="progress-bar">
                <div
                  className={`progress-bar__fill ${prog.done === prog.total && prog.total > 0 ? "progress-bar__fill--complete" : ""}`}
                  style={{ width: prog.total > 0 ? `${Math.round((prog.done / prog.total) * 100)}%` : "0%" }}
                />
              </div>
              <span className="track-header__meta">{prog.done} of {prog.total} complete</span>
            </div>
          </div>

          {/* Challenge list */}
          <div className="challenge-list">
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
                  className={`challenge-row ${isDone ? "challenge-row--done" : ""} ${isNext ? "challenge-row--next" : ""} ${ch.is_boss ? "challenge-row--boss" : ""} ${isLocked ? "challenge-row--locked" : ""}`}
                >
                  <div className={`challenge-row__icon ${isDone ? "challenge-row__icon--done" : ""} ${(ch.is_boss || isNext) ? "challenge-row__icon--next" : ""}`}>
                    {isDone ? "✓" : ch.is_boss ? "🏆" : isLocked ? "🔒" : "▶"}
                  </div>

                  <div className="challenge-row__body">
                    <div className={`challenge-row__title ${isDone ? "challenge-row__title--done" : ""} ${isNext ? "challenge-row__title--next" : ""}`}>
                      <span className="challenge-row__id">{ch.id}</span>
                      {ch.title}
                    </div>
                    <div className="challenge-row__concept-row">
                      <span className="challenge-row__concept">{ch.concept}</span>
                      {ch.is_boss && (
                        <span className="badge badge--amber challenge-row__boss-badge">
                          score {ch.pass_threshold}+ to unlock Track {ch.track + 1}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="challenge-row__right">
                    {isDone && score != null ? (
                      <span className="badge badge--green challenge-row__score">
                        {score} / {ch.points_max}
                      </span>
                    ) : isNext ? (
                      <span className="badge badge--amber challenge-row__score">
                        {ch.pass_threshold}+ to pass
                      </span>
                    ) : null}
                    <span className="challenge-row__pts">{ch.points_max} pts</span>
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