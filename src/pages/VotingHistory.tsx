import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

interface Vote {
  id: number;
  show_tmdb_id: number;
  absolute_number: number;
  season_number: number;
  episode_number: number;
  episode_title: string;
  updated_at: string;
}

interface Show {
  tmdb_id: number;
  title: string;
  poster_path?: string;
  genre?: string;
}

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w92"; // small poster

type SortOption = "recent" | "oldest" | "az" | "za";

export default function VotingHistory() {
  const { user } = useAuth();
  const [votes, setVotes] = useState<Vote[]>([]);
  const [shows, setShows] = useState<Record<number, Show>>({});
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState<SortOption>("recent");

  // Fetch votes for current user
  useEffect(() => {
    if (!user) return;

    const fetchVotes = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("votes")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (data) setVotes(data);
      } catch (err) {
        console.error("Failed to fetch votes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVotes();
  }, [user]);

  // Fetch TMDb show data for all unique show IDs
  useEffect(() => {
    if (votes.length === 0) return;

    const fetchShows = async () => {
      const uniqueIds = Array.from(new Set(votes.map((v) => v.show_tmdb_id)));
      const showsData: Record<number, Show> = {};

      await Promise.all(
        uniqueIds.map(async (tmdb_id) => {
          try {
            const res = await fetch(`https://api.themoviedb.org/3/tv/${tmdb_id}?api_key=${TMDB_API_KEY}`);
            const data = await res.json();
            showsData[tmdb_id] = {
              tmdb_id,
              title: data.name || data.title,
              poster_path: data.poster_path,
              genre: data.genres?.map((g: any) => g.name).join(", "),
            };
          } catch (err) {
            console.error(`Failed to fetch show ${tmdb_id}:`, err);
          }
        })
      );

      setShows(showsData);
    };

    fetchShows();
  }, [votes]);

  // Sorting logic
  const sortedVotes = [...votes].sort((a, b) => {
    const showA = shows[a.show_tmdb_id]?.title || "";
    const showB = shows[b.show_tmdb_id]?.title || "";

    switch (sortOption) {
      case "recent":
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      case "oldest":
        return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      case "az":
        return showA.localeCompare(showB);
      case "za":
        return showB.localeCompare(showA);
      default:
        return 0;
    }
  });

  if (!user) {
    return <p className="text-gray-200 p-6">You must be logged in to see your voting history.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-800 p-6">
      <h1 className="text-3xl text-gray-100 font-bold mb-6">Your Voting History</h1>

      <div className="mb-4">
        <label className="text-gray-200 mr-2">Sort by:</label>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as SortOption)}
          className="p-2 rounded-md bg-gray-700 text-gray-100"
        >
          <option value="recent">Most Recent</option>
          <option value="oldest">Oldest</option>
          <option value="az">Show A-Z</option>
          <option value="za">Show Z-A</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-200">Loading votes...</p>
      ) : sortedVotes.length === 0 ? (
        <p className="text-gray-200">No votes placed yet.</p>
      ) : (
        <table className="w-full text-gray-100 border-collapse">
          <thead>
            <tr className="border-b border-gray-500">
              <th className="text-left p-2">Show</th>
              <th className="text-left p-2">Episode</th>
              <th className="text-left p-2">Genre</th>
              <th className="text-left p-2">Last Voted</th>
            </tr>
          </thead>
          <tbody>
            {sortedVotes.map((vote) => {
              const show = shows[vote.show_tmdb_id];
              if (!show) return null;

              return (
                <tr key={vote.id} className="border-b border-gray-700">
                  <td className="p-2 flex items-center gap-2">
                    {show.poster_path && (
                      <a href={`/show/${show.tmdb_id}`}>
                        <img
                          src={`${TMDB_IMAGE_BASE}${show.poster_path}`}
                          alt={show.title}
                          className="w-12 h-auto rounded-sm hover:brightness-90 transition"
                        />
                      </a>
                    )}
                    <a
                      href={`/show/${show.tmdb_id}`}
                      className="underline hover:text-gray-300 transition"
                    >
                      {show.title}
                    </a>
                  </td>
                  <td className="p-2">
                    S{vote.season_number}E{vote.episode_number} — {vote.episode_title}
                  </td>
                  <td className="p-2">{show.genre || "N/A"}</td>
                  <td className="p-2">{new Date(vote.updated_at).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
