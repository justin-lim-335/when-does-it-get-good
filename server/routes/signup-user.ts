// server/routes/signup-user.ts
import { Router } from "express";
import { supabaseAdmin } from "../supabase";

const router = Router();

router.post("/", async (req, res) => {
  const { auth_id, username } = req.body;
  if (!auth_id || !username) return res.status(400).json({ error: "Missing fields" });

  const { error } = await supabaseAdmin
    .from("users")
    .insert([{ auth_id, username }]);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ message: "User profile created" });
});

export default router;
