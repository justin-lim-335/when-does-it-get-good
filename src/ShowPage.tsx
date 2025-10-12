// src/ShowPage.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "./lib/supabaseClient";
import { useAuth } from "./context/AuthContext"; // ✅ import your auth context

interface Episode {
  season_number: number;
  episode_number: number;
  absolute_number: number;
  name: string;
}

interface Show {
  tmdb_id: number;
  name?: string;
  title?: string; 
  poster_path?: string;
  first_air_date?: string;
  overview?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
}

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w300";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export default function ShowPage() {
  const { tmdb_id } = useParams<{ tmdb_id: string }>();
  const { user } = useAuth(); // ✅ get logged-in user
  const [show, setShow] = useState<Show | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);
  const [average, setAverage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch show details and episodes from TMDb
  useEffect(() => {
    if (!tmdb_id) return;

    const fetchShow = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/tv/${tmdb_id}?api_key=${TMDB_API_KEY}`
        );
        const data = await res.json();

        const formattedShow = {
          ...data,
          title: data.name || data.title,
        };
        setShow(formattedShow);

        let allEpisodes: Episode[] = [];
        let absoluteCounter = 1;

        for (let season = 1; season <= (data.number_of_seasons || 1); season++) {
          const seasonRes = await fetch(
            `https://api.themoviedb.org/3/tv/${tmdb_id}/season/${season}?api_key=${TMDB_API_KEY}`
          );
          const seasonData = await seasonRes.json();

          seasonData.episodes.forEach((ep: any) => {
            allEpisodes.push({
              season_number: season,
              episode_number: ep.episode_number,
              absolute_number: absoluteCounter++,
              name: ep.name,
            });
          });
        }

        setEpisodes(allEpisodes);
      } catch (err) {
        console.error("Failed to fetch show:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchShow();
  }, [tmdb_id]);

  // Fetch average + subscribe to realtime updates
  useEffect(() => {
    if (!tmdb_id) return;

    const fetchAverage = async () => {
      try {
        const res = await fetch(`${API_BASE}/shows/${tmdb_id}/average`);
        const data = await res.json();
        setAverage(data.average);
      } catch (err) {
        console.error("Failed to fetch average:", err);
      }
    };

    fetchAverage();

    const channel = supabase
      .channel(`votes-show-${tmdb_id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "votes",
          filter: `show_tmdb_id=eq.${tmdb_id}`,
        },
        () => fetchAverage()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tmdb_id]);

  // Submit vote
  const submitVote = async () => {
    if (!user) return alert("You must be logged in to vote!");
    if (selectedEpisode === null) return alert("Select an episode first.");

    const episode = episodes.find((ep) => ep.absolute_number === selectedEpisode);
    if (!episode) return alert("Invalid episode selected.");

    try {
      await fetch(`${API_BASE}/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id, // ✅ send logged-in user's ID
          show_tmdb_id: Number(tmdb_id),
          season_number: episode.season_number,
          episode_number: episode.episode_number,
          absolute_number: episode.absolute_number,
        }),
      });
      alert("Vote submitted!");
    } catch (err) {
      console.error("Failed to submit vote:", err);
      alert("Failed to submit vote.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* LEFT COLUMN */}
        {loading ? (
          <div className="md:col-span-2 animate-pulse">
            {/* Loading skeleton */}
            <div className="h-10 w-1/2 bg-gray-300 rounded mb-6"></div>
            <div className="flex flex-col sm:flex-row gap-8 mb-8">
              <div className="w-64 h-96 bg-gray-300 rounded-xl"></div>
              <div className="flex-1 space-y-3">
                <div className="h-6 w-1/3 bg-gray-300 rounded"></div>
                <div className="h-6 w-1/4 bg-gray-300 rounded"></div>
                <div className="h-6 w-1/2 bg-gray-300 rounded"></div>
                <div className="h-6 w-1/3 bg-gray-300 rounded"></div>
              </div>
            </div>
            <div className="h-32 bg-gray-300 rounded"></div>
          </div>
        ) : (
          show && (
            <div className="md:col-span-2">
              <h1 className="text-4xl font-bold mb-6 text-gray-900">{show.title}</h1>

              <div className="flex flex-col sm:flex-row gap-8 mb-8">
                {show.poster_path && (
                  <img
                    src={`${TMDB_IMAGE_BASE}${show.poster_path}`}
                    alt={show.title}
                    className="rounded-xl shadow-lg w-64"
                  />
                )}

                <div className="flex flex-col justify-center text-gray-700 text-lg space-y-2">
                  <p><strong>Year:</strong> {show.first_air_date ? new Date(show.first_air_date).getFullYear() : "N/A"}</p>
                  <p><strong>Seasons:</strong> {show.number_of_seasons || "N/A"}</p>
                  <p><strong>Episodes:</strong> {show.number_of_episodes || "N/A"}</p>
                  <p><strong>First Aired:</strong> {show.first_air_date || "N/A"}</p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-2 text-gray-800">Description</h2>
                <p className="text-gray-600 leading-relaxed">{show.overview || "No description available."}</p>
              </div>
            </div>
          )
        )}

        {/* RIGHT COLUMN — Voting Section */}
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-6">
          <h2 className="text-2xl font-semibold text-gray-800">Submit Your Vote</h2>

          {episodes.length > 0 ? (
            <select
              className="border border-gray-300 rounded-md p-3 w-full"
              value={selectedEpisode ?? ""}
              onChange={(e) => setSelectedEpisode(Number(e.target.value))}
            >
              <option value="">-- Choose an episode --</option>
              {episodes.map((ep) => (
                <option key={ep.absolute_number} value={ep.absolute_number}>
                  S{ep.season_number}E{ep.episode_number} — {ep.name}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-gray-500 italic">Loading episodes...</p>
          )}

          <button
            onClick={submitVote}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-md transition"
          >
            Submit Vote
          </button>

          <div className="mt-6 border-t pt-4 text-center">
            <h3 className="text-lg font-semibold text-gray-800">Average “Gets Good” Episode</h3>
            <p className="text-4xl font-bold text-blue-600 mt-1">{average}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
