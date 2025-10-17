import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // make sure this is the *service role key*, not the anon key
);

router.post("/", async (req, res) => {
  try {
    const { email, firstName, lastName, username } = req.body;

    if (!email) return res.status(400).json({ error: "Missing email" });

    const { data, error } = await supabase
      .from("users") // ✅ make sure this matches your actual table name
      .update({
        first_name: firstName,
        last_name: lastName,
        username: username,
      })
      .eq("email", email)
      .select();

    if (error) throw error;

    if (!data || data.length === 0)
      return res.status(404).json({ error: "User not found or not updated" });

    res.status(200).json({ message: "User updated", user: data[0] });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
