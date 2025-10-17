import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { token, first_name, last_name, username } = req.body;

    if (!token) return res.status(400).json({ error: "Missing token" });

    // Verify user
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) return res.status(403).json({ error: "Unauthorized" });

    const userId = userData.user.id;

    // Optional: check username duplicates
    if (username) {
      const { data: existing, error: checkError } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("username", username)
        .neq("auth_id", userId)
        .single();

      if (checkError && checkError.code !== "PGRST116") throw checkError;
      if (existing) return res.status(400).json({ error: "Username already taken" });
    }

    // Update user profile
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ first_name, last_name, username })
      .eq("auth_id", userId);

    if (updateError) throw updateError;

    return res.status(200).json({ message: "User updated successfully!" });
  } catch (err: any) {
    console.error("Update error:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
