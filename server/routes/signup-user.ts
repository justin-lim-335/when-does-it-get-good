// server/routes/signup-user.ts
import { Router } from "express";
import { supabaseAdmin } from "../supabase";

const router = Router();

router.post("/", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    // 1️⃣ Create user in Supabase Auth
    const { data, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // Let Supabase handle confirmation via email link
    });

    if (signUpError) {
      console.error("Sign-up error:", signUpError);
      return res.status(400).json({ error: signUpError.message });
    }

    const user = data.user;
    if (!user) {
      return res.status(500).json({ error: "User creation failed." });
    }

    // 2️⃣ Create a profile record in `users`
    const { error: insertError } = await supabaseAdmin
      .from("users")
      .insert([
        {
          auth_id: user.id,
          email: user.email,
          first_name: null,
          last_name: null,
          username: null,
        },
      ]);

    if (insertError) {
      console.error("Insert error:", insertError);
      return res.status(500).json({ error: insertError.message });
    }

    // 3️⃣ Send success response
    return res.status(201).json({
      message: "User created successfully. Please check your email to confirm your account.",
    });
  } catch (err) {
    console.error("Signup-user route error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
