// -------------------------------------------------------------------
// Generic on/off toggle switch used in the filter modal.
// Purely presentational — state is managed by the parent.
//
// Props:
//   enabled  : boolean — current state
//   onChange : callback fired with the new boolean value
// -------------------------------------------------------------------
export default function ToggleSwitch({ enabled, onChange }) {
  return (
    <div
      onClick={() => onChange(!enabled)}
      style={{
        ...styles.track,
        // Track background is the same regardless of state
        backgroundColor: "#D9D7D4",
      }}
    >
      <div
        style={{
          ...styles.thumb,
          backgroundColor: enabled ? "#BE2A22" : "#7F7F7F",
          // Slide the thumb right when enabled, left when disabled
          transform: enabled ? "translateX(20px)" : "translateX(2px)",
        }}
      />
    </div>
  );
}

const styles = {
  track: {
    width: 44,
    height: 26,
    borderRadius: 13,
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    flexShrink: 0,
    // Smooth thumb slide
    transition: "background-color 0.2s ease",
    userSelect: "none",
    WebkitUserSelect: "none",
  },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    transition: "transform 0.2s ease, background-color 0.2s ease",
  },
};