"use client";

// TotalPowerBadge — animated badge that shows total fleet power.
//
// Two states driven by isExpanded (= filter modal is open) :
//   collapsed : top-left corner, amount only, small font
//   expanded  : bottom-center, full label + amount, larger font
//
// When isDetailOpen is true the badge fades out entirely to make
// room for the back arrow in AssetDetailPage.
//
// Animation strategy (Option A) :
//   We animate `top`, `left`, `bottom`, `transform` and `font-size`
//   directly via a CSS transition on the wrapping div.
//   The element stays mounted at all times — no mount/unmount flicker.
//   If performance is an issue on device we can switch to Option B
//   (two elements with opacity crossfade) without touching the API.

export default function TotalPowerBadge({ value, isExpanded, isDetailOpen }) {

  // ------------------------------------------------------------------
  // DYNAMIC POSITION + SIZE
  // We derive every animatable property from the two boolean props.
  // CSS transition handles the interpolation between states.
  // ------------------------------------------------------------------
  const collapsed = !isExpanded;

  const dynamicStyle = collapsed
    ? {
        // Collapsed state — top left
        position: "fixed",
        top: 12,
        left: 12,
        bottom: "auto",
        transform: "translateX(0)",
        fontSize: 14,
        paddingTop: 6,
        paddingBottom: 6,
        paddingLeft: 12,
        paddingRight: 12,
        opacity: isDetailOpen ? 0 : 1,
        pointerEvents: isDetailOpen ? "none" : "auto",
      }
    : {
        // Expanded state — bottom center
        position: "fixed",
        top: "auto",
        bottom: 32,
        left: "50%",
        transform: "translateX(-50%)",
        fontSize: 20,
        paddingTop: 12,
        paddingBottom: 12,
        paddingLeft: 16,
        paddingRight: 16,
        opacity: isDetailOpen ? 0 : 1,
        pointerEvents: isDetailOpen ? "none" : "auto",
      };

  return (
    <div style={{ ...styles.badge, ...dynamicStyle }}>
      <span style={{
        ...styles.text,
        fontSize: "inherit",
      }}>
        {collapsed
          ? `${value} mWh`
          : `Total power: ${value} mWh`
        }
      </span>
    </div>
  );
}

// -------------------------------------------------------------------
// STYLES
// -------------------------------------------------------------------
const styles = {
  badge: {
    // Visual style — identical in both states
    backgroundColor: "var(--color-power-bg)",
    border: "1px solid var(--color-power-border)",
    borderRadius: 10,
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    zIndex: 60,

    // Transition — all animatable properties in one declaration.
    // `top`, `left`, `bottom`, `transform`, `font-size`,
    // `padding` and `opacity` all interpolate smoothly.
    transition: [
      "top 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      "left 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      "bottom 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      "font-size 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      "padding 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      "opacity 0.35s ease",
    ].join(", "),
  },

  text: {
    fontFamily: "'Roboto Mono', monospace",
    fontWeight: 600,
    color: "var(--color-panel-title)",
    // fontSize is inherited from the parent div's dynamic style
    // so the transition on font-size applies correctly
    letterSpacing: "-0.05em",
    whiteSpace: "nowrap",
  },
};