// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      navigate("/"); // go to home after login
    }
  };

  const handlePasswordReset = async () => {
    setResetMessage(null);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/login`
    });

    if (error) {
      setResetMessage(error.message);
    } else {
      setResetMessage("Check your email for the password reset link!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-800 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Log In</h1>

      {!showReset ? (
        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 rounded text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Password Field */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-2 rounded text-black pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2 text-gray-600 hover:text-gray-800"
            >
              {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </div>

          {error && <p className="text-red-400 text-center">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-white font-semibold hover:opacity-90 transition"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>

          <p
            className="mt-2 text-sm text-gray-400 text-center cursor-pointer hover:underline"
            onClick={() => setShowReset(true)}
          >
            Forgot Password?
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-center mb-2">Enter your email to reset your password:</p>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 rounded text-black"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
          />
          {resetMessage && (
            <p className={`text-center ${resetMessage.includes("Check") ? "text-green-400" : "text-red-400"}`}>
              {resetMessage}
            </p>
          )}
          <button
            onClick={handlePasswordReset}
            className="w-full bg-green-600 hover:bg-green-700 py-2 rounded font-bold"
          >
            Send Reset Link
          </button>
          <p
            className="mt-2 text-sm text-gray-400 text-center cursor-pointer hover:underline"
            onClick={() => setShowReset(false)}
          >
            Back to Log In
          </p>
        </div>
      )}

      <p className="mt-6 text-center text-gray-300">
        Don’t have an account?{" "}
        <span
          className="text-blue-400 underline cursor-pointer"
          onClick={() => navigate("/signup")}
        >
          Sign Up
        </span>
      </p>
    </div>
  );
}
