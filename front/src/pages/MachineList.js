import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchMachines, updateMachinesCache, getFilterOptions, subscribeMachines } from "../services/api";
import "../App.css";
import styles from "./MachineList.module.css";


const statusOptions = ["", "Normal", "Satisfactory", "Alert", "Unacceptable"];

// Semantic status palette (keep consistent with StackedChart.js)
const STATUS_COLORS = {
  Normal: "#16a34a",
  Satisfactory: "#475569",
  Alert: "#f59e0b",
  Unacceptable: "#ef4444",
};



const MachineList = () => {
  const location = useLocation();
  const navigate = useNavigate();
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

  // Parse query params for initial filters
  const getInitialFilters = () => {
    const params = new URLSearchParams(location.search);
    const defaultDates = getDefaultDates();
    return {
      areaId: "",
      subAreaId: params.get("subAreaId") || "",
      statusName: params.get("statusName") || "",
      customerId: params.get("customerId") || "",
      date_from: params.get("date_from") || defaultDates.from,
      date_to: params.get("date_to") || defaultDates.to
    };
  };
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(getInitialFilters());
  const [filterOptions, setFilterOptions] = useState({ areaId: [], customerId: [] });

  // Update subscriber to not fetch subAreaId
  useEffect(() => {
    const unsubscribe = subscribeMachines(() => {
      const opts = getFilterOptions(['areaId', 'customerId']);
      setFilterOptions(opts);
    });
    return () => unsubscribe();
  }, []);

  // Load machines with filters
  useEffect(() => {
    const loadMachines = async () => {
      setLoading(true);
      try {
        const params = {};
        if (filters.areaId) params.areaId = filters.areaId;
        if (filters.subAreaId) params.subAreaId = filters.subAreaId;
        if (filters.statusName) params.status = filters.statusName;
        if (filters.customerId) params.customerId = filters.customerId;
        if (filters.date_from) params.date_from = filters.date_from;
        if (filters.date_to) params.date_to = filters.date_to;
        
        const res = await fetchMachines(params);
        const loadedMachines = res.machines || [];
        setMachines(loadedMachines);
        updateMachinesCache(loadedMachines);
      } catch (error) {
        setMachines([]);
      } finally {
        setLoading(false);
      }
    };
    loadMachines();
  }, [filters]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Pagination state
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(machines.length / rowsPerPage);
  // Sort machines by date (ascending)
  const sortedMachines = [...machines].sort((a, b) => {
    const dateA = a.dataUpdatedTime ? new Date(a.dataUpdatedTime) : new Date(0);
    const dateB = b.dataUpdatedTime ? new Date(b.dataUpdatedTime) : new Date(0);
    return dateA - dateB;
  });
  const paginatedMachines = sortedMachines.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
      <div className={styles.machineListContainer}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ textAlign: 'left', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#6366f1' }}>
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <h2 className={styles.machineListTitle}>Machine List</h2>
          </div>
          <p style={{ color: '#64748b', fontSize: '1rem', marginLeft: 44 }}>Browse and filter all machines in the system</p>
        </div>
      </div>
      {/* Filters */}
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <div className={styles.filterItem}>
            <label className={styles.filterLabel}>Area ID</label>
            <select
              name="areaId"
              value={filters.areaId}
              onChange={handleInputChange}
              className={styles.filterSelect}
            >
              <option value="">All Areas</option>
              {filterOptions.areaId?.map(id => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterItem}>
            <label className={styles.filterLabel}>Status</label>
            <select
              name="statusName"
              value={filters.statusName}
              onChange={handleInputChange}
              className={styles.filterSelect}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s || "All Statuses"}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterItem}>
            <label className={styles.filterLabel}>Customer ID</label>
            <select
              name="customerId"
              value={filters.customerId}
              onChange={handleInputChange}
              className={styles.filterSelect}
            >
              <option value="">All Customers</option>
              {filterOptions.customerId?.map(id => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.filterGroup}>
          <div className={styles.filterItem}>
            <label className={styles.filterLabel}>From Date</label>
            <input
              type="date"
              name="date_from"
              value={filters.date_from}
              onChange={handleDateChange}
              className={styles.filterInput}
            />
          </div>
          <div className={styles.filterItem}>
            <label className={styles.filterLabel}>To Date</label>
            <input
              type="date"
              name="date_to"
              value={filters.date_to}
              onChange={handleDateChange}
              className={styles.filterInput}
            />
          </div>
        </div>
      </div>
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p style={{ color: '#64748b', marginTop: 16, fontSize: '1rem' }}>Loading machines...</p>
        </div>
      ) : machines.length === 0 ? (
        <div className={styles.emptyState}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: '#cbd5e1', marginBottom: 16 }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h3 style={{ color: '#334155', marginBottom: 8 }}>No machines found</h3>
          <p style={{ color: '#64748b' }}>Try adjusting your filters to see more results</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.machineTable} style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
            <thead>
              <tr style={{ background: '#f1f5f9', color: '#334155', fontWeight: 600 }}>
                <th style={{ padding: '10px 8px', borderBottom: '2px solid #e5e7eb' }}>Customer ID</th>
                <th style={{ padding: '10px 8px', borderBottom: '2px solid #e5e7eb' }}>Machine Name</th>
                <th style={{ padding: '10px 8px', borderBottom: '2px solid #e5e7eb' }}>Machine ID</th>
                <th style={{ padding: '10px 8px', borderBottom: '2px solid #e5e7eb' }}>Status</th>
                <th style={{ padding: '10px 8px', borderBottom: '2px solid #e5e7eb' }}>Type</th>
                <th style={{ padding: '10px 8px', borderBottom: '2px solid #e5e7eb' }}>Area ID</th>
                <th style={{ padding: '10px 8px', borderBottom: '2px solid #e5e7eb' }}>Subarea ID</th>
                <th style={{ padding: '10px 8px', borderBottom: '2px solid #e5e7eb' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMachines.map((m, idx) => (
                <tr
                  key={m._id}
                  style={{ cursor: "pointer", background: idx % 2 === 0 ? '#f9fafb' : '#fff', transition: 'background 0.2s' }}
                  onClick={() => {
                    // Send only minimal required details for instant display
                    // Bearings will be fetched from backend
                    // Extract date properly - handle both full ISO string and date-only formats
                    let dataUpdatedTime = "N/A";
                    if (m.dataUpdatedTime) {
                      // If it's already a date string, use it; otherwise format it
                      if (typeof m.dataUpdatedTime === 'string' && m.dataUpdatedTime.includes('T')) {
                        dataUpdatedTime = m.dataUpdatedTime;
                      } else if (m.dataUpdatedTime) {
                        dataUpdatedTime = m.dataUpdatedTime;
                      }
                    }
                    
                    const machineForDetail = {
                      _id: m._id || "",
                      name: m.name || m.machineName || "",
                      customerId: m.customerId || "N/A",
                      statusName: m.statusName || "N/A",
                      areaId: m.areaId || "N/A",
                      machineType: m.machineType || m.type || "N/A",
                      type: m.machineType || m.type || "N/A",
                      dataUpdatedTime: dataUpdatedTime
                    };
                    navigate(`/machines/${m._id}`, { state: { machine: machineForDetail } });
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#e0e7ef'}
                  onMouseOut={e => e.currentTarget.style.background = idx % 2 === 0 ? '#f9fafb' : '#fff'}
                >
                  <td style={{ padding: '8px 6px', borderBottom: '1px solid #e5e7eb' }}>{m.customerId}</td>
                  <td className={styles.machineNameCell} style={{ padding: '6px 8px', borderBottom: '1px solid rgba(229,231,235,0.6)' }}>{m.name}</td>
                  <td style={{ padding: '8px 6px', borderBottom: '1px solid #e5e7eb' }}>{m._id}</td>
                  <td className={styles.statusCell} style={{ padding: '8px 6px', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
                    <span
                      className={styles.statusBadge}
                      style={{ background: STATUS_COLORS[m.statusName] || '#6b7280' }}
                    >
                      {m.statusName}
                    </span>
                  </td>
                  <td style={{ padding: '8px 6px', borderBottom: '1px solid #e5e7eb' }}>{m.machineType || m.type || "N/A"}</td>
                  <td style={{ padding: '8px 6px', borderBottom: '1px solid #e5e7eb' }}>{m.areaId}</td>
                  <td style={{ padding: '8px 6px', borderBottom: '1px solid #e5e7eb' }}>{m.subAreaId || "-"}</td>
                  <td style={{ padding: '8px 6px', borderBottom: '1px solid #e5e7eb' }}>{m.dataUpdatedTime ? m.dataUpdatedTime.split("T")[0] : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination Controls */}
          <div className={styles.pagination}>
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1} 
              className={styles.paginationButton}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Previous
            </button>
            <span className={styles.paginationInfo}>
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
              disabled={page === totalPages} 
              className={styles.paginationButton}
            >
              Next
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MachineList;
