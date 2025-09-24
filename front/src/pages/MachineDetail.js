import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchMachineDetails, fetchBearingData } from "../services/api";
import FFTChart from "../components/FFTChart";
import TimeSeriesChart from "../components/TimeSeriesChart";
import styles from "./MachineDetail.module.css";

const MachineDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [machine, setMachine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchMachineDetails(id);
        setMachine(res.machine);
      } catch (e) {
        setError("Failed to load machine data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!machine) return <div className={styles.error}>No data found.</div>;

  return (
    <div className={styles.detailContainer}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <button
          className={styles.navButton}
          onClick={() => navigate('/')}
        >
          Dashboard
        </button>
        <button
          className={styles.navButton}
          onClick={() => navigate('/machines')}
        >
          Machine List
        </button>
      </div>
      <h2 className={styles.title}>Machine Details: {machine.name || machine._id}</h2>
      <div className={styles.infoSection}>
        <div><strong>Customer ID:</strong> {machine.customerId}</div>
        <div><strong>Status:</strong> {machine.statusName}</div>
        <div><strong>Area ID:</strong> {machine.areaId}</div>
        <div><strong>Type:</strong> {machine.machineType}</div>
        <div><strong>Last Updated:</strong> {machine.dataUpdatedTime}</div>
      </div>
      <h3 className={styles.subtitle}>Bearings</h3>
      <div style={{overflowX: 'auto'}}>
        <table className={styles.machineTable} style={{width: '100%', marginBottom: 24}}>
          <thead>
            <tr>
              <th>Bearing ID</th>
              <th>Status</th>
              <th>FFT</th>
            </tr>
          </thead>
          <tbody>
            {machine.bearings && machine.bearings.length > 0 ? (
              machine.bearings.map((bearing, idx) => (
                <BearingRowWithFFT key={bearing._id || idx} bearing={bearing} />
              ))
            ) : (
              <tr><td colSpan={3}>No bearings found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};


function BearingRowWithFFT({ bearing }) {
  const [rawData, setRawData] = useState(null);
  const [sr, setSr] = useState(null);
  const [timeSeriesData, setTimeSeriesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCharts, setShowCharts] = useState(false);
  const { id: machineId } = useParams();

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchBearingData(machineId, bearing._id);
      const rowdata = res.rowdata || [];
      setRawData(rowdata);
      setSr(res.SR || 20000);
      // Time series data: [{x: sampleIndex, y: amplitude}]
      const tsData = rowdata.map((y, x) => ({ x, y }));
      setTimeSeriesData(tsData);
      setShowCharts(true);
    } catch (e) {
      setError("Failed to load bearing data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <React.Fragment>
      <tr>
        <td>{bearing._id}</td>
        <td>{bearing.statusName}</td>
        <td>
          <button onClick={loadData} disabled={loading} style={{margin: '4px 0', padding: '4px 12px'}}>
            {loading ? 'Loading...' : 'Show Charts'}
          </button>
          {error && <div style={{color: 'red'}}>{error}</div>}
        </td>
      </tr>
      {showCharts && (
        <tr>
          <td colSpan={3}>
            <div style={{marginBottom: 16}}>
              <TimeSeriesChart data={timeSeriesData} />
            </div>
            <FFTChart rawData={rawData} sr={sr} />
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}


export default MachineDetail;
