import express from "express";
import { createClient } from "@supabase/supabase-js"; 

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

const router = express.Router();

// GET all shows
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("shows")
      .select("id,title,genre,tmdb_id");

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch shows" });
  }
});

// GET show by TMDB ID
router.get("/:tmdb_id", async (req, res) => {
  try {
    const { tmdb_id } = req.params;
    const { data, error } = await supabase
      .from("shows")
      .select("*")
      .eq("tmdb_id", tmdb_id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch show" });
  }
});

// GET average vote for a show
router.get("/:tmdb_id/average", async (req, res) => {
  try {
    const { tmdb_id } = req.params;
    const { data, error } = await supabase
      .from("votes")
      .select("rating", { count: "exact" })
      .eq("show_tmdb_id", tmdb_id);

    if (error) throw error;

    const average =
      data && data.length
        ? data.reduce((sum, v) => sum + v.rating, 0) / data.length
        : 0;

    res.json({ average });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch average vote" });
  }
});

export default router;
