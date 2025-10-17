import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role for unrestricted reads
);

router.post("/", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || typeof username !== "string") {
      return res.status(400).json({ error: "Invalid username" });
    }

    // ✅ Query your users table to see if username exists
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .limit(1);

    if (error) throw error;

    return res.status(200).json({ exists: data.length > 0 });
  } catch (err) {
    console.error("Error checking username:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
