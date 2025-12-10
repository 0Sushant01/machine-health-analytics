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

// Status icons as SVG components
const StatusIcons = {
  total: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  Normal: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  Satisfactory: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Alert: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Unacceptable: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  )
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

  // Status accent colors matching CSS
  const getAccentColor = (status) => {
    const colors = {
      Normal: '#10b981',
      Satisfactory: '#3b82f6',
      Alert: '#f59e0b',
      Unacceptable: '#ef4444'
    };
    return colors[status] || '#0891b2';
  };

  return (
    <div className="dashboard-container">
      {/* Summary Section - Now at the top */}
      <div className="summary-section">
        {/* Total Machines Card */}
        <div
          className="total-card"
          data-status="total"
          style={{ '--accent-color': '#0891b2', '--accent-color-light': '#06b6d4' }}
        >
          <div className="total-card-icon" style={{ background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)' }}>
            {StatusIcons.total}
          </div>
          <h2 className="total-card-title">Total Machines</h2>
          <p className="total-card-value">{summary.totalMachines}</p>
        </div>

        {/* Status Cards */}
        {Object.keys(summary.statuses).map((status) => {
          const accent = getAccentColor(status);
          return (
            <div
              key={status}
              className="total-card"
              data-status={status.toLowerCase()}
              style={{ '--accent-color': accent }}
            >
              <div
                className="total-card-icon"
                style={{ background: accent }}
              >
                {StatusIcons[status]}
              </div>
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