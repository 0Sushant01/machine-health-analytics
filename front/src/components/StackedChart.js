
// src/components/StackedChart.js
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";


// Colors: green for Normal, yellow for Alert, red for Unacceptable, black for Satisfactory
const COLORS = {
  Normal: "rgb(34, 197, 94)",        // green
  Alert: "rgb(250, 204, 21)",         // yellow
  Unacceptable: "rgb(239, 68, 68)",  // red
  Satisfactory: "rgb(59, 130, 246)"   // black
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
