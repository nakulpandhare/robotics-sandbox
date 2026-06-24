import { supabase } from "../supabaseClient";

export async function markChallengeComplete(user, challengeId, score, unlocksIds = []) {
  if (!user) return;

  // Upsert the completed challenge
  await supabase.from("student_progress").upsert({
    user_id:      user.id,
    challenge_id: challengeId,
    status:       "completed",
    best_score:   score,
    completed_at: new Date().toISOString(),
  }, { onConflict: "user_id,challenge_id" });

  // Insert unlocked challenges (ignore if already exists)
  for (const id of unlocksIds) {
    await supabase.from("student_progress").upsert({
      user_id:      user.id,
      challenge_id: id,
      status:       "unlocked",
      best_score:   0,
    }, { onConflict: "user_id,challenge_id" });
  }
}

export async function getProgress(userId) {
  const { data } = await supabase
    .from("student_progress")
    .select("challenge_id, status, best_score, completed_at")
    .eq("user_id", userId);
  return data || [];
}