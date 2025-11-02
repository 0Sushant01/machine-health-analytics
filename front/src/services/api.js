// Fetch customer trend data (dummy, replace with real endpoint if available)
export const fetchCustomerTrend = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`http://localhost:8000/customer_trend?${query}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};
// Fetch bearing data for a given machineId and bearingId
// dataType should be "ONLINE" or "OFFLINE" based on machine type
export const fetchBearingData = async (machineId, bearingId, dataType = "OFFLINE") => {
  try {
    const url = `https://machine-health-analytics.onrender.com/machines/data/${machineId}/${bearingId}?data_type=${dataType}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};
// Fetch a single machine with bearings and FFT data
export const fetchMachineDetails = async (id) => {
  try {
    const res = await fetch(`https://machine-health-analytics.onrender.com/machines/${id}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};
export const fetchMachines = async (params) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`https://machine-health-analytics.onrender.com/machines?${query}`);
    if (!res.ok) return { machines: [] };
    return await res.json();
  } catch {
    return { machines: [] };
  }
};

// Changed / Added: normalize, subscriptions, improved update and helpers

// add missing machines cache used across helpers
const _machinesCache = [];

// helper to produce a stable key for deduplication
const _machineKey = (m) => {
  if (!m || typeof m !== "object") return JSON.stringify(m);
  return m?.id ?? m?._id ?? m?.machine_id ?? m?.machineId ?? JSON.stringify(m);
};

// normalize a machine-like object to predictable keys used for dedupe & filters
const _normalizeMachine = (raw) => {
  if (!raw || typeof raw !== "object") return null;
  const id = raw?.id ?? raw?._id ?? raw?.machine_id ?? raw?.machineId ?? null;
  const machine_id = raw?.machine_id ?? raw?.machineId ?? id;
  const customer_id = raw?.customer_id ?? raw?.customerId ?? raw?.customer ?? null;
  const status = raw?.status ?? raw?.state ?? null;
  // keep original payload for other fields
  return {
    ...raw,
    id,
    machine_id,
    customer_id,
    status,
  };
};

const _subscribers = new Set();

// notify subscribers (shallow copy)
const _notifySubs = () => {
  const snapshot = _machinesCache.slice();
  for (const cb of _subscribers) {
    try { cb(snapshot); } catch { /* ignore */ }
  }
};

// Replace the previous updateMachinesCache with normalization + notify
export const updateMachinesCache = (machines = []) => {
  if (!Array.isArray(machines) || machines.length === 0) {
    // still notify so UI can re-evaluate filters if needed
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

// replace entire cache (useful when table reloads whole dataset)
export const setMachinesCache = (machines = []) => {
  const norm = (Array.isArray(machines) ? machines.map((r) => _normalizeMachine(r) ?? r) : []);
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

// subscribe to cache changes, returns unsubscribe function
export const subscribeMachines = (callback) => {
  if (typeof callback !== "function") throw new Error("callback must be a function");
  _subscribers.add(callback);
  // immediate emit
  try { callback(_machinesCache.slice()); } catch {}
  return () => { _subscribers.delete(callback); };
};

// Added: get distinct values for requested fields from the machines cache
// fields: ['areaId','subAreaId','customerId', ...]
export const getFilterOptions = (fields = []) => {
  const result = {};
  if (!Array.isArray(fields) || fields.length === 0) return result;
  for (const field of fields) {
    const set = new Set();
    for (const m of _machinesCache) {
      // support nested keys like 'owner.name' if needed
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

// Accept table rows (DOM nodes or raw row objects) and a mapper that converts a row to a machine object.
// rows: iterable of row items
// mapper: function(row) => machineObject (optional). If not provided and rows are plain objects, they're used directly.
export const addMachinesFromTableRows = (rows = [], mapper = null) => {
  if (!rows || typeof rows[Symbol.iterator] !== "function") return _machinesCache.slice();
  const machines = [];
  for (const row of rows) {
    try {
      const m = typeof mapper === "function" ? mapper(row) : row;
      if (m) machines.push(m);
    } catch {
      /* ignore bad rows */
    }
  }
  return updateMachinesCache(machines);
};
