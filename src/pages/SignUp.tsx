// src/pages/SignUp.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { EyeIcon, EyeSlashIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";

export default function SignUp() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

  // Password validation helpers
  const passwordValid = password.length >= 8;
  const confirmValid = password === confirmPassword && passwordValid;

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!passwordValid) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!confirmValid) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Create the auth user
      const { data: { user }, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (authError) throw authError;
      if (!user) throw new Error("Failed to create user.");

      // 2️⃣ Insert username into public.users using service role key (backend recommended)
      //    Here, using frontend requires RLS allowing auth_id = auth.uid()
      const { error: profileError } = await supabase
        .from("users")
        .insert([{ auth_id: user.id, username }]);
      if (profileError) throw profileError;

      alert("Account created! Please check your email to confirm.");
      navigate("/login");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Database error saving new user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-gray-900 text-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>

      <form onSubmit={handleSignUp} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Username"
          className="w-full p-2 rounded text-black"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

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
          onChange={(e) => {
            setPassword(e.target.value);
            if (!passwordTouched) setPasswordTouched(true);
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
      {passwordTouched && password.trim().length > 0 && (
        <div className="flex items-center gap-2 text-sm mb-2">
          {passwordValid ? (
            <CheckIcon className="w-4 h-4 text-green-500" />
          ) : (
            <XMarkIcon className="w-4 h-4 text-red-500" />
          )}
          <span className={passwordValid ? "text-green-400" : "text-red-400"}>
            At least 8 characters
          </span>
        </div>
      )}

      {/* Confirm Password Field */}
      <div className="relative">
        <input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm Password"
          className="w-full p-2 rounded text-black pr-10"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (!confirmTouched) setConfirmTouched(true);
          }}
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-2 top-2 text-gray-600 hover:text-gray-800"
        >
          {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
        </button>
      </div>
      {confirmTouched && confirmPassword.trim().length > 0 && (
        <div className="flex items-center gap-2 text-sm mb-2">
          {confirmValid ? (
            <CheckIcon className="w-4 h-4 text-green-500" />
          ) : (
            <XMarkIcon className="w-4 h-4 text-red-500" />
          )}
          <span className={confirmValid ? "text-green-400" : "text-red-400"}>
            {confirmPassword ? "Passwords match" : "Confirm password"}
          </span>
        </div>
      )}


        {error && <p className="text-red-400 text-center">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-bold"
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>

      <p className="mt-4 text-center text-gray-300">
        Already have an account?{" "}
        <span
          className="text-blue-400 underline cursor-pointer"
          onClick={() => navigate("/login")}
        >
          Log In
        </span>
      </p>
    </div>
  );
}
