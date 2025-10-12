// src/Login.tsx
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<any>(null);

  // Subscribe to auth changes
  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert("Check your email for a confirmation link!");
  };

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (user) {
    return (
      <div>
        <p>Logged in as {user.email}</p>
        <button onClick={handleSignOut} className="bg-red-500 text-white p-2 rounded">Log Out</button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-2">Log In / Sign Up</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="border p-2 w-full mb-2"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="border p-2 w-full mb-2"
      />
      <div className="flex gap-2">
        <button onClick={handleSignIn} className="bg-blue-500 text-white p-2 rounded w-full">
          Log In
        </button>
        <button onClick={handleSignUp} className="bg-green-500 text-white p-2 rounded w-full">
          Sign Up
        </button>
      </div>
    </div>
  );
}
