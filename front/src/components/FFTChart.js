import React, { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import FFT from "fft.js";

// Accepts rawData (array of amplitudes) and sr (sample rate in Hz)

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
  const fftData = useMemo(() => computeFFTData(rawData, sr), [rawData, sr]);
  if (!fftData || fftData.length === 0) return <div>No FFT data</div>;
  return (
    <div style={{ width: "100%", height: 300, background: "#fff" }}>
      <h3 style={{ textAlign: "center", margin: 0, fontWeight: 500 }}>Frequency Spectrum (FFT)</h3>
      <ResponsiveContainer>
        <LineChart data={fftData} margin={{ top: 20, right: 30, left: 10, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="frequency"
            type="number"
            domain={[0, 'dataMax']}
            label={{ value: 'Frequency (Hz)', position: 'insideBottom', offset: -10 }}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            label={{ value: 'Amplitude', angle: -90, position: 'insideLeft', offset: 10 }}
            tick={{ fontSize: 12 }}
            domain={[0, 'auto']}
          />
          <Tooltip />
          <Line
            type="linear"
            dataKey="amplitude"
            stroke="#1976d2"
            dot={false}
            strokeWidth={2}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FFTChart;
