import React, { useState } from "react";

const Filters = ({ setFilters }) => {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const applyFilter = () => {
    setFilters({ date_from: dateFrom, date_to: dateTo });
  };

  return (
    <div className="flex gap-4 items-center">
      <div>
        <label className="block text-sm font-medium text-gray-700">From</label>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border p-2 rounded" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">To</label>
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border p-2 rounded" />
      </div>
      <button onClick={applyFilter} className="px-4 py-2 bg-blue-500 text-white rounded-lg">Apply</button>
    </div>
  );
};

export default Filters;
