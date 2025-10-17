// src/api/users.ts
import { Router } from "express";
import { supabaseAdmin } from "../../src/lib/supabaseAdmin"; // make sure this uses SERVICE_ROLE_KEY for admin operations

const router = Router();

/**
 * POST /api/users
 * Body: { username: string }
 * Header: Authorization: Bearer <access_token>
 */
router.post("/", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Missing access token" });

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) return res.status(401).json({ error: "Invalid token" });

    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "Missing username" });

    // Insert username into users table
    const { error: insertError } = await supabaseAdmin
      .from("users")
      .insert([{ auth_id: user.id, username }]);

    if (insertError) {
      console.error("Failed to insert username:", insertError);
      return res.status(500).json({ error: "Failed to save username" });
    }

    res.status(200).json({ message: "Username saved successfully!" });
  } catch (err: any) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

export default router;
