"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Settings } from "lucide-react";
import { useAssets } from "@/hooks/useAssets";
import BubbleChart from "@/components/BubbleChart/BubbleChart";
import Toggle from "@/components/UI/Toggle";
import FilterModal from "@/components/UI/FilterModal";

export default function Home() {
  const { assets, loading, error } = useAssets();

  const [metric, setMetric] = useState("power_mw");
  const [selectedAsset, setSelectedAsset] = useState(null);

  // activeFilters is a Set of asset type keys, or a Set containing "all"
  const [activeFilters, setActiveFilters] = useState(new Set(["all"]));
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // ------------------------------------------------------------------
  // DERIVED STATE
  // filteredAssets is recomputed only when assets or activeFilters change.
  // useMemo avoids refiltering on every render triggered by other state.
  // ------------------------------------------------------------------
  const filteredAssets = useMemo(() => {
    if (activeFilters.has("all")) return assets;
    return assets.filter((a) => activeFilters.has(a.asset_type));
  }, [assets, activeFilters]);

  // The metric toggle is only visible when the filter is "battery" only
  const showToggle =
    activeFilters.size === 1 && activeFilters.has("battery");

  // When the toggle is hidden, power_mw is the forced metric.
  // We derive the effective metric here so BubbleChart always gets
  // the correct value regardless of what the Toggle last emitted.
  const effectiveMetric = showToggle ? metric : "power_mw";

  // ------------------------------------------------------------------
  // HANDLERS
  // ------------------------------------------------------------------
  function handleBubbleSelect(asset) {
    setSelectedAsset(asset);
  }

  function handleDismiss() {
    setSelectedAsset(null);
  }

  function handleFilterChange(newFilters) {
    setActiveFilters(newFilters);

    // If the selected bubble is no longer in the filtered set, close the panel
    if (selectedAsset && !newFilters.has("all")) {
      const stillVisible = newFilters.has(selectedAsset.asset_type);
      if (!stillVisible) setSelectedAsset(null);
    }
  }

  // ------------------------------------------------------------------
  // LOADING / ERROR STATES
  // ------------------------------------------------------------------
  if (loading) {
    return (
      <div style={styles.centeredScreen}>
        <p style={styles.statusText}>Loading assets...</p>
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

      {/* ---- HEADER ---- */}
      <div style={styles.header}>
        {/* Dark mode icon will sit here — added in a later step */}
        <button
          style={styles.headerButton}
          onClick={() => setIsFilterOpen(true)}
          aria-label="Open filters"
        >
          <Settings size={22} color="#EEECE6" />
        </button>
      </div>

      {/* ---- TOGGLE — visible only when filter is battery-only ---- */}
      {showToggle && (
        <div style={styles.toggleWrapper}>
          <Toggle value={metric} onChange={setMetric} />
        </div>
      )}

      {/* ---- BUBBLE MAP ---- */}
      <div style={styles.mapWrapper} onClick={handleDismiss}>
        <BubbleChart
          assets={filteredAssets}
          metric={effectiveMetric}
          selectedId={selectedAsset?.id ?? null}
          onSelect={handleBubbleSelect}
        />
      </div>

      {/* ---- DETAIL PANEL ---- */}
      <div
        style={{
          ...styles.panel,
          transform: selectedAsset ? "translateY(0)" : "translateY(110%)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {selectedAsset && (
          <>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>{selectedAsset.name}</h2>
              <button style={styles.closeButton} onClick={handleDismiss}>✕</button>
            </div>

            <div style={styles.panelBody}>
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

            <Link href={`/assets/${selectedAsset.id}`} style={styles.detailLink}>
              View details →
            </Link>
          </>
        )}
      </div>

      {/* ---- FILTER MODAL ---- */}
      {isFilterOpen && (
        <FilterModal
          activeFilters={activeFilters}
          onChange={handleFilterChange}
          onClose={() => setIsFilterOpen(false)}
        />
      )}

    </main>
  );
}

// -------------------------------------------------------------------
// DETAIL ROW
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
  root: {
    position: "relative",
    width: "100%",
    height: "100dvh",
    backgroundColor: "#0d1b2a",
    overflow: "hidden",
  },

  // Header strip — top of screen, contains icon buttons
  header: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  headerButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  toggleWrapper: {
    position: "absolute",
    top: 24,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 10,
  },

  mapWrapper: {
    position: "absolute",
    inset: 0,
  },

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