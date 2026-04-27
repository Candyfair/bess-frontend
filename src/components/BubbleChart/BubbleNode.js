// src/components/BubbleChart/BubbleNode.js

// -------------------------------------------------------------------
// COMPONENT
// Renders a single battery bubble as SVG elements.
// Positioning is handled entirely by the parent BubbleChart via D3 transforms.
// This component only handles visual rendering — no D3 logic here.
//
// All elements are drawn around (0, 0) because D3 applies
// translate(x, y) on the parent <g>, making (0, 0) the bubble centre.
//
// Props:
//   battery    : battery object from the API
//   radius     : pixel radius computed by BubbleChart's radius scale
//   isSelected : whether this bubble is currently selected
//   metric     : "capacity_kwh" | "max_charge_rate_kw" — controls label display
// -------------------------------------------------------------------
export default function BubbleNode({ battery, radius, isSelected, metric }) {
  // Format the metric value for display inside the bubble.
  // Math.round strips decimals — labels need to stay readable at small sizes.
  const metricLabel =
    metric === "capacity_kwh"
      ? `${Math.round(battery.capacity_kwh)} kWh`
      : `${Math.round(battery.max_charge_rate_kw)} kW`;

  // Font size scales with bubble radius, with a minimum to stay legible.
  const fontSize = Math.max(9, radius * 0.28);

  // Vertical offset between the name and the metric value labels.
  // Proportional to radius so spacing adapts across all bubble sizes.
  const labelOffset = radius * 0.22;

  return (
    <g>
      {/* ---- CIRCLE ---- */}
      <circle
        r={radius}
        fill={
          isSelected
            ? "#4FC3F7"                    // selected: light blue
            : battery.is_active
            ? "#29B6F6"                    // active: blue
            : "#455A64"                    // inactive: slate grey
        }
        stroke={isSelected ? "#ffffff" : "transparent"}
        strokeWidth={isSelected ? 2 : 0}
        // CSS transitions on SVG properties for smooth state changes.
        // Works on Safari (iOS 15+) which covers iPhone 12/13 mini targets.
        style={{ transition: "fill 0.3s ease" }}
      />

      {/* ---- BATTERY NAME ---- */}
      <text
        textAnchor="middle"
        dominantBaseline="middle"
        dy={-labelOffset}
        fontSize={fontSize}
        fontWeight="600"
        fill="#ffffff"
        style={{
          // Prevent text from intercepting tap/click events meant for the parent <g>
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {battery.name}
      </text>

      {/* ---- METRIC VALUE ---- */}
      <text
        textAnchor="middle"
        dominantBaseline="middle"
        dy={labelOffset}
        fontSize={fontSize * 0.85}
        fill={isSelected ? "#e0f7fa" : "rgba(255,255,255,0.75)"}
        style={{
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {metricLabel}
      </text>
    </g>
  );
}