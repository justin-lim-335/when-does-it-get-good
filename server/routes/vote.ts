import { Router } from "express";
import { supabase } from "../supabase";

const router = Router();

// POST /api/vote
router.post("/", async (req, res) => {
  const { showId, episode, userId } = req.body;

  if (!showId || !episode) {
    return res.status(400).json({ error: "Missing showId or episode" });
  }

  try {
    const { data, error } = await supabase
      .from("votes")
      .insert([{ show_id: showId, episode, user_id: userId || null }]);

    if (error) throw error;
    res.json({ message: "Vote recorded", data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
