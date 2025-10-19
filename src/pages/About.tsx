// src/pages/About.tsx
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
          <strong>When Does It Get Good?</strong> is a simple, personal project designed to help users vote on when their favorite shows start getting interesting. 
          As a One Piece fan, I have often seen the question of when does such a long series "get good".
          The only online resources I found were forum threads and Reddit posts, which were often lengthy and subjective. 
          I wanted to create a more structured and community-driven way to gather opinions on this topic, and provide a better frame of reference for these discussions to start from.
        </p>

        <p className="text-lg leading-relaxed">
          By collecting and averaging user votes on specific episodes, the website aims to provide insights into this topic and provide what people consider to be when a TV show "gets good".
          This website does not seek to be an objective resource nor does it rate shows overall; rather, it focuses on the subjective experience of viewers and has over time become a space to help determine when a show truly begins to shine.
        </p>


        <p className="text-lg leading-relaxed">
          When Does It Get Good? does not seek to monetize or profit from this project in any way. It is built purely out of passion for television and a desire to create a fun, community-driven resource for fellow TV enthusiasts.
          Questions or feedback are always welcome and can be sent to whendoesitgg@gmail.com.
        </p>

        <p className="text-lg leading-relaxed italic">
          All show data comes from <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">TMDB</a>. 
          User authentication and database services are powered by <a href="https://supabase.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Supabase</a>. 
          The site is hosted on <a href="https://render.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Render</a> and <a href="https://vercel.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Vercel</a> for fast and secure access.
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
