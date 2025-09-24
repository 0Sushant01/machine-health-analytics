// src/components/LineChart.js
import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const LineChart = ({ data }) => {
  if (!data || !data.hours) return null;

  const chartData = {
    labels: data.hours,
    datasets: Object.keys(data.values || {}).map((machine, idx) => ({
      label: machine,
      data: data.values[machine],
      borderColor: `hsl(${idx * 60}, 70%, 50%)`,
      backgroundColor: "transparent",
      tension: 0.2
    }))
  };

  const options = { responsive: true, plugins: { legend: { position: "top" } } };

  return (
    <div style={{ width: "100%", maxWidth: "800px", marginBottom: "30px" }}>
      <h3>Hourly Reading Trends</h3>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default LineChart;
