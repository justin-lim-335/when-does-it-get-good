// server/index.ts
import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import signupUserRouter from "./routes/signup-user"
import searchRoutes from "./routes/search";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "./supabase";
import checkUsernameRouter from "./routes/check-username";
import updateUserHandler from "./routes/update-user";
import deleteUserHandler from "./routes/delete-user";
import submitVoteRouter from "./routes/submit-vote";
import updateVoteRouter from "./routes/update-vote";
import deleteVoteRouter from "./routes/delete-vote";
import getVotesRouter from "./routes/get-vote";
import getAverageRoute from "./routes/get-average";
import votesCountRouter from "./routes/total-votes";
import authRoutes from "./routes/auth";

// ------------------- Setup -------------------
dotenv.config();
const app = express();
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "https://whendoesitgetgood.net",
        "https://www.whendoesitgetgood.net",
        "https://when-does-it-get-good.vercel.app",
        "http://localhost:5173",
      ];

      // Allow all vercel.app subdomains (optional, useful for staging)
      const vercelRegex = /\.vercel\.app$/;

      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        vercelRegex.test(origin)
      ) {
        console.log("✅ CORS allowed for:", origin);
        callback(null, true);
      } else {
        console.error("❌ CORS blocked:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(bodyParser.json());
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

// Signup user route
app.use("/signup-user", signupUserRouter);

// Check username availability route
app.use("/api/check-username", checkUsernameRouter);

// Update user route
app.post("/api/update-user", updateUserHandler);

// Delete user route
app.post("/api/delete-user", deleteUserHandler);

// Reset password route
app.use("/auth", authRoutes);

// Search shows by title (Supabase + fallback to TMDb)
app.use("/api/search", searchRoutes);

// GET popular shows for homepage
app.get("/shows/popular", async (req, res) => {
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

    // Check final vote counts
    console.log("Vote counts:", voteCounts);

    // Sort and take top 24 IDs
    const topIds = Object.entries(voteCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 24)
      .map(([id]) => Number(id));

    // Check top IDs
    console.log("Top voted show IDs:", topIds);

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

// Use the new average route
app.use("/shows", getAverageRoute);

// ✅ Delete user route
app.post("/api/delete-user", async (req, res) => {
  try {
    const { userId, token } = req.body;

    if (!userId || !token) {
      return res.status(400).json({ error: "Missing userId or token." });
    }

    // Verify the access token before deleting
    const { data: session, error: verifyError } = await supabaseAdmin.auth.getUser(token);
    if (verifyError || session.user.id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Perform deletion via admin API
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) throw deleteError;

    return res.status(200).json({ message: "User deleted successfully." });
  } catch (err) {
    console.error("Delete error:", err);
    return res.status(500).json({ error: "Server error during deletion." });
  }
});

// ------------------- Vote routes -------------------
app.post("/submit-vote", submitVoteRouter);
app.patch("/update-vote/:user_id/:show_tmdb_id", updateVoteRouter);
app.delete("/delete-vote/:user_id/:show_tmdb_id", deleteVoteRouter);
app.get("/votes/:user_id/:show_tmdb_id", getVotesRouter);
app.get("/count/:show_tmdb_id", votesCountRouter);

// ------------------- Start server -------------------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
