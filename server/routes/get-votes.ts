// server/routes/get-votes.ts
import { Router } from "express";
import { supabaseAdmin } from "../supabase";

const router = Router();

router.get("/votes/:user_id/:show_tmdb_id", async (req, res) => {
  const { user_id, show_tmdb_id } = req.params;

  try {
    const { data, error } = await supabaseAdmin
      .from("votes")
      .select("*")
      .eq("user_id", user_id)
      .eq("show_tmdb_id", Number(show_tmdb_id))
      .maybeSingle();

    if (error) throw error;
    return res.json(data || {});
  } catch (err) {
    console.error("Fetch vote error:", err);
    return res.status(500).json({ error: "Failed to fetch user vote" });
  }
});

export default router;
