// src/pages/ResetPassword.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValidSession, setIsValidSession] = useState(false);

  useEffect(() => {
    console.log("ResetPassword useEffect running...");
    const hash = window.location.hash.substring(1); // remove "#"
    console.log("URL hash:", hash);
    const params = new URLSearchParams(hash);
    const token = params.get("token_hash");
    const type = params.get("type");
    console.log("Parsed token:", token, "type:", type);

    if (token && type === "recovery") {
      console.log("Exchanging token for session...");
      supabase.auth.exchangeCodeForSession(token)
        .then(({ data, error }) => {
          if (error) {
            console.error("Session exchange error:", error);
            setError("Invalid or expired password reset link.");
          } else {
            console.log("Exchange data:", data);
            if (data?.session) {
              console.log("Setting session in Supabase...");
              supabase.auth.setSession(data.session)
                .then(({ error }) => {
                  if (error) {
                    console.error("Error setting session:", error);
                    setError("Failed to establish session.");
                  } else {
                    console.log("Session successfully set!");
                    setIsValidSession(true);
                  }
                });
            } else {
              console.warn("No session returned from exchangeCodeForSession");
              setError("Invalid or expired password reset link.");
            }
          }
        });
    } else {
      console.warn("Token missing or type invalid.");
      setError("Missing or invalid reset link.");
    }
  }, []);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    console.log("Updating password...");
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      console.error("Password update error:", error);
      setError(error.message);
    } else {
      console.log("Password successfully reset!");
      setMessage("Password successfully reset! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-start bg-gray-900 px-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-white mb-6">
          Reset Your Password
        </h2>

        {!isValidSession ? (
          <p className="text-center text-red-400">{error || "Verifying link..."}</p>
        ) : (
          <form onSubmit={handlePasswordReset} className="flex flex-col gap-4">
            <input
              type="password"
              placeholder="New Password"
              className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {error && <p className="text-red-400 text-center">{error}</p>}
            {message && <p className="text-green-400 text-center">{message}</p>}

            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
