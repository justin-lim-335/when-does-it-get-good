// server/routes/home-page.ts
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

router.get("/shows/popular", async (_req, res) => {
  try {
    // --- Fetch from TMDb ---
    const fetchJson = async (url: string) => (await fetch(url)).json();

    const [tmdbReleased, tmdbAnime, tmdbDrama, tmdbSitcoms, tmdbSciFi, tmdbAction, tmdbMystery, tmdbReality, tmdbAnimation] = await Promise.all([
      fetchJson(
        `https://api.themoviedb.org/3/tv/on_the_air?api_key=${TMDB_API_KEY}&language=en-US&page=1`
      ),
      fetchJson(
        `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&with_genres=16&with_origin_country=JP&sort_by=popularity.desc&page=1&query=anime&without_genres=10762,10751`
      ),
      fetchJson(
        `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&with_genres=18&sort_by=popularity.desc&page=1`
      ),
      fetchJson(
        `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&with_genres=35&sort_by=popularity.desc&page=1`
      ),
      fetchJson(
        `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&with_genres=10765&sort_by=popularity.desc&page=1`
      ),
      fetchJson(
        `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&with_genres=10759&sort_by=popularity.desc&page=1&without_genres=10762,10751`
      ),
      fetchJson(
        `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&with_genres=9648&sort_by=popularity.desc&page=1`
      ),
      fetchJson(
        `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&with_genres=10764&sort_by=popularity.desc&page=1`
      ),
      fetchJson(
        `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&with_genres=16&sort_by=popularity.desc&page=1&without_genres=10751`
      ),
    ]);

    // --- Recently voted (Supabase join) ---
    const { data: recentVotesRaw, error: recentError } = await supabase
      .from("votes")
      .select("*, shows!fk_votes_show(*)")
      .order("created_at", { ascending: false });

    if (recentError) throw recentError;

    // Deduplicate by show_tmdb_id so a show appears only once
    const seen = new Set<number | string>();
    const recentVotes: any[] = [];
    for (const v of recentVotesRaw || []) {
      if (!seen.has(v.show_tmdb_id) && v.shows) {
        recentVotes.push(v);
        seen.add(v.show_tmdb_id);
      }
    }
    recentVotes.splice(24);

    // --- Most voted (aggregate by show) ---
    const { data: votesData, error: votesError } = await supabase
      .from("votes")
      .select("show_tmdb_id");

    if (votesError) throw votesError;

    if (!votesData || votesData.length === 0) {
      return res.json({
        recentlyReleased: (tmdbReleased.results || []).slice(0, 24),
        recentlyVoted: [],
        mostVoted: [],
        popularAnime: (tmdbAnime.results || []).slice(0, 24),
        popularDramas: (tmdbDrama.results || []).slice(0, 24),
        popularSitcoms: (tmdbSitcoms.results || []).slice(0, 24),
        popularSciFi: (tmdbSciFi.results || []).slice(0, 24),
        popularAction: (tmdbAction.results || []).slice(0, 24),
        popularMystery: (tmdbMystery.results || []).slice(0, 24),
        popularReality: (tmdbReality.results || []).slice(0, 24),
        popularAnimation: (tmdbAnimation.results || []).slice(0, 24),
      });
    }

    // Aggregate votes by show ID
    const voteCounts: Record<string, number> = {};
    for (const v of votesData) {
      if (v.show_tmdb_id) {
        voteCounts[v.show_tmdb_id] = (voteCounts[v.show_tmdb_id] || 0) + 1;
      }
    }

    // Sort and take top 24 IDs
    const topIds = Object.entries(voteCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 24)
      .map(([id]) => Number(id));

    // Fetch show details for top voted IDs
    const { data: showsData, error: showsError } = await supabase
      .from("shows")
      .select("tmdb_id, title, poster_path, first_air_date")
      .in("tmdb_id", topIds);

    if (showsError) throw showsError;

    const showsArray = (showsData || []);

    // Build a map from numeric tmdb_id -> show row
    const showsById = new Map<number, any>(
      showsArray.map((s: any) => [Number(s.tmdb_id), s])
    );

    const normalizeShow = (s: any) => ({
      tmdb_id: s.tmdb_id || s.id,
      title: s.title || s.name,
      poster_path: s.poster_path || null,
      first_air_date: s.first_air_date || null,
    });

    // Reorder according to topIds, keep only rows that exist
    const orderedMostVoted = topIds
      .map((id) => showsById.get(Number(id)))
      .filter(Boolean);

        // Check if most voted shows were returned in order
    console.log("Most voted shows returned:", orderedMostVoted);

    res.json({
      recentlyReleased: (tmdbReleased.results || []).slice(0, 24).map(normalizeShow),
      recentlyVoted: recentVotes.map((v: any) => v.shows).filter(Boolean).map(normalizeShow),
      mostVoted: (orderedMostVoted || []).map(normalizeShow),
      popularAnime: (tmdbAnime.results || []).slice(0, 24).map(normalizeShow),
      popularDramas: (tmdbDrama.results || []).slice(0, 24).map(normalizeShow),
      popularSitcoms: (tmdbSitcoms.results || []).slice(0, 24).map(normalizeShow),
      popularSciFi: (tmdbSciFi.results || []).slice(0, 24).map(normalizeShow),
      popularAction: (tmdbAction.results || []).slice(0, 24).map(normalizeShow),
      popularMystery: (tmdbMystery.results || []).slice(0, 24).map(normalizeShow),
      popularReality: (tmdbReality.results || []).slice(0, 24).map(normalizeShow),
      popularAnimation: (tmdbAnimation.results || []).slice(0, 24).map(normalizeShow),
    });
  } catch (err) {
    console.error("❌ Homepage fetch error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;