// src/pages/APIDocs.tsx
import { Link } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/logo.png";

export default function APIDocs() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex bg-gray-800 text-gray-100 min-h-screen">
      {/* ===================== SIDEBAR ===================== */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 border-r border-gray-700 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 z-40`}
      >
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          
          <button
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        <nav className="mt-6 space-y-4 px-4">
          <a
            href="#shows"
            className="block py-2 px-3 rounded-md hover:bg-gray-800 hover:text-blue-400 transition"
            onClick={() => setSidebarOpen(false)}
          >
            Shows
          </a>
          <a
            href="#votes"
            className="block py-2 px-3 rounded-md hover:bg-gray-800 hover:text-blue-400 transition"
            onClick={() => setSidebarOpen(false)}
          >
            Votes
          </a>
          <Link
            to="/"
            className="block py-2 px-3 rounded-md hover:bg-gray-800 hover:text-blue-400 transition"
            onClick={() => setSidebarOpen(false)}
          >
            ← Back to Home
          </Link>
        </nav>
      </aside>

      {/* Sidebar toggle button (mobile only) */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-900 border border-gray-700 text-gray-300 px-3 py-2 rounded-md hover:text-white"
        onClick={() => setSidebarOpen(true)}
      >
        ☰ Menu
      </button>

      {/* ===================== MAIN CONTENT ===================== */}
      <main className="flex-1 md:ml-64 px-6 py-2 prose prose-invert max-w-none">
        <div className="max-w-5xl mx-auto space-y-2">
          {/* Logo */}
          <div className="flex justify-center mb-2">
            <img src={logo} alt="When Does It Get Good? Logo" className="w-32 h-auto mb-2" />
          </div>
          {/* Header */}
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-3 text-white tracking-tight">
              API Documentation
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Reference guide for public API routes available in the{" "}
              <strong>When Does It Get Good?</strong> website. These endpoints allow
              fetching of show data, episodes, and voting information. The API is not
              yet publicly available but will be in future releases.
            </p>
          </header>

          {/* ======================== SHOW ROUTES ======================== */}
          <section id="shows">
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">
              Shows
            </h2>

            {/* GET /api/shows */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-md mb-6 hover:border-blue-500 transition">
              <h3 className="text-xl font-semibold text-white mb-2">
                GET <span className="text-blue-400">/api/shows</span>
              </h3>
              <p className="text-gray-400 mb-3">
                Fetches all available shows with their metadata.
              </p>

              <pre className="bg-gray-800 rounded-lg p-4 text-sm overflow-x-auto text-gray-200">
{`Response:
[
  {
    "id": 1,
    "title": "One Piece",
    "genre": "Action & Adventure",
    "tmdb_id": 37854
  }
]`}
              </pre>
            </div>

            {/* GET /api/shows/:tmdb_id */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-md mb-6 hover:border-blue-500 transition">
              <h3 className="text-xl font-semibold text-white mb-2">
                GET <span className="text-blue-400">/api/shows/:tmdb_id</span>
              </h3>
              <p className="text-gray-400 mb-3">
                Returns details for a specific show including description, seasons, and episodes.
              </p>

              <pre className="bg-gray-800 rounded-lg p-4 text-sm overflow-x-auto text-gray-200">
{`Example:
GET /api/shows/37854

Response:
{
  "title": "One Piece",
  "genre": "Action & Adventure",
  "seasons": 22,
  "episodes": 1147
}`}
              </pre>
            </div>

            {/* GET /api/shows/:tmdb_id/average */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-md mb-6 hover:border-blue-500 transition">
              <h3 className="text-xl font-semibold text-white mb-2">
                GET <span className="text-blue-400">/api/shows/:tmdb_id/average</span>
              </h3>
              <p className="text-gray-400 mb-3">
                Retrieves the “gets good” average episode for a show, based on user votes.
              </p>

              <pre className="bg-gray-800 rounded-lg p-4 text-sm overflow-x-auto text-gray-200">
{`Example:
GET /api/shows/37854/average

Response:
{
  "average": 1023
}`}
              </pre>
            </div>
          </section>

          {/* ======================== VOTE ROUTES ======================== */}
          <section id="votes">
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">
              Votes
            </h2>

            {/* POST /api/votes */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-md mb-6 hover:border-blue-500 transition">
              <h3 className="text-xl font-semibold text-white mb-2">
                POST <span className="text-blue-400">/api/votes</span>
              </h3>
              <p className="text-gray-400 mb-3">
                Records a user’s vote for a specific episode. Authentication required.
              </p>

              <pre className="bg-gray-800 rounded-lg p-4 text-sm overflow-x-auto text-gray-200">
{`Request Body:
{
  "tmdb_id": 37854,
  "season_number": 21,
  "episode_number": 1015,
  "rating": 5
}

Response:
{
  "success": true,
  "message": "Vote recorded successfully"
}`}
              </pre>
            </div>

            {/* GET /api/votes/history */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-md mb-6 hover:border-blue-500 transition">
              <h3 className="text-xl font-semibold text-white mb-2">
                GET <span className="text-blue-400">/api/votes/history</span>
              </h3>
              <p className="text-gray-400 mb-3">
                Retrieves a summary of all episodes voted on (no personal identifiers returned).
              </p>

              <pre className="bg-gray-800 rounded-lg p-4 text-sm overflow-x-auto text-gray-200">
{`Response:
[
  {
    "show_title": "One Piece",
    "episode": "S21E1015 - Straw Hat Luffy! The Man Who Will Become the King of the Pirates!",
    "rating": 5,
    "voted_at": "2025-10-18T22:41:00Z"
  }
]`}
              </pre>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
