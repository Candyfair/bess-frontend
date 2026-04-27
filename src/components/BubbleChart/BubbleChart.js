// src/components/BubbleChart/BubbleChart.js
import { useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import BubbleNode from "./BubbleNode";

// -------------------------------------------------------------------
// CONFIGURATION
// All visual and physical parameters are centralised here.
// Adjust these values to tune the simulation behaviour and appearance.
// -------------------------------------------------------------------
const CONFIG = {
  MIN_RADIUS: 24,
  MAX_RADIUS: 72,
  CENTER_FORCE_STRENGTH: 0.04,
  COLLISION_PADDING: 6,
  FLOAT_AMPLITUDE: 0.3,
  ZOOM_MIN: 0.5,
  ZOOM_MAX: 4,
  FOCUS_TRANSITION_MS: 600,
  FOCUS_Y_RATIO: 0.25,
};

// -------------------------------------------------------------------
// COMPONENT
// Props:
//   batteries  : array of battery objects from useBatteries
//   metric     : "capacity_kwh" | "max_charge_rate_kw"
//   selectedId : id of the currently selected battery, or null
//   onSelect   : callback fired on bubble tap — receives the battery object
// -------------------------------------------------------------------
export default function BubbleChart({ batteries, metric, selectedId, onSelect }) {
  const svgRef = useRef(null);
  const gRef = useRef(null);
  const nodesRef = useRef([]);
  const simulationRef = useRef(null);
  const zoomRef = useRef(null);

  // Maps a metric value to a pixel radius using a linear scale.
  const buildRadiusScale = useCallback((data, metricKey) => {
    const values = data.map((b) => b[metricKey]);
    return d3
      .scaleLinear()
      .domain([d3.min(values), d3.max(values)])
      .range([CONFIG.MIN_RADIUS, CONFIG.MAX_RADIUS]);
  }, []);

  // -------------------------------------------------------------------
  // SIMULATION INITIALISATION — runs once when battery data is ready
  // -------------------------------------------------------------------
  useEffect(() => {
    if (!batteries.length || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const radiusScale = buildRadiusScale(batteries, metric);

    // D3 mutates x, y, vx, vy directly on these objects each tick.
    // Using a ref means React never sees these mutations — intentional.
    nodesRef.current = batteries.map((b) => ({
      ...b,
      r: radiusScale(b[metric]),
      x: width / 2 + (Math.random() - 0.5) * 100,
      y: height / 2 + (Math.random() - 0.5) * 100,
    }));

    // Adds a small random velocity each tick — produces organic floating.
    function floatForce() {
      nodesRef.current.forEach((node) => {
        node.vx += (Math.random() - 0.5) * CONFIG.FLOAT_AMPLITUDE;
        node.vy += (Math.random() - 0.5) * CONFIG.FLOAT_AMPLITUDE;
      });
    }

    // alphaDecay(0) + alphaTarget(0.3): keeps the simulation running
    // indefinitely at a steady energy level — enables permanent floating.
    const simulation = d3
      .forceSimulation(nodesRef.current)
      .force("center", d3.forceCenter(width / 2, height / 2).strength(CONFIG.CENTER_FORCE_STRENGTH))
      .force("collide", d3.forceCollide((d) => d.r + CONFIG.COLLISION_PADDING).strength(0.8))
      .force("x", d3.forceX(width / 2).strength(0.02))
      .force("y", d3.forceY(height / 2).strength(0.02))
      .force("float", floatForce)
      .alphaDecay(0)
      .alphaTarget(0.3)
      .on("tick", () => {
        // Update SVG transforms directly — bypasses React state for 60fps performance.
        d3.select(gRef.current)
          .selectAll("g.bubble-node")
          .data(nodesRef.current, (d) => d.id)
          .attr("transform", (d) => `translate(${d.x}, ${d.y})`);
      });

    simulationRef.current = simulation;

    // d3.zoom() handles pinch/drag on touch and scroll/drag on desktop.
    // Transform is applied to <g>, not <svg> — map-style pan/zoom.
    const zoom = d3
      .zoom()
      .scaleExtent([CONFIG.ZOOM_MIN, CONFIG.ZOOM_MAX])
      .on("zoom", (event) => {
        d3.select(gRef.current).attr("transform", event.transform);
      });

    svg.call(zoom);
    zoomRef.current = zoom;

    return () => {
      simulation.stop();
      svg.on(".zoom", null);
    };
  // metric is intentionally excluded: radius updates are handled separately
  // to avoid recreating the simulation on every toggle.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batteries]);

  // -------------------------------------------------------------------
  // METRIC UPDATE — updates radii and reheats without recreating the sim
  // -------------------------------------------------------------------
  useEffect(() => {
    if (!simulationRef.current || !nodesRef.current.length) return;

    const radiusScale = buildRadiusScale(batteries, metric);
    nodesRef.current.forEach((node) => {
      node.r = radiusScale(node[metric]);
    });

    simulationRef.current
      .force("collide", d3.forceCollide((d) => d.r + CONFIG.COLLISION_PADDING).strength(0.8))
      .alpha(0.5)
      .restart();
  }, [metric, batteries, buildRadiusScale]);

  // -------------------------------------------------------------------
  // SELECTED BUBBLE FOCUS
  // Pins the selected node to the upper area via D3 fx/fy constraints.
  // Cleanup unpins the node when selection changes.
  // -------------------------------------------------------------------
  useEffect(() => {
    if (!selectedId || !svgRef.current || !simulationRef.current) return;

    const node = nodesRef.current.find((n) => n.id === selectedId);
    if (!node) return;

    node.fx = svgRef.current.clientWidth / 2;
    node.fy = svgRef.current.clientHeight * CONFIG.FOCUS_Y_RATIO;

    return () => {
      node.fx = null;
      node.fy = null;
    };
  }, [selectedId]);

  // -------------------------------------------------------------------
  // RENDER
  // <svg> fills its container — dimensions controlled by the parent.
  // <g ref={gRef}> is the pan/zoom target.
  // Each <g className="bubble-node"> is the D3 tick target + click handler.
  // -------------------------------------------------------------------
  return (
    <svg
      ref={svgRef}
      style={{ width: "100%", height: "100%", display: "block" }}
      aria-label="Battery fleet map"
    >
      <g ref={gRef}>
        {nodesRef.current.map((node) => (
          <g
            key={node.id}
            className="bubble-node"
            onClick={() => onSelect(node)}
            style={{ cursor: "pointer" }}
          >
            <BubbleNode
              battery={node}
              radius={node.r}
              isSelected={node.id === selectedId}
              metric={metric}
            />
          </g>
        ))}
      </g>
    </svg>
  );
}