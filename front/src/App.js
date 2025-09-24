
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import MainDashboard from "./pages/MainDashboard";
import MachineList from "./pages/MachineList";
import MachineDetail from "./pages/MachineDetail";
import "./AppNavbar.css";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* Navbar */}
        <nav className="bg-white shadow-md p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Factory Monitoring</h1>
          <div className="space-x-4">
            <Link
              to="/"
              className="navbar-link bg-blue-500 hover:bg-blue-600"
            >
              Dashboard
            </Link>
            <Link
              to="/machines"
              className="navbar-link bg-green-500 hover:bg-green-600"
            >
              Machine List
            </Link>
          </div>
        </nav>

        {/* Page Content */}
        <Routes>
          <Route path="/" element={<MainDashboard />} />
          <Route path="/machines" element={<MachineList />} />
          <Route path="/machines/:id" element={<MachineDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
