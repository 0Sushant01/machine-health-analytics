import React, { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./RichMachineTable.module.css";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CombinedMachineReport } from "./MachineReport";
import { fetchFullMachineReportData } from "../services/api";

const STATUS_COLORS = {
    Normal: "#16a34a",
    Satisfactory: "#475569",
    Alert: "#f59e0b",
    Unacceptable: "#ef4444",
};

const RichMachineTable = ({ machines = [] }) => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;

    // Sorting: Default by dataUpdatedTime desc (latest first) or as in MachineList (asc)
    // MachineList sort: old to new?
    // Let's stick to the MachineList implementation:
    /*
    const sortedMachines = React.useMemo(() => {
      return [...machines].sort((a, b) => {
        const dateA = a.dataUpdatedTime ? new Date(a.dataUpdatedTime) : new Date(0);
        const dateB = b.dataUpdatedTime ? new Date(b.dataUpdatedTime) : new Date(0);
        return dateA - dateB;
      });
    }, [machines]);
    */

    // Actually, usually users prefer newest first. 
    // But to perfectly match "MachineList", I should check step 74.
    // Step 74: `return dateA - dateB;` -> Ascending (Oldest first). 
    // I will reproduce this behavior.

    const [selectedIds, setSelectedIds] = useState(new Set());
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [combinedReportData, setCombinedReportData] = useState(null);
    const combinedReportRef = useRef(null);

    const sortedMachines = useMemo(() => {
        if (!machines) return [];
        return [...machines].sort((a, b) => {
            const dateA = a.dataUpdatedTime ? new Date(a.dataUpdatedTime) : new Date(0);
            const dateB = b.dataUpdatedTime ? new Date(b.dataUpdatedTime) : new Date(0);
            return dateA - dateB;
        });
    }, [machines]);

    const totalPages = Math.max(1, Math.ceil((sortedMachines.length || 0) / rowsPerPage));
    const paginatedMachines = sortedMachines.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    // Selection Handlers
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(new Set(machines.map(m => m._id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelectOne = (id, e) => {
        e.stopPropagation();
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
            const results = await Promise.all(
                ids.map(id => {
                    // Find the machine object to pass name fallback
                    const m = machines.find(mac => mac._id === id);
                    return fetchFullMachineReportData(id, m || {});
                })
            );

            const validResults = results.filter(r => r !== null);
            if (validResults.length === 0) {
                alert("Failed to load data for selected machines.");
                setIsGeneratingReport(false);
                return;
            }

            setCombinedReportData(validResults);
            await new Promise(resolve => setTimeout(resolve, 3000));

            if (!combinedReportRef.current) throw new Error("Report container not found");

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pages = combinedReportRef.current.querySelectorAll('.report-page');

            if (pages.length === 0) throw new Error("No pages generated");

            for (let i = 0; i < pages.length; i++) {
                if (i > 0) pdf.addPage();
                const canvas = await html2canvas(pages[i], {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    windowWidth: 794,
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
            setCombinedReportData(null);
        }
    };

    const isAllSelected = machines.length > 0 && selectedIds.size === machines.length;
    const isIndeterminate = selectedIds.size > 0 && selectedIds.size < machines.length;

    if (!machines || machines.length === 0) {
        return (
            <div className={styles.emptyState}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: '#cbd5e1', marginBottom: 16 }}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <h3 style={{ color: '#334155', marginBottom: 8 }}>No machines found</h3>
                <p style={{ color: '#64748b' }}>Try adjusting filters if available</p>
            </div>
        );
    }

    return (
        <div className={styles.tableContainer}>
            {/* Hidden Report Container for PDF Generation */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                {combinedReportData && (
                    <CombinedMachineReport
                        ref={combinedReportRef}
                        machinesData={combinedReportData}
                    />
                )}
            </div>

            {/* Loading Overlay */}
            {isGeneratingReport && (
                <div className={styles.fullscreenLoadingOverlay}>
                    <div className={styles.overlayBox}>
                        <div className={styles.spinner}></div>
                        <p className={styles.overlayMessage}>Generating Combined Report...</p>
                        <p className={styles.overlaySub}>Processing {selectedIds.size} machines...</p>
                    </div>
                </div>
            )}

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                <button
                    onClick={handleGenerateCombinedReport}
                    disabled={selectedIds.size === 0}
                    className={styles.actionButton}
                >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Generate Report ({selectedIds.size})
                </button>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.machineTable}>
                    <thead>
                        <tr>
                            <th style={{ width: '50px', textAlign: 'center' }}>
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
                            <th>Customer ID</th>
                            <th>Machine Name</th>
                            <th>Machine ID</th>
                            <th>Status</th>
                            <th>Type</th>
                            <th>Area ID</th>
                            <th>Subarea ID</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedMachines.map((m, idx) => (
                            <tr
                                key={m._id}
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                    let dataUpdatedTime = "N/A";
                                    if (m.dataUpdatedTime) {
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
                            >
                                <td onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(m._id)}
                                            onChange={(e) => handleSelectOne(m._id, e)}
                                            className={styles.checkboxReset}
                                        />
                                    </div>
                                </td>
                                <td>{m.customerId}</td>
                                <td><span className={styles.machineNameCell}>{m.name}</span></td>
                                <td>{m._id}</td>
                                <td className={styles.statusCell}>
                                    <span
                                        className={styles.statusBadge}
                                        style={{ background: STATUS_COLORS[m.statusName] || '#6b7280' }}
                                    >
                                        {m.statusName}
                                    </span>
                                </td>
                                <td>{m.machineType || m.type || "N/A"}</td>
                                <td>{m.areaId}</td>
                                <td>{m.subAreaId || "-"}</td>
                                <td>{m.dataUpdatedTime ? m.dataUpdatedTime.split("T")[0] : ""}</td>
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
        </div>
    );
};

export default RichMachineTable;
