"use client";

import { useState } from "react";
import Link from "next/link";
import { useBatteries } from "@/hooks/useBatteries";
import BubbleChart from "@/components/BubbleChart/BubbleChart";
import Toggle from "@/components/UI/Toggle";

// -------------------------------------------------------------------
// PAGE COMPONENT
// Holds all application state and assembles the main view:
//   - Toggle (metric switcher)
//   - BubbleChart (D3 force map)
//   - Detail panel (slides up from the bottom on bubble tap)
// -------------------------------------------------------------------
export default function Home() {
  const { batteries, loading, error } = useBatteries();

  // Active metric — shared between Toggle and BubbleChart
  const [metric, setMetric] = useState("capacity_kwh");

  // Full battery object of the selected bubble, or null if none selected.
  // We store the full object so the detail panel can render without an extra API call.
  const [selectedBattery, setSelectedBattery] = useState(null);

  // ------------------------------------------------------------------
  // HANDLERS
  // ------------------------------------------------------------------

  // Called when a bubble is tapped in BubbleChart
  function handleBubbleSelect(battery) {
    console.log("selectedBattery set to", battery);
    setSelectedBattery(battery);
  }

  // Called by the close button or a tap on the map background
  function handleDismiss() {
    setSelectedBattery(null);
  }

  // ------------------------------------------------------------------
  // LOADING / ERROR STATES
  // ------------------------------------------------------------------
  if (loading) {
    return (
      <div style={styles.centeredScreen}>
        <p style={styles.statusText}>Loading batteries...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.centeredScreen}>
        <p style={styles.statusText}>Error: {error}</p>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------------
  return (
    <main style={styles.root}>

      {/* ---- TOGGLE — floats above the map ---- */}
      <div style={styles.toggleWrapper}>
        <Toggle value={metric} onChange={setMetric} />
      </div>

      {/* ---- BUBBLE MAP ---- */}
      {/* onClick on this wrapper dismisses the selection when tapping the background */}
      <div style={styles.mapWrapper} onClick={handleDismiss}>
        <BubbleChart
          batteries={batteries}
          metric={metric}
          selectedId={selectedBattery?.id ?? null}
          onSelect={handleBubbleSelect}
        />
      </div>

      {/* ---- DETAIL PANEL ---- */}
      {/* Always in the DOM — visibility is controlled via translateY transition */}
      <div
        style={{
          ...styles.panel,
          transform: selectedBattery ? "translateY(0)" : "translateY(110%)",
        }}
        // Stop tap propagation so tapping the panel does not trigger handleDismiss
        onClick={(e) => e.stopPropagation()}
      >
        {selectedBattery && (
          <>
            {/* Panel header */}
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>{selectedBattery.name}</h2>
              <button style={styles.closeButton} onClick={handleDismiss}>
                ✕
              </button>
            </div>

            {/* Battery fields */}
            <div style={styles.panelBody}>
              <DetailRow label="Manufacturer" value={selectedBattery.manufacturer} />
              <DetailRow
                label="Capacity"
                value={`${Math.round(selectedBattery.capacity_kwh)} kWh`}
              />
              <DetailRow
                label="Max charge rate"
                value={`${Math.round(selectedBattery.max_charge_rate_kw)} kW`}
              />
              <DetailRow
                label="Status"
                value={selectedBattery.is_active ? "Active" : "Inactive"}
                valueColor={selectedBattery.is_active ? "#4FC3F7" : "#78909c"}
              />
            </div>

            {/* Navigation to the full detail page */}
            <Link
              href={`/batteries/${selectedBattery.id}`}
              style={styles.detailLink}
            >
              View details →
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

// -------------------------------------------------------------------
// DETAIL ROW
// Small presentational sub-component for a label/value pair in the panel.
// Defined in the same file because it is only used here.
// -------------------------------------------------------------------
function DetailRow({ label, value, valueColor = "#ffffff" }) {
  return (
    <div style={styles.detailRow}>
      <span style={styles.detailLabel}>{label}</span>
      <span style={{ ...styles.detailValue, color: valueColor }}>{value}</span>
    </div>
  );
}

// -------------------------------------------------------------------
// STYLES
// -------------------------------------------------------------------
const styles = {
  // Full-screen root container.
  // dvh (dynamic viewport height) accounts for the browser chrome on mobile Safari —
  // unlike vh, it reflects the actual visible height after the address bar collapses.
  root: {
    position: "relative",
    width: "100%",
    height: "100dvh",
    backgroundColor: "#0d1b2a",
    overflow: "hidden",
  },

  // Toggle floats above the map, centred at the top
  toggleWrapper: {
    position: "absolute",
    top: 24,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 10,
  },

  // Map fills the entire screen behind the overlay elements
  mapWrapper: {
    position: "absolute",
    inset: 0, // shorthand for top/right/bottom/left: 0
  },

  // Detail panel slides up from the bottom.
  // Height is ~35% of the screen — leaves enough room for the map above.
  // Transition on transform drives the slide-up/slide-down animation.
  panel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "35%",
    backgroundColor: "#1a2332",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: "20px 24px",
    zIndex: 20,
    transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    // Subtle top shadow to separate the panel from the map
    boxShadow: "0 -4px 24px rgba(0,0,0,0.5)",
  },

  panelHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  panelTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },

  closeButton: {
    background: "none",
    border: "none",
    color: "#78909c",
    fontSize: 18,
    cursor: "pointer",
    padding: 4,
    lineHeight: 1,
  },

  panelBody: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    flex: 1,
    overflowY: "auto",
  },

  detailRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  detailLabel: {
    fontSize: 13,
    color: "#78909c",
    fontWeight: "500",
  },

  detailValue: {
    fontSize: 13,
    fontWeight: "600",
  },

  // "View details" link styled as a full-width button at the bottom of the panel
  detailLink: {
    display: "block",
    textAlign: "center",
    backgroundColor: "#29B6F6",
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: "700",
    fontSize: 14,
    paddingTop: 12,
    paddingBottom: 12,
    borderRadius: 12,
    letterSpacing: 0.3,
  },

  centeredScreen: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100dvh",
    backgroundColor: "#0d1b2a",
  },

  statusText: {
    color: "#78909c",
    fontSize: 15,
  },
};