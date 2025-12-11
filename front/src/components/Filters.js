import React, { useState, useEffect, useRef } from "react";

// Helper function to format date as YYYY-MM-DD
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get today's date only
const getTodayDate = () => {
  const today = new Date();
  return formatDate(today);
};

// compact: when true, render inline compact controls suitable for header rows
const Filters = ({ setFilters, compact = false, initialDateFrom = null, initialDateTo = null, filterOptions = {}, initialFilters = {} }) => {
  const todayDate = getTodayDate();
  const [dateFrom, setDateFrom] = useState(initialDateFrom || todayDate);
  const [dateTo, setDateTo] = useState(initialDateTo || todayDate);
  const [customerId, setCustomerId] = useState(initialFilters.customerId || "");
  const [statusName, setStatusName] = useState(initialFilters.statusName || "");
  const [areaId, setAreaId] = useState(initialFilters.areaId || "");

  const isInitialMount = useRef(true);

  // Sync with parent if initial dates/filters are provided
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // On initial mount, apply provided values or defaults
      setDateFrom(initialDateFrom || initialFilters.date_from || todayDate);
      setDateTo(initialDateTo || initialFilters.date_to || todayDate);
      setCustomerId(initialFilters.customerId || "");
      setStatusName(initialFilters.statusName || "");
      setAreaId(initialFilters.areaId || "");

      // If specifically passed initial dates separate from initialFilters object (legacy support)
      if (initialDateFrom && initialDateTo) {
        // already set above
      } else if (!initialFilters.date_from) {
        // triggering default set if nothing passed
        setFilters(prev => ({ ...prev, date_from: todayDate, date_to: todayDate }));
      }
    } else {
      // Subsequent updates looking at props? 
      // Usually Filters component drives the state, but if parent updates constraints we might need to react.
      // For now, let's trust internal state unless fully controlled.
    }
  }, [initialDateFrom, initialDateTo, initialFilters, setFilters, todayDate]);

  const applyFilter = () => {
    setFilters({
      date_from: dateFrom,
      date_to: dateTo,
      customerId,
      statusName,
      areaId
    });
  };

  const rootClass = compact ? "filters-compact" : "filters-full";

  const selectStyle = {
    background: '#ffffff',
    cursor: 'pointer',
    fontWeight: 500,
    color: '#1e293b',
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    minWidth: '120px',
    outline: 'none'
  };

  return (
    <div className={rootClass} style={{
      background: compact ? 'transparent' : '#ffffff',
      padding: compact ? '0' : '20px',
      borderRadius: compact ? '0' : '12px',
      boxShadow: compact ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      border: compact ? 'none' : '1px solid #e2e8f0',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '16px',
      alignItems: 'end',
      position: 'relative',
      zIndex: 20,
      width: '100%',
      marginBottom: '20px'
    }}>
      {/* Customer ID Filter */}
      <div className={compact ? "filters-field" : "filter-field-full"} style={{ display: 'flex', flexDirection: 'column', flex: '1 1 200px' }}>
        <label className={compact ? "filters-label" : "filter-label-full"} style={{ marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Customer ID</label>
        <select
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          style={selectStyle}
        >
          <option value="">All Customers</option>
          {filterOptions.customerId && filterOptions.customerId.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Area ID Filter */}
      <div className={compact ? "filters-field" : "filter-field-full"} style={{ display: 'flex', flexDirection: 'column', flex: '1 1 200px' }}>
        <label className={compact ? "filters-label" : "filter-label-full"} style={{ marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Area ID</label>
        <select
          value={areaId}
          onChange={(e) => setAreaId(e.target.value)}
          style={selectStyle}
        >
          <option value="">All Areas</option>
          {filterOptions.areaId && filterOptions.areaId.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {/* Status Filter */}
      <div className={compact ? "filters-field" : "filter-field-full"} style={{ display: 'flex', flexDirection: 'column', flex: '1 1 200px' }}>
        <label className={compact ? "filters-label" : "filter-label-full"} style={{ marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Status</label>
        <select
          value={statusName}
          onChange={(e) => setStatusName(e.target.value)}
          style={selectStyle}
        >
          <option value="">All Statuses</option>
          {["Normal", "Satisfactory", "Alert", "Unacceptable"].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Current Date Display */}
      <div className={compact ? "filters-field" : "filter-field-full"} style={{ display: 'flex', flexDirection: 'column', flex: '1 1 200px' }}>
        <label className={compact ? "filters-label" : "filter-label-full"} style={{ marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Date</label>
        <div style={{
          background: '#f1f5f9',
          padding: '8px 16px',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: 600,
          color: '#475569',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          height: '38px' // Match visually with select inputs
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {todayDate}
        </div>
      </div>

      <button
        onClick={applyFilter}
        className={compact ? "filters-apply-btn" : "filter-apply-btn-full"}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{
          filter: 'drop-shadow(0 1px 2px rgba(255, 255, 255, 0.3))'
        }}>
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontWeight: 600, letterSpacing: '0.3px' }}>Apply Filter</span>
      </button>
    </div >
  );
};

export default Filters;
