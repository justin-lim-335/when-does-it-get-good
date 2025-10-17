// server/routes/signup-user.ts
import { Router } from "express";
import { supabaseAdmin } from "../supabase";
import { error } from "console";  

const router = Router();

router.post("/", async (req, res) => {
  const { id, email } = req.body;

  console.log("Signup route hit:", { id, email });

  try {
    const { data: existing, error: selectError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("auth_id", id)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      // PGRST116 = No rows found (not an error in this context)
      console.error("Select error:", selectError);
    }

    if (existing) {
      return res.status(200).json({ message: "User already exists" });
    }

    const { error: insertError } = await supabaseAdmin
      .from("users")
      .insert([{ auth_id: id, email }]);

    if (insertError) {
      console.error("Insert error:", insertError);
      return res.status(500).json({ error: insertError.message });
    }

    res.status(201).json({ message: "User record created" });
  } catch (err) {
    console.error("Signup-user route error:", err);
    res.status(500).json({ error: "Internal server error", details: err });
  }
});


export default router;