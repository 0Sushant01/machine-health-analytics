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

// Modern Navbar Component
const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname === "/";
  const isMachineList = location.pathname.startsWith("/machines");

  return (
    <nav className="modern-navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="navbar-icon">
            <rect x="2" y="2" width="20" height="20" rx="2.5" />
            <path d="M12 2v20M2 12h20" />
          </svg>
          <span className="navbar-title">Factory Monitor</span>
        </div>
        <div className="navbar-links">
          <button
            onClick={() => navigate("/")}
            className={`nav-link ${isDashboard && !isMachineList ? "active" : ""}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Dashboard
          </button>
          <button
            onClick={() => navigate("/machines")}
            className={`nav-link ${isMachineList ? "active" : ""}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Machines
          </button>
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
