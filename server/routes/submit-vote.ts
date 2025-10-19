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

    let finalSeason = season;
    let finalEpisode = episode;
    let finalTitle = episode_title;

    // If season/episode/episode_title are missing, fetch from TMDb
    if (!season || !episode || !episode_title) {
      const epRes = await fetch(
        `https://api.themoviedb.org/3/tv/${tmdbIdNum}/season/${season}/episode/${episode}?api_key=${TMDB_API_KEY}`
      );
      if (!epRes.ok) throw new Error("Failed to fetch episode metadata from TMDb");
      const epData = await epRes.json();
      finalSeason = epData.season_number;
      finalEpisode = epData.episode_number;
      finalTitle = epData.name;
    }

    // Ensure show exists
    const showRes = await fetch(`https://api.themoviedb.org/3/tv/${tmdbIdNum}?api_key=${TMDB_API_KEY}`);
    if (!showRes.ok) throw new Error("Failed to fetch show metadata from TMDb");
    const showData = await showRes.json();
    const { name: title, poster_path, first_air_date } = showData;

    await supabaseAdmin
      .from("shows")
      .upsert([{ tmdb_id: tmdbIdNum, title, poster_path, first_air_date }], { onConflict: "tmdb_id" });

    // Upsert vote
    const { data, error } = await supabaseAdmin
      .from("votes")
      .upsert(
        [
          {
            user_id,
            show_tmdb_id: tmdbIdNum,
            season: finalSeason,
            episode: finalEpisode,
            episode_title: finalTitle,
            absolute_number,
            last_voted: new Date().toISOString(),
          },
        ],
        { onConflict: "user_id,show_tmdb_id" }
      )
      .select()
      .single();

    if (error) throw error;

    return res.json({ success: true, data });
  } catch (err) {
    console.error("Submit vote error:", err);
    return res.status(500).json({ error: err instanceof Error ? err.message : "Internal server error" });
  }
});

export default router;
