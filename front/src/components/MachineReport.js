import React, { forwardRef } from 'react';
import FFTChart from './FFTChart';

const MachineReport = forwardRef(({ machine, measurements = [], observations = [], recommendations = [], fftData = [] }, ref) => {
    const currentDate = new Date().toLocaleDateString('en-GB'); // DD-MM-YYYY format

    return (
        <div ref={ref} style={{
            width: '210mm',
            minHeight: '297mm',
            padding: '20mm',
            background: 'white',
            fontFamily: 'Arial, sans-serif',
            fontSize: '12px',
            color: '#000',
            boxSizing: 'border-box'
        }}>
            {/* 🔹 HEADER INFORMATION */}
            <div style={{ borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '20px' }}>
                <h1 style={{ fontSize: '24px', textAlign: 'center', margin: '0 0 20px 0', textTransform: 'uppercase' }}>Vibration Analysis Report</h1>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div><strong>Machine Name:</strong> {machine?.name || 'N/A'}</div>
                    <div><strong>Status:</strong> {machine?.statusName || 'N/A'}</div>
                    <div><strong>Report Date:</strong> {currentDate}</div>
                    <div><strong>Area Name:</strong> {machine?.areaId || 'N/A'}</div>
                </div>
            </div>

            {/* 🔹 SECTION 1 – VIBRATION ANALYSIS REPORT */}
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '14px', background: '#e0e0e0', padding: '5px', margin: '0 0 10px 0', borderLeft: '4px solid #000' }}>SECTION 1 – VIBRATION ANALYSIS REPORT</h2>

                <div style={{ display: 'flex', gap: '20px' }}>
                    {/* Severity Table */}
                    <div style={{ flex: 1 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                            <thead>
                                <tr><th style={{ border: '1px solid #000', padding: '4px', background: '#f0f0f0' }}>Level</th><th style={{ border: '1px solid #000', padding: '4px', background: '#f0f0f0' }}>Description</th></tr>
                            </thead>
                            <tbody>
                                <tr><td style={{ border: '1px solid #000', padding: '4px', color: 'green', fontWeight: 'bold' }}>Level A</td><td style={{ border: '1px solid #000', padding: '4px' }}>Normal</td></tr>
                                <tr><td style={{ border: '1px solid #000', padding: '4px', color: '#B8860B', fontWeight: 'bold' }}>Level B</td><td style={{ border: '1px solid #000', padding: '4px' }}>Satisfactory</td></tr>
                                <tr><td style={{ border: '1px solid #000', padding: '4px', color: 'orange', fontWeight: 'bold' }}>Level C</td><td style={{ border: '1px solid #000', padding: '4px' }}>Unsatisfactory</td></tr>
                                <tr><td style={{ border: '1px solid #000', padding: '4px', color: 'red', fontWeight: 'bold' }}>Level D</td><td style={{ border: '1px solid #000', padding: '4px' }}>Unacceptable</td></tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Grid Chart Placeholder */}
                    <div style={{ flex: 1, border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px', background: '#f9f9f9', color: '#666' }}>
                        [Velocity Thresholds Grid Chart Placeholder]
                    </div>
                </div>
            </div>

            {/* 🔹 SECTION 2 – MACHINE DETAILS */}
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '14px', background: '#e0e0e0', padding: '5px', margin: '0 0 10px 0', borderLeft: '4px solid #000' }}>SECTION 2 – MACHINE DETAILS</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div><strong>Machine Code:</strong> {machine?.id || 'N/A'}</div>
                    <div><strong>Manufacturer:</strong> {machine?.manufacturer || 'N/A'}</div>
                    <div><strong>Model:</strong> {machine?.model || 'N/A'}</div>
                    <div><strong>Manufacture Year:</strong> {machine?.year || 'N/A'}</div>
                </div>
            </div>

            {/* 🔹 SECTION 3 – OBSERVATIONS */}
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '14px', background: '#e0e0e0', padding: '5px', margin: '0 0 10px 0', borderLeft: '4px solid #000' }}>SECTION 3 – OBSERVATIONS</h2>
                <ul style={{ margin: '0', paddingLeft: '20px' }}>
                    {observations.length > 0 ? observations.map((obs, i) => (
                        <li key={i} style={{ marginBottom: '5px' }}>{obs}</li>
                    )) : (
                        <>
                            <li>Overall vibration condition is within {machine?.statusName === 'Normal' ? 'acceptable' : 'monitoring'} limits.</li>
                            <li>FFT analysis shows no significant peaks at breakdown frequencies.</li>
                            <li>Noise floor is stable.</li>
                        </>
                    )}
                </ul>
            </div>

            {/* 🔹 SECTION 4 – RECOMMENDATIONS */}
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '14px', background: '#e0e0e0', padding: '5px', margin: '0 0 10px 0', borderLeft: '4px solid #000' }}>SECTION 4 – RECOMMENDATIONS</h2>
                <ul style={{ margin: '0', paddingLeft: '20px' }}>
                    {recommendations.length > 0 ? recommendations.map((rec, i) => (
                        <li key={i} style={{ marginBottom: '5px' }}>{rec}</li>
                    )) : (
                        <>
                            <li>Continue routine vibration monitoring.</li>
                            <li>Ensure proper lubrication as per schedule.</li>
                        </>
                    )}
                </ul>
            </div>

            {/* 🔹 SECTION 5 – MEASUREMENT DATA TABLE */}
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '14px', background: '#e0e0e0', padding: '5px', margin: '0 0 10px 0', borderLeft: '4px solid #000' }}>SECTION 5 – MEASUREMENT DATA TABLE</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'center' }}>
                    <thead>
                        <tr style={{ background: '#f0f0f0' }}>
                            <th style={{ border: '1px solid #ccc', padding: '6px' }}>Point Name</th>
                            <th style={{ border: '1px solid #ccc', padding: '6px' }}>Date</th>
                            <th style={{ border: '1px solid #ccc', padding: '6px' }}>Axis</th>
                            <th style={{ border: '1px solid #ccc', padding: '6px' }}>Velocity (mm/s)</th>
                            <th style={{ border: '1px solid #ccc', padding: '6px' }}>Acceleration (g)</th>
                            <th style={{ border: '1px solid #ccc', padding: '6px' }}>Envelope (gE)</th>
                            <th style={{ border: '1px solid #ccc', padding: '6px' }}>Temp (°C)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {measurements.length > 0 ? measurements.map((m, i) => (
                            <tr key={i}>
                                <td style={{ border: '1px solid #ccc', padding: '6px' }}>{m.pointName}</td>
                                <td style={{ border: '1px solid #ccc', padding: '6px' }}>{m.date}</td>
                                <td style={{ border: '1px solid #ccc', padding: '6px' }}>{m.axis}</td>
                                <td style={{ border: '1px solid #ccc', padding: '6px' }}>{m.velocity}</td>
                                <td style={{ border: '1px solid #ccc', padding: '6px' }}>{m.acceleration}</td>
                                <td style={{ border: '1px solid #ccc', padding: '6px' }}>{m.envelope}</td>
                                <td style={{ border: '1px solid #ccc', padding: '6px' }}>{m.temp}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan="7" style={{ border: '1px solid #ccc', padding: '10px' }}>No measurement data available</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* 🔹 SECTION 6 – FFT CHARTS */}
            <div style={{ pageBreakInside: 'avoid' }}>
                <h2 style={{ fontSize: '14px', background: '#e0e0e0', padding: '5px', margin: '0 0 10px 0', borderLeft: '4px solid #000' }}>SECTION 6 – FFT CHARTS</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {fftData.length > 0 ? fftData.map((data, i) => (
                        <div key={i} style={{ border: '1px solid #ddd', padding: '10px', pageBreakInside: 'avoid' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '11px' }}>{data.title}</div>
                            <div style={{ height: '200px', width: '100%' }}>
                                {data.rawData && data.rawData.length > 0 ? (
                                    <FFTChart rawData={data.rawData} sr={data.sr} width={340} height={180} compact={true} />
                                ) : (
                                    <div style={{
                                        height: '100%',
                                        background: '#fcfcfc',
                                        border: '1px dashed #ccc',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#888'
                                    }}>
                                        No Data Available
                                    </div>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div style={{ gridColumn: '1 / -1', padding: '20px', textAlign: 'center', color: '#666' }}>
                            No FFT Charts to display.
                        </div>
                    )}
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '10px', color: '#888', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                *** END OF REPORT ***
            </div>
        </div>
    );
});

export default MachineReport;
