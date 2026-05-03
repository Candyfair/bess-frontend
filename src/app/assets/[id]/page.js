"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/constants";

// -------------------------------------------------------------------
// HOOK — useAsset
// Fetches a single asset by id from the /assetslist endpoint.
// Defined here for now — move to src/hooks/useAsset.js once
// additional API calls (telemetry, SOC, dispatch) are added.
// -------------------------------------------------------------------
function useAsset(id) {
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    async function fetchAsset() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/assetslist`);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        // The API currently returns all assets — filter by id.
        // id from params is a string, asset.id from the API is a number,
        // so we coerce with Number() before comparing.
        const match = data.find((b) => b.id === Number(id));

        if (!match) {
          throw new Error(`Asset ${id} not found`);
        }

        setAsset(match);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAsset();
  }, [id]);

  return { asset, loading, error };
}

// -------------------------------------------------------------------
// PAGE COMPONENT
// Receives { params: { id } } from Next.js App Router automatically.
// The [id] folder name in the file system maps to this params shape.
// -------------------------------------------------------------------
export default function AssetDetailPage({ params }) {
  const { id } = params;
  const { asset, loading, error } = useAsset(id);

  // ------------------------------------------------------------------
  // LOADING STATE
  // ------------------------------------------------------------------
  if (loading) {
    return (
      <div style={styles.centeredScreen}>
        <p style={styles.statusText}>Loading asset {id}...</p>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // ERROR STATE
  // ------------------------------------------------------------------
  if (error) {
    return (
      <div style={styles.centeredScreen}>
        <p style={styles.statusText}>{error}</p>
        <Link href="/" style={styles.backLink}>
          ← Back to map
        </Link>
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
        <Link href="/" style={styles.backButton}>
          ←
        </Link>
        <h1 style={styles.title}>{asset.name}</h1>
        {/* Spacer to keep the title visually centred */}
        <div style={{ width: 32 }} />
      </div>

      {/* ---- STATUS BADGE ---- */}
      <div style={styles.section}>
        <span
          style={{
            ...styles.badge,
            backgroundColor: asset.is_active ? "#1a3a4a" : "#1e2a30",
            color: asset.is_active ? "#4FC3F7" : "#78909c",
          }}
        >
          {asset.is_active ? "Active" : "Inactive"}
        </span>
      </div>

      {/* ---- MAIN FIELDS ---- */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>General</h2>
        <div style={styles.card}>
          <DetailRow label="Manufacturer" value={asset.manufacturer} />
          <Divider />
          <DetailRow
            label="Capacity"
            value={`${Math.round(asset.capacity_kwh)} kWh`}
          />
          <Divider />
          <DetailRow
            label="Max charge rate"
            value={`${Math.round(asset.max_charge_rate_kw)} kW`}
          />
          <Divider />
          <DetailRow label="ID" value={`#${asset.id}`} />
        </div>
      </div>

      {/* ---- PLACEHOLDER SECTIONS ---- */}
      {/* These sections will be populated once Christian exposes
          the telemetry, SOC and dispatch endpoints. */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>State of charge</h2>
        <div style={{ ...styles.card, ...styles.placeholder }}>
          <p style={styles.placeholderText}>
            Available once /assets/{id}/soc is exposed
          </p>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Telemetry</h2>
        <div style={{ ...styles.card, ...styles.placeholder }}>
          <p style={styles.placeholderText}>
            Available once /assets/{id}/telemetry is exposed
          </p>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Dispatch commands</h2>
        <div style={{ ...styles.card, ...styles.placeholder }}>
          <p style={styles.placeholderText}>
            Available once /assets/{id}/dispatch is exposed
          </p>
        </div>
      </div>

    </main>
  );
}

// -------------------------------------------------------------------
// SUB-COMPONENTS
// Defined here because they are only used on this page.
// -------------------------------------------------------------------
function DetailRow({ label, value }) {
  return (
    <div style={styles.detailRow}>
      <span style={styles.detailLabel}>{label}</span>
      <span style={styles.detailValue}>{value}</span>
    </div>
  );
}

function Divider() {
  return <div style={styles.divider} />;
}

// -------------------------------------------------------------------
// STYLES
// -------------------------------------------------------------------
const styles = {
  root: {
    width: "100%",
    minHeight: "100dvh",
    backgroundColor: "#0d1b2a",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    paddingBottom: 40,
  },

  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    borderBottom: "1px solid #1e2d3d",
  },

  backButton: {
    color: "#29B6F6",
    fontSize: 22,
    textDecoration: "none",
    width: 32,
    display: "flex",
    alignItems: "center",
  },

  title: {
    margin: 0,
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
  },

  section: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 8,
  },

  sectionTitle: {
    margin: "0 0 8px 0",
    fontSize: 12,
    fontWeight: "600",
    color: "#78909c",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  card: {
    backgroundColor: "#1a2332",
    borderRadius: 14,
    padding: "4px 16px",
  },

  detailRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 14,
    paddingBottom: 14,
  },

  detailLabel: {
    fontSize: 15,
    color: "#b0bec5",
  },

  detailValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
  },

  divider: {
    height: 1,
    backgroundColor: "#1e2d3d",
    marginLeft: 0,
  },

  badge: {
    display: "inline-block",
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 14,
    paddingRight: 14,
    borderRadius: 20,
    fontSize: 13,
    fontWeight: "600",
  },

  placeholder: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 64,
  },

  placeholderText: {
    margin: 0,
    fontSize: 13,
    color: "#455a64",
    fontStyle: "italic",
    textAlign: "center",
  },

  centeredScreen: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100dvh",
    backgroundColor: "#0d1b2a",
    gap: 16,
  },

  statusText: {
    color: "#78909c",
    fontSize: 15,
    margin: 0,
  },

  backLink: {
    color: "#29B6F6",
    fontSize: 14,
    textDecoration: "none",
  },
};