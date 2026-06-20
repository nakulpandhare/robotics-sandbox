import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function Auth({ onUserChange }) {
  const [user, setUser] = useState(null);

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

  async function handleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: window.location.origin },
    });
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  if (user) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img
          src={user.user_metadata?.avatar_url}
          alt=""
          style={{ width: 24, height: 24, borderRadius: "50%" }}
        />
        <span style={{ fontSize: 12, color: "#888" }}>
          {user.user_metadata?.user_name || user.email}
        </span>
        <button
          onClick={handleLogout}
          style={{
            background: "transparent", color: "#666", border: "1px solid #333",
            borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer"
          }}
        >
          Log out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleLogin}
      style={{
        background: "#1a1a1a", color: "#eee", border: "1px solid #333",
        borderRadius: 6, padding: "6px 14px", fontSize: 12, cursor: "pointer",
        display: "flex", alignItems: "center", gap: 6
      }}
    >
      Log in with GitHub
    </button>
  );
}