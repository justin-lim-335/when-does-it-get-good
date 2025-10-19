// src/pages/APIDocs.tsx
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function APIDocs() {
  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="When Does It Get Good? Logo" className="w-32 h-auto" />
        </div>

        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3 text-white tracking-tight">
            API Documentation
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Reference guide for public API routes available in the{" "}
            <strong>When Does It Get Good?</strong> website. These endpoints allow
            fetching of show data, episodes, and voting information. The API is not
            yet publicly available but will be in future releases.
          </p>
        </header>

        {/* ======================== SHOW ROUTES ======================== */}
        <section id="shows" className="space-y-8 mb-12">
          <h2 className="text-2xl font-semibold text-blue-400 border-b border-gray-700 pb-2">
            Shows
          </h2>

          {/* GET /api/shows */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-lg hover:border-blue-500 transition">
            <h3 className="text-xl font-semibold text-white mb-2">
              GET <span className="text-blue-400">/api/shows</span>
            </h3>
            <p className="text-gray-400 mb-3">
              Fetches all available shows with their metadata.
            </p>

            <div className="overflow-x-auto">
              <pre className="bg-gray-900 rounded-lg p-4 text-sm text-gray-200 min-w-full whitespace-pre">
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
          </div>

          {/* GET /api/shows/:tmdb_id */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-lg hover:border-blue-500 transition">
            <h3 className="text-xl font-semibold text-white mb-2">
              GET <span className="text-blue-400">/api/shows/:tmdb_id</span>
            </h3>
            <p className="text-gray-400 mb-3">
              Returns details for a specific show including description, seasons, and episodes.
            </p>

            <div className="overflow-x-auto">
              <pre className="bg-gray-900 rounded-lg p-4 text-sm text-gray-200 min-w-full whitespace-pre">
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
          </div>

          {/* GET /api/shows/:tmdb_id/average */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-lg hover:border-blue-500 transition">
            <h3 className="text-xl font-semibold text-white mb-2">
              GET <span className="text-blue-400">/api/shows/:tmdb_id/average</span>
            </h3>
            <p className="text-gray-400 mb-3">
              Retrieves the “gets good” average episode for a show, based on user votes.
            </p>

            <div className="overflow-x-auto">
              <pre className="bg-gray-900 rounded-lg p-4 text-sm text-gray-200 min-w-full whitespace-pre">
{`Example:
GET /api/shows/37854/average

Response:
{
  "average": 1023
}`}
              </pre>
            </div>
          </div>
        </section>

        {/* ======================== VOTE ROUTES ======================== */}
        <section id="votes" className="space-y-8">
          <h2 className="text-2xl font-semibold text-blue-400 border-b border-gray-700 pb-2">
            Votes
          </h2>

          {/* POST /api/votes */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-lg hover:border-blue-500 transition">
            <h3 className="text-xl font-semibold text-white mb-2">
              POST <span className="text-blue-400">/api/votes</span>
            </h3>
            <p className="text-gray-400 mb-3">
              Records a user’s vote for a specific episode. Authentication required.
            </p>

            <div className="overflow-x-auto">
              <pre className="bg-gray-900 rounded-lg p-4 text-sm text-gray-200 min-w-full whitespace-pre">
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
          </div>

          {/* GET /api/votes/history */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-lg hover:border-blue-500 transition">
            <h3 className="text-xl font-semibold text-white mb-2">
              GET <span className="text-blue-400">/api/votes/history</span>
            </h3>
            <p className="text-gray-400 mb-3">
              Retrieves a summary of all episodes voted on (no personal identifiers returned).
            </p>

            <div className="overflow-x-auto">
              <pre className="bg-gray-900 rounded-lg p-4 text-sm text-gray-200 min-w-full whitespace-pre">
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
          </div>
        </section>

        {/* Back link */}
        <div className="text-center mt-12">
          <Link
            to="/"
            className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
