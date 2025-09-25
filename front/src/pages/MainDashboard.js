import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import SummaryCard from "../components/SummaryCards"; // removed unused import
import CustomerTrendStackedChart from "../components/CustomerTrendStackedChart";
import CustomerTrendChart from "../components/CustomerTrendChart";
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
  const [stackedData, setStackedData] = useState({});
  const [trendView, setTrendView] = useState('stacked'); // 'stacked' or 'line'
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
    const dateMap = {};

    machines.forEach((m) => {
      if (statuses.includes(m.statusName)) statusCount[m.statusName]++;

      const date = m.dataUpdatedTime.split("T")[0];
      if (!dateMap[date]) dateMap[date] = { Normal: 0, Satisfactory: 0, Alert: 0, Unacceptable: 0 };
      if (statuses.includes(m.statusName)) dateMap[date][m.statusName]++;
    });

    setSummary({ totalMachines: machines.length, statuses: statusCount });

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
        <div style={{ width: '100%', maxWidth: 1120 }}>
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <h1 className="dashboard-title">Factory Monitoring Dashboard</h1>
            <p className="dashboard-subtitle">Real-time monitoring of industrial machines</p>
          </div>
          <div style={{ background: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 1px 6px rgba(15,23,42,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => navigate('/')} className="navbar-link">Dashboard</button>
                <button onClick={() => navigate('/machines')} className="navbar-link" style={{ background: '#10b981', borderColor: '#10b981' }}>Machine List</button>
              </div>

              <div style={{ flex: 1 }} />

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Filters setFilters={setFilters} compact={true} />
              </div>
            </div>
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

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h3 style={{ margin: 0 }}>Customer Trend</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setTrendView('stacked')}
                style={{ padding: '6px 10px', borderRadius: 6, border: trendView === 'stacked' ? '1px solid #111827' : '1px solid #e5e7eb', background: trendView === 'stacked' ? '#111827' : '#fff', color: trendView === 'stacked' ? '#fff' : '#111827', cursor: 'pointer' }}
              >Stacked</button>
              <button
                onClick={() => setTrendView('line')}
                style={{ padding: '6px 10px', borderRadius: 6, border: trendView === 'line' ? '1px solid #111827' : '1px solid #e5e7eb', background: trendView === 'line' ? '#111827' : '#fff', color: trendView === 'line' ? '#fff' : '#111827', cursor: 'pointer' }}
              >Line</button>
            </div>
          </div>
          {trendView === 'stacked' ? (
            <CustomerTrendStackedChart
              machines={machines}
              onBarClick={({ customerId, date }) => {
                navigate(`/machines?customerId=${encodeURIComponent(customerId)}&date_from=${encodeURIComponent(date)}&date_to=${encodeURIComponent(date)}`);
              }}
            />
          ) : (
            <CustomerTrendChart machines={machines} />
          )}
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
