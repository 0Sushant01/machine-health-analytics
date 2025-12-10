// src/pages/Dashboard.js
import React, { useState, useEffect } from "react";
import MachineTable from "../components/MachineTable";
import PieChart from "../components/PieChart";
import StackedChart from "../components/StackedChart";
import SummaryCards from "../components/SummaryCards";
import { fetchMachines, fetchPieChart, fetchStackedChart, fetchSummary } from "../services/api";

const Dashboard = () => {
  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayDate = getTodayDate();
  const [machines, setMachines] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [stackedData, setStackedData] = useState({});
  const [summary, setSummary] = useState({ totalMachines: 0, statuses: {} });

  useEffect(() => {
    const loadData = async () => {
      const filters = { date_from: todayDate, date_to: todayDate };
      const machinesRes = await fetchMachines(filters);
      setMachines(machinesRes.machines || []);

      const pieRes = await fetchPieChart(todayDate);
      setPieData(pieRes.data || []);
      const summaryRes = await fetchSummary(todayDate);
      setSummary(summaryRes);

      const stackedRes = await fetchStackedChart("daily", todayDate, todayDate);
      setStackedData(stackedRes || {});
    };

    loadData();
  }, [todayDate]);

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#111827' }}>Factory Monitoring Dashboard</h1>
        <p style={{ color: '#6b7280', marginTop: 6 }}>Real-time monitoring of industrial machines</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 14, justifyContent: 'center' }}>
          <button onClick={() => window.location.href = '/'} className="navbar-link">Dashboard</button>
          <button onClick={() => window.location.href = '/machines'} className="navbar-link" style={{ background: '#10b981', borderColor: '#10b981' }}>Machine List</button>
        </div>
      </div>
      <SummaryCards totalMachines={summary.totalMachines} statuses={summary.statuses} />
      <MachineTable machines={machines} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: "30px", justifyContent: "space-between" }}>
        {pieData.length > 0 && <div style={{ flex: "1 1 45%" }}><PieChart data={pieData} /></div>}
        {stackedData.dates && <div style={{ flex: "1 1 50%" }}><StackedChart data={stackedData} /></div>}
      </div>
    </div>
  );
};

export default Dashboard;
