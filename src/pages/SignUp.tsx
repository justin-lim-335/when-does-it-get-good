// src/pages/SignUpPage.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (password.length < 8) return alert("Password must be at least 8 characters.");
    if (password !== confirmPassword) return alert("Passwords do not match.");

    setLoading(true);
    const { data: user, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      alert(error.message);
      return;
    }

    // Insert username into users table
    const { error: profileError } = await supabase.from("users").insert({
      id: user.user?.id,
      email,
      username,
    });

    setLoading(false);
    if (profileError) {
      alert("Failed to save username: " + profileError.message);
    } else {
      navigate("/"); // go to home after signup
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-gray-800 text-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">Sign Up</h1>
      <input
        type="text"
        placeholder="Username"
        className="w-full p-2 mb-4 rounded text-black"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        className="w-full p-2 mb-4 rounded text-black"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password (min 8 chars)"
        className="w-full p-2 mb-4 rounded text-black"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="Confirm Password"
        className="w-full p-2 mb-4 rounded text-black"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <button
        onClick={handleSignUp}
        className="w-full bg-green-500 hover:bg-green-600 py-2 rounded font-bold"
        disabled={loading}
      >
        {loading ? "Signing up..." : "Sign Up"}
      </button>
      <p className="mt-4 text-center text-gray-300">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-400 underline">
          Log In
        </Link>
      </p>
    </div>
  );
}
