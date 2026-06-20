import { supabase } from "../supabaseClient";

export async function saveRun({ user, challengeId, score, timeTaken, passed, code }) {
  if (!user) return null; // not logged in — skip silently

  const { data, error } = await supabase.from("runs").insert({
    user_id: user.id,
    challenge_id: challengeId,
    score,
    time_taken: timeTaken,
    passed,
    code,
  });

  if (error) console.error("Failed to save run:", error.message);
  return data;
}

export async function getPersonalBest(user, challengeId) {
  if (!user) return null;

  const { data, error } = await supabase
    .from("runs")
    .select("score, time_taken, created_at")
    .eq("user_id", user.id)
    .eq("challenge_id", challengeId)
    .order("score", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch personal best:", error.message);
    return null;
  }
  return data;
}

export async function saveBot({ user, name, code, challengeId }) {
  if (!user) return null;

  const { data, error } = await supabase.from("bots").insert({
    user_id: user.id,
    name,
    code,
    challenge_id: challengeId,
  });

  if (error) console.error("Failed to save bot:", error.message);
  return data;
}

export async function listMyBots(user, challengeId) {
  if (!user) return [];

  const { data, error } = await supabase
    .from("bots")
    .select("id, name, code, created_at")
    .eq("user_id", user.id)
    .eq("challenge_id", challengeId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to list bots:", error.message);
    return [];
  }
  return data;
}

export async function getLeaderboard(challengeId) {
  const { data, error } = await supabase
    .from("leaderboard")
    .select("user_id, score, time_taken, profiles(username, avatar_url)")
    .eq("challenge_id", challengeId)
    .order("score", { ascending: false })
    .order("time_taken", { ascending: true })
    .limit(20);

  if (error) {
    console.error("Failed to fetch leaderboard:", error.message);
    return [];
  }
  return data;
}

export async function togglePublic(botId, isPublic) {
  const { error } = await supabase
    .from("bots")
    .update({ is_public: isPublic })
    .eq("id", botId);

  if (error) console.error("Failed to update bot visibility:", error.message);
}

export async function getPublicGallery(challengeId) {
  const { data, error } = await supabase
    .from("bots")
    .select("id, name, code, created_at, profiles(username, avatar_url)")
    .eq("challenge_id", challengeId)
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    console.error("Failed to fetch gallery:", error.message);
    return [];
  }
  return data;
}