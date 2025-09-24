// src/pages/Dashboard.js
import React, { useState, useEffect } from "react";
import Filters from "../components/Filters";
import MachineTable from "../components/MachineTable";
import PieChart from "../components/PieChart";
import StackedChart from "../components/StackedChart";
import SummaryCards from "../components/SummaryCards";
import { fetchMachines, fetchPieChart, fetchStackedChart, fetchSummary } from "../services/api";

const Dashboard = () => {
  const [filters, setFilters] = useState({});
  const [machines, setMachines] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [stackedData, setStackedData] = useState({});
  const [summary, setSummary] = useState({ totalMachines: 0, statuses: {} });

  useEffect(() => {
    const loadData = async () => {
      const machinesRes = await fetchMachines(filters);
      setMachines(machinesRes.machines || []);

      if (filters.date_from) {
        const pieRes = await fetchPieChart(filters.date_from);
        setPieData(pieRes.data || []);
        const summaryRes = await fetchSummary(filters.date_from);
        setSummary(summaryRes);
      } else {
        setPieData([]);
        setSummary({ totalMachines: 0, statuses: {} });
      }

      if (filters.date_from && filters.date_to) {
        const stackedRes = await fetchStackedChart("weekly", filters.date_from, filters.date_to);
        setStackedData(stackedRes || {});
      } else {
        setStackedData({});
      }
    };

    loadData();
  }, [filters]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Factory Monitoring Dashboard</h1>
      <Filters setFilters={setFilters} />
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
