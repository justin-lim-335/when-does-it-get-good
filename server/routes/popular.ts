import { Router } from "express";
import fetch from "node-fetch";
import cors from "cors";

const router = Router();

// Allow requests only from frontend URL
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
router.use(cors({
  origin: [FRONTEND_URL],
  methods: ["GET"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

interface TMDBShow {
  id: number;
  name: string;
  poster_path?: string;
  first_air_date?: string;
}

interface TMDBResponse {
  results?: TMDBShow[];
}

// GET /api/shows/popular
router.get("/", async (_req, res) => {
  try {
    // Example fetching popular TV shows
    const response = await fetch(
      `https://api.themoviedb.org/3/tv/popular?api_key=${process.env.TMDB_API_KEY}&language=en-US&page=1`
    );

    // ✅ Type the JSON
    const data = (await response.json()) as TMDBResponse;


    // Map results to your frontend structure
    const results = data.results?.map((show: any) => ({
      tmdb_id: show.id,
      title: show.name,
      poster_path: show.poster_path,
      first_air_date: show.first_air_date,
    })) || [];

    res.json({
      recentlyReleased: results.slice(0, 24),
      recentlyVoted: results.slice(0, 24),
      mostVoted: results.slice(0, 24),
      popularAnime: results.slice(0, 24),
      popularDramas: results.slice(0, 24),
    });
  } catch (err) {
    console.error("Failed to fetch popular shows:", err);
    res.status(500).json({ error: "Failed to fetch popular shows" });
  }
});

export default router;
