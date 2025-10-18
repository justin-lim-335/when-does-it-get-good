import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface Show {
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  genre: string | null;
}

interface Vote {
  id: number;
  updated_at: string;
  season_number: number;
  episode_number: number;
  episode_title: string | null;
  show: Show;
}

export default function VotingHistory({ userId }: { userId: string }) {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVotes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("votes")
        .select(`
          id,
          updated_at,
          season_number,
          episode_number,
          episode_title,
          show:shows!votes_show_tmdb_id_fkey(
            tmdb_id,
            title,
            poster_path,
            genre
          )
        `)
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("❌ Failed to fetch votes:", error);
      }
      setLoading(false);
    };

    fetchVotes();
  }, [userId]);

  // --- Filter and search
  const filteredVotes = votes.filter((v) =>
    v.show.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="voting-history">
      <input
        type="text"
        placeholder="Search shows..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-2 p-1 border rounded"
      />

      {loading ? (
        <p>Loading votes...</p>
      ) : filteredVotes.length === 0 ? (
        <p>No votes found</p>
      ) : (
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 text-left">Show</th>
              <th className="border p-2 text-left">Season</th>
              <th className="border p-2 text-left">Episode</th>
              <th className="border p-2 text-left">Episode Title</th>
              <th className="border p-2 text-left">Last Voted</th>
            </tr>
          </thead>
          <tbody>
            {filteredVotes.map((v) => (
              <tr key={v.id}>
                <td className="border p-2 flex items-center gap-2">
                  {v.show.poster_path && (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${v.show.poster_path}`}
                      alt={v.show.title}
                      className="w-12 h-16 object-cover"
                    />
                  )}
                  {v.show.title}
                </td>
                <td className="border p-2">{v.season_number}</td>
                <td className="border p-2">{v.episode_number}</td>
                <td className="border p-2">{v.episode_title || "N/A"}</td>
                <td className="border p-2">
                  {new Date(v.updated_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
