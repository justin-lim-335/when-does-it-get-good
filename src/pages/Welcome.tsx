import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import logo from "../assets/logo.png";

export default function Welcome() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const confirmUser = async () => {
      setLoading(true);
      setError(null);

      try {
        // Extract hash fragment (Supabase puts access_token, refresh_token here)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");

        if (!accessToken) throw new Error("No access token found in URL.");

        // Set Supabase session
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: hashParams.get("refresh_token") || "",
        });
        if (sessionError) throw sessionError;

        const user = data?.user;
        if (!user) throw new Error("User not found after setting session.");

        // Insert username into backend if stored in localStorage
        const username = localStorage.getItem("signup_username");
        if (username) {
          await fetch(`${import.meta.env.VITE_API_BASE_URL}/signup-user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: user.id, username }),
          });
          localStorage.removeItem("signup_username");
        }

        // Redirect to homepage
        navigate("/");
      } catch (err: any) {
        console.error("Welcome page error:", err);
        setError(err.message || "Failed to confirm user.");
      } finally {
        setLoading(false);
      }
    };

    confirmUser();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col justify-start items-center pt-24 text-white bg-gray-900">
      <img src={logo} alt="Site Logo" className="w-32 h-auto mb-6" />
      {loading && <p className="text-lg">Confirming your account...</p>}
      {error && <p className="text-lg text-red-400">{error}</p>}
    </div>
  );
}
