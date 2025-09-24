// src/components/MachineTable.js
import React from "react";

const MachineTable = ({ machines }) => (
  <table style={{ width: "100%", borderCollapse: "collapse" }}>
    <thead>
      <tr>
        <th>Customer</th>
        <th>Area</th>
        <th>Machine</th>
        <th>Status</th>
        <th>Updated Time</th>
      </tr>
    </thead>
    <tbody>
      {machines.length === 0 ? (
        <tr><td colSpan="5" style={{ textAlign:"center" }}>No machines found</td></tr>
      ) : (
        machines.map(m => (
          <tr key={m._id}>
            <td>{m.customerId}</td>
            <td>{m.areaId}</td>
            <td>{m._id}</td>
            <td>{m.status}</td>
            <td>{m.dataUpdatedTime}</td>
          </tr>
        ))
      )}
    </tbody>
  </table>
);

export default MachineTable;
