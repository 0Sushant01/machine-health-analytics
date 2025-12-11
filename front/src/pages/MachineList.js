import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMachinesNoLoading, updateMachinesCache, getFilterOptions, subscribeMachines, fetchFullMachineReportData } from "../services/api";
import Filters from "../components/Filters";
import { CombinedMachineReport } from "../components/MachineReport";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import "../App.css";
import styles from "./MachineList.module.css";

// Semantic status palette (keep consistent with StackedChart.js)
const STATUS_COLORS = {
  Normal: "#16a34a",
  Satisfactory: "#475569",
  Alert: "#f59e0b",
  Unacceptable: "#ef4444",
};

const MachineList = () => {
  // const location = useLocation(); // unused
  const navigate = useNavigate();
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

  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const todayDate = getTodayDate();
  const [filters, setFilters] = useState({
    areaId: "",
    subAreaId: "",
    statusName: "",
    customerId: "",
    date_from: todayDate,
    date_to: todayDate
  });
  // dynamic filter options derived from the currently loaded table data (cache)
  const [filterOptions, setFilterOptions] = useState({ areaId: [], customerId: [] });
  // const [error, setError] = useState(null);

  // Selection & Report State
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [combinedReportData, setCombinedReportData] = useState(null);
  const combinedReportRef = useRef(null);

  // subscribe to cache updates so filters update when table data is updated
  useEffect(() => {
    const unsub = subscribeMachines(() => {
      const opts = getFilterOptions(['areaId', 'customerId']);
      setFilterOptions({
        areaId: opts.areaId || [],
        customerId: opts.customerId || [],
      });
    });
    return () => unsub();
  }, []);

  // Load machines with filters
  useEffect(() => {
    const loadMachines = async () => {
      setLoading(true);
      setSelectedIds(new Set()); // Reset selection on filter change
      try {
        const params = {
          date_from: filters.date_from,
          date_to: filters.date_to,
          customerId: filters.customerId,
          areaId: filters.areaId,
          statusName: filters.statusName
        };
        // use non-loading fetch to avoid triggering global loader from this page
        const res = await fetchMachinesNoLoading(params);
        const loaded = res.machines || [];
        setMachines(loaded);
        // push loaded table rows into cache so filters reflect currently shown data
        updateMachinesCache(loaded);
      } catch (error) {
        setMachines([]);
      } finally {
        setLoading(false);
      }
    };
    loadMachines();
  }, [filters]); // Re-fetch when any filter changes

  // ... (keeping pagination) ...

  // Pagination state (ensure defined)
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Derived/sorted & paginated machines
  const sortedMachines = React.useMemo(() => {
    return [...machines].sort((a, b) => {
      const dateA = a.dataUpdatedTime ? new Date(a.dataUpdatedTime) : new Date(0);
      const dateB = b.dataUpdatedTime ? new Date(b.dataUpdatedTime) : new Date(0);
      return dateA - dateB;
    });
  }, [machines]);

  const totalPages = Math.max(1, Math.ceil((sortedMachines?.length || 0) / rowsPerPage));
  const paginatedMachines = sortedMachines.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // determine initial-load situation: first page and no data yet
  const initialLoad = loading && machines.length === 0 && page === 1;

  // Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(machines.map(m => m._id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id, e) => {
    e.stopPropagation(); // Prevent row click
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleGenerateCombinedReport = async () => {
    if (selectedIds.size === 0) return;
    setIsGeneratingReport(true);
    setCombinedReportData(null);

    try {
      const ids = Array.from(selectedIds);
      // Sort IDs to match list order? Optional but nice.
      // Fetch all data
      const results = await Promise.all(
        ids.map(id => fetchFullMachineReportData(id))
      );

      const validResults = results.filter(r => r !== null);
      if (validResults.length === 0) {
        alert("Failed to load data for selected machines.");
        setIsGeneratingReport(false);
        return;
      }

      setCombinedReportData(validResults);

      // Wait for render
      await new Promise(resolve => setTimeout(resolve, 3000)); // Give enough time for charts

      if (!combinedReportRef.current) {
        throw new Error("Report container not found");
      }

      // Generate PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pages = combinedReportRef.current.querySelectorAll('.report-page');

      if (pages.length === 0) {
        throw new Error("No pages generated");
      }

      for (let i = 0; i < pages.length; i++) {
        if (i > 0) pdf.addPage();
        const canvas = await html2canvas(pages[i], {
          scale: 2,
          useCORS: true,
          logging: false,
          windowWidth: 794, // A4 width in px at 96 DPI approx (210mm)
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      }

      pdf.save(`Combined_Report_${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (err) {
      console.error("Report generation failed:", err);
      alert("Failed to generate report. Please try again.");
    } finally {
      setIsGeneratingReport(false);
      setCombinedReportData(null); // Clear data to unmount report
    }
  };

  const isAllSelected = machines.length > 0 && selectedIds.size === machines.length;
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < machines.length;

  return (
    <div className={styles.machineListContainer}>
      {/* Hidden Report Container */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        {combinedReportData && (
          <CombinedMachineReport
            ref={combinedReportRef}
            machinesData={combinedReportData}
          />
        )}
      </div>

      {/* Fullscreen overlay during initial first-page load */}
      {initialLoad && (
        <div className={styles.fullscreenLoadingOverlay} role="status" aria-live="polite" aria-busy="true">
          <div className={styles.overlayBox}>
            <div className={styles.spinner} aria-hidden="true"></div>
            <p className={styles.overlayMessage}>Loading machines — fetching the latest data</p>
            <p className={styles.overlaySub}>This may take a few seconds. Filters and table will become active once data arrives.</p>
          </div>
        </div>
      )}

      {/* Report Generation Overlay */}
      {isGeneratingReport && (
        <div className={styles.fullscreenLoadingOverlay} role="status" aria-live="polite" aria-busy="true" style={{ zIndex: 9999 }}>
          <div className={styles.overlayBox}>
            <div className={styles.spinner}></div>
            <p className={styles.overlayMessage}>Generating Combined Report...</p>
            <p className={styles.overlaySub}>Processing {selectedIds.size} machines. Please wait.</p>
          </div>
        </div>
      )}

      {/* Dim underlying content when overlay active */}
      <div className={initialLoad ? styles.dimmedContent : ""}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ textAlign: 'left', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#6366f1' }}>
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                <h2 className={styles.machineListTitle}>Machine List</h2>
              </div>
              <p style={{ color: '#64748b', fontSize: '1rem', marginLeft: 44 }}>Today's machines status</p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleGenerateCombinedReport}
                disabled={selectedIds.size === 0}
                className={styles.actionButton}
                style={{
                  padding: '8px 16px',
                  background: selectedIds.size === 0 ? '#94a3b8' : '#4f46e5', // Grey if disabled
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: selectedIds.size === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: selectedIds.size === 0 ? 'none' : '0 2px 4px rgba(0,0,0,0.1)',
                  opacity: selectedIds.size === 0 ? 0.7 : 1
                }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate Report ({selectedIds.size})
              </button>
            </div>
          </div>

          <Filters
            setFilters={setFilters}
            initialFilters={filters}
            filterOptions={filterOptions}
          />
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
                  <th style={{ padding: '10px 8px', borderBottom: '2px solid #e5e7eb', width: '50px', textAlign: 'center', zIndex: 20, background: 'orange' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={el => { if (el) el.indeterminate = isIndeterminate; }}
                        onChange={handleSelectAll}
                        className={styles.checkboxReset}
                      />
                    </div>
                  </th>
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
                    <td style={{ padding: '8px 6px', borderBottom: '1px solid #e5e7eb', textAlign: 'center', background: 'orange' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(m._id)}
                          onChange={(e) => handleSelectOne(m._id, e)}
                          className={styles.checkboxReset}
                        />
                      </div>
                    </td>
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
    </div>
  );
};

export default MachineList;
