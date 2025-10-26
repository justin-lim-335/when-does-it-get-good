// src/pages/Waiting.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Waiting() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-24 bg-gray-800 px-4">
      <img src={logo} alt="Logo" className="w-32 mb-6" />
      <div className="bg-gray-900 p-8 rounded-2xl shadow text-center max-w-lg">
        <h2 className="text-2xl font-bold mb-2">Check your email</h2>
        <p className="text-gray-300 mb-4">
          We sent a confirmation link to the email you provided. Click that link to confirm your account and you'll
          be redirected back to the site.
        </p>
        <p className="text-sm text-gray-400">If you don't see the email, please check your spam folder.</p>
        <p className="text-sm text-gray-400">Contact whendoesitgg@gmail.com for further assistance</p>
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
