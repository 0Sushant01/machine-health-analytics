import React, { useState } from "react";

// compact: when true, render inline compact controls suitable for header rows
const Filters = ({ setFilters, compact = false }) => {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const applyFilter = () => {
    setFilters({ date_from: dateFrom, date_to: dateTo });
  };

  const rootClass = compact ? "filters-compact" : "flex gap-4 items-center";

  return (
    <div className={rootClass}>
      <div className={compact ? "filters-field" : ""}>
        <label className={compact ? "filters-label" : "block text-sm font-medium text-gray-700"}>From</label>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={compact ? "filters-input-date" : "border p-2 rounded"} />
      </div>
      <div className={compact ? "filters-field" : ""}>
        <label className={compact ? "filters-label" : "block text-sm font-medium text-gray-700"}>To</label>
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={compact ? "filters-input-date" : "border p-2 rounded"} />
      </div>
      <button onClick={applyFilter} className={compact ? "filters-apply-btn" : "px-4 py-2 bg-blue-500 text-white rounded-lg"}>Apply</button>
    </div>
  );
};

export default Filters;
