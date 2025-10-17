// server/routes/signup-user.ts
import { Router } from "express";
import { supabaseAdmin } from "../supabase";
import { error } from "console";  

const router = Router();

router.post("/", async (req, res) => {
  const { id, email } = req.body; // coming from webhook or client

  try {
    // ensure no duplicate
    const { data: existing } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("auth_id", id)
      .single();

    if (existing) {
      return res.status(200).json({ message: "User already exists" });
    }

    // create minimal profile record
    const { error } = await supabaseAdmin
      .from("users")
      .insert([{ auth_id: id, email, first_name: null, last_name: null, username: null }]);

    if (error) throw error;
    res.status(201).json({ message: "User record created" });
  } catch (err) {
    console.error("Signup-user route error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;