// server/routes/submit-vote.ts
import { Router } from "express";
import { supabaseAdmin } from "../supabase";

const router = Router();
const TMDB_API_KEY = process.env.TMDB_API_KEY;

router.post("/submit-vote", async (req, res) => {
  const { user_id, show_tmdb_id, season, episode, episode_title, absolute_number } = req.body;

  if (!user_id || !show_tmdb_id || !absolute_number) {
    return res.status(400).json({ error: "Missing required vote fields" });
  }

  try {
    const tmdbIdNum = Number(show_tmdb_id);
    if (isNaN(tmdbIdNum)) return res.status(400).json({ error: "Invalid show_tmdb_id" });

    // --- 1️⃣ Fetch show metadata from TMDb (ensure we have it cached) ---
    const tmdbRes = await fetch(`https://api.themoviedb.org/3/tv/${tmdbIdNum}?api_key=${TMDB_API_KEY}`);
    if (!tmdbRes.ok) {
      const text = await tmdbRes.text();
      console.error("TMDb fetch failed:", tmdbRes.status, text);
      return res.status(500).json({ error: "Failed to fetch show metadata from TMDb" });
    }

    const tmdbData = await tmdbRes.json();
    const title = tmdbData.name;
    const poster_path = tmdbData.poster_path;
    const first_air_date = tmdbData.first_air_date;

    // --- 2️⃣ Ensure show exists in DB ---
    const { error: showError } = await supabaseAdmin
      .from("shows")
      .upsert([{ tmdb_id: tmdbIdNum, title, poster_path, first_air_date }], { onConflict: "tmdb_id" });
    if (showError) throw showError;

    // --- 3️⃣ Upsert user's vote ---
    const { data: voteData, error: voteError } = await supabaseAdmin
      .from("votes")
      .upsert(
        [
          {
            user_id,
            show_tmdb_id: tmdbIdNum,
            season,
            episode,
            episode_title,
            absolute_number,
            last_voted: new Date().toISOString(),
          },
        ],
        { onConflict: "user_id,show_tmdb_id" }
      )
      .select()
      .single();

    if (voteError) throw voteError;

    return res.json({ success: true, data: voteData });
  } catch (err) {
    console.error("Submit vote error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});


export default router;
