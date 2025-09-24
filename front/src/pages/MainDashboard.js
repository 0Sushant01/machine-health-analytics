import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import SummaryCard from "../components/SummaryCards"; // removed unused import
import PieChart from "../components/PieChart";
import CustomerTrendStackedChart from "../components/CustomerTrendStackedChart";
import StackedChart from "../components/StackedChart";
import Filters from "../components/Filters";
import { fetchMachines } from "../services/api";
import Modal from "react-modal";
import "../App.css";
import "./MainDashboard.css"; // custom styles

Modal.setAppElement("#root");

const MainDashboard = () => {
  const [filters, setFilters] = useState({ date_from: "2025-08-10", date_to: "2025-08-17" });
  const [machines, setMachines] = useState([]);
  const [summary, setSummary] = useState({ totalMachines: 0, statuses: {} });
  const [pieData, setPieData] = useState([]);
  const [stackedData, setStackedData] = useState({});
  // const [statusFilter, setStatusFilter] = useState(""); // removed unused
  const [modalData, setModalData] = useState(null);

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
    const pieMap = {};
    const dateMap = {};

    machines.forEach((m) => {
      if (statuses.includes(m.statusName)) statusCount[m.statusName]++;
      // Pie chart by areaId
      if (m.areaId) pieMap[m.areaId] = (pieMap[m.areaId] || 0) + 1;

      const date = m.dataUpdatedTime.split("T")[0];
      if (!dateMap[date]) dateMap[date] = { Normal: 0, Satisfactory: 0, Alert: 0, Unacceptable: 0 };
      if (statuses.includes(m.statusName)) dateMap[date][m.statusName]++;
    });

    setSummary({ totalMachines: machines.length, statuses: statusCount });
    setPieData(Object.entries(pieMap).map(([areaId, count]) => ({ _id: areaId, count })));

    const stacked = { dates: Object.keys(dateMap).sort(), statuses: { Normal: [], Satisfactory: [], Alert: [], Unacceptable: [] } };
    stacked.dates.forEach((date) => statuses.forEach((s) => stacked.statuses[s].push(dateMap[date][s])));
    setStackedData(stacked);
  }, [machines]);

  // const handleStatusClick = (status) => setStatusFilter(status); // removed unused
  const navigate = useNavigate();
  // When a bar region is clicked, navigate to MachineList with filters for status and date
  const handleBarClick = ({ status, date }) => {
    // Pass filters as query params
    navigate(`/machines?statusName=${encodeURIComponent(status)}&date_from=${encodeURIComponent(date)}&date_to=${encodeURIComponent(date)}`);
  };
  const closeModal = () => setModalData(null);

  // const statusColors = {
  //   Normal: "bg-green-500",
  //   Satisfactory: "bg-blue-500",
  //   Alert: "bg-yellow-500",
  //   Unacceptable: "bg-red-500",
  // };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Factory Monitoring Dashboard</h1>
          <p className="dashboard-subtitle">Real-time monitoring of industrial machines</p>
        </div>
        <div className="dashboard-filters">
          <Filters setFilters={setFilters} />
        </div>
      </header>

      {/* Summary Section */}
      <div className="summary-section">
        <div className="total-card">
          <h2>Total Machines</h2>
          <p>{summary.totalMachines}</p>
        </div>
        {Object.keys(summary.statuses).map((status) => (
          <div
            key={status}
            className="total-card"
            style={{ borderTop: `4px solid ${
              status === 'Normal' ? '#22c55e' :
              status === 'Satisfactory' ? '#3b82f6' :
              status === 'Alert' ? '#facc15' :
              status === 'Unacceptable' ? '#ef4444' : '#e5e7eb'
            }` }}
          >
            <h2 style={{ color: '#6b7280', fontSize: '1.25rem', marginBottom: 8 }}>{status}</h2>
            <p style={{ color: '#111827', fontSize: '2.5rem', fontWeight: 700 }}>{summary.statuses[status]}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-card">
          <CustomerTrendStackedChart
            machines={machines}
            onBarClick={({ customerId, date }) => {
              navigate(`/machines?customerId=${encodeURIComponent(customerId)}&date_from=${encodeURIComponent(date)}&date_to=${encodeURIComponent(date)}`);
            }}
          />
        </div>
        <div className="chart-card">
          <h3>Area Machine Distribution</h3>
          {pieData.length > 0 ? <PieChart data={pieData} /> : <p>No data available</p>}
        </div>
        <div className="chart-card">
          <h3>Machine Status Trends</h3>
          {stackedData.dates && stackedData.dates.length > 0 ? (
            <StackedChart data={stackedData} onBarClick={handleBarClick} clickable={true} />
          ) : <p>No data available</p>}
        </div>
      </div>

      {/* Modal Popup */}
      {modalData && (
        <Modal
          isOpen={!!modalData}
          onRequestClose={closeModal}
          className="modal-card"
          overlayClassName="modal-overlay"
        >
          <h2>{modalData.name}</h2>
          <p><strong>Status:</strong> {modalData.statusName}</p>
          <p><strong>Type:</strong> {modalData.machineType}</p>
          <p><strong>Last Updated:</strong> {modalData.dataUpdatedTime}</p>
          <p><strong>Customer ID:</strong> {modalData.customerId}</p>
          <button onClick={closeModal}>Close</button>
        </Modal>
      )}
    </div>
  );
};

export default MainDashboard;
