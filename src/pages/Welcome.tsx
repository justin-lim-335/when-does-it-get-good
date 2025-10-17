// src/pages/Welcome.tsx
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
        // Read hash fragment (Supabase sends access_token in hash)
        const hash = window.location.hash.substring(1); // remove '#'
        const params = new URLSearchParams(hash);
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token") || "";

        if (!access_token) {
          throw new Error("No access token found in URL.");
        }

        // Set session using both tokens
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (sessionError) throw sessionError;
        if (!data?.user) throw new Error("Failed to set session.");

        // Mark in localStorage that user just confirmed — home page will show a banner and then clear it.
        localStorage.setItem("just_confirmed", "true");

        // redirect to home
        navigate("/");
      } catch (err: any) {
        console.error("Welcome error:", err);
        setError(err.message || "Failed to confirm account.");
      } finally {
        setLoading(false);
      }
    };

    confirmUser();
  }, [navigate]);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-800 flex flex-col items-center justify-start pt-24 text-white">
        <img src={logo} className="w-40 mb-6" alt="Logo" />
        <div className="bg-gray-900 p-6 rounded-lg shadow">Confirming your account…</div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gray-800 flex flex-col items-center justify-start pt-24 text-red-400">
        <img src={logo} className="w-40 mb-6" alt="Logo" />
        <div className="bg-gray-900 p-6 rounded-lg shadow">{error}</div>
      </div>
    );

  return null;
}
