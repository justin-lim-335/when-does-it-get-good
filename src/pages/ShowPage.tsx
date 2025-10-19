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
  const [selectedEpisode, setSelectedEpisode] = useState<number | "">("");
  const [average, setAverage] = useState<number | null>(null);
  const [userVote, setUserVote] = useState<number | null>(null);
  const [isChangingVote, setIsChangingVote] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voteSuccess, setVoteSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Helper: find episode by absolute number
  const findEpisodeByAbsolute = (absolute: number) =>
    episodes.find((ep) => ep.absolute_number === absolute);

  // Reset state when navigating to a new show
  useEffect(() => {
    setShow(null);
    setEpisodes([]);
    setSelectedEpisode("");
    setAverage(null);
    setUserVote(null);
    setIsChangingVote(false);
    setVoteSuccess(null);
    setErrorMessage(null);
    setLoading(true);
  }, [tmdb_id]);

  // Fetch show + episodes
  useEffect(() => {
    if (!tmdb_id) return;

    const fetchShowAndEpisodes = async () => {
      setLoading(true);
      setErrorMessage(null);

      try {
        // 1️⃣ Fetch show info
        const res = await fetch(
          `https://api.themoviedb.org/3/tv/${tmdb_id}?api_key=${TMDB_API_KEY}`
        );
        if (!res.ok) throw new Error(`Show fetch failed: ${res.status}`);
        const data = await res.json();

        const genreNames = data.genres?.map((g: any) => g.name).join(", ") || "N/A";

        setShow({
          ...data,
          title: data.name || data.title,
          genre: genreNames,
        });

        // 2️⃣ Fetch all episodes
        const allEpisodes: Episode[] = [];
        let counter = 1;
        for (let s = 1; s <= (data.number_of_seasons || 1); s++) {
          try {
            const seasonRes = await fetch(
              `https://api.themoviedb.org/3/tv/${tmdb_id}/season/${s}?api_key=${TMDB_API_KEY}`
            );
            if (!seasonRes.ok) throw new Error(`Season ${s} fetch failed`);
            const seasonData = await seasonRes.json();
            (seasonData.episodes || []).forEach((ep: any) => {
              allEpisodes.push({
                season_number: s,
                episode_number: ep.episode_number,
                absolute_number: counter++,
                name: ep.name,
                still_path: ep.still_path,
              });
            });
          } catch (err) {
            console.error(`Error loading season ${s}:`, err);
          }
        }

        setEpisodes(allEpisodes);
        console.log("Fetched show and episodes for tmdb_id:", tmdb_id);
      } catch (err) {
        console.error("Failed to fetch show info:", err);
        setErrorMessage("Could not load show details.");
      } finally {
        setLoading(false);
      }
    };

    fetchShowAndEpisodes();
  }, [tmdb_id]);


  // Fetch average numeric absolute_number
  const fetchAverage = async () => {
    if (!tmdb_id) return;

    const numericTmdbId = Number(tmdb_id);
    console.log("Fetching average vote for show:", numericTmdbId);

    try {
      const res = await fetch(`${API_BASE}/shows/${numericTmdbId}/average`);
      if (!res.ok) {
        console.error("Average vote fetch failed:", res.status, res.statusText);
        setAverage(null);
        return;
      }

      const data = await res.json();
      console.log("Average vote response:", data);

      // data.average is already numeric (or null)
      if (data?.average != null && !isNaN(data.average)) {
        setAverage(Number(data.average));
      } else {
        setAverage(null);
      }
    } catch (err) {
      console.error("Failed to fetch average vote:", err);
      setAverage(null);
    }
  };


  // Fetch user's vote
  const fetchUserVote = async () => {
    if (!user || !tmdb_id) return;

    const numericTmdbId = Number(tmdb_id);
    console.log(`Fetching vote for user ${user.id} on show ${numericTmdbId}`);

    try {
      const res = await fetch(`${API_BASE}/votes/${user.id}/${numericTmdbId}`);
      if (!res.ok) {
        console.warn("User vote fetch failed:", res.status, res.statusText);
        setUserVote(null);
        setSelectedEpisode("");
        return;
      }

      const data = await res.json();
      console.log("User vote response:", data);

      if (data?.absolute_number != null) {
        const voteNum = Number(data.absolute_number);
        if (!isNaN(voteNum)) {
          setUserVote(voteNum);
          setSelectedEpisode(voteNum);
          setIsChangingVote(false);
        } else {
          console.warn("User vote absolute_number is not numeric:", data.absolute_number);
          setUserVote(null);
          setSelectedEpisode("");
        }
      } else {
        console.log("User has not voted yet.");
        setUserVote(null);
        setSelectedEpisode("");
      }
    } catch (err) {
      console.error("Failed to fetch user vote:", err);
      setUserVote(null);
      setSelectedEpisode("");
    }
  };

  // Setup realtime subscription for votes
  useEffect(() => {
    if (!tmdb_id || !user) return;

    const numericTmdbId = Number(tmdb_id);
    console.log("Setting up vote fetch and subscription for show:", numericTmdbId, "user:", user.id);

    // Fetch initial data
    const fetchData = async () => {
      console.log("Fetching average vote...");
      await fetchAverage();
      console.log("Fetching user vote...");
      await fetchUserVote();
    };

    fetchData();

    // Setup Supabase Realtime subscription for votes on this show
    const channel = supabase
      .channel(`votes-${numericTmdbId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // listen to INSERT, UPDATE, DELETE
          schema: "public",
          table: "votes",
          filter: `show_tmdb_id=eq.${numericTmdbId}`,
        },
        (payload) => {
          console.log("Realtime vote update received:", payload);

          // Only update average; userVote will be fetched on next render if needed
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE" || payload.eventType === "DELETE") {
            fetchAverage();
          }
        }
      )
      .subscribe((status) => console.log("Channel subscription status:", status));

    // Cleanup subscription on unmount or tmdb_id/user change
    return () => {
      console.log("Removing subscription for show:", numericTmdbId);
      supabase.removeChannel(channel);
    };
  }, [tmdb_id, user]);



  // Handle vote submission
  const handleVoteSubmit = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (!user) {
      return setErrorMessage("You must be logged in to vote.");
    }
    if (selectedEpisode === "" || selectedEpisode === null) {
      return setErrorMessage("Please select an episode to vote.");
    }

    const ep = findEpisodeByAbsolute(Number(selectedEpisode));
    if (!ep) {
      return setErrorMessage("Invalid episode selected.");
    }

    const payload = {
      season: ep.season_number,
      episode: ep.episode_number,
      episode_title: ep.name,
      absolute_number: ep.absolute_number,
    };

    try {
      const endpoint = userVote
        ? `${API_BASE}/update-vote/${user.id}/${tmdb_id}`
        : `${API_BASE}/submit-vote`;

      const method = userVote ? "PATCH" : "POST";
      const body = userVote
        ? JSON.stringify(payload)
        : JSON.stringify({ user_id: user.id, show_tmdb_id: Number(tmdb_id), ...payload });

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Vote submission failed:", data);
        return setErrorMessage(data?.error || "Failed to submit vote.");
      }

      //Update UI
      setUserVote(ep.absolute_number);
      setSelectedEpisode(ep.absolute_number);
      setIsChangingVote(false);
      setVoteSuccess(userVote ? "Vote updated!" : "Vote submitted!");
      fetchAverage();
      setTimeout(() => setVoteSuccess(null), 2500);
    } catch (err) {
      console.error("Error submitting vote:", err);
      setErrorMessage("Failed to submit vote.");
    }
  };

  // Remove vote
  const removeVote = async () => {
    if (!user || !tmdb_id) return;
    if (!confirm("Are you sure you want to remove your vote?")) return;

    try {
      const res = await fetch(`${API_BASE}/delete-vote/${user.id}/${tmdb_id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("Remove vote failed:", data);
        return setErrorMessage(data?.error || "Failed to remove vote.");
      }

      setUserVote(null);
      setSelectedEpisode("");
      setIsChangingVote(false);
      setVoteSuccess("Vote removed.");
      fetchAverage();
      setTimeout(() => setVoteSuccess(null), 2000);
    } catch (err) {
      console.error("Error removing vote:", err);
      setErrorMessage("Failed to remove vote.");
    }
  };

  const averageEpisode = 
    average != null && episodes.length > 0 
    ? findEpisodeByAbsolute(Math.round(average)) 
    : null;
  const hasVotes = !!averageEpisode;
  const userEpisode = userVote ? findEpisodeByAbsolute(userVote) : null;
  const averagePercent =
  hasVotes && averageEpisode && episodes.length > 1
    ? ((averageEpisode.absolute_number - 1) / (episodes.length - 1)) * 100
    : 50;
  
  console.log("tmdb_id:", tmdb_id);
  console.log("Rendering show:", show, "loading:", loading);

  return (
    <div className="min-h-screen bg-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-10">
        {!loading && show && (
          <div>
            <h1 className="text-4xl font-bold mb-6 text-gray-100">{show.title}</h1>
            <div className="flex flex-col sm:flex-row gap-8 mb-6">
              {show.poster_path && (
                <img
                  src={`${TMDB_IMAGE_BASE}${show.poster_path}`}
                  alt={show.title}
                  className="rounded-xl shadow-lg w-64"
                />
              )}
              <div className="flex flex-col justify-center text-gray-200 text-lg space-y-2">
                <p><strong>Year:</strong> {show.first_air_date?.slice(0, 4) ?? "N/A"}</p>
                <p><strong>Genre:</strong> {show.genre ?? "N/A"}</p>
                <p><strong>Seasons:</strong> {show.number_of_seasons ?? "N/A"}</p>
                <p><strong>Episodes:</strong> {show.number_of_episodes ?? "N/A"}</p>
              </div>
            </div>
            <p className="text-gray-200 leading-relaxed mb-4">{show.overview || "No description available."}</p>
          </div>
        )}

        {/* Voting section */}
        <div className="bg-gray-600 rounded-2xl shadow-md p-6 flex flex-col gap-3">
          {!userVote || isChangingVote ? (
            <>
              <h2 className="text-2xl font-semibold text-gray-200">Submit Your Vote</h2>
              <form onSubmit={handleVoteSubmit} className="flex flex-col gap-3">
                {episodes.length > 0 ? (
                  <select
                    className="border border-gray-300 rounded-md p-3 w-full text-gray-800 bg-white"
                    value={selectedEpisode}
                    onChange={(e) => setSelectedEpisode(e.target.value === "" ? "" : Number(e.target.value))}
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
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-gray-200 font-medium py-3 px-4 rounded-md transition"
                >
                  Submit Vote
                </button>
                {voteSuccess && <p className="text-green-400">{voteSuccess}</p>}
                {errorMessage && <p className="text-red-400">{errorMessage}</p>}
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-gray-200">Your Vote</h2>
              {userEpisode ? (
                <p className="text-lg text-gray-200">
                  S{userEpisode.season_number}E{userEpisode.episode_number} — {userEpisode.name}
                </p>
              ) : (
                <p className="italic text-gray-200">Could not find your vote.</p>
              )}
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setIsChangingVote(true)}
                  className="bg-black hover:bg-gray-800 text-white py-2 px-4 rounded-md"
                >
                  Change Vote
                </button>
                <button
                  onClick={removeVote}
                  className="text-red-500 underline hover:text-red-600"
                >
                  Remove Vote
                </button>
              </div>
              {voteSuccess && <p className="text-green-400 mt-2">{voteSuccess}</p>}
              {errorMessage && <p className="text-red-400 mt-2">{errorMessage}</p>}
            </>
          )}

          {/* Average indicator */}
          <div className="mt-6 border-t pt-4 text-center relative">
            <h3 className="text-xl font-semibold text-gray-200 mb-3">
              When Does <span className="italic text-blue-400">{show?.title}</span> Get Good?
            </h3>
            <div className="relative w-full flex items-center justify-center">
              <div className="w-3/4 h-[4px] bg-black relative">
                <div className="absolute -left-2 top-1/2 w-4 h-4 bg-black rounded-full -translate-y-1/2" />
                <div className="absolute -right-2 top-1/2 w-4 h-4 bg-black rounded-full -translate-y-1/2" />
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md ${
                      hasVotes ? "bg-blue-500" : "bg-red-500"
                    }`}
                    style={{
                      left: `${
                        hasVotes && averageEpisode && episodes.length > 1
                          ? ((averageEpisode.absolute_number - 1) / (episodes.length - 1)) * 100
                          : 50
                      }%`,
                      transform: "translate(-50%, -50%)",
                      transition: "left 0.5s ease-in-out", // ✨ Add this line
                    }}
                  />
              </div>

              <div
                className={`absolute top-full mt-3 px-4 py-3 rounded-lg shadow text-center max-w-xs flex flex-col items-center ${
                  hasVotes ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-600"
                }`}
                style={{
                  left: `${averagePercent}%`,
                  transform: "translateX(-50%)",
                  transition: "left 0.5s ease-in-out", // Animate along with the dot
                }}
              >
                {hasVotes ? (
                  <>
                    {averageEpisode?.still_path && (
                      <img
                        src={`${TMDB_IMAGE_BASE}${averageEpisode.still_path}`}
                        alt={averageEpisode.name}
                        className="w-32 h-auto mb-2 rounded-md"
                      />
                    )}
                    <p className="font-bold">
                      S{averageEpisode?.season_number}E{averageEpisode?.episode_number}
                    </p>
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

