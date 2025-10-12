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

  // Helper to normalize any show object
  const normalizeShow = (s: any): Show => ({
    tmdb_id: s.tmdb_id || s.id,
    title: s.title || s.name || "Untitled",
    poster_path: s.poster_path || s.shows?.poster_path || "/placeholder.png",
    first_air_date: s.first_air_date || s.shows?.first_air_date || "Unknown",
  });

  // Fetch homepage data
  const fetchHomepageData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/shows/popular");
      const json = await res.json();

      // Normalize and deduplicate recently voted shows
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
      console.error("Failed to fetch homepage data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHomepageData();
  }, [fetchHomepageData]);

  if (loading)
    return <p className="text-center mt-8 text-lg font-medium">Loading...</p>;

  if (!data)
    return <p className="text-center mt-8 text-lg font-medium">No shows found.</p>;

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4 text-center">Here to answer the question:</h1>
      <h2 className="text-3xl font-bold mb-12 text-center">WHEN DOES IT GET GOOD?</h2>

      <Carousel title="Recently Released" shows={data.recentlyReleased} />
      <Carousel title="Recently Voted" shows={data.recentlyVoted} />
      <Carousel title="Most Voted" shows={data.mostVoted} />
      <Carousel title="Popular Anime" shows={data.popularAnime} />
      <Carousel title="Popular Dramas" shows={data.popularDramas} />
    </div>
  );
}
