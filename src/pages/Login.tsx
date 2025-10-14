// src/pages/LoginPage.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      navigate("/"); // go to home after login
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-gray-800 text-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">Log In</h1>
      <input
        type="email"
        placeholder="Email"
        className="w-full p-2 mb-4 rounded text-black"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full p-2 mb-4 rounded text-black"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={handleLogin}
        className="w-full bg-blue-500 hover:bg-blue-600 py-2 rounded font-bold"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Log In"}
      </button>
      <p className="mt-4 text-center text-gray-300">
        Don’t have an account?{" "}
        <Link to="/signup" className="text-blue-400 underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
