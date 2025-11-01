import React, { useState, useEffect, useRef } from "react";

// Helper function to format date as YYYY-MM-DD
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get default dates: today and 7 days ago
const getDefaultDates = () => {
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);
  return {
    from: formatDate(sevenDaysAgo),
    to: formatDate(today)
  };
};

// compact: when true, render inline compact controls suitable for header rows
const Filters = ({ setFilters, compact = false, initialDateFrom = null, initialDateTo = null }) => {
  const defaultDates = getDefaultDates();
  const [dateFrom, setDateFrom] = useState(initialDateFrom || defaultDates.from);
  const [dateTo, setDateTo] = useState(initialDateTo || defaultDates.to);
  const isInitialMount = useRef(true);

  // Sync with parent if initial dates are provided, and apply on mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // On initial mount, apply dates
      if (initialDateFrom && initialDateTo) {
        setDateFrom(initialDateFrom);
        setDateTo(initialDateTo);
        setFilters({ date_from: initialDateFrom, date_to: initialDateTo });
      } else {
        const dates = getDefaultDates();
        setDateFrom(dates.from);
        setDateTo(dates.to);
        setFilters({ date_from: dates.from, date_to: dates.to });
      }
    } else {
      // On subsequent updates, sync with parent if dates are provided
      if (initialDateFrom && initialDateTo) {
        setDateFrom(initialDateFrom);
        setDateTo(initialDateTo);
      }
    }
  }, [initialDateFrom, initialDateTo, setFilters]);

  const applyFilter = () => {
    setFilters({ date_from: dateFrom, date_to: dateTo });
  };

  const rootClass = compact ? "filters-compact" : "filters-full";

  return (
    <div className={rootClass} style={{
      background: compact ? 'transparent' : 'rgba(255, 255, 255, 0.95)',
      padding: compact ? '0' : '16px',
      borderRadius: compact ? '0' : '16px',
      boxShadow: compact ? 'none' : '0 2px 8px rgba(0,0,0,0.05)',
      border: compact ? 'none' : '1px solid rgba(0,0,0,0.06)'
    }}>
      <div className={compact ? "filters-field" : "filter-field-full"} style={{ position: 'relative' }}>
        <label className={compact ? "filters-label" : "filter-label-full"}>
          {compact ? (
            <span style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              color: '#6366f1',
              fontWeight: 600
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ 
                filter: 'drop-shadow(0 1px 2px rgba(99, 102, 241, 0.3))'
              }}>
                <rect x="3" y="4" width="18" height="18" rx="3" ry="3" />
                <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
                <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
                <line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round" />
                <circle cx="8" cy="15" r="1" fill="currentColor" />
                <circle cx="12" cy="15" r="1" fill="currentColor" />
                <circle cx="16" cy="15" r="1" fill="currentColor" />
              </svg>
              <span>From</span>
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              From Date
            </span>
          )}
        </label>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          {/* Calendar Icon */}
          <svg 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#6366f1" 
            strokeWidth="2"
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              zIndex: 1,
              opacity: 0.7
            }}
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <input 
            type="date" 
            value={dateFrom} 
            onChange={(e) => setDateFrom(e.target.value)} 
            className={compact ? "filters-input-date" : "filter-input-full"}
            style={{
              background: '#ffffff',
              cursor: 'pointer',
              fontWeight: 500,
              color: '#1e293b',
              paddingLeft: '2.5rem'
            }}
          />
          {compact && (
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#94a3b8" 
              strokeWidth="2"
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                opacity: 0.6
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}
        </div>
      </div>
      
      {/* Arrow Icon Between Dates */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        paddingBottom: compact ? '0' : '24px',
        margin: compact ? '0 -4px' : '0 4px'
      }}>
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="#6366f1" 
          strokeWidth="3"
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(99, 102, 241, 0.3))',
            opacity: 0.8
          }}
        >
          <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div className={compact ? "filters-field" : "filter-field-full"} style={{ position: 'relative' }}>
        <label className={compact ? "filters-label" : "filter-label-full"}>
          {compact ? (
            <span style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              color: '#6366f1',
              fontWeight: 600
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ 
                filter: 'drop-shadow(0 1px 2px rgba(99, 102, 241, 0.3))'
              }}>
                <rect x="3" y="4" width="18" height="18" rx="3" ry="3" />
                <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
                <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
                <line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round" />
                <path d="M8 14h8M8 18h5" strokeLinecap="round" />
              </svg>
              <span>To</span>
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              To Date
            </span>
          )}
        </label>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          {/* Calendar Icon */}
          <svg 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#6366f1" 
            strokeWidth="2"
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              zIndex: 1,
              opacity: 0.7
            }}
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <input 
            type="date" 
            value={dateTo} 
            onChange={(e) => setDateTo(e.target.value)} 
            className={compact ? "filters-input-date" : "filter-input-full"}
            style={{
              background: '#ffffff',
              cursor: 'pointer',
              fontWeight: 500,
              color: '#1e293b',
              paddingLeft: '2.5rem'
            }}
          />
          {compact && (
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#94a3b8" 
              strokeWidth="2"
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                opacity: 0.6
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}
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
    </div>
  );
};

export default Filters;
