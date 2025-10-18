// server/routes/delete-vote.ts
import { Router } from "express";
import { supabaseAdmin } from "../supabase";

const router = Router();

router.delete("/delete-vote/:user_id/:show_tmdb_id", async (req, res) => {
  const { user_id, show_tmdb_id } = req.params;

  try {
    const { error } = await supabaseAdmin
      .from("votes")
      .delete()
      .eq("user_id", user_id)
      .eq("show_tmdb_id", Number(show_tmdb_id));

    if (error) throw error;

    return res.json({ success: true });
  } catch (err) {
    console.error("Delete vote error:", err);
    return res.status(500).json({ error: "Failed to delete vote" });
  }
});

export default router;
