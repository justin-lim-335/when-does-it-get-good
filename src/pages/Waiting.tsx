import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";


export default function Waiting() {
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
      <p className="text-lg">Please check your email to confirm your Account!</p>
    </div>
  );
}