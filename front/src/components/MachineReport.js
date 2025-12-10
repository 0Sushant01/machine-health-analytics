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
        <img src="https://upload.wikimedia.org/wikipedia/en/thumb/5/52/JSW_Group_logo.svg/1200px-JSW_Group_logo.svg.png" alt="JSW" style={{ height: '30px' }} />
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

const SeverityMatrix = () => {
    // Styles
    const containerStyle = { marginTop: '20px', flex: 1, fontFamily: 'Arial, sans-serif' };
    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '9px',
        border: '3px solid #000',
        textAlign: 'center'
    };
    const cellStyle = { border: '1px solid #000', padding: '1px' };
    const headerCellStyle = { ...cellStyle, fontWeight: 'bold', backgroundColor: '#fff' };
    const valueCellStyle = { ...cellStyle, fontWeight: 'bold', backgroundColor: '#fff', width: '25px', height: '15px' };
    const verticalTdStyle = {
        ...cellStyle,
        verticalAlign: 'middle',
        textAlign: 'center',
        width: '30px',
        padding: 0
    };

    // Colors
    const RED = '#ff0000';
    const YEL = '#ffff00';
    const GRN = '#339933';
    const BLU = '#0000ff';

    // Helper for color cell - Now always single cell to enforce borders
    const ColorCell = ({ color }) => (
        <td style={{ backgroundColor: color, border: '1px solid #000', height: '15px', width: '6%' }}></td>
    );

    // Group columns helper
    // 8 columns: 0,1=Grp4; 2,3=Grp3; 4,5=Grp2; 6,7=Grp1
    const renderRowCells = (colors) => {
        // colors is array of 4 colors [Grp4, Grp3, Grp2, Grp1].
        // We render 2 cells for each color.
        return (
            <>
                <ColorCell color={colors[0]} /><ColorCell color={colors[0]} />
                <ColorCell color={colors[1]} /><ColorCell color={colors[1]} />
                <ColorCell color={colors[2]} /><ColorCell color={colors[2]} />
                <ColorCell color={colors[3]} /><ColorCell color={colors[3]} />
            </>
        );
    };

    return (
        <div style={containerStyle}>
            <h3 style={{ borderBottom: '2px solid #ddd', paddingBottom: '5px', marginBottom: '10px' }}>VIBRATION ANALYSIS REPORT</h3>

            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '5px', fontSize: '9px', border: '2px solid #000', display: 'inline-block', float: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #000' }}>
                    <div style={{ background: BLU, width: 15, height: 12, borderRight: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>A</div>
                    <div style={{ padding: '0 5px' }}>Newly Commissioned</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #000' }}>
                    <div style={{ background: GRN, width: 15, height: 12, borderRight: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>B</div>
                    <div style={{ padding: '0 5px' }}>Unrestricted long-term operation</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #000' }}>
                    <div style={{ background: YEL, width: 15, height: 12, borderRight: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>C</div>
                    <div style={{ padding: '0 5px' }}>Restricted long-term operation</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ background: RED, width: 15, height: 12, borderRight: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>D</div>
                    <div style={{ padding: '0 5px' }}>Vibration causes damage</div>
                </div>
            </div>
            <div style={{ clear: 'both' }}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 'bold', marginBottom: '2px' }}>
                <span>Velocity Threshold Values</span>
                <span>ISO 10816-3</span>
            </div>

            <table style={tableStyle}>
                <colgroup>
                    <col style={{ width: '6%' }} /> {/* Group 4 */}
                    <col style={{ width: '6%' }} /> {/* Group 4 */}
                    <col style={{ width: '6%' }} /> {/* Group 3 */}
                    <col style={{ width: '6%' }} /> {/* Group 3 */}
                    <col style={{ width: '6%' }} /> {/* Group 2 */}
                    <col style={{ width: '6%' }} /> {/* Group 2 */}
                    <col style={{ width: '6%' }} /> {/* Group 1 */}
                    <col style={{ width: '6%' }} /> {/* Group 1 */}
                    <col style={{ width: '8%' }} /> {/* mms */}
                    <col style={{ width: '8%' }} /> {/* inch */}
                    <col style={{ width: '5%' }} /> {/* label */}
                </colgroup>

                {/* Red Zone Top - 3 Rows (>11 spacing) */}
                {[...Array(3)].map((_, i) => (
                    <tr key={`top-${i}`}>
                        {renderRowCells([RED, RED, RED, RED])}
                        <td style={{ ...valueCellStyle, border: 'none', borderLeft: '1px solid #000' }}></td>
                        <td style={{ ...valueCellStyle, border: 'none', borderRight: '1px solid #000' }}></td>
                        {i === 0 && (
                            <td rowSpan={11} style={verticalTdStyle}>
                                <div style={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap', fontWeight: 'bold', fontSize: '18px', fontFamily: 'sans-serif', display: 'inline-block' }}>Velocity</div>
                            </td>
                        )}
                    </tr>
                ))}

                {/* 11.0 Line */}
                <tr>
                    {renderRowCells([RED, RED, RED, RED])}
                    <td style={valueCellStyle}>11</td><td style={valueCellStyle}>0.44</td>
                </tr>

                {/* 7.1 Line */}
                <tr>
                    {/* Grp 4,3,2 Red. Grp 1 Yellow. */}
                    {renderRowCells([RED, RED, RED, YEL])}
                    <td style={valueCellStyle}>7.1</td><td style={valueCellStyle}>0.28</td>
                </tr>

                {/* 4.5 Line */}
                <tr>
                    {/* Grp 4 Red. Grp 3,2,1 Yellow. */}
                    {renderRowCells([RED, YEL, YEL, YEL])}
                    <td style={valueCellStyle}>4.5</td><td style={valueCellStyle}>0.18</td>
                </tr>

                {/* Row 3.5 - 4.5 gap */}
                <tr>
                    {/* Grp 4 Yellow. Grp 3,2 Green. Grp 1 Yellow. */}
                    {renderRowCells([YEL, GRN, GRN, YEL])}
                    <td style={valueCellStyle}>3.5</td><td style={valueCellStyle}>0.11</td>
                </tr>

                {/* 2.8 line */}
                <tr>
                    {/* Grp 4 Yellow. Grp 3,2,1 Green. */}
                    {renderRowCells([YEL, GRN, GRN, GRN])}
                    <td style={valueCellStyle}>2.8</td><td style={valueCellStyle}>0.07</td>
                </tr>

                {/* 2.3 Line */}
                <tr>
                    {/* Grp 4,3,2,1 Green. */}
                    {renderRowCells([GRN, GRN, GRN, GRN])}
                    <td style={valueCellStyle}>2.3</td><td style={valueCellStyle}>0.04</td>
                </tr>

                {/* 1.4 Line */}
                <tr>
                    {/* Grp 4 Green. Grp 3,2,1 Blue. */}
                    {renderRowCells([GRN, BLU, BLU, BLU])}
                    <td style={valueCellStyle}>1.4</td><td style={valueCellStyle}>0.03</td>
                </tr>

                {/* 0.71 Line */}
                <tr>
                    {/* All Blue */}
                    {renderRowCells([BLU, BLU, BLU, BLU])}
                    <td style={valueCellStyle}>0.71</td><td style={valueCellStyle}>0.02</td>
                </tr>

                {/* Units */}
                <tr>
                    <td colSpan={8} style={{ border: 'none', borderRight: '1px solid #000', borderBottom: '1px solid #000' }}></td>
                    <td style={headerCellStyle}>mm/s</td><td style={headerCellStyle}>in/s</td>
                </tr>

                {/* Footer Headers */}
                {/* Rigid / Flexible x 4 */}
                <tr>
                    <td style={cellStyle}>Rigid</td><td style={cellStyle}>Flexible</td>
                    <td style={cellStyle}>Rigid</td><td style={cellStyle}>Flexible</td>
                    <td style={cellStyle}>Rigid</td><td style={cellStyle}>Flexible</td>
                    <td style={cellStyle}>Rigid</td><td style={cellStyle}>Flexible</td>
                    <td colSpan={3} style={headerCellStyle}>Foundation</td>
                </tr>

                {/* Machine Types - Row 1 (Headers) */}
                <tr>
                    <td colSpan={4} style={cellStyle}>Pumps &gt; 15 kW</td>
                    <td colSpan={2} style={cellStyle}>Medium sized Machines</td>
                    <td colSpan={2} style={cellStyle}>Large Machines</td>
                    <td colSpan={3} rowSpan={3} style={{ ...headerCellStyle, verticalAlign: 'middle' }}>Machine Type</td>
                </tr>

                {/* Machine Types - Row 2 (Details) */}
                <tr>
                    <td colSpan={4} style={cellStyle}><span style={{ fontSize: '8px' }}>radial, axial, mixed flow</span></td>
                    <td colSpan={2} style={cellStyle}><span style={{ fontSize: '8px' }}>15 kW &lt; M 300kW</span></td>
                    <td colSpan={2} style={cellStyle}><span style={{ fontSize: '8px' }}>300 kW &lt; M &lt; 50MW</span></td>
                </tr>

                {/* Driver/Motor Details */}
                <tr>
                    <td colSpan={2} style={cellStyle}>Integrated Driver</td> {/* Group 4 */}
                    <td colSpan={2} style={cellStyle}>External Driver</td> {/* Group 3 */}
                    <td colSpan={2} style={cellStyle}>Motors<br />160mm &lt; H &lt; 315mm</td> {/* Group 2 */}
                    <td colSpan={2} style={cellStyle}>Motors<br />315mm &lt;= H</td> {/* Group 1 */}
                </tr>

                {/* Group Labels */}
                <tr>
                    <td colSpan={2} style={{ ...headerCellStyle, backgroundColor: '#fff' }}>Group 4</td>
                    <td colSpan={2} style={{ ...headerCellStyle, backgroundColor: '#fff' }}>Group 3</td>
                    <td colSpan={2} style={{ ...headerCellStyle, backgroundColor: '#fff' }}>Group 2</td>
                    <td colSpan={2} style={{ ...headerCellStyle, backgroundColor: '#fff' }}>Group 1</td>
                    <td colSpan={3} style={headerCellStyle}>Group</td>
                </tr>
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

const MachineReport = forwardRef(({ machine, measurements = [], observations = [], recommendations = [], fftData = [] }, ref) => {
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
        // fftChunks.push([]); // Do not push empty if no charts, maybe simple message or skip
    } else {
        for (let i = 0; i < fftData.length; i += chartsPerPage) {
            fftChunks.push(fftData.slice(i, i + chartsPerPage));
        }
    }

    // CALCULATE TOTAL PAGES
    // Fixed Pages:
    // Page 1: Severity Matrix
    // Page 2: Details + Obs + Rec
    // Page 3...N: Measurements
    // Page N+1...M: Charts
    const fixedPages = 2;
    const measurePages = measurementChunks.length > 0 ? measurementChunks.length : 1;
    const chartPages = fftChunks.length;
    const totalPages = fixedPages + measurePages + chartPages;

    let pageCount = 0;

    return (
        <div ref={ref} style={{ background: '#555', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            {/* PAGE 1: SEVERITY MATRIX */}
            <Page machine={machine} reportDate={currentDate} pageNum={pageCount++} totalPages={totalPages}>
                <div style={{ marginBottom: '10px', color: getStatusColor(machine?.statusName), fontWeight: 'bold' }}>Status: {machine?.statusName || 'N/A'}</div>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Area Name: {machine?.areaId || 'N/A'}</div>
                <SeverityMatrix />
            </Page>

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

export default MachineReport;