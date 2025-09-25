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
export const fetchBearingData = async (machineId, bearingId) => {
  try {
    const res = await fetch(`http://localhost:8000/machines/data/${machineId}/${bearingId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};
// Fetch a single machine with bearings and FFT data
export const fetchMachineDetails = async (id) => {
  try {
    const res = await fetch(`http://localhost:8000/machines/${id}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};
export const fetchMachines = async (params) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`http://localhost:8000/machines?${query}`);
    if (!res.ok) return { machines: [] };
    return await res.json();
  } catch {
    return { machines: [] };
  }
};
