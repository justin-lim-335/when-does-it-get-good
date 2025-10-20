// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { supabase } from "../lib/supabaseClient";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [emailOrUsername, setEmailOrUsername] = useState("");

  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let loginInput = emailOrUsername.trim();
      let loginEmail = loginInput;

      // Regex to check if it's an email
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginInput);

      if (!isEmail) {
        // Look up user email by username via Supabase REST API (avoids 406)
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/users?select=email&username=ilike.${encodeURIComponent(
            loginInput
          )}`,
          {
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY!,
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY!}`,
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          console.error("Supabase fetch error:", response.status, await response.text());
          throw new Error("Failed to look up username.");
        }

        const data = await response.json();

        if (!data || data.length === 0 || !data[0].email) {
          throw new Error("No account found for that username.");
        }

        loginEmail = data[0].email; // replace with looked-up email
      }

      // Sign in using the resolved email
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (signInError) throw signInError;
      if (!authData?.session) throw new Error("Login failed: no session created.");

      navigate("/"); // redirect to homepage
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Failed to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setResetMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setResetMessage("Check your email for the password reset link!");
    } catch (err: any) {
      setResetMessage(err.message || "Failed to send password reset email.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-24 bg-gray-800 px-4">
      <img src={logo} alt="Site Logo" className="w-32 h-auto mb-8" />

      <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-extrabold text-center text-white mb-6">
          Log In
        </h2>

      {!showReset ? (
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Enter your username or email"
            className="p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleLogin(e as any)
            }}
          />

          {/* Password Field */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-2 rounded text-white bg-gray-800 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLogin(e as any)
              }}
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
  </div>
  );
}
