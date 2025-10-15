import { Router } from "express";
import fetch from "node-fetch";

const router = Router();

// GET /api/search?query=breaking+bad
router.get("/", async (req, res) => {
  const query = req.query.query as string;
  if (!query) return res.status(400).json({ error: "Missing query param" });

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/tv?api_key=${process.env.VITE_TMDB_API_KEY}&query=${encodeURIComponent(query)}`
    );
    const data = (await response.json()) as { results?: any[] };

    const results = data.results?.map((show: any) => ({
      id: show.id,
      name: show.name,
      overview: show.overview,
      poster: show.poster_path,
    }));

    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: "TMDb fetch failed" });
  }
});

export default router;
