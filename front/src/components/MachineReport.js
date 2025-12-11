import React, { forwardRef } from 'react';
import FFTChart from './FFTChart';
import logo from '../logo.svg';

const PAGE_STYLE = {
    width: '210mm',
    height: '297mm',
    padding: '10mm 15mm', // Reduced padding to give more content space, standard is usually 20mm but we need to fit charts
    background: 'white',
    fontFamily: 'Arial, sans-serif',
    fontSize: '12px',
    color: '#000',
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden', // Ensure no spillover
    pageBreakAfter: 'always',
    marginBottom: '20px', // Visual gap in UI
    display: 'flex',
    flexDirection: 'column'
};

const Header = ({ machine, reportDate }) => (
    <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '60px' }}>
        <img src={logo} alt="AAMS" style={{ height: '40px' }} />
        <div style={{ textAlign: 'center', flex: 1 }}>
            <h2 style={{ fontSize: '18px', margin: 0, textTransform: 'uppercase' }}>{machine?.name || 'MACHINE REPORT'}</h2>
        </div>
        {/* Placeholder for JSW Logo to avoid 404/CORS issues */}
        <div style={{ padding: '5px', border: '1px dashed #ccc', color: '#666', fontSize: '10px' }}>[JSW Logo]</div>
    </div>
);

const Footer = ({ pageNum, totalPages }) => (
    <div style={{
        position: 'absolute',
        bottom: '10mm',
        left: '15mm',
        right: '15mm',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '10px',
        color: 'blue'
    }}>
        <a href="http://app.aams.io" style={{ textDecoration: 'none', color: 'blue' }}>http://app.aams.io</a>
        <span>Page: {pageNum + 1} / {totalPages}</span>
    </div>
);

const Page = forwardRef(({ children, machine, reportDate, pageNum, totalPages }, ref) => (
    <div ref={ref} className="report-page" style={PAGE_STYLE}>
        <Header machine={machine} reportDate={reportDate} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {children}
        </div>
        <Footer pageNum={pageNum} totalPages={totalPages} />
    </div>
));

export const SeverityMatrix = () => {
    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '8px',
        border: '2px solid #000',
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif'
    };
    const cellStyle = { border: '1px solid #000', padding: '0px', height: '14px' };
    const boldCellStyle = { ...cellStyle, fontWeight: 'bold' };

    // Colors
    const R = '#ff0000';
    const Y = '#ffff00';
    const G = '#339933'; // Slightly darker green matching image
    const B = '#0000ff';
    const W = '#ffffff'; // White for empty top right

    // Grid Rows (Top to Bottom) - Visual extraction from screenshot
    // Columns: [G4R, G4F, G3R, G3F, G2R, G2F, G1R, G1F]
    // Values: 11, 7.1, 4.5, 3.5, 2.8, 2.3, 1.4, 0.71
    const gridRows = [
        { colors: [R, R, R, R, R, R, R, R], valMm: '11', valIn: '0.44' },     // > 11
        { colors: [R, R, R, R, R, R, R, R], valMm: '7.1', valIn: '0.28' },    // 7.1 - 11
        { colors: [R, R, R, R, R, R, Y, Y], valMm: '4.5', valIn: '0.18' },    // 4.5 - 7.1
        { colors: [R, R, Y, Y, Y, Y, Y, Y], valMm: '3.5', valIn: '0.11' },    // 3.5 - 4.5
        { colors: [Y, Y, G, G, G, G, Y, Y], valMm: '2.8', valIn: '0.07' },    // 2.8 - 3.5
        { colors: [Y, Y, G, G, G, G, G, G], valMm: '2.3', valIn: '0.04' },    // 2.3 - 2.8
        { colors: [G, G, G, G, G, G, G, G], valMm: '1.4', valIn: '0.03' },    // 1.4 - 2.3
        { colors: [G, G, B, B, B, B, B, B], valMm: '0.71', valIn: '0.02' },   // 0.71 - 1.4
        { colors: [B, B, B, B, B, B, B, B], valMm: 'mm/s', valIn: 'in/s' },   // < 0.71 (Bottom Blue)
    ];

    const LegendItem = ({ letter, text, color }) => (
        <div style={{ display: 'flex', border: '1px solid #000', borderBottom: text === 'Vibration causes damage' ? '1px solid #000' : 'none', fontSize: '9px', lineHeight: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '15px', backgroundColor: color, color: 'white', fontWeight: 'bold', textAlign: 'center', borderRight: '1px solid #000' }}>{letter}</div>
            <div style={{ padding: '0 5px', backgroundColor: '#fff', flex: 1 }}>{text}</div>
        </div>
    );

    return (
        <div style={{ marginTop: '10px', width: '100%', fontFamily: 'Arial, sans-serif' }}>
            {/* Legend Section (Right Aligned) */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '5px' }}>
                <div style={{ width: '250px', borderBottom: '1px solid #000' }}>
                    <LegendItem letter="A" color={B} text="Newly Commissioned" />
                    <LegendItem letter="B" color={G} text="Unrestricted long-term operation" />
                    <LegendItem letter="C" color={Y} text="Restricted long-term operation" />
                    <LegendItem letter="D" color={R} text="Vibration causes damage" />
                </div>
            </div>

            {/* Header Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '11px', marginBottom: '2px' }}>
                <span>Velocity Threshold Values</span>
                <span>ISO 10816-3</span>
            </div>

            {/* Main Table */}
            <table style={tableStyle}>
                <tbody>
                    {/* Color Grid + Values + Side Header */}
                    {gridRows.map((row, idx) => (
                        <tr key={idx} style={{ height: '16px' }}>
                            {/* Color Cells */}
                            {row.colors.map((c, cIdx) => (
                                <td key={cIdx} style={{ ...cellStyle, backgroundColor: c, width: '6.5%' }}></td>
                            ))}

                            {/* Values */}
                            <td style={{ ...boldCellStyle, width: '8%', backgroundColor: '#fff' }}>{row.valMm}</td>
                            <td style={{ ...boldCellStyle, width: '8%', backgroundColor: '#fff' }}>{row.valIn}</td>

                            {/* Velocity Vertical Header (RowSpan) */}
                            {idx === 0 && (
                                <td rowSpan={9} style={{
                                    border: '2px solid #000',
                                    verticalAlign: 'middle',
                                    textAlign: 'center',
                                    width: '8%',
                                    backgroundColor: '#fff',
                                }}>
                                    <div style={{
                                        transform: 'rotate(-90deg)',
                                        whiteSpace: 'nowrap',
                                        fontWeight: 'bold',
                                        fontSize: '14px',
                                        width: '10px',
                                        margin: '0 auto',
                                        height: '100px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>Velocity</div>
                                </td>
                            )}
                        </tr>
                    ))}

                    {/* Footer Hierarchy */}
                    {/* Row 1: Rigid/Flexible */}
                    <tr>
                        <td style={boldCellStyle}>Rigid</td><td style={boldCellStyle}>Flexible</td>
                        <td style={boldCellStyle}>Rigid</td><td style={boldCellStyle}>Flexible</td>
                        <td style={boldCellStyle}>Rigid</td><td style={boldCellStyle}>Flexible</td>
                        <td style={boldCellStyle}>Rigid</td><td style={boldCellStyle}>Flexible</td>
                        <td colSpan={3} style={boldCellStyle}>Foundation</td>
                    </tr>

                    {/* Row 2: Machine Types (Pumps etc) */}
                    <tr>
                        <td colSpan={4} style={boldCellStyle}>Pumps &gt; 15 kW</td>
                        <td colSpan={2} style={boldCellStyle}>Medium sized Machines</td>
                        <td colSpan={2} style={boldCellStyle}>Large Machines</td>
                        <td rowSpan={3} colSpan={3} style={{ ...boldCellStyle, verticalAlign: 'middle' }}>Machine Type</td>
                    </tr>

                    {/* Row 3: Details */}
                    <tr>
                        <td colSpan={4} style={cellStyle}><span style={{ fontSize: '8px' }}>radial, axial, mixed flow</span></td>
                        <td colSpan={2} style={cellStyle}><span style={{ fontSize: '8px' }}>15 kW &lt; M 300kW</span></td>
                        <td colSpan={2} style={cellStyle}><span style={{ fontSize: '8px' }}>300 kW &lt; M &lt; 50MW</span></td>
                    </tr>

                    {/* Row 4: Mount/Motor */}
                    <tr>
                        <td colSpan={2} style={cellStyle}>Integrated Driver</td>
                        <td colSpan={2} style={cellStyle}>External Driver</td>
                        <td colSpan={2} style={cellStyle}>Motors<br />160mm &lt; H &lt; 315mm</td>
                        <td colSpan={2} style={cellStyle}>Motors<br />315mm &lt;= H</td>
                    </tr>

                    {/* Row 5: Group */}
                    <tr>
                        <td colSpan={2} style={{ ...boldCellStyle, borderBottom: '2px solid #000' }}>Group 4</td>
                        <td colSpan={2} style={{ ...boldCellStyle, borderBottom: '2px solid #000' }}>Group 3</td>
                        <td colSpan={2} style={{ ...boldCellStyle, borderBottom: '2px solid #000' }}>Group 2</td>
                        <td colSpan={2} style={{ ...boldCellStyle, borderBottom: '2px solid #000' }}>Group 1</td>
                        <td colSpan={3} style={{ ...boldCellStyle, borderBottom: '2px solid #000' }}>Group</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

const getStatusColor = (status) => {
    if (!status) return '#000';
    const s = status.toLowerCase();
    if (s.includes('normal')) return '#66aa00';
    if (s.includes('satisfactory')) return '#00ccff';
    if (s.includes('alert') || s.includes('unsatisfactory')) return '#ff8800';
    if (s.includes('unacceptable')) return '#ff0000';
    return '#000';
};

// Helper: Calculate number of pages this machine's report will take
export const calculateMachinePageCount = (measurements = [], fftData = [], skipMatrix = false) => {
    // 1. Matrix Page (skipMatrix ? 0 : 1)
    const matrixPages = skipMatrix ? 0 : 1;
    // 2. Details Page (always 1)
    const detailsPages = 1;
    // 3. Measurement Pages
    const measurementsPerPage = 15;
    const measurePages = measurements.length > 0 ? Math.ceil(measurements.length / measurementsPerPage) : 1;
    // 4. Chart Pages
    const chartsPerPage = 2;
    const chartPages = Math.ceil(fftData.length / chartsPerPage);

    return matrixPages + detailsPages + measurePages + chartPages;
};

const MachineReport = forwardRef(({ machine, measurements = [], observations = [], recommendations = [], fftData = [], skipMatrix = false, startPageNum = 0, globalTotalPages = null }, ref) => {
    const currentDate = new Date().toLocaleDateString('en-GB');

    // CHUNK DATA
    const measurementsPerPage = 15;
    const measurementChunks = [];
    if (measurements.length === 0) {
        measurementChunks.push([]);
    } else {
        for (let i = 0; i < measurements.length; i += measurementsPerPage) {
            measurementChunks.push(measurements.slice(i, i + measurementsPerPage));
        }
    }

    const chartsPerPage = 2;
    const fftChunks = [];
    if (fftData.length === 0) {
        // fftChunks.push([]); // Do not push empty if no charts
    } else {
        for (let i = 0; i < fftData.length; i += chartsPerPage) {
            fftChunks.push(fftData.slice(i, i + chartsPerPage));
        }
    }

    // CALCULATE TOTAL PAGES (or use override)
    const fixedPages = skipMatrix ? 1 : 2; // Matrix + Details (or just Details)
    const measurePages = measurementChunks.length > 0 ? measurementChunks.length : 1;
    const chartPages = fftChunks.length;
    const localTotalPages = fixedPages + measurePages + chartPages;
    const totalPages = globalTotalPages || localTotalPages;

    let pageCount = startPageNum;

    return (
        <div ref={ref} style={{ background: '#555', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            {/* PAGE 1: SEVERITY MATRIX (Optional) */}
            {!skipMatrix && (
                <Page machine={machine} reportDate={currentDate} pageNum={pageCount++} totalPages={totalPages}>
                    <div style={{ color: 'red', fontSize: '10px' }}>DEBUG: Measurements: {measurements.length}, FFT: {fftData.length}, Bearings: {machine?.bearings?.length}</div>
                    <div style={{ marginBottom: '10px', color: getStatusColor(machine?.statusName), fontWeight: 'bold' }}>Status: {machine?.statusName || 'N/A'}</div>
                    <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Area Name: {machine?.areaId || 'N/A'}</div>
                    <SeverityMatrix />
                </Page>
            )}

            {/* PAGE 2: MACHINE DETAILS + OBS/REC */}
            <Page machine={machine} reportDate={currentDate} pageNum={pageCount++} totalPages={totalPages}>
                <div style={{ marginBottom: '10px', color: getStatusColor(machine?.statusName), fontWeight: 'bold' }}>Status: {machine?.statusName || 'N/A'}</div>
                <div style={{ fontWeight: 'bold', marginBottom: '20px' }}>Area Name: {machine?.areaId || 'N/A'}</div>

                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px', marginBottom: '30px' }}>
                    <div style={{ fontWeight: 'bold' }}>Machine Code</div><div>{machine?.id || machine?._id}</div>
                    <div style={{ fontWeight: 'bold' }}>Manufacturer</div><div>{machine?.manufacturer || 'N/A'}</div>
                    <div style={{ fontWeight: 'bold' }}>Model</div><div>{machine?.model || 'N/A'}</div>
                    <div style={{ fontWeight: 'bold' }}>Manufacture Year</div><div>{machine?.year || 'N/A'}</div>
                </div>

                <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 1, border: '1px solid #eee', borderRadius: '5px', padding: '10px' }}>
                        <h3 style={{ color: 'blue', marginTop: 0 }}>Observation</h3>
                        <ul style={{ paddingLeft: '20px', fontSize: '11px' }}>
                            {observations.length > 0 ? observations.map((o, i) => <li key={i} style={{ marginBottom: '8px' }}>{o}</li>) : <li>No specific observations recorded.</li>}
                        </ul>
                    </div>
                    <div style={{ flex: 1, border: '1px solid #eee', borderRadius: '5px', padding: '10px' }}>
                        <h3 style={{ color: 'blue', marginTop: 0 }}>Recommendation</h3>
                        <ul style={{ paddingLeft: '20px', fontSize: '11px' }}>
                            {recommendations.length > 0 ? recommendations.map((r, i) => <li key={i} style={{ marginBottom: '8px' }}>{r}</li>) : <li>No specific recommendations recorded.</li>}
                        </ul>
                    </div>
                </div>
            </Page>

            {/* PAGE 3..: DATA TABLES */}
            {measurementChunks.map((chunk, index) => (
                <Page key={`measure-${index}`} machine={machine} reportDate={currentDate} pageNum={pageCount++} totalPages={totalPages}>
                    <div style={{ marginBottom: '10px', color: getStatusColor(machine?.statusName), fontWeight: 'bold' }}>Status: {machine?.statusName || 'N/A'}</div>
                    <div style={{ fontWeight: 'bold', marginBottom: '20px' }}>Area Name: {machine?.areaId || 'N/A'}</div>

                    <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>VIBRATION DATA LOG</h3>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', border: '1px solid #ccc' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa' }}>
                                <th style={{ textAlign: 'left', padding: '8px 6px', border: '1px solid #ccc', color: '#444' }}>Point Name</th>
                                <th style={{ textAlign: 'left', padding: '8px 6px', border: '1px solid #ccc', color: '#444' }}>Date</th>
                                <th style={{ textAlign: 'center', padding: '8px 6px', border: '1px solid #ccc', color: '#444' }}>Axis</th>
                                <th style={{ textAlign: 'center', padding: '8px 6px', border: '1px solid #ccc', color: '#444' }}>Vel (mm/s)</th>
                                <th style={{ textAlign: 'center', padding: '8px 6px', border: '1px solid #ccc', color: '#444' }}>Acc (g)</th>
                                <th style={{ textAlign: 'center', padding: '8px 6px', border: '1px solid #ccc', color: '#444' }}>Env (gE)</th>
                                <th style={{ textAlign: 'center', padding: '8px 6px', border: '1px solid #ccc', color: '#444' }}>Temp (C)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {chunk.length > 0 ? (
                                chunk.map((row, rIdx) => {
                                    // Simple conditional formatting logic for Velocity
                                    let velColor = '#000';
                                    if (row.velocity > 4.5) velColor = 'orange';
                                    if (row.velocity > 7.1) velColor = 'red';

                                    // RowSpan Logic for Point Name
                                    const isFirstOccurrence = rIdx === 0 || row.pointName !== chunk[rIdx - 1].pointName;
                                    let pointNameRowSpan = 1;
                                    if (isFirstOccurrence) {
                                        for (let i = rIdx + 1; i < chunk.length; i++) {
                                            if (chunk[i].pointName === row.pointName) {
                                                pointNameRowSpan++;
                                            } else {
                                                break;
                                            }
                                        }
                                    }

                                    return (
                                        <tr key={rIdx}>
                                            {isFirstOccurrence && (
                                                <td rowSpan={pointNameRowSpan} style={{ padding: '8px 6px', textAlign: 'left', border: '1px solid #ccc', verticalAlign: 'middle', backgroundColor: '#fff' }}>
                                                    {row.pointName}
                                                </td>
                                            )}
                                            <td style={{ padding: '8px 6px', textAlign: 'left', border: '1px solid #ccc', whiteSpace: 'nowrap' }}>{row.date}</td>
                                            <td style={{ padding: '8px 6px', textAlign: 'center', border: '1px solid #ccc' }}>{row.axis}</td>
                                            <td style={{ padding: '8px 6px', textAlign: 'center', border: '1px solid #ccc', color: velColor, fontWeight: 'bold' }}>{row.velocity}</td>
                                            <td style={{ padding: '8px 6px', textAlign: 'center', border: '1px solid #ccc', color: 'green', fontWeight: 'bold' }}>{row.acceleration}</td>
                                            <td style={{ padding: '8px 6px', textAlign: 'center', border: '1px solid #ccc', color: 'green', fontWeight: 'bold' }}>{row.envelope}</td>
                                            <td style={{ padding: '8px 6px', textAlign: 'center', border: '1px solid #ccc' }}>{row.temp || '-'}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#666', fontStyle: 'italic', border: '1px solid #ccc' }}>
                                        No measurement data available for this machine.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </Page>
            ))}

            {/* PAGE 4..: FFT CHARTS */}
            {fftChunks.map((chunk, index) => (
                <Page key={`fft-${index}`} machine={machine} reportDate={currentDate} pageNum={pageCount++} totalPages={totalPages}>
                    <div style={{ marginBottom: '10px', color: '#000' }}>Area Name: {machine?.areaId || 'N/A'}</div>

                    {chunk.map((chart, cIdx) => (
                        <div key={cIdx} style={{ marginBottom: '30px' }}>
                            <h4 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#333' }}>
                                FFT Series- {chart.title} {chart.date ? `> ${chart.date}` : ''}
                            </h4>
                            <div style={{ height: '250px', border: '1px solid #eee' }}>
                                <FFTChart rawData={chart.rawData} sr={chart.sr} width={650} height={250} compact={true} />
                            </div>
                            <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '5px 10px', marginTop: '5px', fontSize: '11px' }}>
                                <strong>Description:</strong> {chart.description || `${chart.pointName} - ${chart.axis}`}
                            </div>
                        </div>
                    ))}
                </Page>
            ))}

        </div>
    );
});

export const CombinedMachineReport = forwardRef(({ machinesData = [] }, ref) => {
    // Matrix Page is Page 0 for calc, but displayed as 1
    // Combined Report:
    // So if startPageNum is 0, First Page is 1.
    // Combined Report:
    // Page 0: Global Matrix (Displayed as 1)
    // Page 1...: Machine 1 (Displayed as 2...)

    // 1. Calculate Global Total Pages
    let totalPages = 1; // 1 for Matrix

    // Cache page counts to avoid recalculating during render
    const machinePageCounts = machinesData.map(data =>
        calculateMachinePageCount(data.measurements, data.fftData, true) // skipMatrix = true
    );

    totalPages += machinePageCounts.reduce((sum, c) => sum + c, 0);

    let pageCounter = 0; // Current Page Index (0-based)

    return (
        <div ref={ref} style={{ background: '#555', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Page 1: Global Severity Matrix */}
            <Page machine={{ name: "Combined Report" }} reportDate={new Date().toLocaleDateString('en-GB')} pageNum={pageCounter++} totalPages={totalPages}>
                <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>Multi-Machine Analysis Report</div>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Generated on: {new Date().toLocaleDateString('en-GB')}</div>
                <SeverityMatrix />
            </Page>

            {/* Machine Reports */}
            {machinesData.map((data, idx) => {
                const count = machinePageCounts[idx];
                const content = (
                    <div key={idx} style={{ display: 'contents' }}> {/* Wrapper to avoid breaking flex layout if needed, but MachineReport returns a div. */}
                        {/* We need to render the CONTENT of MachineReport, but MachineReport renders a wrapper div. 
                             This wrapper div style (padding/flex) might double up. 
                             Ideally MachineReport should return Fragments of Pages?
                             But MachineReport returns a div with ref.
                             If we render multiple MachineReports, we get multiple wrapper divs.
                             That is fine as long as html2canvas sees them.
                             BUT we want seamless PDF. html2canvas captures the ROOT ref.
                             So we will have:
                             <CombinedContent>
                               <Page .../>
                               <MachineReportWrapper>...<Page/></MachineReportWrapper>
                               ...
                             </CombinedContent>
                             The inner wrapper style might add padding/background which is weird for print?
                             The inner wrapper has `background: #555`.
                             We should override style for inner reports to be transparent?
                         */}
                        <MachineReport
                            {...data}
                            skipMatrix={true}
                            startPageNum={pageCounter}
                            globalTotalPages={totalPages}
                        // Override style to remove padding/background for inner components if they are stacked
                        // Actually MachineReport style: background #555, padding 20px.
                        // If we nest them, we get gaps.
                        // PDF generation queries `.report-page`. It ignores the container wrappers.
                        // So visual display in hidden div doesn't matter much, as long as `.report-page` elements are siblings or descendants.
                        />
                    </div>
                );
                pageCounter += count;
                return content;
            })}
        </div>
    );
});

export default MachineReport;