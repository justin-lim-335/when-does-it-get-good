import { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function updateUserHandler(req: Request, res: Response) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { userId, first_name, last_name, username, token } = req.body;

    if (!userId || !token)
      return res.status(400).json({ error: "Missing userId or token" });

    // Verify token
    const { data: sessionData, error: verifyError } = await supabase.auth.getUser(token);
    if (verifyError || sessionData.user.id !== userId)
      return res.status(403).json({ error: "Unauthorized" });

    // Validate username
    if (username && !/^[A-Za-z0-9_]{3,20}$/.test(username)) {
      return res.status(400).json({ error: "Invalid username format." });
    }

    // Check username availability if provided
    if (username) {
      const { data: existingUser } = await supabase
        .from("users")
        .select("auth_id")
        .eq("username", username)
        .single();
      if (existingUser && existingUser.auth_id !== userId) {
        return res.status(400).json({ error: "Username already taken." });
      }
    }

    // Update user record
    const { error: updateError } = await supabase
      .from("users")
      .update({ first_name, last_name, username })
      .eq("auth_id", userId);

    if (updateError) throw updateError;

    res.status(200).json({ message: "User updated successfully." });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Server error" });
  }
}
