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

  // ✅ Validation helpers
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidUsername = (uname: string) =>
    /^[A-Za-z0-9_]{3,20}$/.test(uname); // no spaces, only letters/numbers/underscore
  const isValidPassword = (pwd: string) =>
    pwd.length >= 8 && !/\s/.test(pwd); // min 8 chars, no spaces
  const isPasswordMatch = password === confirmPassword;

  // ✅ Username availability check (debounced)
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
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [username]);

  // ✅ Sign-up handler
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // client-side validation
    if (!isValidEmail(email)) return setError("Invalid email address.");
    if (!isValidUsername(username)) return setError("Username must be 3–20 characters (no spaces).");
    if (usernameAvailable === false) return setError("Username already taken.");
    if (!isValidPassword(password))
      return setError("Password must be at least 8 characters with no spaces.");
    if (!isPasswordMatch) return setError("Passwords do not match.");

    setLoading(true);
    try {
      // double-check duplicate user
      const { data: existingUsers, error: fetchError } = await supabase
        .from("users")
        .select("email, username")
        .or(`email.eq.${email},username.eq.${username}`);

      if (fetchError) throw fetchError;

      if (existingUsers && existingUsers.length > 0) {
        const duplicate =
          existingUsers.find((u) => u.email === email)
            ? "Email already registered."
            : "Username already taken.";
        throw new Error(duplicate);
      }

      // Supabase Auth signup
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
          emailRedirectTo: `${window.location.origin}/waiting`, // correct Supabase syntax
        },
      });

      if (authError) throw authError;
      if (!data.user) throw new Error("Failed to create user.");

      localStorage.setItem("signup_username", username);
      navigate("/waiting");
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "An error occurred during sign up.");
    } finally {
      setLoading(false);
    }
  };

  const getTextColor = (input: string, valid?: boolean) => {
    if (!input) return "text-gray-400";
    return valid ? "text-green-400" : "text-red-400";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-24 bg-gray-800 px-4">
      <img src={logo} alt="Site Logo" className="w-32 h-auto mb-8" />

      <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-extrabold text-center text-white mb-6">
          Create an Account
        </h2>

        <form onSubmit={handleSignUp} className="w-full max-w-sm mx-auto flex flex-col gap-4">
          {/* Username */}
          <div className="flex flex-col">
            <label htmlFor="username" className="text-sm text-gray-300 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`p-2 rounded bg-gray-800 text-white border ${
                error?.toLowerCase().includes("username") ? "border-red-500" : "border-gray-700"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter your username"
            />
            <p className={`text-xs transition-colors duration-200 mt-1 ${getTextColor(username, isValidUsername(username))}`}>
              • 3–20 characters, letters/numbers/underscores only, no spaces
            </p>
            {checkingUsername ? (
              <p className="text-gray-400 text-xs mt-1">Checking username...</p>
            ) : usernameAvailable === true ? (
              <p className="text-green-400 text-xs mt-1">Username available!</p>
            ) : usernameAvailable === false ? (
              <p className="text-red-400 text-xs mt-1">Username already taken.</p>
            ) : null}
          </div>

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
              className={`p-2 rounded bg-gray-800 text-white border ${
                error?.toLowerCase().includes("email") ? "border-red-500" : "border-gray-700"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="you@example.com"
            />
            <p className={`text-xs transition-colors duration-200 mt-1 ${getTextColor(email, isValidEmail(email))}`}>
              • Must be a valid email format
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
              className={`p-2 rounded bg-gray-800 text-white border ${
                error?.toLowerCase().includes("password") ? "border-red-500" : "border-gray-700"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10`}
              placeholder="Enter your password"
            />
            <div
              className="absolute right-3 top-9 cursor-pointer text-gray-400"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </div>
            <p className={`text-xs transition-colors duration-200 mt-1 ${getTextColor(password, isValidPassword(password))}`}>
              • At least 8 characters, no spaces
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
              className={`p-2 rounded bg-gray-800 text-white border ${
                !isPasswordMatch && confirmPassword ? "border-red-500" : "border-gray-700"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10`}
              placeholder="Confirm password"
            />
            <div
              className="absolute right-3 top-9 cursor-pointer text-gray-400"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
            </div>
            <p className={`text-xs transition-colors duration-200 mt-1 ${getTextColor(confirmPassword, isPasswordMatch && confirmPassword.length > 0)}`}>
              • Passwords must match
            </p>
          </div>

          {error && <p className="text-red-500 text-sm text-center -mt-2">{error}</p>}

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
