import { useEffect, useRef, useCallback, useState } from "react";
import * as d3 from "d3";
import BubbleNode from "./BubbleNode";

const CONFIG = {
  MIN_RADIUS: 24,
  MAX_RADIUS: 72,
  CENTER_FORCE_STRENGTH: 0.04,
  COLLISION_PADDING: 6,
  ZOOM_MIN: 0.5,
  ZOOM_MAX: 4,
  FOCUS_Y_RATIO: 0.25,
  FLOAT_SPEED_MIN: 0.006,
  FLOAT_SPEED_MAX: 0.022,
  FLOAT_FORCE: 0.22,
  VELOCITY_DECAY: 0.55,
};

export default function BubbleChart({ batteries, metric, selectedId, onSelect }) {
  const svgRef = useRef(null);
  const gRef = useRef(null);
  const labelsRef = useRef(null);  // ref to the HTML label overlay container
  const simulationRef = useRef(null);
  const zoomRef = useRef(null);
  const nodesRef = useRef([]);
  const [nodes, setNodes] = useState([]);

  // currentZoom tracks the active D3 zoom transform so label positions
  // can be recalculated correctly when the user pans or zooms.
  const currentZoomRef = useRef(d3.zoomIdentity);

  const buildRadiusScale = useCallback((data, metricKey) => {
    const values = data.map((b) => b[metricKey]);
    return d3
      .scaleLinear()
      .domain([d3.min(values), d3.max(values)])
      .range([CONFIG.MIN_RADIUS, CONFIG.MAX_RADIUS]);
  }, []);

  // -------------------------------------------------------------------
  // LABEL POSITION UPDATE
  // Applies the current zoom transform to a node's simulation coordinates
  // to get the correct screen position for its HTML label.
  // Called both in the simulation tick and in the zoom event handler.
  // -------------------------------------------------------------------
  const updateLabelPositions = useCallback(() => {
    if (!labelsRef.current) return;
    const labelDivs = labelsRef.current.children;
    const t = currentZoomRef.current;

    nodesRef.current.forEach((node, i) => {
      const el = labelDivs[i];
      if (!el) return;
      // Apply the zoom transform to the simulation coordinates.
      // t.applyX / t.applyY convert from simulation space to screen space.
      const screenX = t.applyX(node.x);
      const screenY = t.applyY(node.y);
      // translate(-50%, -50%) centres the label div on the bubble position.
      el.style.transform = `translate(calc(${screenX}px - 50%), calc(${screenY}px - 50%))`;
    });
  }, []);

  // -------------------------------------------------------------------
  // SIMULATION INITIALISATION
  // -------------------------------------------------------------------
  useEffect(() => {
    if (!batteries.length || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const radiusScale = buildRadiusScale(batteries, metric);

    const initialNodes = batteries.map((b) => ({
      ...b,
      r: radiusScale(b[metric]),
      x: width / 2 + (Math.random() - 0.5) * 100,
      y: height / 2 + (Math.random() - 0.5) * 100,
      floatAngle: Math.random() * Math.PI * 2,
      floatSpeed:
        CONFIG.FLOAT_SPEED_MIN +
        Math.random() * (CONFIG.FLOAT_SPEED_MAX - CONFIG.FLOAT_SPEED_MIN),
    }));

    nodesRef.current = initialNodes;
    setNodes([...initialNodes]);

    function floatForce() {
      nodesRef.current.forEach((node) => {
        node.floatAngle += node.floatSpeed + (Math.random() - 0.5) * 0.006;
        node.vx += Math.cos(node.floatAngle) * CONFIG.FLOAT_FORCE;
        node.vy += Math.sin(node.floatAngle) * CONFIG.FLOAT_FORCE;
      });
    }

    const simulation = d3
      .forceSimulation(nodesRef.current)
      .force("center", d3.forceCenter(width / 2, height / 2).strength(CONFIG.CENTER_FORCE_STRENGTH))
      .force("collide", d3.forceCollide((d) => d.r + CONFIG.COLLISION_PADDING).strength(0.8))
      .force("x", d3.forceX(width / 2).strength(0.02))
      .force("y", d3.forceY(height / 2).strength(0.02))
      .force("float", floatForce)
      .velocityDecay(CONFIG.VELOCITY_DECAY)
      .alphaDecay(0)
      .alphaTarget(0.3)
      .on("tick", () => {
        // Update SVG circle positions
        if (!gRef.current) return;
        const groups = gRef.current.querySelectorAll("g.bubble-node");
        nodesRef.current.forEach((node, i) => {
          if (groups[i]) {
            groups[i].setAttribute(
              "transform",
              `translate(${node.x}, ${node.y})`
            );
          }
        });
        // Update HTML label positions in the same tick
        updateLabelPositions();
      });

    simulationRef.current = simulation;

    const zoom = d3
      .zoom()
      .scaleExtent([CONFIG.ZOOM_MIN, CONFIG.ZOOM_MAX])
      .on("zoom", (event) => {
        // Update the SVG group transform as before
        d3.select(gRef.current).attr("transform", event.transform);
        // Store the current zoom transform and reposition labels
        currentZoomRef.current = event.transform;
        updateLabelPositions();
      });

    svg.call(zoom);
    zoomRef.current = zoom;

    return () => {
      simulation.stop();
      svg.on(".zoom", null);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batteries]);

  // -------------------------------------------------------------------
  // METRIC UPDATE
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
  // Two layers stacked inside a relative container:
  //   1. SVG  — renders circles only, managed by D3
  //   2. HTML div overlay — renders text labels, positioned via CSS transform
  //      pointerEvents: none so taps pass through to the SVG circles below
  // -------------------------------------------------------------------
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>

      {/* ---- LAYER 1 : SVG circles ---- */}
      <svg
        ref={svgRef}
        style={{ width: "100%", height: "100%", display: "block" }}
        aria-label="Battery fleet map"
      >
        <g ref={gRef}>
          {nodes.map((node) => (
            <g
              key={node.id}
              className="bubble-node"
              onClick={() => onSelect(node)}
              style={{ cursor: "pointer", willChange: "transform" }}
            >
              <BubbleNode
                radius={node.r}
                isSelected={node.id === selectedId}
                isActive={node.is_active}
              />
            </g>
          ))}
        </g>
      </svg>

      {/* ---- LAYER 2 : HTML label overlay ---- */}
      {/* position: absolute + inset: 0 makes this layer cover the SVG exactly. */}
      {/* pointerEvents: none lets taps fall through to the SVG circles below.  */}
      <div
        ref={labelsRef}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {nodes.map((node) => {
          const metricLabel =
            metric === "capacity_kwh"
              ? `${Math.round(node.capacity_kwh)} kWh`
              : `${Math.round(node.max_charge_rate_kw)} kW`;

          const fontSize = Math.max(8, Math.min(node.r * 0.24, 13));
          const isSelected = node.id === selectedId;

          return (
            <div
              key={node.id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                // Width matches the bubble diameter so text wraps correctly
                width: node.r * 1.8,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                // Initial position — D3 will update this every tick via
                // updateLabelPositions() without going through React state
                transform: "translate(-50%, -50%)",
                willChange: "transform",
              }}
            >
              <span
                style={{
                  fontSize,
                  fontWeight: 600,
                  color: "#ffffff",
                  lineHeight: 1.1,
                  textAlign: "center",
                  // Truncate with ellipsis if the name is wider than the bubble
                  maxWidth: "100%",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >
                {node.name}
              </span>
              <span
                style={{
                  fontSize: fontSize * 0.88,
                  color: isSelected ? "#e0f7fa" : "rgba(255,255,255,0.7)",
                  lineHeight: 1.1,
                  textAlign: "center",
                }}
              >
                {metricLabel}
              </span>
            </div>
          );
        })}
      </div>

    </div>
  );
}