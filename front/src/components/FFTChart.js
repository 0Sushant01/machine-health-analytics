import React, { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ReferenceLine, Brush } from "recharts";
import FFT from "fft.js";
import MetricsPanel from './MetricsPanel';

// Custom tooltip for FFT
const FFTTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#1e293b' }}>
          Frequency: {data.frequency.toFixed(2)} Hz
        </p>
        <p style={{ margin: 0, color: '#3b82f6', fontWeight: 500 }}>
          Amplitude: {data.amplitude.toFixed(4)}
        </p>
      </div>
    );
  }
  return null;
};

function nearestPowerOfTwo(n) {
  return Math.pow(2, Math.floor(Math.log2(n)));
}

const computeFFTData = (rawData, sr) => {
  if (!rawData || rawData.length < 2 || !sr) return [];
  // fft.js requires N to be a power of two and > 1
  const N = nearestPowerOfTwo(rawData.length);
  if (N < 2) return [];
  const input = rawData.slice(0, N);
  const fft = new FFT(N);
  const out = fft.createComplexArray();
  const data = fft.toComplexArray(input);
  fft.transform(out, data);
  // Only first N/2 are unique for real input
  const amplitude = [];
  for (let i = 0; i < N / 2; i++) {
    const re = out[2 * i];
    const im = out[2 * i + 1];
    amplitude.push((2.0 / N) * Math.sqrt(re * re + im * im));
  }
  // Frequency bins
  const T = 1.0 / parseFloat(sr);
  const xf = Array.from({ length: N / 2 }, (_, i) => i / (N * T));
  // Return array of {frequency, amplitude}
  return xf.map((f, i) => ({ frequency: f, amplitude: amplitude[i] }));
};

// Props: rawData (array), sr (sample rate)
const FFTChart = ({ rawData, sr }) => {
  const [frequencyRange, setFrequencyRange] = useState(null);
  
  const fftData = useMemo(() => computeFFTData(rawData, sr), [rawData, sr]);
  
  // Calculate FFT statistics
  const stats = useMemo(() => {
    if (!fftData || fftData.length === 0) return null;
    const amplitudes = fftData.map(d => d.amplitude);
    const maxAmplitude = Math.max(...amplitudes);
    const maxIndex = amplitudes.indexOf(maxAmplitude);
    const dominantFreq = fftData[maxIndex].frequency;
    const meanAmplitude = amplitudes.reduce((a, b) => a + b, 0) / amplitudes.length;
    const totalPower = amplitudes.reduce((a, b) => a + b * b, 0);
    
    return { maxAmplitude, dominantFreq, meanAmplitude, totalPower, count: fftData.length };
  }, [fftData]);

  // Filter data based on frequency range if set
  const displayData = useMemo(() => {
    if (!frequencyRange || !fftData) return fftData;
    return fftData.filter(d => d.frequency >= frequencyRange[0] && d.frequency <= frequencyRange[1]);
  }, [fftData, frequencyRange]);

  if (!fftData || fftData.length === 0) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: '#64748b',
        background: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #e2e8f0'
      }}>
        No FFT data available
      </div>
    );
  }

  const maxFreq = fftData[fftData.length - 1].frequency;

  return (
    <div className="space-y-4">
      <div style={{
        width: "100%",
        background: '#ffffff',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        marginTop: '16px'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#3b82f6' }}>
                <path d="M12 2v20M2 12h20" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Frequency Spectrum (FFT)
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#64748b' }}>
              Sample Rate: {sr.toLocaleString()} Hz | Max Frequency: {maxFreq.toFixed(2)} Hz | {stats.count.toLocaleString()} bins
            </p>
          </div>
          
          {/* Statistics */}
          {stats && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '12px',
              flex: 1,
              maxWidth: '600px'
            }}>
              <div style={{ background: '#eff6ff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: 600 }}>Dominant Freq</div>
                <div style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: 700 }}>{stats.dominantFreq.toFixed(2)} Hz</div>
              </div>
              <div style={{ background: '#f0fdf4', padding: '8px 12px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>Peak Amplitude</div>
                <div style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: 700 }}>{stats.maxAmplitude.toFixed(4)}</div>
              </div>
              <div style={{ background: '#faf5ff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e9d5ff' }}>
                <div style={{ fontSize: '0.75rem', color: '#6b21a8', fontWeight: 600 }}>Mean Amplitude</div>
                <div style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: 700 }}>{stats.meanAmplitude.toFixed(4)}</div>
              </div>
            </div>
          )}
        </div>

        {/* Chart */}
        <div style={{ width: "100%", height: 400 }}>
          <ResponsiveContainer>
            <LineChart 
              data={displayData} 
              margin={{ top: 10, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis
                dataKey="frequency"
                type="number"
                domain={frequencyRange ? [frequencyRange[0], frequencyRange[1]] : [0, 'dataMax']}
                label={{ value: 'Frequency (Hz)', position: 'insideBottom', offset: -10, style: { fontSize: '12px', fill: '#64748b', fontWeight: 600 } }}
                tick={{ fontSize: 11, fill: '#64748b' }}
                stroke="#94a3b8"
                allowDecimals={true}
              />
              <YAxis
                label={{ value: 'Amplitude', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: '#64748b', fontWeight: 600 } }}
                tick={{ fontSize: 11, fill: '#64748b' }}
                stroke="#94a3b8"
                domain={[0, 'auto']}
              />
              <Tooltip content={<FFTTooltip />} />
              {stats && (
                <ReferenceLine 
                  x={stats.dominantFreq} 
                  stroke="#ef4444" 
                  strokeDasharray="3 3" 
                  label={{ value: `Peak: ${stats.dominantFreq.toFixed(2)} Hz`, position: 'top', fill: '#ef4444' }}
                />
              )}
              <Line
                type="monotone"
                dataKey="amplitude"
                stroke="url(#colorFFT)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#3b82f6' }}
                isAnimationActive={false}
              />
              <Brush 
                dataKey="frequency" 
                height={30}
                stroke="#3b82f6"
                onChange={(e) => {
                  if (e && e.startIndex !== undefined && e.endIndex !== undefined) {
                    const startFreq = displayData[e.startIndex]?.frequency || 0;
                    const endFreq = displayData[e.endIndex]?.frequency || maxFreq;
                    setFrequencyRange([startFreq, endFreq]);
                  } else {
                    setFrequencyRange(null);
                  }
                }}
              />
              <defs>
                <linearGradient id="colorFFT" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9}/>
                  <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#ec4899" stopOpacity={0.7}/>
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Zoom Controls */}
        <div style={{ marginTop: '12px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          {frequencyRange && (
            <button
              onClick={() => setFrequencyRange(null)}
              style={{
                padding: '6px 12px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                color: '#475569',
                fontSize: '0.875rem',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Reset Zoom
            </button>
          )}
          <button
            onClick={() => setFrequencyRange([0, maxFreq * 0.1])}
            style={{
              padding: '6px 12px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '6px',
              color: '#1e40af',
              fontSize: '0.875rem',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            0-10% Range
          </button>
        </div>
      </div>
      <MetricsPanel data={rawData} />
    </div>
  );
};

export default FFTChart;
