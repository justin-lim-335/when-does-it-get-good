// server/routes/votes.ts
import express from "express";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const router = express.Router();

// GET total votes for a specific show
router.get("/:show_tmdb_id", async (req, res) => {
  try {
    const { show_tmdb_id } = req.params;
    const { count, error } = await supabase
      .from("votes")
      .select("*", { count: "exact", head: true })
      .eq("show_tmdb_id", show_tmdb_id);

    if (error) throw error;
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch vote count" });
  }
});

export default router;
