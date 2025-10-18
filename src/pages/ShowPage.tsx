// src/ShowPage.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

interface Episode {
  season_number: number;
  episode_number: number;
  absolute_number: number;
  name: string;
  still_path?: string;
}

interface Show {
  tmdb_id: number;
  name?: string;
  title?: string;
  poster_path?: string;
  first_air_date?: string;
  overview?: string;
  genre?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
}

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w300";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export default function ShowPage() {
  const { tmdb_id } = useParams<{ tmdb_id: string }>();
  const { user } = useAuth();

  const [show, setShow] = useState<Show | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);
  const [average, setAverage] = useState<number | null>(null);
  const [userVote, setUserVote] = useState<number | null>(null);
  const [isChangingVote, setIsChangingVote] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voteSuccess, setVoteSuccess] = useState(false);

  // ------------------------------
  // Reset states on show change
  // ------------------------------
  useEffect(() => {
    setShow(null);
    setEpisodes([]);
    setSelectedEpisode(null);
    setAverage(null);
    setUserVote(null);
    setIsChangingVote(false);
    setLoading(true);
  }, [tmdb_id]);

  // ------------------------------
  // Fetch show and episodes
  // ------------------------------
  useEffect(() => {
    if (!tmdb_id) return;

    const fetchShowData = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/tv/${tmdb_id}?api_key=${TMDB_API_KEY}&append_to_response=external_ids`
        );
        const data = await res.json();

        const genreNames = data.genres?.map((g: any) => g.name).join(", ") || "N/A";
        setShow({ ...data, title: data.name || data.title, genre: genreNames });

        // Fetch all episodes
        let allEpisodes: Episode[] = [];
        let absCounter = 1;
        for (let season = 1; season <= (data.number_of_seasons || 1); season++) {
          const seasonRes = await fetch(
            `https://api.themoviedb.org/3/tv/${tmdb_id}/season/${season}?api_key=${TMDB_API_KEY}`
          );
          const seasonData = await seasonRes.json();
          seasonData.episodes?.forEach((ep: any) => {
            allEpisodes.push({
              season_number: season,
              episode_number: ep.episode_number,
              absolute_number: absCounter++,
              name: ep.name,
              still_path: ep.still_path,
            });
          });
        }

        setEpisodes(allEpisodes);
      } catch (err) {
        console.error("Failed to fetch show or episodes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchShowData();
  }, [tmdb_id]);

  // ------------------------------
  // Fetch user's vote
  // ------------------------------
  useEffect(() => {
    if (!user || !tmdb_id) return;

    const fetchVote = async () => {
      try {
        const res = await fetch(`${API_BASE}/votes/${user.id}/${tmdb_id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data?.absolute_number) setUserVote(data.absolute_number);
      } catch (err) {
        console.error("Failed to fetch user vote:", err);
      }
    };

    fetchVote();
  }, [tmdb_id, user]);

  // ------------------------------
  // Fetch average & subscribe to live updates
  // ------------------------------
  useEffect(() => {
    if (!tmdb_id) return;

    const fetchAverage = async () => {
      try {
        const res = await fetch(`${API_BASE}/shows/${tmdb_id}/average`);
        if (!res.ok) return;
        const data = await res.json();
        if (data?.average && episodes.length > 0) {
          const match = episodes.find(
            (ep) => `S${ep.season_number}E${ep.episode_number} - ${ep.name}` === data.average
          );
          setAverage(match?.absolute_number || null);
        } else {
          setAverage(null);
        }
      } catch (err) {
        console.error("Failed to fetch average:", err);
      }
    };

    fetchAverage();

    const channel = supabase
      .channel(`votes-show-${tmdb_id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "votes", filter: `show_tmdb_id=eq.${tmdb_id}` },
        () => { fetchAverage().catch(console.error); }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [tmdb_id, episodes]);

  // ------------------------------
  // Sync selected episode with user's vote
  // ------------------------------
  useEffect(() => {
    if (userVote) {
      setSelectedEpisode(userVote);
    }
  }, [userVote]);

  // ------------------------------
  // Submit / update vote
  // ------------------------------
  const submitVote = async () => {
    if (!user || selectedEpisode === null) return alert("Select an episode first!");
    const ep = episodes.find((e) => e.absolute_number === selectedEpisode);
    if (!ep) return alert("Invalid episode selected");

    const payload = {
      user_id: user.id,
      show_tmdb_id: Number(tmdb_id),
      season_number: ep.season_number,
      episode_number: ep.episode_number,
      absolute_number: ep.absolute_number,
    };

    try {
      const response = await fetch(`${API_BASE}/votes`, {
        method: userVote ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Vote submission failed");

      setUserVote(ep.absolute_number);
      setIsChangingVote(false);
      setVoteSuccess(true);
      setTimeout(() => setVoteSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to submit vote");
    }
  };

  // ------------------------------
  // Remove vote
  // ------------------------------
  const removeVote = async () => {
    if (!user || !userVote) return;
    if (!window.confirm("Are you sure you want to remove your vote?")) return;

    try {
      const res = await fetch(`${API_BASE}/votes/${user.id}/${tmdb_id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove vote");

      setUserVote(null);
      setSelectedEpisode(null);
      setIsChangingVote(false);
    } catch (err) {
      console.error(err);
      alert("Failed to remove vote");
    }
  };

  // ------------------------------
  // Computed average
  // ------------------------------
  const averageEpisode =
    average && episodes.length > 0 ? episodes.find((ep) => ep.absolute_number === average) : null;

  const positionPercent =
    averageEpisode && episodes.length > 1
      ? ((averageEpisode.absolute_number - 1) / (episodes.length - 1)) * 100
      : 50;

  const hasVotes = !!averageEpisode;
  const userEpisode = userVote ? episodes.find((ep) => ep.absolute_number === userVote) : null;

  // ------------------------------
  // JSX
  // ------------------------------
  return (
    <div className="min-h-screen bg-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-10">
        {!loading && show && (
          <div>
            <h1 className="text-4xl font-bold mb-6 text-gray-100">{show.title}</h1>
            <div className="flex flex-col sm:flex-row gap-8 mb-8">
              {show.poster_path && (
                <img
                  src={`${TMDB_IMAGE_BASE}${show.poster_path}`}
                  alt={show.title}
                  className="rounded-xl shadow-lg w-64"
                />
              )}
              <div className="flex flex-col justify-center text-gray-200 text-lg space-y-2">
                <p><strong>Year:</strong> {show.first_air_date ? new Date(show.first_air_date).getFullYear() : "N/A"}</p>
                <p><strong>Genre:</strong> {show.genre || "N/A"}</p>
                <p><strong>Seasons:</strong> {show.number_of_seasons || "N/A"}</p>
                <p><strong>Episodes:</strong> {show.number_of_episodes || "N/A"}</p>
              </div>
            </div>
            <p className="text-gray-200 leading-relaxed">{show.overview || "No description available."}</p>
          </div>
        )}

        {/* Voting Section */}
        <div className="bg-gray-600 rounded-2xl shadow-md p-6 flex flex-col gap-3">
          {!userVote || isChangingVote ? (
            <>
              <h2 className="text-2xl font-semibold text-gray-200">Submit Your Vote</h2>
              {episodes.length > 0 ? (
                <select
                  className="border border-gray-300 rounded-md p-3 w-full text-gray-800 bg-white"
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
                <p className="text-gray-200 italic">Loading episodes...</p>
              )}
              <button
                onClick={submitVote}
                className="bg-blue-500 hover:bg-blue-600 text-gray-200 font-medium py-3 px-4 rounded-md transition"
              >
                Submit Vote
              </button>
              {voteSuccess && (
                <p className="transition-opacity duration-500 text-green-500 font-medium mt-2">
                  Vote submitted!
                </p>
              )}
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-gray-200 mb-2">Your Vote</h2>
              {userEpisode ? (
                <p className="text-lg text-gray-200">
                  S{userEpisode.season_number}E{userEpisode.episode_number} — {userEpisode.name}
                </p>
              ) : (
                <p className="text-gray-200 italic">Could not find episode.</p>
              )}
              <button
                onClick={() => setIsChangingVote(true)}
                className="bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-md transition"
              >
                Change Vote
              </button>
              <button
                onClick={removeVote}
                className="text-red-500 underline mt-1 bg-transparent hover:text-red-600 p-0"
              >
                Remove Vote
              </button>
            </>
          )}

          {/* Average line */}
          <div className="mt-3 border-t pt-4 text-center relative">
            <h3 className="text-xl font-semibold text-gray-200 mb-4">
              When Does <span className="italic text-blue-400">{show?.title}</span> Get Good?
            </h3>
            <div className="relative w-full flex items-center justify-center">
              <div className="w-3/4 h-[4px] bg-black relative">
                <div className="absolute -left-2 top-1/2 w-4 h-4 bg-black rounded-full -translate-y-1/2"></div>
                <div className="absolute -right-2 top-1/2 w-4 h-4 bg-black rounded-full -translate-y-1/2"></div>
                <div
                  className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md ${hasVotes ? "bg-blue-500" : "bg-red-500"}`}
                  style={{ left: `${hasVotes ? positionPercent : 50}%`, transform: "translate(-50%, -50%)" }}
                ></div>
              </div>
              <div
                className={`absolute top-full mt-4 left-1/2 -translate-x-1/2 px-4 py-4 rounded-lg shadow text-center max-w-xs flex flex-col items-center ${hasVotes ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-600"}`}
                style={{ minHeight: averageEpisode?.still_path ? "100px" : "auto" }}
              >
                {hasVotes ? (
                  <>
                    {averageEpisode?.still_path && (
                      <img
                        src={`${TMDB_IMAGE_BASE}${averageEpisode.still_path}`}
                        alt={averageEpisode.name}
                        className="w-32 h-auto mx-auto mb-2 rounded-md shadow-lg"
                      />
                    )}
                    <p className="font-bold">S{averageEpisode?.season_number}E{averageEpisode?.episode_number}</p>
                    <p className="italic">{averageEpisode?.name}</p>
                  </>
                ) : (
                  <>
                    <p className="font-bold">N/A</p>
                    <p className="italic text-gray-800">Vote to help us find out!</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
