// server/routes/update-vote.ts
import { Router } from "express";
import { supabaseAdmin } from "../supabase";

const router = Router();

router.patch("/update-vote/:user_id/:show_tmdb_id", async (req, res) => {
  const { user_id, show_tmdb_id } = req.params;
  const { season, episode, episode_title, absolute_number } = req.body;

  console.log("📝 Updating vote:", { user_id, show_tmdb_id, season, episode, episode_title, absolute_number });

  try {
    const { data, error } = await supabaseAdmin
      .from("votes")
      .update({
        season_number: season,
        episode_number: episode,
        episode_title,
        absolute_number,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user_id)
      .eq("show_tmdb_id", Number(show_tmdb_id))
      .select()
      .single();

    if (error) {
      console.error("❌ Supabase update error:", error);
      throw error;
    }
    if (!data) {
      console.warn("⚠️ No vote found for update:", { user_id, show_tmdb_id });
      return res.status(404).json({ error: "Vote not found" });
    }

    console.log("✅ Vote successfully updated:", data);
    return res.json({ success: true, data });
  } catch (err) {
    console.error("🔥 Update vote error:", err);
    return res.status(500).json({ error: "Failed to update vote" });
  }
});

export default router;
