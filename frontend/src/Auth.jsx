import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function Auth({ onUserChange }) {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
      onUserChange(data.session?.user || null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      onUserChange(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogin(provider) {
    setMenuOpen(false);
    const redirectTo = import.meta.env.VITE_APP_URL || "https://nakulpandhare.github.io/robotics-sandbox/";
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setMenuOpen(false);
  }

  // Logged in state
  if (user) {
    return (
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setMenuOpen(o => !o)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "transparent", border: "1px solid #333",
            borderRadius: 8, padding: "5px 10px", cursor: "pointer"
          }}
        >
          {user.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt=""
              style={{ width: 22, height: 22, borderRadius: "50%" }}
            />
          ) : (
            <div style={{
              width: 22, height: 22, borderRadius: "50%",
              background: "#22c55e", display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: "#000"
            }}>
              {(user.user_metadata?.full_name || user.email || "U")[0].toUpperCase()}
            </div>
          )}
          <span style={{ fontSize: 12, color: "#888", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user.user_metadata?.user_name || user.user_metadata?.full_name || user.email}
          </span>
          <span style={{ fontSize: 10, color: "#555" }}>▾</span>
        </button>

        {menuOpen && (
          <div style={{
            position: "fixed", 
            right: 16,
            top: 56,
            background: "#111", border: "1px solid #222",
            borderRadius: 8, padding: 8, minWidth: 200,
            zIndex: 9999,
            display: "flex", flexDirection: "column", gap: 6
          }}>
            <div style={{ padding: "6px 10px", fontSize: 11, color: "#555", borderBottom: "1px solid #1a1a1a", marginBottom: 6 }}>
              {user.email}
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: "100%", background: "transparent", border: "none",
                color: "#f87171", padding: "6px 10px", cursor: "pointer",
                fontSize: 12, textAlign: "left", borderRadius: 4
              }}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    );
  }

  // Logged out state — show login menu
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setMenuOpen(o => !o)}
        style={{
          background: "#1a1a1a", color: "#eee", border: "1px solid #333",
          borderRadius: 8, padding: "6px 14px", fontSize: 12,
          cursor: "pointer", display: "flex", alignItems: "center", gap: 6
        }}
      >
        Sign in ▾
      </button>

      {menuOpen && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 6px)",
          background: "#111", border: "1px solid #222",
          borderRadius: 8, padding: 8, minWidth: 200, zIndex: 50,
          display: "flex", flexDirection: "column", gap: 6
        }}>
          <div style={{ padding: "4px 8px 8px", fontSize: 11, color: "#555", borderBottom: "1px solid #1a1a1a", marginBottom: 2 }}>
            Sign in to save progress
          </div>

          {/* GitHub */}
          <button
            onClick={() => handleLogin("github")}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "#0d0d0d", border: "1px solid #222",
              borderRadius: 6, padding: "9px 12px", cursor: "pointer",
              color: "#eee", fontSize: 13, width: "100%"
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02.005 2.04.14 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.57 21.8 24 17.3 24 12 24 5.37 18.63 0 12 0z"/>
            </svg>
            Continue with GitHub
          </button>

          {/* Google */}
          <button
            onClick={() => handleLogin("google")}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "#0d0d0d", border: "1px solid #222",
              borderRadius: 6, padding: "9px 12px", cursor: "pointer",
              color: "#eee", fontSize: 13, width: "100%"
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

        </div>
      )}
    </div>
  );
}