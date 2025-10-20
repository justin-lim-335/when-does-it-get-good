// src/NoPageFound.tsx
import { Link } from "react-router-dom";

export default function NoPageFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-gray-100 px-6">
      <h1 className="text-5xl font-bold mb-4">404</h1>
      <p className="text-xl mb-6">Oops! Page not found.</p>
      <Link
        to="/"
        className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-md transition"
      >
        Go Back Home
      </Link>
    </div>
  );
}
