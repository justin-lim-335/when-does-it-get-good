// src/pages/About.tsx
import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-800 text-gray-200 px-4 py-12 flex flex-col items-center">
      {/* Logo */}
      <img src={logo} alt="Site Logo" className="w-32 h-auto mb-6" />

      <div className="max-w-3xl text-center space-y-6">
        <h1 className="text-4xl font-bold text-white">About When Does It Get Good?</h1>

        <p className="text-lg leading-relaxed">
          When Does It Get Good? is a simple, personal project designed to help users vote on when their favorite shows start getting interesting. 
          The platform only asks for an email for login and verification, and there are no age restrictions or advertisements.
        </p>

        <p className="text-lg leading-relaxed">
          All show data comes from <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">TMDB</a>. 
          User authentication and database services are powered by <a href="https://supabase.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Supabase</a>. 
          The site is hosted on <a href="https://vercel.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Vercel</a> for fast and secure access.
        </p>

        <p className="text-lg leading-relaxed italic">
          This project is maintained purely for fun and educational purposes. No personal information is shared publicly.
        </p>

        <Link 
          to="/" 
          className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
