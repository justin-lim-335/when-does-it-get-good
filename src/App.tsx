import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import ShowPage from "./pages/ShowPage";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Account from "./pages/Account";

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Shared Header */}
        <Header />

        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shows/:tmdb_id" element={<ShowPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/account" element={<Account />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
