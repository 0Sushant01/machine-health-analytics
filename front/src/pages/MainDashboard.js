import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RichMachineTable from "../components/RichMachineTable";
import { fetchMachines } from "../services/api";
import "../App.css";
import "./MainDashboard.css"; // custom styles

// Helper function to format date as YYYY-MM-DD
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get today's date
const getTodayDate = () => {
  const today = new Date();
  return formatDate(today);
};

const MainDashboard = () => {
  const todayDate = getTodayDate();
  const [filters] = useState({ date_from: todayDate, date_to: todayDate });
  const [machines, setMachines] = useState([]);
  const [summary, setSummary] = useState({ totalMachines: 0, statuses: {} });

  useEffect(() => {
    const loadData = async () => {
      const res = await fetchMachines({ ...filters });
      setMachines(res.machines || []);
    };
    loadData();
  }, [filters]);

  useEffect(() => {
    const statuses = ["Normal", "Satisfactory", "Alert", "Unacceptable"];
    const statusCount = { Normal: 0, Satisfactory: 0, Alert: 0, Unacceptable: 0 };

    machines.forEach((m) => {
      if (statuses.includes(m.statusName)) statusCount[m.statusName]++;
    });

    setSummary({ totalMachines: machines.length, statuses: statusCount });
  }, [machines]);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div style={{ width: '100%', maxWidth: 1400 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h1 className="dashboard-title">Factory Monitoring Dashboard</h1>
            <p className="dashboard-subtitle">Real-time monitoring of industrial machines</p>
          </div>
        </div>
      </header>

      {/* Summary Section */}
      <div className="summary-section">
        <div className="total-card" style={{ '--accent-color': '#ffffff' }}>
          <h2 className="total-card-title" style={{ fontWeight: 800 }}>Total Machines</h2>
          <p className="total-card-value">{summary.totalMachines}</p>
        </div>
        {Object.keys(summary.statuses).map((status) => {
          const accent = status === 'Normal' ? '#22c55e' :
            status === 'Satisfactory' ? '#3b82f6' :
              status === 'Alert' ? '#facc15' :
                status === 'Unacceptable' ? '#ef4444' : '#e5e7eb';
          return (
            <div
              key={status}
              className="total-card"
              style={{ '--accent-color': accent }}
            >
              <h2 className="total-card-title">{status}</h2>
              <p className="total-card-value">{summary.statuses[status]}</p>
            </div>
          );
        })}
      </div>

      {/* Machine Table */}
      <div style={{ marginTop: '2rem' }}>
        <RichMachineTable machines={machines} />
      </div>
    </div>
  );
};

export default MainDashboard;