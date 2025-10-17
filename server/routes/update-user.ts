import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role key required for updates
);

router.post("/", async (req, res) => {
  try {
    const { authId, firstName, lastName, username } = req.body;

    if (!authId) {
      return res.status(400).json({ error: "Missing authId" });
    }

    // ✅ Perform update using auth_id as the matching key
    const { data, error } = await supabase
      .from("users")
      .update({
        first_name: firstName,
        last_name: lastName,
        username: username,
      })
      .eq("auth_id", authId)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "User not found or not updated" });
    }

    return res.status(200).json({ message: "User updated", user: data[0] });
  } catch (err) {
    console.error("Error updating user:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
