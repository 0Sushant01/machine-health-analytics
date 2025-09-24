
// src/components/StackedChart.js
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";


// Colors: green for Normal, yellow for Alert, red for Unacceptable, black for Satisfactory
const COLORS = {
  Normal: "#22c55e",        // green
  Alert: "#facc15",         // yellow
  Unacceptable: "#ef4444",  // red
  Satisfactory: "#000000"   // black
};

const StackedChart = ({ data, onBarClick }) => {
  const chartData = data.dates.map((date, i) => ({
    date,
    Normal: data.statuses.Normal[i],
    Satisfactory: data.statuses.Satisfactory[i],
    Alert: data.statuses.Alert[i],
    Unacceptable: data.statuses.Unacceptable[i]
  }));

  return (
    <BarChart width={600} height={300} data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Legend />
      {["Normal", "Alert", "Unacceptable", "Satisfactory"].map(status => (
        <Bar
          key={status}
          dataKey={status}
          stackId="a"
          fill={COLORS[status]}
          onClick={(_, index) => {
            if (typeof onBarClick === 'function') {
              const date = chartData[index]?.date;
              onBarClick({ status, date });
            }
          }}
        />
      ))}
    </BarChart>
  );
}

export default StackedChart;
