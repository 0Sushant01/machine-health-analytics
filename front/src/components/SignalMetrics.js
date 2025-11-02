import React from 'react';
import { calculateCF, calculateKurtosis, getSeverityLevel, getSeverityColor, formatMetricValue, SIGNAL_THRESHOLDS } from '../services/api';

const MetricCard = ({ label, value, severity, info, thresholds }) => {
  const color = getSeverityColor(severity);
  
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200
                    border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-700">{label}</h3>
          <span className="px-3 py-1 rounded-full text-sm font-medium"
                style={{ backgroundColor: `${color}20`, color }}>
            {severity}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="text-4xl font-bold tracking-tight mb-2" style={{ color }}>
          {value}
        </div>
        <p className="text-sm text-gray-600 mb-3">{info}</p>
        
        <div className="space-y-2">
          {Object.entries(thresholds).map(([level, threshold]) => (
            <div key={level} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{level}</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getSeverityColor(level) }} />
                <span className="font-medium">{threshold}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function SignalMetrics({ fftData = [] }) {
  const cf = calculateCF(fftData);
  const kurtosis = calculateKurtosis(fftData);

  const metrics = [
    {
      label: 'Crest Factor (CF)',
      value: formatMetricValue(cf),
      severity: getSeverityLevel('CF', cf),
      info: 'Peak-to-RMS ratio indicating potential impulse faults',
      thresholds: SIGNAL_THRESHOLDS.CF
    },
    {
      label: 'Kurtosis',
      value: formatMetricValue(kurtosis),
      severity: getSeverityLevel('KURTOSIS', kurtosis),
      info: 'Statistical measure indicating potential bearing defects',
      thresholds: SIGNAL_THRESHOLDS.KURTOSIS
    }
  ];

  return (
    <div className="bg-gray-50 rounded-xl p-6 mt-8">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Signal Analysis Metrics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {metrics.map(metric => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>
    </div>
  );
}
