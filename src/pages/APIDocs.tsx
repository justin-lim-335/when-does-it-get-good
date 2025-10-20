// src/pages/APIDocs.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const API_BASE = "https://api.whendoesitgetgood.net/api"; // replace with your deployed API

export default function APIDocs() {
  const [showsData, setShowsData] = useState<any>(null);
  const [showDetails, setShowDetails] = useState<any>(null);
  const [averageData, setAverageData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [tmdbInput, setTmdbInput] = useState("37854"); // default TMDB ID
  const [copyMessage, setCopyMessage] = useState("");

  const tryFetchShows = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/shows`);
      const data = await res.json();
      setShowsData(data);
    } catch {
      setShowsData({ error: "Failed to fetch shows" });
    }
    setLoading(false);
  };

  const tryFetchShowDetails = async () => {
    if (!tmdbInput) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/shows/${tmdbInput}`);
      const data = await res.json();
      setShowDetails(data);
    } catch {
      setShowDetails({ error: "Failed to fetch show details" });
    }
    setLoading(false);
  };

  const tryFetchAverage = async () => {
    if (!tmdbInput) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/shows/${tmdbInput}/average`);
      const data = await res.json();
      setAverageData(data);
    } catch {
      setAverageData({ error: "Failed to fetch average vote" });
    }
    setLoading(false);
  };

  // Copy to clipboard helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyMessage("Copied!");
    setTimeout(() => setCopyMessage(""), 2000);
  };

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="w-32 h-auto" />
        </div>

        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3 text-white tracking-tight">
            API Documentation
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed mb-4">
            Public API for <strong>When Does It Get Good?</strong>. These endpoints allow anyone to fetch show data, episode information, and voting statistics without exposing personal user data. All GET endpoints are read-only and safe for public consumption.
          </p>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto leading-relaxed">
            Use the “Try it” buttons below to fetch live data, or copy the endpoint URL for your own applications.
          </p>
        </header>

        {/* ======================== SHOW ROUTES ======================== */}
        <section id="shows" className="space-y-8 mb-12">
          <h2 className="text-2xl font-semibold text-blue-400 border-b border-gray-700 pb-2">
            Shows (Public GET)
          </h2>

          {/* GET /shows */}
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg hover:border-blue-500 transition">
            <h3 className="text-xl font-semibold text-white mb-2">
              GET <span className="text-blue-400">{API_BASE}/shows</span>
            </h3>
            <p className="text-gray-400 mb-3">Fetch all shows with metadata.</p>
            <div className="flex gap-2 mb-2">
              <button
                className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700"
                onClick={tryFetchShows}
              >
                Try it
              </button>
              <button
                className="bg-gray-600 px-4 py-2 rounded text-white hover:bg-gray-700"
                onClick={() => copyToClipboard(`${API_BASE}/shows`)}
              >
                Copy URL
              </button>
            </div>
            {showsData && (
              <pre className="bg-gray-900 p-4 mt-3 rounded text-sm text-gray-200 overflow-x-auto">
                {JSON.stringify(showsData, null, 2)}
              </pre>
            )}
          </div>

          {/* GET /shows/:tmdb_id */}
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg hover:border-blue-500 transition">
            <h3 className="text-xl font-semibold text-white mb-2">
              GET <span className="text-blue-400">{API_BASE}/shows/:tmdb_id</span>
            </h3>
            <p className="text-gray-400 mb-3">Fetch details for a specific show.</p>
                        {/* Instructions */}
            <p className="text-gray-300 mb-2 text-sm">
              Enter the TMDB ID of a show below and click “Try it” to fetch the show's details.
            </p>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="TMDB ID"
                value={tmdbInput}
                onChange={(e) => setTmdbInput(e.target.value)}
                className="p-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700"
                onClick={tryFetchShowDetails}
              >
                Try it
              </button>
              <button
                className="bg-gray-600 px-4 py-2 rounded text-white hover:bg-gray-700"
                onClick={() => copyToClipboard(`${API_BASE}/shows/${tmdbInput}`)}
              >
                Copy URL
              </button>
            </div>
            {showDetails && (
              <pre className="bg-gray-900 p-4 mt-3 rounded text-sm text-gray-200 overflow-x-auto">
                {JSON.stringify(showDetails, null, 2)}
              </pre>
            )}
          </div>

          {/* GET /shows/:tmdb_id/average */}
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg hover:border-blue-500 transition">
            <h3 className="text-xl font-semibold text-white mb-2">
              GET <span className="text-blue-400">{API_BASE}/shows/:tmdb_id/average</span>
            </h3>
            <p className="text-gray-400 mb-3">
              Retrieve the average “gets good” episode for a specific show.
            </p>

            {/* Instructions */}
            <p className="text-gray-300 mb-2 text-sm">
              Enter the TMDB ID of a show below and click “Try it” to fetch the average episode.
            </p>

            {/* Input + Buttons */}
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Enter TMDB ID (e.g., 37854)"
                value={tmdbInput}
                onChange={(e) => setTmdbInput(e.target.value)}
                className="p-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700"
                onClick={tryFetchAverage}
              >
                Try it
              </button>
              <button
                className="bg-gray-600 px-4 py-2 rounded text-white hover:bg-gray-700"
                onClick={() => copyToClipboard(`${API_BASE}/shows/${tmdbInput}/average`)}
              >
                Copy URL
              </button>
            </div>

            {/* Response */}
            {averageData && (
              <pre className="bg-gray-900 p-4 mt-3 rounded text-sm text-gray-200 overflow-x-auto">
                {JSON.stringify(averageData, null, 2)}
              </pre>
            )}
          </div>

        </section>

        {/* Back link */}
        <div className="text-center mt-12">
          <Link
            to="/"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            ← Back to Home
          </Link>
          {copyMessage && <p className="text-green-400 mt-2">{copyMessage}</p>}
        </div>
      </div>
    </div>
  );
}
