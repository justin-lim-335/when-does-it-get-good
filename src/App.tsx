import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import ShowPage from "./ShowPage";
import Login from "./Login";

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
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
