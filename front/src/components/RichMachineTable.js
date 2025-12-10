import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./RichMachineTable.module.css";

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
        <div className={styles.tableWrapper}>
            <table className={styles.machineTable}>
                <thead>
                    <tr>
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
    );
};

export default RichMachineTable;
