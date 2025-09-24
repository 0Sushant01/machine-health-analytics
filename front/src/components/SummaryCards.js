import React from "react";

const SummaryCard = ({ title, count, color }) => {
  return (
    <div
      className={`${color} text-white p-6 rounded-xl shadow-lg flex flex-col justify-center items-center transition transform hover:scale-105`}
      title={`${title}: ${count}`} // simple tooltip on hover
    >
      <h2 className="text-lg font-semibold uppercase">{title}</h2>
      <p className="text-4xl font-extrabold mt-2">{count}</p>
    </div>
  );
};

export default SummaryCard;
