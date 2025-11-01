import React, { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ReferenceLine, Legend } from "recharts";

// Custom tooltip component
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#1e293b' }}>
          Sample: {payload[0].payload.x}
        </p>
        <p style={{ margin: 0, color: '#10b981', fontWeight: 500 }}>
          Amplitude: {payload[0].value.toFixed(4)}
        </p>
      </div>
    );
  }
  return null;
};

// Expects data: [{x: sampleIndex, y: amplitude}]
const TimeSeriesChart = ({ data }) => {
  // Calculate statistics
  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;
    const values = data.map(d => d.y);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const rms = Math.sqrt(values.reduce((a, b) => a + b * b, 0) / values.length);
    const peakToPeak = max - min;
    
    return { max, min, mean, rms, peakToPeak, count: data.length };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: '#64748b',
        background: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #e2e8f0'
      }}>
        No time series data available
      </div>
    );
  }

  return (
    <div style={{
      width: "100%",
      background: '#ffffff',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#10b981' }}>
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            Time Series (Amplitude vs Sample)
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#64748b' }}>
            {stats.count.toLocaleString()} samples
          </p>
        </div>
        
        {/* Statistics */}
        {stats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '12px',
            flex: 1,
            maxWidth: '500px'
          }}>
            <div style={{ background: '#f0fdf4', padding: '8px 12px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>Max</div>
              <div style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: 700 }}>{stats.max.toFixed(3)}</div>
            </div>
            <div style={{ background: '#fef2f2', padding: '8px 12px', borderRadius: '8px', border: '1px solid #fecaca' }}>
              <div style={{ fontSize: '0.75rem', color: '#991b1b', fontWeight: 600 }}>Min</div>
              <div style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: 700 }}>{stats.min.toFixed(3)}</div>
            </div>
            <div style={{ background: '#eff6ff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: 600 }}>RMS</div>
              <div style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: 700 }}>{stats.rms.toFixed(3)}</div>
            </div>
            <div style={{ background: '#faf5ff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e9d5ff' }}>
              <div style={{ fontSize: '0.75rem', color: '#6b21a8', fontWeight: 600 }}>Peak-Peak</div>
              <div style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: 700 }}>{stats.peakToPeak.toFixed(3)}</div>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer>
          <LineChart 
            data={data} 
            margin={{ top: 10, right: 30, left: 20, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
            <XAxis 
              dataKey="x" 
              label={{ value: 'Sample Index', position: 'insideBottom', offset: -10, style: { fontSize: '12px', fill: '#64748b', fontWeight: 600 } }}
              tick={{ fontSize: 11, fill: '#64748b' }}
              stroke="#94a3b8"
            />
            <YAxis 
              label={{ value: 'Amplitude', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: '#64748b', fontWeight: 600 } }}
              tick={{ fontSize: 11, fill: '#64748b' }}
              stroke="#94a3b8"
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#cbd5e1" strokeDasharray="2 2" />
            {stats && (
              <>
                <ReferenceLine y={stats.mean} stroke="#3b82f6" strokeDasharray="2 2" label={{ value: `Mean: ${stats.mean.toFixed(3)}`, position: 'right' }} />
                <ReferenceLine y={stats.max} stroke="#10b981" strokeDasharray="2 2" opacity={0.5} />
                <ReferenceLine y={stats.min} stroke="#ef4444" strokeDasharray="2 2" opacity={0.5} />
              </>
            )}
            <Line 
              type="monotone" 
              dataKey="y" 
              stroke="url(#colorAmplitude)" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#10b981' }}
            />
            <defs>
              <linearGradient id="colorAmplitude" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#34d399" stopOpacity={0.3}/>
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TimeSeriesChart;
