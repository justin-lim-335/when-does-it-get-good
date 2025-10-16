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
        // Extract hash fragment (Supabase puts access_token etc. here)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");

        if (accessToken) {
          // Set the session manually if access_token is present
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get("refresh_token") || "",
          });
          if (sessionError) throw sessionError;

          const user = data?.user;
          if (!user) throw new Error("User not found after setting session.");

          // Fetch username stored temporarily in localStorage
          const username = localStorage.getItem("signup_username");
          if (username) {
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

          // Once verified, redirect to homepage
          navigate("/");
        } else {
          throw new Error("No access token found in URL.");
        }
      } catch (err: any) {
        console.error("Welcome page error:", err);
        setError(err.message || "Failed to confirm user.");
      } finally {
        setLoading(false);
      }
    };

    confirmUser();
  }, [navigate]);

  if (loading)
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-white bg-gray-900">
        <img src={logo} alt="Site Logo" className="w-24 h-auto mb-4" />
        <p>Confirming your account...</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-red-400 bg-gray-900">
        <img src={logo} alt="Site Logo" className="w-24 h-auto mb-4" />
        <p>{error}</p>
      </div>
    );

  return null;
}
