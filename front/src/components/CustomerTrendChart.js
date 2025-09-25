import React from "react";


import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);


// machines: array of machine objects
const CustomerTrendChart = ({ machines }) => {
  // Build trend data: x-axis = date, y-axis = count per customer per date
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
  const datasets = customerIds.map((customerId, idx) => ({
    label: customerId,
    data: dates.map(date => dateCustomerMap[date][customerId] || 0),
    borderColor: `hsl(${idx * 60}, 70%, 50%)`,
    backgroundColor: "transparent",
    tension: 0.2
  }));
  const chartData = { labels: dates, datasets };
  const options = { responsive: true, plugins: { legend: { position: "top" } } };
  return (
    <div style={{ width: "100%", maxWidth: 800, margin: "0 auto 30px auto" }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default CustomerTrendChart;
