import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { FaEye as EyeIcon, FaEyeSlash as EyeOffIcon } from "react-icons/fa6";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();

  // Validation helpers
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = (pwd: string) => pwd.length >= 8;
  const isPasswordMatch = password === confirmPassword;
  const isValidUsername = (uname: string) => uname.length >= 3 && uname.length <= 20;

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) return setError("Invalid email address");
    if (!isValidUsername(username)) return setError("Username must be 3-20 characters");
    if (!isValidPassword(password)) return setError("Password must be at least 8 characters");
    if (!isPasswordMatch) return setError("Passwords do not match");

    setLoading(true);
    try {
      localStorage.setItem("signup_username", username);

      const { data, error: authError } = await supabase.auth.signUp(
        { email, password } as any, // emailRedirectTo not needed
      );

      if (authError) throw authError;
      if (!data.user) throw new Error("Failed to create user.");

      alert("Account created! Please check your email to confirm before logging in.");
      navigate("/waiting-auth");
    } catch (err: any) {
      setError(err.message || "An error occurred during sign up");
    } finally {
      setLoading(false);
    }
  };

  const getIndicatorColor = (valid: boolean | undefined) =>
    valid === undefined ? "bg-gray-400" : valid ? "bg-green-500" : "bg-red-500";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-800 px-4">
      {/* Logo */}
      <img src="/logo.png" alt="Site Logo" className="w-32 h-auto mb-8" />

      {/* Form container */}
      <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-extrabold text-center text-white mb-6">
          Create an Account
        </h2>

        <form onSubmit={handleSignUp} className="space-y-4">
          {/* Username */}
          <div className="relative">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-gray-800 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full ${getIndicatorColor(
                username ? isValidUsername(username) : undefined
              )}`}
            />
          </div>

          {/* Email */}
          <div className="relative">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-gray-800 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full ${getIndicatorColor(
                email ? isValidEmail(email) : undefined
              )}`}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-gray-800 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span
              className={`absolute right-10 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full ${getIndicatorColor(
                password ? isValidPassword(password) : undefined
              )}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300"
            >
              {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-gray-800 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span
              className={`absolute right-10 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full ${getIndicatorColor(
                confirmPassword ? isPasswordMatch : undefined
              )}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300"
            >
              {showConfirm ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </div>

          {/* Error message */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-white font-semibold hover:opacity-90 transition"
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        {/* Footer: login link */}
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
