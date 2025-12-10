import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { fetchMachineDetails, fetchBearingData } from "../services/api";
import FFTChart from "../components/FFTChart";
import TimeSeriesChart from "../components/TimeSeriesChart";
import styles from "./MachineDetail.module.css";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas'; // turbo
import MachineReport from '../components/MachineReport';
import { useRef } from 'react';

const STATUS_COLORS = {
  Normal: "#16a34a",
  Satisfactory: "#475569",
  Alert: "#f59e0b",
  Unacceptable: "#ef4444",
};

// Component for displaying long ID values with copy functionality
const IdDisplay = ({ value }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!value) return <div className={styles.infoValue}>N/A</div>;

  return (
    <div className={styles.idContainer}>
      <div className={styles.idValue} title={value}>
        {value}
      </div>
      <button
        onClick={copyToClipboard}
        className={styles.copyButton}
        title="Copy to clipboard"
      >
        {copied ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>
    </div>
  );
};

const MachineDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const initialMachine = location.state?.machine || null;
  const [machine, setMachine] = useState(initialMachine ? { ...initialMachine, bearings: [] } : null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportData, setReportData] = useState({ measurements: [], observations: [], recommendations: [], fftData: [] });
  const reportRef = useRef(null);
  const [loading, setLoading] = useState(false); // Don't show loading if we have initial data
  const [loadingBearings, setLoadingBearings] = useState(true); // Separate loading state for bearings
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      // If we have initial machine data, show it immediately (don't show loading screen)
      // Always fetch full machine details and bearings from backend
      if (!initialMachine) {
        setLoading(true); // Only show loading if no initial data
      }
      setLoadingBearings(true);
      setError(null);

      try {
        // Fetch full machine details and bearings from backend
        const res = await fetchMachineDetails(id);

        // Check if response is valid
        if (!res) {
          setError("Failed to load machine data");
          setLoading(false);
          setLoadingBearings(false);
          return;
        }

        // Check if res.machine exists before accessing it
        if (!res.machine) {
          setError("Machine not found");
          setLoading(false);
          setLoadingBearings(false);
          return;
        }

        // Merge backend data with navigation state data
        // Priority: Keep ALL frontend (initialMachine) values, backend ONLY provides bearings
        // Don't overwrite frontend fields with backend "N/A" values
        setMachine({
          // Preserve ALL frontend values first
          ...initialMachine,
          // ONLY add bearings from backend - don't touch any other fields
          bearings: res.machine.bearings || []
          // Explicitly do NOT spread res.machine to avoid overwriting with "N/A" values
        });

      } catch (e) {
        setError("Failed to load machine data");
        // If we have initial machine data, keep showing it even on error
        if (!initialMachine) {
          setMachine(null);
        }
      } finally {
        setLoading(false);
        setLoadingBearings(false);
      }
    };

    load();
  }, [id, initialMachine]);

  const calculateMetrics = (rawData) => {
    if (!rawData || rawData.length === 0) return { velocity: 0, acceleration: 0 };
    // Basic RMS calculation (assuming rawData is velocity or acceleration waveforms)
    // In reality, this depends on what the raw data represents. Assuming standard waveform.
    const sumSquares = rawData.reduce((acc, val) => acc + val * val, 0);
    const rms = Math.sqrt(sumSquares / rawData.length);
    const peak = Math.max(...rawData.map(Math.abs));
    return { velocity: rms.toFixed(3), acceleration: (peak / 9.81).toFixed(3) }; // Very rough approximation
  };

  const generateReport = async () => {
    if (!reportRef.current) return;
    setIsGeneratingReport(true);

    try {
      const allMeasurements = [];
      const allFFTData = [];
      const bearings = machine.bearings || [];
      const currentDate = new Date().toLocaleDateString();

      // Fetch data for each bearing and axis
      // Limit to first 2 bearings to avoid overwhelming requests if many bearings
      const bearingsToProcess = bearings;

      for (const bearing of bearingsToProcess) {
        for (const axis of ['V-Axis', 'H-Axis', 'A-Axis']) {
          const axisCode = axis.charAt(0);
          try {
            const res = await fetchBearingData(id, bearing._id, "OFFLINE", axis);
            const rawData = (res && res.data && res.data.rawData) ? res.data.rawData : [];
            const sr = (res && res.data && res.data.SR) ? parseFloat(res.data.SR) : 20000;

            if (rawData.length > 0) {
              const metrics = calculateMetrics(rawData);
              allMeasurements.push({
                pointName: `${bearing._id} (${bearing.bearingType || 'Bearing'})`,
                date: currentDate,
                axis: axisCode,
                velocity: metrics.velocity,
                acceleration: metrics.acceleration,
                envelope: '0.00', // Envelope data not usually in raw waveform
                temp: 'N/A'
              });

              allFFTData.push({
                title: `${bearing._id} – ${axisCode} Axis`,
                rawData: rawData,
                sr: sr
              });
            }
          } catch (e) {
            console.warn(`Failed to fetch report data for ${bearing._id} ${axis}`, e);
          }
        }
      }

      // Update report data state
      setReportData({
        measurements: allMeasurements.length > 0 ? allMeasurements : [],
        observations: ["Vibration levels analyzed from latest data.", "FFT charts generated for available axes."],
        recommendations: ["Review critical axes.", "Monitor trends."],
        fftData: allFFTData
      });

      // Wait for React to render the report with new data
      await new Promise(resolve => setTimeout(resolve, 1000));

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`Vibration_Report_${machine?.name || 'Machine'}.pdf`);
    } catch (err) {
      console.error("Report generation failed:", err);
      alert("Failed to generate report");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Show loading only if we don't have initial machine data
  if (loading && !machine) return <div className={styles.loading}>Loading...</div>;
  if (error && !machine) return <div className={styles.error}>{error}</div>;
  if (!machine) return <div className={styles.error}>No data found.</div>;

  return (
    <div className={styles.detailContainer}>
      {/* Hidden Report Container */}
      <div style={{ position: 'absolute', top: -10000, left: -10000 }}>
        {machine && (
          <MachineReport
            ref={reportRef}
            machine={machine}
            measurements={reportData.measurements}
            observations={reportData.observations}
            recommendations={reportData.recommendations}
            fftData={reportData.fftData}
          />
        )}
      </div>

      <div className={styles.headerSection}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className={styles.title}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 12, verticalAlign: 'middle', color: '#6366f1' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
              {machine.name}
            </h2>
          </div>
          <button
            onClick={generateReport}
            disabled={isGeneratingReport}
            className={styles.showChartsButton}
            style={{ background: '#10b981', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)', opacity: isGeneratingReport ? 0.7 : 1 }}
          >
            {isGeneratingReport ? (
              <>
                <div className={styles.buttonSpinner} style={{ marginRight: 8 }}></div>
                Generating...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Generate Report
              </>
            )}
          </button>
        </div>
        <p className={styles.subtitle}>Detailed machine information and bearing data</p>
      </div>
      <div className={styles.infoSection}>
        <div className={styles.infoCard}>
          <div className={styles.infoIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
          </div>
          <div className={styles.infoContent}>
            <div className={styles.infoLabel}>Machine ID</div>
            <IdDisplay value={machine._id || id} />
          </div>
        </div>
        <div className={styles.infoCard}>
          <div className={styles.infoIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className={styles.infoContent}>
            <div className={styles.infoLabel}>Customer ID</div>
            <IdDisplay value={machine.customerId} />
          </div>
        </div>
        <div className={styles.infoCard}>
          <div className={styles.infoIcon} style={{ background: STATUS_COLORS[machine.statusName] ? `${STATUS_COLORS[machine.statusName]}20` : '#e2e8f020' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <div className={styles.infoContent}>
            <div className={styles.infoLabel}>Status</div>
            <div className={styles.infoValue}>
              <span className={styles.statusBadgeDetail} style={{ background: STATUS_COLORS[machine.statusName] || '#64748b' }}>
                {machine.statusName}
              </span>
            </div>
          </div>
        </div>
        <div className={styles.infoCard}>
          <div className={styles.infoIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
          </div>
          <div className={styles.infoContent}>
            <div className={styles.infoLabel}>Area ID</div>
            <IdDisplay value={machine.areaId} />
          </div>
        </div>
        <div className={styles.infoCard}>
          <div className={styles.infoIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
          </div>
          <div className={styles.infoContent}>
            <div className={styles.infoLabel}>Type</div>
            <div className={styles.infoValue}>{machine.machineType || machine.type || "N/A"}</div>
          </div>
        </div>
        <div className={styles.infoCard}>
          <div className={styles.infoIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className={styles.infoContent}>
            <div className={styles.infoLabel}>Last Updated</div>
            <div className={styles.infoValue}>
              {machine.dataUpdatedTime && machine.dataUpdatedTime !== "N/A" ? (() => {
                try {
                  const date = new Date(machine.dataUpdatedTime);
                  return isNaN(date.getTime()) ? machine.dataUpdatedTime : date.toLocaleString();
                } catch {
                  return machine.dataUpdatedTime;
                }
              })() : "N/A"}
            </div>
          </div>
        </div>
      </div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 className={styles.subtitle} style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8, verticalAlign: 'middle', color: '#6366f1' }}>
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Bearings
        </h3>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className={styles.machineTable} style={{ width: '100%', marginBottom: 24 }}>
          <thead>
            <tr>
              <th>Bearing ID</th>
              <th>Status</th>
              <th>FFT</th>
            </tr>
          </thead>
          <tbody>
            {loadingBearings ? (
              <tr><td colSpan={3} style={{ textAlign: 'center', padding: '20px' }}>Loading bearings...</td></tr>
            ) : machine.bearings && machine.bearings.length > 0 ? (
              machine.bearings.map((bearing, idx) => (
                <BearingRowWithFFT
                  key={bearing._id || idx}
                  bearing={bearing}
                  machineType={machine.machineType || machine.type || "OFFLINE"}
                />
              ))
            ) : (
              <tr><td colSpan={3}>No bearings found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div >
  );
};


const BearingRowWithFFT = ({ bearing, machineType = "OFFLINE" }) => {
  const [axisData, setAxisData] = useState({
    "V-Axis": { rawData: null, sr: null, timeSeriesData: null, error: null },
    "H-Axis": { rawData: null, sr: null, timeSeriesData: null, error: null },
    "A-Axis": { rawData: null, sr: null, timeSeriesData: null, error: null },
  });
  const [loading, setLoading] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [activeAxis, setActiveAxis] = useState("V-Axis"); // Default active tab
  const { id: machineId } = useParams();

  const loadData = async () => {
    setLoading(true);
    // Reset errors
    setAxisData(prev => ({
      "V-Axis": { ...prev["V-Axis"], error: null },
      "H-Axis": { ...prev["H-Axis"], error: null },
      "A-Axis": { ...prev["A-Axis"], error: null },
    }));

    try {
      const dataType = (machineType && machineType.toUpperCase() === "ONLINE") ? "ONLINE" : "OFFLINE";
      const axes = ["V-Axis", "H-Axis", "A-Axis"];

      // Fetch all axes in parallel
      const results = await Promise.all(axes.map(async (axis) => {
        try {
          const res = await fetchBearingData(machineId, bearing._id, dataType, axis);
          const rowdata = (res && res.data && res.data.rawData) ? res.data.rawData :
            (res && res.data && res.data.rowdata) ? res.data.rowdata : [];
          const sr = (res && res.data && res.data.SR) ? parseFloat(res.data.SR) : 20000;
          const tsData = rowdata.length > 0 ? rowdata.map((y, x) => ({ x, y })) : [];

          return { axis, rawData: rowdata, sr, timeSeriesData: tsData, error: (!rowdata || rowdata.length === 0) ? "No data available" : null };
        } catch (e) {
          return { axis, rawData: [], sr: 20000, timeSeriesData: [], error: "Failed to load data" };
        }
      }));

      // Update state with results
      const newData = {};
      results.forEach(r => {
        newData[r.axis] = {
          rawData: r.rawData,
          sr: r.sr,
          timeSeriesData: r.timeSeriesData,
          error: r.error
        };
      });

      setAxisData(newData);
      setShowCharts(true);

    } catch (e) {
      console.error("Error loading bearing data:", e);
    } finally {
      setLoading(false);
    }
  };

  const currentAxisState = axisData[activeAxis];

  return (
    <React.Fragment>
      <tr>
        <td>{bearing._id}</td>
        <td>{bearing.statusName}</td>
        <td>
          <button
            onClick={loadData}
            disabled={loading}
            className={styles.showChartsButton}
          >
            {loading ? (
              <>
                <div className={styles.buttonSpinner}></div>
                Loading...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                Show Charts
              </>
            )}
          </button>
        </td>
      </tr>
      {showCharts && (
        <tr>
          <td colSpan={3} style={{ padding: 0 }}>
            <div className={styles.tabsContainer}>

              {/* Axis Tabs */}
              <div className={styles.tabsList}>
                {["V-Axis", "H-Axis", "A-Axis"].map(axis => (
                  <button
                    key={axis}
                    onClick={() => setActiveAxis(axis)}
                    className={`${styles.tabButton} ${activeAxis === axis ? styles.tabButtonActive : ''}`}
                  >
                    {axis === "V-Axis" ? "Vertical" : axis === "H-Axis" ? "Horizontal" : "Axial"}
                  </button>
                ))}
              </div>

              {/* Chart Content */}
              {currentAxisState.error ? (
                <div className={styles.errorMessage} style={{ margin: 0 }}>{currentAxisState.error}</div>
              ) : (
                <div className="space-y-6">
                  <div className={styles.chartSection}>
                    <h4 className={styles.chartTitle}>Time Series - {activeAxis === "V-Axis" ? "Vertical" : activeAxis === "H-Axis" ? "Horizontal" : "Axial"}</h4>
                    <TimeSeriesChart data={currentAxisState.timeSeriesData} />
                  </div>
                  <div>
                    <h4 className={styles.chartTitle}>Frequency Spectrum - {activeAxis === "V-Axis" ? "Vertical" : activeAxis === "H-Axis" ? "Horizontal" : "Axial"}</h4>
                    <FFTChart rawData={currentAxisState.rawData} sr={currentAxisState.sr} />
                  </div>
                </div>
              )}

            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
};


export default MachineDetail;