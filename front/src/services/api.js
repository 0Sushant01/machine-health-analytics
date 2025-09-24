// Fetch customer trend data (dummy, replace with real endpoint if available)
export const fetchCustomerTrend = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`http://localhost:8000/customer_trend?${query}`);
  if (!res.ok) throw new Error('No customer trend data');
  return await res.json();
};
// Fetch bearing data for a given machineId and bearingId
export const fetchBearingData = async (machineId, bearingId) => {
  const res = await fetch(`http://localhost:8000/machines/data/${machineId}/${bearingId}`);
  if (!res.ok) throw new Error('No data found');
  const data = await res.json();
  return data;
};
// Fetch a single machine with bearings and FFT data
export const fetchMachineDetails = async (id) => {
  const res = await fetch(`http://localhost:8000/machines/${id}`);
  const data = await res.json();
  return data;
};
export const fetchMachines = async (params) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`http://localhost:8000/machines?${query}`);
  const data = await res.json();
  return data;
};
