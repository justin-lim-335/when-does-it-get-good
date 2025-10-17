// server/routes/signup-user.ts
import { Router } from "express";
import { supabaseAdmin } from "../supabase";

const router = Router();

router.post("/", async (req, res) => {
  const { email } = req.body; // only email is sent from frontend

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Check if user already exists (by email)
    const { data: existing, error: selectError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      console.error("Select error:", selectError);
      return res.status(500).json({ error: "Database error" });
    }

    if (existing) {
      return res.status(200).json({ message: "User already exists" });
    }

    // Insert minimal profile
    const { error: insertError } = await supabaseAdmin
      .from("users")
      .insert([{ email, first_name: null, last_name: null, username: null }]);

    if (insertError) {
      console.error("Insert error:", insertError);
      return res.status(500).json({ error: "Failed to create user profile" });
    }

    res.status(201).json({ message: "User profile created" });
  } catch (err) {
    console.error("Signup-user route error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
