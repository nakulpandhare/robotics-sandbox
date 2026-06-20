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