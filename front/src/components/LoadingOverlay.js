import React, { useEffect, useState } from "react";
import { subscribeLoading } from "../services/api";

export default function LoadingOverlay() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = subscribeLoading(setLoading);
    return () => unsub();
  }, []);

  if (!loading) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(15,23,42,0.45)",
      zIndex: 2000,
      padding: 24
    }} role="status" aria-live="polite" aria-busy="true">
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        background: "rgba(255,255,255,0.96)",
        padding: "20px 26px",
        borderRadius: 12,
        boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
        textAlign: "center",
        minWidth: 260
      }}>
        <div style={{
          width: 56,
          height: 56,
          border: "6px solid #e6e9f2",
          borderTopColor: "#7c3aed",
          borderRadius: "50%",
          animation: "loadingOverlaySpin 0.8s linear infinite"
        }} aria-hidden="true" />
        <div style={{ fontWeight: 700, color: "#0f172a" }}>Loading — fetching latest data</div>
        <div style={{ color: "#475569", fontSize: 13 }}>Please wait a moment while we load machines.</div>
      </div>
      <style>{`@keyframes loadingOverlaySpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
