// src/pages/HomePage.tsx
import { useEffect, useState, useCallback } from "react";
import Carousel from "../components/Carousel";

interface Show {
  tmdb_id: number;
  title: string;
  poster_path?: string;
  first_air_date?: string;
}

interface HomepageData {
  recentlyReleased: Show[];
  recentlyVoted: Show[];
  mostVoted: Show[];
  popularAnime: Show[];
  popularDramas: Show[];
}

export default function HomePage() {
  const [data, setData] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);
  const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

  const normalizeShow = (s: any): Show => ({
    tmdb_id: s.tmdb_id || s.id,
    title: s.title || s.name || "Untitled",
    poster_path: s.poster_path || "/placeholder.png",
    first_air_date: s.first_air_date || "Unknown",
  });

  const fetchHomepageData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/shows/popular`, {
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error(`API error ${res.status}`);
      const json = await res.json();

      const seenRecentlyVoted = new Set<number>();
      const dedupedRecentlyVoted: any[] = [];
      (json.recentlyVoted || []).forEach((s: any) => {
        if (!seenRecentlyVoted.has(s.tmdb_id)) {
          dedupedRecentlyVoted.push(s);
          seenRecentlyVoted.add(s.tmdb_id);
        }
      });

      setData({
        recentlyReleased: (json.recentlyReleased || []).slice(0, 24).map(normalizeShow),
        recentlyVoted: dedupedRecentlyVoted.slice(0, 24).map(normalizeShow),
        mostVoted: (json.mostVoted || []).slice(0, 24).map(normalizeShow),
        popularAnime: (json.popularAnime || []).slice(0, 24).map(normalizeShow),
        popularDramas: (json.popularDramas || []).slice(0, 24).map(normalizeShow),
      });
    } catch (err) {
      console.error("❌ Failed to fetch homepage data:", err);
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchHomepageData();
  }, [fetchHomepageData]);

  if (loading)
    return <p className="text-center bg-gray-800 mt-8 text-lg font-medium">Loading...</p>;

  if (!data)
    return <p className="text-center bg-gray-800 mt-8 text-lg font-medium">No shows found.</p>;

  return (
    <div className="bg-gray-800 min-h-screen w-full">
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <h1 className="text-2xl font-heading text-center mb-2 tracking-wide text-gray-300">
          Here to answer the question:
        </h1>
        <h2 className="text-5xl font-heading font-extrabold text-center mb-12 
          bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">
          WHEN DOES IT GET GOOD?
        </h2>

        <Carousel title="Recently Released" shows={data.recentlyReleased} />
        <Carousel title="Recently Voted" shows={data.recentlyVoted} />
        <Carousel title="Most Voted" shows={data.mostVoted} />
        <Carousel title="Popular Anime" shows={data.popularAnime} />
        <Carousel title="Popular Dramas" shows={data.popularDramas} />
      </div>
    </div>
  );
}
