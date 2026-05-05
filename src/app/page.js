"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Moon, Sun, Settings } from "lucide-react";
import { useAssets } from "@/hooks/useAssets";
import { useTheme } from "@/context/ThemeContext";
import BubbleChart from "@/components/BubbleChart/BubbleChart";
import Toggle from "@/components/UI/Toggle";
import FilterModal from "@/components/UI/FilterModal";
import LogoutMenu from "@/components/UI/LogoutMenu";

export default function Home() {
  const { assets, loading, error } = useAssets();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const [metric, setMetric] = useState("power_mw");
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isThemeSpinning, setIsThemeSpinning] = useState(false);
  const [activeFilters, setActiveFilters] = useState(new Set(["all"]));
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLogoutMenuOpen, setIsLogoutMenuOpen] = useState(false);

  // Total power value — hardcoded until the grid signal API is connected
  const TOTAL_POWER = 5000;


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

  function handleThemeToggle() {
    if (isThemeSpinning) return;
    setIsThemeSpinning(true);
    setTimeout(() => {
      toggleTheme();
      setIsThemeSpinning(false);
    }, 350);
  }

  function handleFilterChange(newFilters) {
    setActiveFilters(newFilters);
    if (selectedAsset && !newFilters.has("all")) {
      const stillVisible = newFilters.has(selectedAsset.asset_type);
      if (!stillVisible) setSelectedAsset(null);
    }
  }

  // Opens the filter modal and the logout menu simultaneously,
  // matching the Figma design where the Settings icon triggers both.
  function handleSettingsPress() {
    const opening = !isLogoutMenuOpen;
    setIsLogoutMenuOpen(opening);
    setIsFilterOpen(opening);
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
    <>
      <style>{`
        @keyframes spin-once {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      <main style={styles.root}>

        {/* ---- HEADER ---- */}
        {/* ---- HEADER ---- */}
        <div style={styles.header}>

          {/* Total Power indicator — top left */}
          <div style={styles.powerBadge}>
            <span style={styles.powerText}>{TOTAL_POWER} mWh</span>
          </div>

          {/* Right side controls */}
          <div style={styles.headerRight}>
            <button
              style={styles.headerButton}
              onClick={handleThemeToggle}
              aria-label="Toggle theme"
            >
              <span style={{
                display: "flex",
                animation: isThemeSpinning ? "spin-once 0.35s ease-in-out" : "none",
              }}>
                {theme === "light"
                  ? <Moon size={22} color="var(--color-icon)" />
                  : <Sun  size={22} color="var(--color-icon)" />
                }
              </span>
            </button>

            {/* Settings button — wrapped in relative div to anchor LogoutMenu */}
            <div style={{ position: "relative" }}>
              <button
                style={styles.settingsButton}
                onClick={handleSettingsPress}
                aria-label="Open settings"
              >
                <Settings size={22} color="var(--color-icon)" />
              </button>

              {isLogoutMenuOpen && (
                <LogoutMenu
                  opacity={0.5}
                  onClose={() => setIsLogoutMenuOpen(false)}
                  onLogout={() => {
                    setIsLogoutMenuOpen(false);
                    setIsFilterOpen(false);
                    router.push("/login");
                  }}
                />
              )}
            </div>
          </div>
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
            visibility: selectedAsset ? "visible" : "hidden",
            transition: selectedAsset
              ? "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), visibility 0s"
              : "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), visibility 0s 0.20s",
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
            onClose={() => {
              setIsFilterOpen(false);
              setIsLogoutMenuOpen(false);
            }}
          />
        )}

      </main>
    </>
  );
}

// -------------------------------------------------------------------
// DETAIL ROW
// -------------------------------------------------------------------
function DetailRow({ label, value }) {
  return (
    <div style={styles.detailRow}>
      <span style={{ ...styles.detailLabel, color: "var(--color-panel-label)" }}>
        {label}
      </span>
      <span style={{ ...styles.detailValue, color: "var(--color-panel-value)" }}>
        {value}
      </span>
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
    overflow: "hidden",
  },

  // Header is now a full-width row to accommodate left + right elements
  header: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    zIndex: 60,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerRight: {
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

  // ⚙️ button with visible border per Figma
  settingsButton: {
    background: "none",
    border: "1px solid var(--color-settings-border)",
    borderRadius: 8,
    cursor: "pointer",
    padding: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  // Total Power badge — top left, same visual style as the detail panel
  powerBadge: {
    backgroundColor: "var(--color-power-bg)",
    border: "1px solid var(--color-power-border)",
    borderRadius: 10,
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 12,
    paddingRight: 12,
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
  },

  powerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "var(--color-panel-title)",
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
    bottom: 60,
    left: 0,
    right: 0,
    height: "30%",
    backgroundColor: "var(--color-panel-bg)",
    border: "1px solid var(--color-panel-border)",
    borderBottomWidth: 1,
    borderRadius: 20,
    padding: "20px 24px",
    marginLeft: "20px",
    marginRight: "20px",
    zIndex: 20,
    transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
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

  closeButton: {
    background: "none",
    border: "none",
    color: "var(--color-panel-title)",
    fontSize: 18,
    cursor: "pointer",
    padding: 4,
    lineHeight: 1,
  },

  // "View details →" button
  detailLink: {
    display: "block",
    position: "absolute",
    bottom: -45,
    right: 0,
    alignSelf: "flex-end",
    backgroundColor: "var(--color-detail-btn-bg)",
    color: "var(--color-detail-btn-text)",
    textDecoration: "none",
    fontWeight: "700",
    fontSize: 14,
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 12,
    letterSpacing: 0.3,
  },

  centeredScreen: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100dvh",
  },

  statusText: {
    color: "var(--color-text-muted)",
    fontSize: 15,
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
  },

  detailValue: {
    fontSize: 13,
    fontWeight: "600",
  },
};