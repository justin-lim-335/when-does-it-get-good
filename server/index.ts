// server/index.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

// ------------------- Setup -------------------
const app = express();
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://when-does-it-get-good.vercel.app"
  ],
  credentials: true,
}));
app.use(express.json());

// ------------------- Environment -------------------
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TMDB_API_KEY = process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase URL or Service Role Key!");
}

if (!TMDB_API_KEY) {
  throw new Error("Missing TMDB API key in environment!");
}

// ------------------- Initialize Supabase -------------------
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ------------------- Helpers -------------------
/**
 * Validate an Authorization Bearer token (Supabase access token) and return the user id.
 * Returns null if no token or validation fails.
 */
async function getUserIdFromAuthHeader(req: express.Request): Promise<string | null> {
  const authHeader = (req.headers.authorization as string) || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader || null;
  if (!token) return null;

  try {
    // Validate token server-side via Supabase JS SDK
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      console.warn("Token validation failed:", error?.message || error);
      return null;
    }
    return data.user.id;
  } catch (err) {
    console.error("getUserIdFromAuthHeader error:", err);
    return null;
  }
}

// ------------------- Routes -------------------

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running and connected to Supabase ✅");
});

// Search shows by title (Supabase + fallback to TMDb)
app.get("/shows/search", async (req, res) => {
  try {
    const query = (req.query.query as string) || "";
    if (!query) return res.json([]);

    // 1️⃣ Search Supabase
    const { data: shows, error } = await supabase
      .from("shows")
      .select("*")
      .ilike("title", `%${query}%`)
      .limit(24);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    // 2️⃣ Fallback to TMDb if no shows in Supabase
    if (!shows || shows.length === 0) {
      const tmdbRes = await fetch(
        `https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
          query
        )}`
      );
      const tmdbData = await tmdbRes.json();

      const mapped = (tmdbData.results || []).map((s: any) => ({
        tmdb_id: s.id,
        title: s.name,
        poster_path: s.poster_path,
        first_air_date: s.first_air_date,
      }));

      return res.json(mapped);
    }

    res.json(shows);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET popular shows for homepage
app.get("/shows/popular", async (req, res) => {
  try {
    // --- Fetch from TMDb ---
    const fetchJson = async (url: string) => (await fetch(url)).json();

    const [tmdbReleased, tmdbAnime, tmdbDrama] = await Promise.all([
      fetchJson(
        `https://api.themoviedb.org/3/tv/on_the_air?api_key=${TMDB_API_KEY}&language=en-US&page=1`
      ),
      fetchJson(
        `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&with_genres=16&with_origin_country=JP&sort_by=popularity.desc&page=1`
      ),
      fetchJson(
        `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&with_genres=18&sort_by=popularity.desc&page=1`
      ),
    ]);

    // --- Recently voted (Supabase join) ---
    const { data: recentVotesRaw } = await supabase
      .from("votes")
      .select("*, shows(*)")
      .order("created_at", { ascending: false });

    // Deduplicate by show_tmdb_id so a show appears only once
    const seen = new Set<number | string>();
    const recentVotes: any[] = [];
    for (const v of recentVotesRaw || []) {
      if (!seen.has(v.show_tmdb_id) && v.shows) {
        recentVotes.push(v);
        seen.add(v.show_tmdb_id);
      }
    }
    // Only keep up to 24 unique shows
    recentVotes.splice(24);

    // --- Most voted (aggregate by show) ---
    const { data: votesData, error: votesError } = await supabase
      .from("votes")
      .select("show_tmdb_id, shows(title, poster_path)");

    if (votesError) {
      throw votesError;
    }

    // Aggregate votes by show_tmdb_id
    const voteCounts: { [key: string]: { count: number; shows: any } } = {};
    (votesData || []).forEach((vote: any) => {
      const key = String(vote.show_tmdb_id);
      if (!voteCounts[key]) {
        voteCounts[key] = { count: 0, shows: vote.shows };
      }
      voteCounts[key].count += 1;
    });

    // Get top 10 most voted shows
    const mostVoted = Object.values(voteCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // --- Helper to normalize any source into a consistent shape ---
    const normalizeShow = (s: any) => ({
      tmdb_id: s.tmdb_id || s.id,
      title: s.title || s.name,
      poster_path: s.poster_path || null,
      first_air_date: s.first_air_date || null,
    });

    res.json({
      recentlyReleased: (tmdbReleased.results || []).slice(0, 24).map(normalizeShow),
      recentlyVoted: (recentVotes || []).map((v: any) => v.shows).filter(Boolean).map(normalizeShow),
      mostVoted: (mostVoted || []).map((v: any) => v.shows).filter(Boolean).map(normalizeShow),
      popularAnime: (tmdbAnime.results || []).slice(0, 24).map(normalizeShow),
      popularDramas: (tmdbDrama.results || []).slice(0, 24).map(normalizeShow),
    });
  } catch (err) {
    console.error("Homepage fetch error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST new show
app.post("/shows", async (req, res) => {
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

// POST a vote (one per user per show, ensure shows table has metadata)
app.post("/votes", async (req, res) => {
  const { user_id, show_tmdb_id, season_number, episode_number, absolute_number } = req.body;

  if (!user_id || !show_tmdb_id || season_number === undefined || episode_number === undefined || !absolute_number) {
    return res.status(400).json({ error: "Missing required vote fields" });
  }

  try {
    // Fetch metadata from TMDb
    const tmdbRes = await fetch(`https://api.themoviedb.org/3/tv/${show_tmdb_id}?api_key=${TMDB_API_KEY}`);
    if (!tmdbRes.ok) throw new Error("Failed to fetch show metadata from TMDb");
    const tmdbData = await tmdbRes.json();

    // Use fallbacks to avoid nulls
    const title = tmdbData.name || "Unknown Title";
    const poster_path = tmdbData.poster_path || "/placeholder.png";
    const first_air_date = tmdbData.first_air_date || "2000-01-01";

    // Upsert show metadata
    const { error: showError } = await supabase
      .from("shows")
      .upsert(
        [{ tmdb_id: show_tmdb_id, title, poster_path, first_air_date }],
        { onConflict: "tmdb_id" }
      );
    if (showError) throw showError;

    // Insert vote (requires unique constraint in Supabase)
    const { data: voteData, error: voteError } = await supabase
      .from("votes")
      .insert(
        [{ user_id, show_tmdb_id, season_number, episode_number, absolute_number }]
      );
      console.log("Insert vote response:", { voteData, voteError });

    if (voteError) throw voteError;

    res.json({ success: true, data: voteData });
  } catch (err: any) {
    console.error("Vote submission error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});




// GET a user's vote for a show
app.get("/votes/:user_id/:show_tmdb_id", async (req, res) => {
  const { user_id, show_tmdb_id } = req.params;

  const { data, error } = await supabase
    .from("votes")
    .select("*")
    .eq("user_id", user_id)
    .eq("show_tmdb_id", Number(show_tmdb_id))
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data || {});
});

// GET average “gets good” episode for a show
app.get("/shows/:tmdb_id/average", async (req, res) => {
  const { tmdb_id } = req.params;

  try {
    const tmdbIdNum = Number(tmdb_id);

    // 1️⃣ Fetch all votes for this show
    const { data: votes, error: votesError } = await supabase
      .from("votes")
      .select("absolute_number")
      .eq("show_tmdb_id", tmdbIdNum);

    if (votesError) throw votesError;

    if (!votes || votes.length === 0) {
      return res.json({ average: null });
    }

    // 2️⃣ Compute average absolute_number
    const avgAbsolute =
      votes.reduce((sum: number, v: any) => sum + Number(v.absolute_number), 0) / votes.length;

    // 3️⃣ Fetch show details from TMDb to get episodes
    const showRes = await fetch(
      `https://api.themoviedb.org/3/tv/${tmdbIdNum}?api_key=${TMDB_API_KEY}`
    );
    const showData = await showRes.json();

    let allEpisodes: {
      season_number: number;
      episode_number: number;
      name: string;
      absolute_number: number;
    }[] = [];
    let absoluteCounter = 1;

    for (let season = 1; season <= (showData.number_of_seasons || 1); season++) {
      const seasonRes = await fetch(
        `https://api.themoviedb.org/3/tv/${tmdbIdNum}/season/${season}?api_key=${TMDB_API_KEY}`
      );
      const seasonData = await seasonRes.json();

      (seasonData.episodes || []).forEach((ep: any) => {
        allEpisodes.push({
          season_number: season,
          episode_number: ep.episode_number,
          absolute_number: absoluteCounter++,
          name: ep.name,
        });
      });
    }

    // 4️⃣ Find the episode closest to the average absolute_number
    const avgEpisode = allEpisodes.reduce((prev, curr) =>
      Math.abs(curr.absolute_number - avgAbsolute) < Math.abs(prev.absolute_number - avgAbsolute)
        ? curr
        : prev
    );

    // 5️⃣ Return in desired format: S#E# - title
    const avgDisplay = avgEpisode
      ? `S${avgEpisode.season_number}E${avgEpisode.episode_number} - ${avgEpisode.name}`
      : null;

    res.json({ average: avgDisplay });
  } catch (err: any) {
    console.error("Average calculation error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

// ------------------- Start server -------------------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
