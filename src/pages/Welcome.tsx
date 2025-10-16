import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import logo from "../assets/logo.png";

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
          // Send to backend to insert into `users` table
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

        // Redirect to home after short delay
        setTimeout(() => navigate("/"), 2000);
      } catch (err: any) {
        console.error("Welcome page error:", err);
        setError(err.message || "Failed to confirm user.");
      } finally {
        setLoading(false);
      }
    };

    if (code) confirmUser();
  }, [navigate, code]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-center px-4">
      {/* Logo section */}
      <img
            src={logo}
            alt="Site Logo"
            className="h-28 sm:h-24 w-auto cursor-pointer transition-all duration-300"
            onClick={() => navigate("/")}
        />

      {loading && (
        <p className="text-lg text-gray-200 font-heading">
          Confirming your account...
        </p>
      )}

      {error && (
        <p className="text-lg text-red-500 font-medium">
          {error}
        </p>
      )}

      {!loading && !error && (
        <p className="text-lg text-green-200 font-heading">
          🎉 Your account has been confirmed! Redirecting...
        </p>
      )}
    </div>
  );
}
