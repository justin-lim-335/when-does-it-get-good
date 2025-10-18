// server/routes/update-vote.ts
import { Router } from "express";
import { supabaseAdmin } from "../supabase";

const router = Router();

router.patch("/update-vote/:user_id/:show_tmdb_id", async (req, res) => {
  const { user_id, show_tmdb_id } = req.params;
  const { season, episode, episode_title, absolute_number } = req.body;

  try {
    const { data, error } = await supabaseAdmin
      .from("votes")
      .update({
        season,
        episode,
        episode_title,
        absolute_number,
        last_voted: new Date().toISOString(),
      })
      .eq("user_id", user_id)
      .eq("show_tmdb_id", Number(show_tmdb_id))
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Vote not found" });

    return res.json({ success: true, data });
  } catch (err) {
    console.error("Update vote error:", err);
    return res.status(500).json({ error: "Failed to update vote" });
  }
});

export default router;
