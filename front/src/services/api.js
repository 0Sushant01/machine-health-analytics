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
