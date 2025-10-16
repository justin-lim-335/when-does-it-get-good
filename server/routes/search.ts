import { Router } from "express";
import fetch from "node-fetch";

const router = Router();
const TMDB_API_KEY = process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY;

router.get("/", async (req, res) => {
  const query = req.query.query as string;
  if (!query) return res.status(400).json({ error: "Missing query param" });

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
    );

    const data = (await response.json()) as { results?: any[] };

    const results =
      data.results?.map((show: any) => ({
        tmdb_id: show.id,
        title: show.name,
        overview: show.overview,
        poster_path: show.poster_path,
        first_air_date: show.first_air_date,
      })) || [];

    res.json({ results });
  } catch (err) {
    console.error("TMDb fetch failed:", err);
    res.status(500).json({ error: "TMDb fetch failed" });
  }
});

export default router;
