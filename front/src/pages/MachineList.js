import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { fetchMachines } from "../services/api";
import "../App.css";
import styles from "./MachineList.module.css";


const statusOptions = ["", "Normal", "Satisfactory", "Alert", "Unacceptable"];



const MachineList = () => {
  const location = useLocation();
  // Parse query params for initial filters
  const getInitialFilters = () => {
    const params = new URLSearchParams(location.search);
    return {
      areaId: "",
      subAreaId: params.get("subAreaId") || "",
      statusName: params.get("statusName") || "",
      customerId: params.get("customerId") || "",
      date_from: params.get("date_from") || "2025-08-10",
      date_to: params.get("date_to") || "2025-08-17"
    };
  };
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(getInitialFilters);
  const [allMachines, setAllMachines] = useState([]);

  // Fetch Machines
  // Fetch all machines for dynamic filter options (customerId, areaId)
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await fetchMachines({});
        setAllMachines(res.machines || []);
      } catch (e) {
        setAllMachines([]);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    const loadMachines = async () => {
      setLoading(true);
      try {
        // Only send non-empty filters to backend
        const params = {};
  if (filters.areaId) params.areaId = filters.areaId;
  if (filters.subAreaId) params.subAreaId = filters.subAreaId;
  if (filters.statusName) params.status = filters.statusName;
  if (filters.customerId) params.customerId = filters.customerId;
  if (filters.date_from) params.date_from = filters.date_from;
  if (filters.date_to) params.date_to = filters.date_to;
        const res = await fetchMachines(params);
        setMachines(res.machines || []);
      } catch (error) {
        console.error("Error fetching machines:", error);
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
    <div className={styles.machineListContainer} style={{ background: '#f9fafb', borderRadius: 12, boxShadow: '0 2px 8px #e5e7eb', padding: 32, margin: 24 }}>
      <h2 className={styles.machineListTitle} style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', marginBottom: 24, letterSpacing: 1 }}>Machine List</h2>
      {/* Filters */}
      <div className={styles.filterBar} style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 24, background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 1px 4px #e5e7eb' }}>
        <div style={{ minWidth: 120 }}>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Area ID</label>
          <select
            name="areaId"
            value={filters.areaId}
            onChange={handleInputChange}
            className={styles.filterSelect + ' border rounded px-2 py-1 bg-white'}
          >
            <option value="">All</option>
            {[...new Set(allMachines.map((m) => m.areaId).filter(Boolean))].map((id) => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
        </div>
        <div style={{ minWidth: 120 }}>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Subarea ID</label>
          <select
            name="subAreaId"
            value={filters.subAreaId}
            onChange={handleInputChange}
            className={styles.filterSelect + ' border rounded px-2 py-1 bg-white'}
          >
            <option value="">All</option>
            {[...new Set(allMachines.map((m) => m.subAreaId).filter(Boolean))].map((id) => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
        </div>
        <div style={{ minWidth: 120 }}>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
          <select
            name="statusName"
            value={filters.statusName}
            onChange={handleInputChange}
            className={styles.filterSelect + ' border rounded px-2 py-1 bg-white'}
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s || "All"}</option>
            ))}
          </select>
        </div>
        <div style={{ minWidth: 120 }}>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Customer ID</label>
          <select
            name="customerId"
            value={filters.customerId}
            onChange={handleInputChange}
            className={styles.filterSelect + ' border rounded px-2 py-1 bg-white'}
          >
            <option value="">All</option>
            {[...new Set(allMachines.map((m) => m.customerId).filter(Boolean))].map((id) => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
        </div>
        <div style={{ minWidth: 140 }}>
          <label className="block text-xs font-semibold text-gray-700 mb-1">From Date</label>
          <input
            type="date"
            name="date_from"
            value={filters.date_from}
            onChange={handleDateChange}
            className={styles.filterInput + ' border rounded px-2 py-1 bg-white'}
          />
        </div>
        <div style={{ minWidth: 140 }}>
          <label className="block text-xs font-semibold text-gray-700 mb-1">To Date</label>
          <input
            type="date"
            name="date_to"
            value={filters.date_to}
            onChange={handleDateChange}
            className={styles.filterInput + ' border rounded px-2 py-1 bg-white'}
          />
        </div>
      </div>
      {loading ? (
        <p style={{ color: '#6b7280' }}>Loading...</p>
      ) : (
        <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #e5e7eb', padding: 16 }}>
          <table className={styles.machineTable} style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
            <thead>
              <tr style={{ background: '#f1f5f9', color: '#334155', fontWeight: 600 }}>
                <th style={{ padding: '10px 8px', borderBottom: '2px solid #e5e7eb' }}>Customer ID</th>
                <th style={{ padding: '10px 8px', borderBottom: '2px solid #e5e7eb' }}>Machine Name</th>
                <th style={{ padding: '10px 8px', borderBottom: '2px solid #e5e7eb' }}>Machine ID</th>
                <th style={{ padding: '10px 8px', borderBottom: '2px solid #e5e7eb' }}>Status</th>
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
                  onClick={() => window.location.href = `/machines/${m._id}`}
                  onMouseOver={e => e.currentTarget.style.background = '#e0e7ef'}
                  onMouseOut={e => e.currentTarget.style.background = idx % 2 === 0 ? '#f9fafb' : '#fff'}
                >
                  <td style={{ padding: '8px 6px', borderBottom: '1px solid #e5e7eb' }}>{m.customerId}</td>
                  <td className={styles.machineNameCell} style={{ padding: '8px 6px', borderBottom: '1px solid #e5e7eb' }}>{m.name}</td>
                  <td style={{ padding: '8px 6px', borderBottom: '1px solid #e5e7eb' }}>{m._id}</td>
                  <td className={styles.statusCell} style={{ padding: '8px 6px', borderBottom: '1px solid #e5e7eb' }}>{m.statusName}</td>
                  <td style={{ padding: '8px 6px', borderBottom: '1px solid #e5e7eb' }}>{m.areaId}</td>
                  <td style={{ padding: '8px 6px', borderBottom: '1px solid #e5e7eb' }}>{m.subAreaId || "-"}</td>
                  <td style={{ padding: '8px 6px', borderBottom: '1px solid #e5e7eb' }}>{m.dataUpdatedTime ? m.dataUpdatedTime.split("T")[0] : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination Controls */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '16px 0' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ marginRight: 8, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', fontWeight: 500, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.6 : 1 }}>
              Previous
            </button>
            <span style={{ fontWeight: 500, color: '#334155', margin: '0 12px' }}>Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ marginLeft: 8, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', fontWeight: 500, cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.6 : 1 }}>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MachineList;
