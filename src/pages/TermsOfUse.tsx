// src/pages/TermsOfUse.tsx
import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-gray-800 text-gray-200 px-4 py-12 flex flex-col items-center">
      {/* Logo */}
      <img src={logo} alt="Site Logo" className="w-32 h-auto mb-6" />

      <div className="max-w-3xl space-y-6">
        <h1 className="text-4xl font-bold text-white text-center">Terms of Use</h1>

        <p className="text-lg leading-relaxed">
          By using When Does It Get Good?, you agree to these terms. This site is intended for general entertainment and personal use. 
          You are solely responsible for your interactions with the platform.
        </p>

        <p className="text-lg leading-relaxed">
          Users may vote on when shows “get good.” Only your email is required for account creation and verification. No personal information is shared publicly.
        </p>

        <p className="text-lg leading-relaxed">
          Show information comes from TMDB. While we strive to provide accurate data, we do not guarantee completeness or accuracy. The site owner is not liable for any errors or omissions.
        </p>

        <p className="text-lg leading-relaxed italic">
          Continued use of this site constitutes acceptance of these terms.
        </p>

        <div className="flex justify-center space-x-6 mt-6">
          <Link to="/" className="text-blue-400 hover:underline">Home</Link>
          <Link to="/about" className="text-blue-400 hover:underline">About</Link>
        </div>
      </div>
    </div>
  );
}
