// server/routes/post-show.ts
import express from "express";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TMDB_API_KEY = process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY;
if (!TMDB_API_KEY) {
  throw new Error("Missing TMDB API key in environment!");
}

const router = express.Router();

router.post("/shows", async (req, res) => {
  const { tmdb_id, title, first_air_date, poster_path } = req.body;
  if (!tmdb_id || !title) return res.status(400).json({ error: "Missing tmdb_id or title" });

  const { data, error } = await supabase
    .from("shows")
    .upsert([{
      tmdb_id: Number(tmdb_id),
      title,
      first_air_date,
      poster_path
    }], {
      onConflict: "tmdb_id"
    })
    .select();


  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;