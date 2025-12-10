import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import MainDashboard from "./pages/MainDashboard";
import MachineList from "./pages/MachineList";
import MachineDetail from "./pages/MachineDetail";
import LoadingOverlay from "./components/LoadingOverlay";
import "./AppNavbar.css";
import "./App.css";

// Define previously referenced locals so eslint/no-undef is not triggered
const loader = null;
const mounted = false;
const here = "";

/* Prevent ESLint no-unused-vars warning for intentionally unused locals */
void loader;
void mounted;
void here;

// Modern Navbar Component - Clean & Minimal
const Navbar = () => {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <nav className="modern-navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="navbar-icon">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
          </svg>
          <span className="navbar-title">Factory Monitor</span>
        </div>
        <div className="navbar-status">
          <div className="navbar-datetime">
            <span className="navbar-date">{formatDate(currentTime)}</span>
            <span className="navbar-time">{formatTime(currentTime)}</span>
          </div>
          <div className="navbar-indicator">
            <span className="status-dot"></span>
            <span className="status-text">Live</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <LoadingOverlay />
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<MainDashboard />} />
            <Route path="/machines" element={<MachineList />} />
            <Route path="/machines/:id" element={<MachineDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
