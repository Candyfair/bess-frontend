// src/components/UI/Toggle.js

// -------------------------------------------------------------------
// CONFIGURATION
// Add or remove entries here to support additional metrics.
// -------------------------------------------------------------------
const OPTIONS = [
  { key: "capacity_kwh", label: "Capacity" },
  { key: "max_charge_rate_kw", label: "Charge rate" },
];

// -------------------------------------------------------------------
// COMPONENT
// Controlled toggle — owns no internal state.
// The active value and the change handler both come from the parent.
//
// Props:
//   value    : currently active metric key
//   onChange : callback fired with the new metric key on user tap
// -------------------------------------------------------------------
export default function Toggle({ value, onChange }) {
  return (
    <div style={styles.wrapper}>
      {OPTIONS.map((option) => {
        const isActive = option.key === value;
        return (
          <button
            key={option.key}
            onClick={() => onChange(option.key)}
            // Disable the already-active option to prevent redundant callbacks
            // and to signal the current state semantically to assistive tech.
            disabled={isActive}
            style={{
              ...styles.option,
              ...(isActive ? styles.optionActive : styles.optionInactive),
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

// -------------------------------------------------------------------
// STYLES
// Inline styles keep this component self-contained with no CSS file dependency.
// The toggle sits on top of the bubble map so it needs a solid background.
// -------------------------------------------------------------------
const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#1a2332",
    borderRadius: 24,
    padding: 4,
    gap: 4,
    // Visual separation from the map below
    boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
  },
  option: {
    flex: 1,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 16,
    paddingRight: 16,
    borderRadius: 20,
    border: "none",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
    cursor: "pointer",
    // Smooth fill transition when switching between active and inactive
    transition: "background-color 0.2s ease, color 0.2s ease",
    // Prevent text selection on rapid double-tap (common on mobile)
    userSelect: "none",
    WebkitUserSelect: "none",
  },
  optionActive: {
    backgroundColor: "#29B6F6",
    color: "#ffffff",
    cursor: "default",
  },
  optionInactive: {
    backgroundColor: "transparent",
    color: "#78909c",
  },
};