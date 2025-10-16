// src/pages/PrivacyPolicy.tsx
import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-800 text-gray-200 px-4 py-12 flex flex-col items-center">
      {/* Logo */}
      <img src={logo} alt="Site Logo" className="w-32 h-auto mb-6" />

      <div className="max-w-3xl space-y-6">
        <h1 className="text-4xl font-bold text-white text-center">Privacy Policy</h1>

        <p className="text-lg leading-relaxed">
          Your privacy is important to us. When Does It Get Good? only collects your email for login, verification, and occasional notifications about major site updates.
          No personal information is shared publicly or sold to third parties.
        </p>

        <p className="text-lg leading-relaxed">
          We may use analytics services such as Vercel Analytics to understand general site traffic and improve user experience. No advertising or targeting is used.
        </p>

        <p className="text-lg leading-relaxed">
          Show data is sourced from TMDB, but user activity (votes) is never shared publicly. We cannot guarantee protection against automated scraping of publicly available show data, but this does not affect your personal information.
        </p>

        <p className="text-lg leading-relaxed italic">
          By using this site, you consent to the collection and usage of your information as described in this policy.
        </p>

        <div className="flex justify-center space-x-6 mt-6">
          <Link to="/" className="text-blue-400 hover:underline">Home</Link>
          <Link to="/about" className="text-blue-400 hover:underline">About</Link>
        </div>
      </div>
    </div>
  );
}
