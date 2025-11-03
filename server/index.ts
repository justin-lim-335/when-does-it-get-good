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
import homePageShowsHandler from "./routes/home-page"
import postShowHandler from "./routes/post-show";
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

// ------------------- Routes -------------------

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running and connected to Supabase ✅");
});

// ---------- User related routes -------------

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

// ------------ Show search routes -------------

// Search shows by title (Supabase + fallback to TMDb)
app.use("/api/search", searchRoutes);

// GET popular shows for homepage
app.get("/shows/popular", homePageShowsHandler);

// POST new show
app.post("/shows", postShowHandler);

// Use the new average route
app.use("/shows", getAverageRoute);

// ------------------- Vote routes -------------------
app.post("/submit-vote", submitVoteRouter);
app.patch("/update-vote/:user_id/:show_tmdb_id", updateVoteRouter);
app.delete("/delete-vote/:user_id/:show_tmdb_id", deleteVoteRouter);
app.get("/votes/:user_id/:show_tmdb_id", getVotesRouter);
app.get("/count/:show_tmdb_id", votesCountRouter);

// ------------------- Start server -------------------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
