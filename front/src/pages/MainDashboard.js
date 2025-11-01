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

// Helper function to format date as YYYY-MM-DD
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get default dates: today and 7 days ago
const getDefaultDates = () => {
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);
  return {
    from: formatDate(sevenDaysAgo),
    to: formatDate(today)
  };
};

const MainDashboard = () => {
  const defaultDates = getDefaultDates();
  const [filters, setFilters] = useState({ date_from: defaultDates.from, date_to: defaultDates.to });
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
        <div style={{ width: '100%', maxWidth: 1400 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h1 className="dashboard-title">Factory Monitoring Dashboard</h1>
            <p className="dashboard-subtitle">Real-time monitoring of industrial machines</p>
          </div>
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)', 
            backdropFilter: 'blur(12px)',
            padding: '24px 28px', 
            borderRadius: '20px', 
            boxShadow: '0 8px 16px rgba(0,0,0,0.08), 0 4px 8px rgba(99, 102, 241, 0.1)',
            border: '2px solid rgba(99, 102, 241, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative background elements */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-10%',
              width: '200px',
              height: '200px',
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
              borderRadius: '50%'
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: '-30%',
              left: '-5%',
              width: '150px',
              height: '150px',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
              borderRadius: '50%'
            }}></div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 16,
              position: 'relative',
              zIndex: 1
            }}>
              <Filters 
                setFilters={setFilters} 
                compact={true} 
                initialDateFrom={filters.date_from}
                initialDateTo={filters.date_to}
              />
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Customer Trend</h3>
            <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', padding: 4, borderRadius: 8 }}>
              <button
                onClick={() => setTrendView('stacked')}
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: 6, 
                  border: 'none',
                  background: trendView === 'stacked' ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : 'transparent',
                  color: trendView === 'stacked' ? '#fff' : '#64748b',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease',
                  boxShadow: trendView === 'stacked' ? '0 2px 4px rgba(99, 102, 241, 0.3)' : 'none'
                }}
              >Stacked</button>
              <button
                onClick={() => setTrendView('line')}
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: 6, 
                  border: 'none',
                  background: trendView === 'line' ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : 'transparent',
                  color: trendView === 'line' ? '#fff' : '#64748b',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease',
                  boxShadow: trendView === 'line' ? '0 2px 4px rgba(99, 102, 241, 0.3)' : 'none'
                }}
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
