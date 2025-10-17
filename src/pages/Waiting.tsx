// src/pages/Waiting.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Waiting() {
  const navigate = useNavigate();

  useEffect(() => {
    // if you want to auto-redirect back after some time, add logic here
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-800 px-4 text-white">
      <img src={logo} alt="Logo" className="w-32 mb-6" />
      <div className="bg-gray-900 p-8 rounded-2xl shadow text-center max-w-lg">
        <h2 className="text-2xl font-bold mb-2">Check your email</h2>
        <p className="text-gray-300 mb-4">
          We sent a confirmation link to the email you provided. Click that link to confirm your account and you'll
          be redirected back to the site.
        </p>
        <p className="text-sm text-gray-400">If you don't receive the email, check spam or try signing up again.</p>
      </div>
      <button
        className="mt-6 text-blue-400 underline"
        onClick={() => navigate("/")}
      >
        Back to Home
      </button>
    </div>
  );
}
