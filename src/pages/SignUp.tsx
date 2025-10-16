import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import logo from "../assets/logo.png";
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

  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const navigate = useNavigate();

  // Validation helpers
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = (pwd: string) => pwd.length >= 8;
  const isPasswordMatch = password === confirmPassword;
  const isValidUsername = (uname: string) => uname.length >= 3 && uname.length <= 20;

  // Check username availability when it changes
  useEffect(() => {
    if (!isValidUsername(username)) {
      setUsernameAvailable(null);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/check-username`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });
        const data = await res.json();
        setUsernameAvailable(!data.exists);
      } catch (err) {
        console.error("Username check failed", err);
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 500); // debounce by 500ms

    return () => clearTimeout(delayDebounce);
  }, [username]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) return setError("Invalid email address");
    if (!isValidUsername(username)) return setError("Username must be 3-20 characters");
    if (usernameAvailable === false) return setError("Username is already taken");
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
      navigate("/waiting");
    } catch (err: any) {
      setError(err.message || "An error occurred during sign up");
    } finally {
      setLoading(false);
    }
  };

    // Helper for text colors
  const getTextColor = (valid?: boolean) => {
    if (valid === undefined) return "text-gray-400";
    return valid ? "text-green-400" : "text-red-400";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-800 px-4">
      {/* Logo */}
      <img src={logo} alt="Site Logo" className="w-32 h-auto mb-8" />

      {/* Form container */}
      <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-extrabold text-center text-white mb-6">
          Create an Account
        </h2>

        <form onSubmit={handleSignUp} className="space-y-4">
          {/* Username */}
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-gray-800 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* ✅ NEW username availability indicator */}
            <p
              className={`text-sm mt-1 ${getTextColor(
                username
                  ? isValidUsername(username)
                    ? usernameAvailable === null
                      ? undefined
                      : usernameAvailable
                    : false
                  : undefined
              )}`}
            >
              {username ? (
                !isValidUsername(username) ? (
                  "Username must be between 3–20 characters"
                ) : checkingUsername ? (
                  "Checking availability..."
                ) : usernameAvailable === null ? (
                  "Enter a username between 3–20 characters"
                ) : usernameAvailable ? (
                  "✓ Username available"
                ) : (
                  "✗ Username already taken"
                )
              ) : (
                "Enter a username between 3–20 characters"
              )}
            </p>
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-gray-800 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-800 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-200"
              >
                {showPassword ? (
                  <EyeOffIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            <p
              className={`text-sm mt-1 ${getTextColor(
                password ? isValidPassword(password) : undefined
              )}`}
            >
              {password
                ? isValidPassword(password)
                  ? "✓ Password meets requirements"
                  : "Password must be at least 8 characters"
                : "Use at least 8 characters"}
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-800 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300"
              >
                {showConfirm ? (
                  <EyeOffIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            <p
              className={`text-sm mt-1 ${getTextColor(
                confirmPassword ? isPasswordMatch : undefined
              )}`}
            >
              {confirmPassword
                ? isPasswordMatch
                  ? "✓ Passwords match"
                  : "Passwords do not match"
                : "Re-enter your password"}
            </p>
          </div>

          {/* General error (e.g. invalid email or signup error) */}
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
