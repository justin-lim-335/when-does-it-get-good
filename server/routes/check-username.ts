// backend/routes/check-username.ts
import express from "express";
import { supabaseAdmin } from "../supabase";
const router = express.Router();

router.post("/", async (req, res) => {
  const { username } = req.body;

  if (!username) return res.status(400).json({ error: "Missing username" });

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("username", username)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = "No rows found"
    return res.status(500).json({ error: error.message });
  }

  res.json({ exists: !!data });
});

export default router;
