// src/components/Header.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient"; // ✅ make sure this exists
import logo from "../assets/logo.png";

interface Show {
  tmdb_id: number;
  title: string;
  poster_path?: string;
  first_air_date?: string;
}

export default function Header() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Show[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState<any>(null);

  // ✅ Check login state on mount and subscribe to changes
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // ✅ Handle search logic
  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/shows/search?query=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        setSuggestions(data.slice(0, 6)); // limit dropdown
        setShowDropdown(true);
      } catch (err) {
        console.error("Failed to fetch suggestions:", err);
      }
    };

    fetchSuggestions();
  }, [query]);

  const handleSelect = (tmdb_id: number) => {
    navigate(`/shows/${tmdb_id}`);
    setQuery("");
    setShowDropdown(false);
  };

  // ✅ Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/");
  };

  return (
    <header className="w-full bg-gray-500 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between px-6 py-4 sm:py-5">
        {/* Logo */}
        <div className="flex items-center mb-2 sm:mb-0">
          <img
            src={logo}
            alt="Site Logo"
            className="h-28 sm:h-24 w-auto cursor-pointer transition-all duration-300"
            onClick={() => navigate("/")}
          />
        </div>

        {/* Search Bar */}
        <div className="flex-1 mx-6 relative w-full max-w-2xl">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search shows..."
            className="w-full px-4 py-3 rounded-md border border-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute top-full mt-1 w-full bg-white rounded shadow-lg z-50 overflow-hidden">
              {suggestions.map((show) => (
                <div
                  key={show.tmdb_id}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-200 cursor-pointer"
                  onClick={() => handleSelect(show.tmdb_id)}
                >
                  <img
                    src={
                      show.poster_path
                        ? `https://image.tmdb.org/t/p/w92${show.poster_path}`
                        : "/placeholder.png"
                    }
                    alt={show.title}
                    className="w-12 h-16 object-cover rounded"
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{show.title}</span>
                    {show.first_air_date && (
                      <span className="text-sm text-gray-600">
                        {new Date(show.first_air_date).getFullYear()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ✅ Login / Logout Button */}
        <div className="mt-3 sm:mt-0 flex-shrink-0">
          {user ? (
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-md text-base font-medium transition"
            >
              Log Out
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-base font-medium transition"
            >
              Log In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
