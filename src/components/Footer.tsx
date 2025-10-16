// src/components/Footer.tsx
import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-6 mt-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-6">
        {/* Navigation Columns */}
        <div className="flex flex-col space-y-2">
          <h4 className="text-white font-semibold mb-2">Navigation</h4>
          <Link to="/" className="hover:text-white transition">Home</Link>
          <Link to="/about" className="hover:text-white transition">About</Link>
        </div>

        <div className="flex flex-col space-y-2">
          <h4 className="text-white font-semibold mb-2">Legal</h4>
          <Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-white transition">Terms of Use</Link>
        </div>
      </div>

      {/* Attribution */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>
          Show data provided by <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">TMDB</a>. 
          Auth & database services by <a href="https://supabase.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Supabase</a>. 
          Hosting & analytics via <a href="https://vercel.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Vercel</a>. 
          No ads are displayed on this site.
        </p>
      </div>
    </footer>
  );
}
