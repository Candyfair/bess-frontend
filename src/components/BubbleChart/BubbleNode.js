// -------------------------------------------------------------------
// COMPONENT
// Renders only the circle for a single battery bubble.
// Labels are rendered as HTML overlays in BubbleChart to avoid
// SVG text pixel-snapping on Safari/WebKit, which causes vertical jitter.
//
// Props:
//   radius     : pixel radius computed by BubbleChart's radius scale
//   isSelected : whether this bubble is currently selected
//   isActive   : battery.is_active
// -------------------------------------------------------------------
export default function BubbleNode({ radius, isSelected, isActive }) {
  return (
    <circle
      r={radius}
      fill={isSelected ? "#4FC3F7" : isActive ? "#29B6F6" : "#455A64"}
      stroke={isSelected ? "#ffffff" : "transparent"}
      strokeWidth={isSelected ? 2 : 0}
      style={{ transition: "fill 0.3s ease" }}
    />
  );
}