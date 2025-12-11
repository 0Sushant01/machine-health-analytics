const BASE_URL = "http://127.0.0.1:8000";

// --- Simple loading emitter for global loader
const _loadingSubscribers = new Set();
let _loadingCount = 0;
// Watchdog to recover from unbalanced start/stop
let _watchdogTimer = null;
const WATCHDOG_MS = 20000;

const _notifyLoading = (isLoading) => {
  for (const cb of _loadingSubscribers) {
    try { cb(isLoading); } catch { /* ignore */ }
  }
};
export const subscribeLoading = (cb) => {
  if (typeof cb !== "function") throw new Error("callback must be a function");
  _loadingSubscribers.add(cb);
  try { cb(_loadingCount > 0); } catch { }
  return () => _loadingSubscribers.delete(cb);
};

const _clearWatchdog = () => {
  if (_watchdogTimer) {
    clearTimeout(_watchdogTimer);
    _watchdogTimer = null;
  }
};
const _startWatchdog = () => {
  _clearWatchdog();
  _watchdogTimer = setTimeout(() => {
    // force reset if something got stuck
    _loadingCount = 0;
    _notifyLoading(false);
    _watchdogTimer = null;
  }, WATCHDOG_MS);
};

const _startLoading = () => {
  _loadingCount += 1;
  if (_loadingCount === 1) _notifyLoading(true);
  _startWatchdog();
};
const _stopLoading = () => {
  _loadingCount = Math.max(0, _loadingCount - 1);
  if (_loadingCount === 0) {
    _notifyLoading(false);
    _clearWatchdog();
  } else {
    _startWatchdog();
  }
};

// exported helper to reset loading state manually (use for recovery)
export const resetLoading = () => {
  _loadingCount = 0;
  _clearWatchdog();
  _notifyLoading(false);
};

// --- Fetch helpers (wrap where needed to emit loading)
// make sure all primary fetch functions use start/stop to avoid stuck loader

export const fetchCustomerTrend = async (params = {}) => {
  _startLoading();
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`http://localhost:8000/customer_trend?${query}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    _stopLoading();
  }
};

export const fetchBearingData = async (machineId, bearingId, dataType = "OFFLINE", axis = "V-Axis") => {
  _startLoading();
  try {
    const url = `${BASE_URL}/machines/data/${machineId}/${bearingId}?data_type=${dataType}&axis=${axis}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    _stopLoading();
  }
};

export const fetchMachineDetails = async (id) => {
  _startLoading();
  try {
    const res = await fetch(`${BASE_URL}/machines/${id}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    _stopLoading();
  }
};

export const fetchMachines = async (params = {}) => {
  _startLoading();
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/machines?${query}`);
    if (!res.ok) return { machines: [] };
    return await res.json();
  } catch {
    return { machines: [] };
  } finally {
    _stopLoading();
  }
};

// Added: same as fetchMachines but without global loading emitter
export const fetchMachinesNoLoading = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/machines?${query}`);
    if (!res.ok) return { machines: [] };
    return await res.json();
  } catch {
    return { machines: [] };
  }
};

// --- In-memory cache + pub/sub for filters derived from table data
const _machinesCache = [];
const _subscribers = new Set();

const _machineKey = (m) => {
  if (!m || typeof m !== "object") return JSON.stringify(m);
  return m.id ?? m._id ?? m.machine_id ?? m.machineId ?? JSON.stringify(m);
};

const _normalizeMachine = (raw) => {
  if (!raw || typeof raw !== "object") return null;
  const id = raw.id ?? raw._id ?? raw.machine_id ?? raw.machineId ?? null;
  const machine_id = raw.machine_id ?? raw.machineId ?? id;
  const customer_id = raw.customer_id ?? raw.customerId ?? raw.customer ?? null;
  const status = raw.status ?? raw.state ?? null;
  return { ...raw, id, machine_id, customer_id, status };
};

const _notifySubs = () => {
  const snapshot = _machinesCache.slice();
  for (const cb of _subscribers) {
    try { cb(snapshot); } catch { /* ignore */ }
  }
};

export const updateMachinesCache = (machines = []) => {
  if (!Array.isArray(machines) || machines.length === 0) {
    _notifySubs();
    return _machinesCache.slice();
  }
  const map = new Map();
  for (const m of _machinesCache) map.set(_machineKey(m), m);
  for (const raw of machines) {
    const m = _normalizeMachine(raw) ?? raw;
    map.set(_machineKey(m), m);
  }
  const merged = Array.from(map.values());
  _machinesCache.length = 0;
  _machinesCache.push(...merged);
  _notifySubs();
  return _machinesCache.slice();
};

export const setMachinesCache = (machines = []) => {
  const norm = Array.isArray(machines) ? machines.map((r) => _normalizeMachine(r) ?? r) : [];
  _machinesCache.length = 0;
  _machinesCache.push(...norm);
  _notifySubs();
  return _machinesCache.slice();
};

export const clearMachinesCache = () => {
  _machinesCache.length = 0;
  _notifySubs();
  return [];
};

export const subscribeMachines = (callback) => {
  if (typeof callback !== "function") throw new Error("callback must be a function");
  _subscribers.add(callback);
  try { callback(_machinesCache.slice()); } catch { }
  return () => { _subscribers.delete(callback); };
};

export const getMachinesCache = () => _machinesCache.slice();

export const getFilterOptions = (fields = []) => {
  const result = {};
  if (!Array.isArray(fields) || fields.length === 0) return result;
  for (const field of fields) {
    const set = new Set();
    for (const m of _machinesCache) {
      const parts = field.split('.');
      let v = m;
      for (const p of parts) {
        v = v?.[p];
        if (v === undefined) break;
      }
      if (v !== undefined && v !== null && v !== '') set.add(String(v));
    }
    result[field] = Array.from(set).sort();
  }
  return result;
};

export const addMachinesFromTableRows = (rows = [], mapper = null) => {
  if (!rows || typeof rows[Symbol.iterator] !== "function") return _machinesCache.slice();
  const machines = [];
  for (const row of rows) {
    try {
      const m = typeof mapper === "function" ? mapper(row) : row;
      if (m && typeof m === "object" && !Array.isArray(m)) machines.push(m);
    } catch { /* ignore */ }
  }
  return updateMachinesCache(machines);
};

// --- Signal Analysis Constants & Thresholds ---
export const SIGNAL_THRESHOLDS = {
  CF: {
    NORMAL: 3,    // CF < 3: Normal
    WARNING: 4,    // 3 <= CF < 4: Caution
    ALERT: 6      // CF >= 6: Critical
  },
  KURTOSIS: {
    NORMAL: 3,    // K < 3: Normal
    WARNING: 5,    // 3 <= K < 5: Caution
    ALERT: 8      // K >= 8: Critical
  }
};

// Calculate Root Mean Square (RMS)
const _calculateRMS = (signal = []) => {
  if (!Array.isArray(signal) || signal.length === 0) return 0;
  const sumSquares = signal.reduce((acc, val) => acc + (val * val), 0);
  return Math.sqrt(sumSquares / signal.length);
};

// Calculate Peak Value
const _calculatePeak = (signal = []) => {
  if (!Array.isArray(signal) || signal.length === 0) return 0;
  return Math.max(...signal.map(Math.abs));
};

// Calculate Crest Factor (CF = Peak/RMS)
export const calculateCF = (signal = []) => {
  const rms = _calculateRMS(signal);
  if (rms === 0) return 0;
  return _calculatePeak(signal) / rms;
};

// Calculate Kurtosis
export const calculateKurtosis = (signal = []) => {
  if (!Array.isArray(signal) || signal.length === 0) return 0;

  const mean = signal.reduce((acc, val) => acc + val, 0) / signal.length;
  const variance = signal.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / signal.length;

  if (variance === 0) return 0;

  const fourthMoment = signal.reduce((acc, val) =>
    acc + Math.pow(val - mean, 4), 0) / signal.length;

  return fourthMoment / Math.pow(variance, 2);
};

// Get severity level based on metric value
export const getSeverityLevel = (metric, value) => {
  const thresholds = SIGNAL_THRESHOLDS[metric];
  if (!thresholds) return 'UNKNOWN';

  if (value >= thresholds.ALERT) return 'CRITICAL';
  if (value >= thresholds.WARNING) return 'WARNING';
  if (value >= thresholds.NORMAL) return 'CAUTION';
  return 'NORMAL';
};

// Get color for severity level
export const getSeverityColor = (severity) => {
  switch (severity) {
    case 'CRITICAL': return '#dc2626'; // red-600
    case 'WARNING': return '#d97706';  // amber-600
    case 'CAUTION': return '#ca8a04';  // yellow-600
    case 'NORMAL': return '#16a34a';   // green-600
    default: return '#64748b';         // slate-500
  }
};

// Format metric value for display
export const formatMetricValue = (value) => {
  if (typeof value !== 'number' || !isFinite(value)) return 'N/A';
  return value.toFixed(3);
};

// Helper to calculate Report Metrics (matches MachineDetail.js logic)
const _calculateReportMetrics = (rawData) => {
  if (!rawData || rawData.length === 0) return { velocity: 0, acceleration: 0 };
  const sumSquares = rawData.reduce((acc, val) => acc + val * val, 0);
  const rms = Math.sqrt(sumSquares / rawData.length);
  const peak = Math.max(...rawData.map(Math.abs));
  // Matches MachineDetail.js: Acceleration = Peak / 9.81
  return { velocity: rms.toFixed(3), acceleration: (peak / 9.81).toFixed(3) };
};

// Fetch ALL data required for a single machine report (Details + Bearings + Signals)
export const fetchFullMachineReportData = async (machineId, overrideData = {}) => {
  try {
    // 1. Fetch Machine Details
    const res = await fetchMachineDetails(machineId);
    if (!res || !res.machine) return null;
    const machine = res.machine;
    // Ensure name is present for Header component using override if backend misses it
    machine.name = machine.name || machine.machineName || overrideData.name || overrideData.machineName || machine._id || "Unknown Machine";

    const allMeasurements = [];
    const allFFTData = [];
    const bearings = machine.bearings || [];

    const currentDate = new Date().toLocaleDateString();

    // 2. Iterate Bearings & Axes
    for (const bearing of bearings) {
      for (const axis of ['V-Axis', 'H-Axis', 'A-Axis']) {
        const axisCode = axis.charAt(0);
        try {
          // 3. Fetch Signal Data
          // Note: using offline data as per MachineDetail logic
          const signalRes = await fetchBearingData(machineId, bearing._id, "OFFLINE", axis);
          const rawData = (signalRes && signalRes.data && signalRes.data.rawData) ? signalRes.data.rawData : [];
          const sr = (signalRes && signalRes.data && signalRes.data.SR) ? parseFloat(signalRes.data.SR) : 20000;

          if (rawData.length > 0) {
            // Calculate metrics only if we have data
            const metrics = _calculateReportMetrics(rawData);

            allMeasurements.push({
              pointName: `${bearing._id} (${bearing.bearingType || 'Bearing'})`,
              date: currentDate,
              axis: axisCode,
              velocity: metrics.velocity,
              acceleration: metrics.acceleration,
              envelope: '0.00', // Placeholder as per current logic
              temp: 'N/A'
            });

            allFFTData.push({
              title: `${bearing._id} – ${axisCode} Axis`,
              rawData: rawData,
              sr: sr,
              pointName: bearing._id,
              axis: axisCode,
              description: `${bearing._id} - ${axisCode} Axis`
            });
          }
        } catch (e) {
          console.warn(`Failed to fetch report data for ${machineId} ${bearing._id} ${axis}`, e);
        }
      }
    }

    return {
      machine: machine,
      measurements: allMeasurements,
      fftData: allFFTData,
      observations: ["Vibration levels analyzed from latest data.", "FFT charts generated for available axes."],
      recommendations: ["Review critical axes.", "Monitor trends."]
    };

  } catch (error) {
    console.error("Error generating full machine report data:", error);
    return null;
  }
};
