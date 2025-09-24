import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from "recharts";

const COLORS = [
  "#2563eb", "#22c55e", "#f59e42", "#ef4444", "#a855f7", "#14b8a6", "#fbbf24", "#6366f1",
  "#0ea5e9", "#f472b6", "#facc15", "#7c3aed", "#059669", "#eab308", "#f43f5e", "#3b82f6"
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // Find the first non-zero value (the hovered bar segment)
    const hovered = payload.find(entry => entry.value > 0);
    if (hovered && hovered.dataKey && hovered.value !== undefined) {
      return (
        <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '10px 18px', fontWeight: 600, color: '#1e293b', fontSize: 15, boxShadow: '0 2px 8px #e5e7eb' }}>
          <div>Date: <span style={{ color: '#2563eb' }}>{label}</span></div>
          <div>Customer ID: <span style={{ color: '#ef4444' }}>{hovered.dataKey}</span></div>
          <div>Machines: <span style={{ color: '#22c55e' }}>{hovered.value}</span></div>
        </div>
      );
    }
    // Fallback: show total only
    const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);
    return (
      <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '10px 18px', fontWeight: 600, color: '#1e293b', fontSize: 15, boxShadow: '0 2px 8px #e5e7eb' }}>
        <div>Date: <span style={{ color: '#2563eb' }}>{label}</span></div>
        <div>Total Machines: <span style={{ color: '#22c55e' }}>{total}</span></div>
      </div>
    );
  }
  return null;
};

// machines: array of machine objects
const CustomerTrendStackedChart = ({ machines, onBarClick }) => {
  const [popup, setPopup] = useState(null);
  if (!machines || machines.length === 0) return <div>No data</div>;
  // Map: {date: {customerId: count}}
  const dateCustomerMap = {};
  machines.forEach(m => {
    const date = m.dataUpdatedTime.split("T")[0];
    if (!dateCustomerMap[date]) dateCustomerMap[date] = {};
    dateCustomerMap[date][m.customerId] = (dateCustomerMap[date][m.customerId] || 0) + 1;
  });
  const dates = Object.keys(dateCustomerMap).sort();
  const customerIds = Array.from(new Set(machines.map(m => m.customerId)));
  // Build chart data for recharts
  const chartData = dates.map(date => {
    const entry = { date };
    customerIds.forEach(cid => {
      entry[cid] = dateCustomerMap[date][cid] || 0;
    });
    return entry;
  });
  // Handler for bar segment click
  const handleBarClick = (data, index, customerId) => {
    setPopup({ customerId });
    if (typeof onBarClick === 'function' && data && data.date) {
      onBarClick({ customerId, date: data.date });
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: 800, margin: "0 auto 30px auto", position: 'relative' }}>
      <h3>Customer Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          {/* Hide legend values, just show color dots */}
          <Legend formatter={() => ''} iconType="circle" />
          {customerIds.map((cid, idx) => (
            <Bar
              key={cid}
              dataKey={cid}
              stackId="a"
              fill={COLORS[idx % COLORS.length]}
              onClick={(data, index) => handleBarClick(data, index, cid)}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      {popup && (
        <div style={{
          position: 'absolute',
          top: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#fff',
          border: '2px solid #2563eb',
          borderRadius: 12,
          boxShadow: '0 4px 16px #e5e7eb',
          padding: '24px 40px',
          zIndex: 10,
          minWidth: 260,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#2563eb', marginBottom: 12 }}>Customer ID</div>
          <div style={{ fontSize: 18, color: '#1e293b', wordBreak: 'break-all', marginBottom: 18 }}>{popup.customerId}</div>
          <button
            style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 24px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
            onClick={() => setPopup(null)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerTrendStackedChart;
