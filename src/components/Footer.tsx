// src/components/Footer.tsx
import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 px-6 py-8 mt-auto w-full">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8">

        {/* Navigation Column */}
        <div className="flex flex-col space-y-3">
          <h3 className="text-white font-semibold border-b border-gray-700 pb-1 mb-2">Navigation</h3>
          <Link to="/" className="hover:underline text-left">Home</Link>
          <Link to="/about" className="hover:underline text-left">About</Link>
          <Link to="/api-docs" className="hover:text-blue-400">API Docs</Link>

        </div>

        {/* Legal / Credits Column */}
        <div className="flex flex-col space-y-3">
          <h3 className="text-white font-semibold border-b border-gray-700 pb-1 mb-2">Legal & Credits</h3>
          <Link to="/privacy" className="hover:underline text-left">Privacy Policy</Link>
          <Link to="/terms" className="hover:underline text-left">Terms of Use</Link>
          <p className="text-left text-sm mt-2">
            Show data provided by <a href="https://www.themoviedb.org/" className="hover:underline">TMDB</a>.
            Database services provided by <a href="https://supabase.com/" className="hover:underline">Vercel</a>.  
            Backend hosted on <a href="https://render.com/" className="hover:underline">Render</a>.  
            Deployed via <a href="https://vercel.com/" className="hover:underline">Vercel</a>.
          </p>
        </div>
      </div>
    </footer>
  );
}
