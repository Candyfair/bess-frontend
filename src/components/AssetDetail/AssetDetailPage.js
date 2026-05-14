"use client";

import { ArrowLeft } from "lucide-react";
import { BatteryFull, Zap, Thermometer, Unplug } from "lucide-react";

// -------------------------------------------------------------------
// HELPERS
// -------------------------------------------------------------------

function getModeColor(mode) {
  switch (mode) {
    case "active":    return "var(--color-status-active)";
    case "fault":     return "var(--color-status-fault)";
    case "curtailed": return "var(--color-status-curtailed)";
    default:          return "var(--color-detail-text)";
  }
}

function getStatusColor(status) {
  switch (status) {
    case "communicating": return "var(--color-status-active)";
    default:              return "var(--color-detail-text)";
  }
}

function getValueColor(value) {
  return value < 0 ? "var(--color-value-negative)" : "var(--color-detail-text)";
}

// -------------------------------------------------------------------
// SUB-COMPONENTS
// -------------------------------------------------------------------

function IconBlock({ icon: Icon }) {
  return (
    <div style={styles.iconBlock}>
      <Icon size={20} color="var(--color-detail-text)" />
    </div>
  );
}

function DataRow({ label, value, valueColor }) {
  return (
    <div style={styles.dataRow}>
      <span style={styles.dataLabel}>{label}</span>
      <span style={{ ...styles.dataValue, color: valueColor ?? "var(--color-detail-text)" }}>
        {value ?? "—"}
      </span>
    </div>
  );
}

function DataBlock({ icon, children }) {
  return (
    <div style={styles.dataBlock}>
      <IconBlock icon={icon} />
      {children}
    </div>
  );
}

// -------------------------------------------------------------------
// MAIN COMPONENT
// -------------------------------------------------------------------
export default function AssetDetailPage({
  asset,
  detail,
  loading,
  error,
  onBack,
}) {
  const record = detail?.record ?? null;
  const isBattery = asset?.asset_type === "battery";

  return (
    <div style={styles.root}>

      {/* ---- BACK BUTTON ---- */}
      <div style={styles.backRow}>
        <button style={styles.backButton} onClick={onBack} aria-label="Go back">
          <ArrowLeft size={22} color="var(--color-detail-text)" />
        </button>
      </div>

      {/* ---- SCROLLABLE CONTENT ---- */}
      <div style={styles.scrollArea}>

        {/* Asset name — yellow panel block */}
        <div style={styles.nameBlock}>
          <span style={styles.nameText}>{asset?.name ?? "—"}</span>
        </div>

        {/* EIC code */}
        <div style={styles.eicBlock}>
          <span style={styles.eicText}>EIC code: {asset?.eic_code ?? "—"}</span>
        </div>

        {loading && (
          <div style={styles.loadingRow}>
            <span style={styles.loadingText}>Loading...</span>
          </div>
        )}

        {error && (
          <div style={styles.loadingRow}>
            <span style={{ ...styles.loadingText, color: "var(--color-status-fault)" }}>
              Error: {error}
            </span>
          </div>
        )}

        {/* ---- CAPACITY BLOCK — batteries only ---- */}
        {isBattery && (
          <DataBlock icon={BatteryFull}>
            <DataRow
              label="Capacity"
              value={record ? `${detail.max_capacity_mwh} MWh` : "—"}
            />
            <DataRow
              label="Current capacity"
              value={record ? `${record.energy_mwh} MWh` : "—"}
              valueColor={record ? getValueColor(record.energy_mwh) : undefined}
            />
          </DataBlock>
        )}

        {/* ---- POWER BLOCK ---- */}
        <DataBlock icon={Zap}>
          <DataRow
            label="Active power"
            value={record ? `${record.power_mw} MW` : "—"}
            valueColor={record ? getValueColor(record.power_mw) : undefined}
          />
          <DataRow
            label="Reactive power"
            value={record ? `${record.reactive_power_mvar} MVAr` : "—"}
            valueColor={record ? getValueColor(record.reactive_power_mvar) : undefined}
          />
          <DataRow
            label="Voltage"
            value={record ? `${record.voltage} V` : "—"}
            valueColor={record ? getValueColor(record.voltage) : undefined}
          />
          <DataRow
            label="Current Amps"
            value={record ? `${record.current_amps} A` : "—"}
            valueColor={record ? getValueColor(record.current_amps) : undefined}
          />
        </DataBlock>

        {/* ---- TEMPERATURE BLOCK ---- */}
        <DataBlock icon={Thermometer}>
          <DataRow
            label="Temperature"
            value={record ? `${record.temperature_celsius} C°` : "—"}
            valueColor={record ? getValueColor(record.temperature_celsius) : undefined}
          />
        </DataBlock>

        {/* ---- STATUS BLOCK ---- */}
        <DataBlock icon={Unplug}>
          <DataRow
            label="Operational mode"
            value={record?.operational_mode ?? "—"}
            valueColor={record ? getModeColor(record.operational_mode) : undefined}
          />
          <DataRow
            label="Telemetric status"
            value={record?.asset_status ?? "—"}
            valueColor={record ? getStatusColor(record.asset_status) : undefined}
          />
        </DataBlock>

        {/* ---- LAST UPDATED ---- */}
        <div style={styles.lastUpdatedBlock}>
          <span style={styles.lastUpdatedText}>Last updated time</span>
          <span style={styles.lastUpdatedText}>
            {record
              ? new Date(record.timestamp).toLocaleString("fr-FR", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"}
          </span>
        </div>

      </div>
    </div>
  );
}

// -------------------------------------------------------------------
// STYLES
// -------------------------------------------------------------------
const styles = {
  root: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "transparent",
    zIndex: 50,
  },

  // Back button row — sits above the scrollable content
  // zIndex 60 ensures it stays above the blur overlay
  backRow: {
    position: "relative",
    zIndex: 60,
    padding: "12px 16px 0",
    flexShrink: 0,
  },

  backButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 4,
    display: "flex",
    alignItems: "center",
  },

  scrollArea: {
    flex: 1,
    overflowY: "auto",
    padding: "12px 16px 32px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  nameBlock: {
    backgroundColor: "var(--color-panel-bg)",
    border: "1px solid var(--color-panel-border)",
    borderRadius: 12,
    padding: "14px 16px",
  },

  nameText: {
    fontSize: 20,
    fontWeight: "700",
    color: "var(--color-panel-title)",
    lineHeight: 1.3,
  },

  eicBlock: {
    backgroundColor: "var(--color-panel-bg)",
    border: "1px solid var(--color-panel-border)",
    borderRadius: 12,
    padding: "10px 16px",
  },

  eicText: {
    fontSize: 13,
    fontWeight: "500",
    color: "var(--color-panel-title)",
    fontFamily: "monospace",
  },

  dataBlock: {
    backgroundColor: "var(--color-detail-block-bg)",
    borderRadius: 12,
    padding: "12px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  iconBlock: {
    width: 36,
    height: 36,
    backgroundColor: "var(--color-detail-icon-bg)",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },

  dataRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  dataLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "var(--color-detail-text)",
  },

  dataValue: {
    fontSize: 13,
    fontWeight: "600",
  },

  lastUpdatedBlock: {
    backgroundColor: "var(--color-detail-block-bg)",
    borderRadius: 12,
    padding: "12px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },

  lastUpdatedText: {
    fontSize: 13,
    fontWeight: "500",
    color: "var(--color-detail-text)",
  },

  loadingRow: {
    padding: "8px 0",
  },

  loadingText: {
    fontSize: 13,
    color: "var(--color-detail-text)",
  },
};