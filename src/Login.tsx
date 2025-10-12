// src/Login.tsx
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<any>(null);

  // ✅ Properly handle session retrieval and subscription
  useEffect(() => {
    // Fetch the initial session once
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) console.error("Error getting session:", error);
      setUser(data?.session?.user ?? null);
    };
    getSession();

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ✅ Auth handlers
  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert(error.message);
    } else {
      alert("Check your email for a confirmation link!");
    }
  };

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    }
    setUser(null);
  };

  // ✅ Logged-in view
  if (user) {
    return (
      <div className="p-4 max-w-md mx-auto text-center">
        <p className="text-lg font-medium mb-4">Logged in as {user.email}</p>
        <button
          onClick={handleSignOut}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
        >
          Log Out
        </button>
      </div>
    );
  }

  // ✅ Login form view
  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Log In / Sign Up</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border border-gray-300 p-2 w-full mb-3 rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border border-gray-300 p-2 w-full mb-4 rounded"
      />
      <div className="flex gap-3">
        <button
          onClick={handleSignIn}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded w-full"
        >
          Log In
        </button>
        <button
          onClick={handleSignUp}
          className="bg-green-500 hover:bg-green-600 text-white p-2 rounded w-full"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
