import React from 'react';
import { calculateCF, calculateKurtosis, getSeverityLevel, getSeverityColor, formatMetricValue, SIGNAL_THRESHOLDS } from '../services/api';

const MetricCard = ({ label, value, severity, info, thresholds }) => {
  const color = getSeverityColor(severity);
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 transition-all hover:shadow-md"
         style={{ borderLeftColor: color }}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm font-semibold text-gray-600">{label}</span>
        <div className="px-2 py-1 rounded text-xs font-medium" 
             style={{ backgroundColor: `${color}20`, color }}>
          {severity}
        </div>
      </div>
      <div className="text-2xl font-bold mb-1" style={{ color }}>{value}</div>
      <div className="text-xs text-gray-500 space-y-1">
        <p>{info}</p>
        <div className="flex gap-2 flex-wrap text-[11px]">
          {Object.entries(thresholds).map(([level, value]) => (
            <span key={level} className="px-1.5 py-0.5 bg-gray-100 rounded">
              {level}: {value}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function MetricsPanel({ data = [] }) {
  const cf = calculateCF(data);
  const kurtosis = calculateKurtosis(data);
  
  const metrics = [
    {
      label: 'Crest Factor (CF)',
      value: formatMetricValue(cf),
      severity: getSeverityLevel('CF', cf),
      info: 'Indicates peak-to-RMS ratio. Higher values suggest impulsive faults.',
      thresholds: SIGNAL_THRESHOLDS.CF
    },
    {
      label: 'Kurtosis',
      value: formatMetricValue(kurtosis),
      severity: getSeverityLevel('KURTOSIS', kurtosis),
      info: 'Measures signal peakedness. High values indicate potential bearing faults.',
      thresholds: SIGNAL_THRESHOLDS.KURTOSIS
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
      {metrics.map(metric => (
        <MetricCard key={metric.label} {...metric} />
      ))}
    </div>
  );
}
