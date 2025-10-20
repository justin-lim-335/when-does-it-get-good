// src/pages/SignUp.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { FaEye as EyeIcon, FaEyeSlash as EyeOffIcon } from "react-icons/fa6";
import logo from "../assets/logo.png";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const BACKEND_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = (pwd: string) => pwd.length >= 8 && !/\s/.test(pwd);
  const isPasswordMatch = password === confirmPassword;

  // src/pages/SignUp.tsx
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) return setError("Please enter a valid email.");
    if (!isValidPassword(password))
      return setError("Password must be at least 8 characters with no spaces.");
    if (!isPasswordMatch) return setError("Passwords do not match.");

    setLoading(true);
    try {
      // 1️⃣ Sign up via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `https://www.whendoesitgetgood.net/` },
      });

      if (authError) {
        setError(authError.message); // usually "User already registered"
        return; // stop further execution
      }

      if (!authData?.user) {
        setError("Sign-up failed. Try again later.");
        return;
      }

      // 2️⃣ Create minimal profile in backend
      const res = await fetch(`${BACKEND_BASE}/signup-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const backendData = await res.json();

      if (!res.ok && res.status !== 409) {
        throw new Error(backendData.error || "Failed to create user profile");
      }


      // 3️⃣ Navigate only if signup was successful
      navigate("/waiting");
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "Sign-up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  const getValidationColor = (value: string, isValid: boolean) => {
    if (!value) return "text-gray-400";
    return isValid ? "text-green-400" : "text-red-400";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-24 bg-gray-800 px-4">
      <img src={logo} alt="Site Logo" className="w-32 h-auto mb-8" />

      <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-extrabold text-center text-white mb-6">
          Create an Account
        </h2>

        <form onSubmit={handleSignUp} className="w-full max-w-sm mx-auto flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col">
            <label htmlFor="email" className="text-sm text-gray-300 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
            <p className={`text-xs mt-1 ${getValidationColor(email, isValidEmail(email))}`}>
              {email
                ? isValidEmail(email)
                  ? "Valid email"
                  : "Invalid email format"
                : "Enter your email"}
            </p>
          </div>

          {/* Password */}
          <div className="flex flex-col relative">
            <label htmlFor="password" className="text-sm text-gray-300 mb-1">
              Password
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              placeholder="Enter password"
            />
            <div
              className="absolute right-3 top-9 cursor-pointer text-gray-400"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </div>
            <p className={`text-xs mt-1 ${getValidationColor(password, isValidPassword(password))}`}>
              {password
                ? isValidPassword(password)
                  ? "Password looks good"
                  : "Must be at least 8 chars with no spaces"
                : "Enter a password"}
            </p>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col relative">
            <label htmlFor="confirmPassword" className="text-sm text-gray-300 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              placeholder="Re-enter password"
            />
            <div
              className="absolute right-3 top-9 cursor-pointer text-gray-400"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
            </div>
            <p className={`text-xs mt-1 ${getValidationColor(confirmPassword, isPasswordMatch)}`}>
              {confirmPassword
                ? isPasswordMatch
                  ? "Passwords match"
                  : "Passwords do not match"
                : "Re-enter your password"}
            </p>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`mt-2 p-2 rounded font-semibold ${
              loading ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            } text-white transition-colors`}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400 text-sm">
          Already have an account?{" "}
          <a href="/login" className="text-blue-400 hover:underline font-medium">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
