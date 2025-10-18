// src/pages/VotingHistory.tsx
import { useEffect, useState, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

interface Show {
  tmdb_id: number;
  title: string;
  poster_path?: string;
  genre?: string;
}

interface Vote {
  id: number;
  last_voted: string;
  season: number;
  episode: number;
  episode_title: string;
  show: Show;
}

export default function VotingHistory() {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("recent"); // 'recent', 'az', 'za'
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVotes = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not logged in.");

        const { data, error } = await supabase
          .from("votes")
          .select(`
            id,
            last_voted,
            season,
            episode,
            episode_title,
            show:shows!votes_show_tmdb_id_fkey (
              tmdb_id,
              title,
              poster_path,
              genre
            )
          `)
          .eq("user_id", user.id)
          .order("last_voted", { ascending: false });

        if (error) throw error;

        const formattedVotes: Vote[] = (data || []).map((v: any) => ({
          id: v.id,
          last_voted: v.last_voted,
          season: v.season,
          episode: v.episode,
          episode_title: v.episode_title,
          show: v.show || {
            tmdb_id: 0,
            title: "Unknown",
            poster_path: "/placeholder.png",
            genre: "Unknown",
          },
        }));

        setVotes(formattedVotes);
      } catch (err) {
        console.error("❌ Failed to fetch votes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVotes();
  }, []);

  const filteredAndSortedVotes = useMemo(() => {
    let result = votes.filter((v) =>
      v.show.title.toLowerCase().includes(search.toLowerCase())
    );

    switch (sortOption) {
      case "az":
        result.sort((a, b) => a.show.title.localeCompare(b.show.title));
        break;
      case "za":
        result.sort((a, b) => b.show.title.localeCompare(a.show.title));
        break;
      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.last_voted).getTime() - new Date(b.last_voted).getTime()
        );
        break;
      case "recent":
      default:
        result.sort(
          (a, b) =>
            new Date(b.last_voted).getTime() - new Date(a.last_voted).getTime()
        );
        break;
    }

    return result;
  }, [votes, search, sortOption]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-16 px-6">
      <h1 className="text-4xl font-bold mb-8 text-center text-white">
        Your Voting History
      </h1>

      {loading ? (
        <p className="text-center text-gray-400 text-lg">Loading your votes...</p>
      ) : votes.length === 0 ? (
        <p className="text-center text-gray-400 text-lg">
          You haven’t voted on any episodes yet.
        </p>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <input
              type="text"
              placeholder="Search shows..."
              className="w-full sm:w-1/2 px-4 py-2 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="px-4 py-2 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest</option>
              <option value="az">A → Z</option>
              <option value="za">Z → A</option>
            </select>
          </div>

          <div className="overflow-x-auto bg-gray-800 rounded-xl shadow-lg border border-gray-700">
            <table className="w-full table-auto">
              <thead className="bg-gray-700 text-gray-200 text-sm uppercase tracking-wide">
                <tr>
                  <th className="p-3 text-left">Show</th>
                  <th className="p-3 text-left">Episode</th>
                  <th className="p-3 text-left">Genre</th>
                  <th className="p-3 text-left">Last Voted</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedVotes.map((vote) => (
                  <tr
                    key={vote.id}
                    className="border-t border-gray-700 hover:bg-gray-700/50 transition cursor-pointer"
                    onClick={() => navigate(`/shows/${vote.show.tmdb_id}`)}
                  >
                    <td className="flex items-center gap-3 p-3">
                      <img
                        src={
                          vote.show.poster_path
                            ? `https://image.tmdb.org/t/p/w92${vote.show.poster_path}`
                            : "/placeholder.png"
                        }
                        alt={vote.show.title}
                        className="w-10 h-14 rounded-md object-cover"
                      />
                      <span className="underline text-blue-400 hover:text-blue-300">
                        {vote.show.title}
                      </span>
                    </td>
                    <td className="p-3 text-gray-300">
                      S{vote.season}E{vote.episode} —{" "}
                      <span className="italic text-gray-400">
                        {vote.episode_title}
                      </span>
                    </td>
                    <td className="p-3 text-gray-300">{vote.show.genre}</td>
                    <td className="p-3 text-gray-400">
                      {new Date(vote.last_voted).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
