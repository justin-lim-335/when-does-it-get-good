import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-800">
      <img
            src={logo}
            alt="Site Logo"
            className="h-28 sm:h-24 w-auto cursor-pointer transition-all duration-300"
            onClick={() => navigate("/")}
          />
      <h1 className="text-3xl font-bold mb-4">Welcome to Get Good!</h1>
      <p className="text-lg">Your email is confirmed. You can now log in and enjoy the site.</p>
    </div>
  );
}
