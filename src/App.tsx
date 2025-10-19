import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import ShowPage from "./pages/ShowPage";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Account from "./pages/Account";
import About from "./pages/About";
import APIDocs from "./pages/APIDocs";
import Privacy from "./pages/PrivacyPolicy";
import Terms from "./pages/TermsOfUse";
import History from "./pages/VotingHistory";
import Waiting from "./pages/Waiting";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <Router>
      <div className="app-container">
        <ScrollToTop />
        {/* Shared Header */}
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shows/:tmdb_id" element={<ShowPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/account" element={<Account />} />
            <Route path="/about" element={<About />} />
            <Route path="/api-docs" element={<APIDocs />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/history" element={<History />} />
            <Route path="/waiting" element={<Waiting />} />
          </Routes>
        </main>
        {/* Shared Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
