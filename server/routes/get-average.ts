// routes/get-average.ts
import { Router } from "express";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const router = Router();

/**
 * GET /shows/:tmdb_id/average
 * Returns the numeric absolute_number of the "average" episode for a show
 */
router.get("/:tmdb_id/average", async (req, res) => {
  const { tmdb_id } = req.params;

  if (!tmdb_id) return res.status(400).json({ error: "tmdb_id is required" });

  const tmdbIdNum = Number(tmdb_id);
  if (isNaN(tmdbIdNum)) return res.status(400).json({ error: "Invalid tmdb_id" });

  try {
    // 1️⃣ Fetch all votes for this show
    const { data: votes, error: votesError } = await supabaseAdmin
      .from("votes")
      .select("absolute_number")
      .eq("show_tmdb_id", tmdbIdNum);

    if (votesError) throw votesError;

    if (!votes || votes.length === 0) {
      return res.json({ average: null });
    }

    // 2️⃣ Compute average absolute_number (rounded to nearest integer)
    const avgAbsolute =
      Math.round(votes.reduce((sum: number, v: any) => sum + Number(v.absolute_number), 0) / votes.length);

    return res.json({ average: avgAbsolute });
  } catch (err: any) {
    console.error("Error fetching average vote:", err);
    return res.status(500).json({ error: "Failed to fetch average vote" });
  }
});

export default router;
