// src/components/PieChart.js
import React from "react";
import { PieChart as RePieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#2563eb", "#22c55e", "#f59e42", "#ef4444", "#a855f7", "#14b8a6", "#fbbf24", "#6366f1"];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { _id, count } = payload[0].payload;
    return (
      <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '10px 18px', fontWeight: 600, color: '#1e293b', fontSize: 15, boxShadow: '0 2px 8px #e5e7eb' }}>
        <div>Area ID: <span style={{ color: '#2563eb' }}>{_id}</span></div>
        <div>Machines: <span style={{ color: '#22c55e' }}>{count}</span></div>
      </div>
    );
  }
  return null;
};

// No label rendering for slices
const PieChart = ({ data }) => (
  <div style={{ width: "100%", height: 360, display: "flex", justifyContent: "center", alignItems: "center" }}>
    <ResponsiveContainer width={420} height={340}>
      <RePieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="_id"
          cx="50%"
          cy="50%"
          outerRadius={110}
          label={false}
          labelLine={false}
          isAnimationActive={true}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        {/* Hide legend values, just show color dots */}
        <Legend
          verticalAlign="bottom"
          align="center"
          iconType="circle"
          formatter={() => ''}
        />
      </RePieChart>
    </ResponsiveContainer>
  </div>
);

export default PieChart;
