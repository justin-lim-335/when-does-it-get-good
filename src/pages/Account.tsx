// src/pages/Account.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Account() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ username: string; email: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = supabase.auth.getUser();
      if (!user) return navigate("/login");

      const { data } = await supabase.from("profiles").select("*").eq("id", (await user).data.user?.id).single();
      if (!data) return navigate("/login");

      setProfile({ username: data.username, email: (await user).data.user?.email || "" });
    };
    fetchProfile();
  }, []);

  const handleChangePassword = async () => {
    alert("Password change placeholder (implement later)");
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="min-h-screen flex max-w-[1200px] mx-auto p-4">
      {/* Sidebar */}
      <aside className="w-64 mr-8">
        <nav className="flex flex-col gap-2">
          <a href="/account" className="hover:underline">Account Details</a>
          <a href="/voting-history" className="hover:underline">Voting History</a>
          <a href="/terms-of-use" className="hover:underline">Terms of Use</a>
          <a href="/privacy-policy" className="hover:underline">Privacy Policy</a>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 bg-gray-100 p-6 rounded">
        <h1 className="text-2xl font-bold mb-4">Hi, {profile.username}</h1>

        <div className="space-y-4">
          <div>Email: {profile.email}</div>
          <div>
            Password: ********
            <button
              onClick={handleChangePassword}
              className="ml-2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Change
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
