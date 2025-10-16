import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Welcome() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code"); // for email confirmation links


  useEffect(() => {
    const confirmUser = async () => {
      setLoading(true);
      setError(null);

      try {
        // Exchange confirmation code from URL automatically
        const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code || "");
        if (sessionError) throw sessionError;
        if (!data.session) throw new Error("No session returned.");

        const user = data.session.user;

        // Retrieve username from localStorage
        const username = localStorage.getItem("signup_username");
        if (username) {
          // Send to backend to insert into `users` table with service role
          await fetch(`${import.meta.env.VITE_API_BASE_URL}/signup-user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: user.id,
              username,
            }),
          });
          localStorage.removeItem("signup_username");
        }

        navigate("/"); // redirect to homepage
      } catch (err: any) {
        console.error("Welcome page error:", err);
        setError(err.message || "Failed to confirm user.");
      } finally {
        setLoading(false);
      }
    };

    confirmUser();
  }, [navigate]);

  if (loading) return <p className="text-center mt-8">Confirming your account...</p>;
  if (error) return <p className="text-center mt-8 text-red-500">{error}</p>;

  return null;
}
