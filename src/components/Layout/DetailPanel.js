"use client";

import { ArrowRight } from "lucide-react";

// DetailPanel — slide-up panel showing summary data for the selected asset.
//
// Visible states :
//   - No asset selected     : hidden below screen (translateY 150%)
//   - Asset selected        : slides up into view (translateY 0)
//   - Detail page open      : slides out to the left (translateX -120%)
//     in sync with AssetDetailPage sliding in from the right
//
// The panel is never unmounted — visibility + transform handle
// show/hide so the slide animation always plays correctly.

export default function DetailPanel({
  selectedAsset,
  isDetailOpen,
  onDismiss,
  onOpenDetail,
}) {

  // Derive the correct transform from the two state booleans
  const transform = isDetailOpen
    ? "translateX(-120%)"
    : selectedAsset
      ? "translateY(0)"
      : "translateY(150%)";

  // visibility stays "visible" as long as an asset is selected —
  // hidden only when no asset is selected AND the panel is fully gone.
  // The transition delay on visibility matches the slide duration
  // so it only hides after the animation completes.
  const visibility = selectedAsset ? "visible" : "hidden";
  const visibilityTransition = selectedAsset
    ? "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), visibility 0s"
    : "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), visibility 0s 0.35s";

  return (
    <div
      style={{
        ...styles.panel,
        transform,
        visibility,
        transition: visibilityTransition,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {selectedAsset && (
        <>
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>{selectedAsset.name}</h2>
            <button
              style={styles.closeButton}
              onClick={onDismiss}
              aria-label="Close panel"
            >
              ✕
            </button>
          </div>

          <div style={styles.panelBody}>
            <div style={styles.panelRowsBlock}>
              <DetailRow
                label="Capacity"
                value={`${Math.round(selectedAsset.energy_mwh)} MWh`}
              />
              <DetailRow
                label="Power"
                value={`${selectedAsset.power_mw?.toFixed(2)} MW`}
              />
              <DetailRow
                label="Status"
                value={selectedAsset.operational_mode ?? "—"}
              />
            </div>
          </div>

          {/* View details button — bottom right per Figma */}
          <button
            style={styles.detailButton}
            onClick={onOpenDetail}
            aria-label="View asset details"
          >
            View details
            <ArrowRight size={14} style={{ marginLeft: 6 }} />
          </button>
        </>
      )}
    </div>
  );
}

// -------------------------------------------------------------------
// DETAIL ROW
// -------------------------------------------------------------------
function DetailRow({ label, value }) {
  return (
    <div style={styles.detailRow}>
      <span style={styles.detailLabel}>{label}</span>
      <span style={styles.detailValue}>{value}</span>
    </div>
  );
}

// -------------------------------------------------------------------
// STYLES
// -------------------------------------------------------------------
const styles = {
  panel: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    height: "30%",
    backgroundColor: "var(--color-panel-bg)",
    border: "1px solid var(--color-panel-border)",
    borderRadius: 20,
    padding: "20px 24px",
    marginLeft: 20,
    marginRight: 20,
    zIndex: 20,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
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
    color: "var(--color-panel-title)",
  },

  closeButton: {
    background: "none",
    border: "none",
    color: "var(--color-panel-title)",
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

  panelRowsBlock: {
    backgroundColor: "var(--color-panel-row-bg)",
    borderRadius: 10,
    padding: "8px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  detailButton: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    backgroundColor: "var(--color-detail-btn-bg)",
    color: "var(--color-detail-btn-text)",
    border: "none",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: 14,
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 12,
    letterSpacing: 0.3,
    position: "absolute",
    bottom: -45,
    right: 0,
  },

  detailRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  detailLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "var(--color-panel-label)",
  },

  detailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "var(--color-panel-value)",
  },
};