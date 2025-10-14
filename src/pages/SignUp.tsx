// src/pages/SignUp.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function SignUp() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    setError("");

    if (!username || !email || !password || !passwordConfirm)
      return setError("All fields are required");
    if (password.length < 8) return setError("Password must be at least 8 characters");
    if (password !== passwordConfirm) return setError("Passwords do not match");

    const { data: userData, error: signupError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signupError) return setError(signupError.message);

    // Upsert into profiles
    if (userData.user) {
      await supabase.from("profiles").upsert({ id: userData.user.id, username });
    }

    navigate("/account");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-800">
      <div className="bg-gray-100 p-8 rounded-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>

        {error && <div className="text-red-600 mb-4">{error}</div>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded"
        />

        <button
          onClick={handleSignUp}
          className="w-full py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700"
        >
          Sign Up
        </button>

        <p className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-600 cursor-pointer underline"
          >
            Log In
          </span>
        </p>
      </div>
    </div>
  );
}
