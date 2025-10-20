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
    console.log("🔄 ResetPassword useEffect running...");

    // Handle both hash-based (#token_hash=...) and query-based (?token_hash=...) URLs
    const hashParams = new URLSearchParams(window.location.hash.replace("#", "?"));
    const searchParams = new URLSearchParams(window.location.search);

    const token =
      hashParams.get("token_hash") || searchParams.get("token_hash");
    const type = hashParams.get("type") || searchParams.get("type");

    console.log("🌐 URL hash:", window.location.hash);
    console.log("🌐 URL search:", window.location.search);
    console.log("🧩 Parsed token:", token, "type:", type);

    if (!token || type !== "recovery") {
      console.error("❌ Token missing or type invalid.");
      setError("Invalid or expired reset link.");
      return;
    }

    const verifyToken = async () => {
      console.log("🔑 Verifying password recovery token via verifyOtp...");
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: "recovery",
      });

      if (error) {
        console.error("🚫 Error verifying token:", error);
        setError("Your password reset link is invalid or expired.");
      } else {
        console.log("✅ Token verified successfully:", data);
        setIsValidSession(true);
      }
    };

    verifyToken();
  }, []);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    console.log("🔐 Attempting password update...");
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      console.error("❗ Password update error:", error);
      setError(error.message);
    } else {
      console.log("🎉 Password successfully reset!");
      setMessage("Password successfully reset! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md flex flex-col justify-center">
        <h2 className="text-2xl font-bold text-center text-white mb-6">
          Reset Your Password
        </h2>

        {!isValidSession ? (
          <p className="text-center text-red-400">
            {error || "Verifying your reset link..."}
          </p>
        ) : (
          <form onSubmit={handlePasswordReset} className="flex flex-col gap-4">
            <input
              type="password"
              placeholder="New Password"
              className="p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-center"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              className="p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-center"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {error && <p className="text-red-400 text-center">{error}</p>}
            {message && <p className="text-green-400 text-center">{message}</p>}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
            >
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
