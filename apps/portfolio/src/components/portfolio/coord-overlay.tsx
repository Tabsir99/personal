/* --------- Coordinate waypoints (near plane) ----------
   Sparse field-survey marks. A few crosshairs, a few small filled
   circles, a couple of tiny serif coordinate labels. Placed at
   hand-chosen positions so the eye finds three or four per viewport;
   anything denser would compete with content. */
type Waypoint = [number, number, "cross" | "dot" | "tick", string?];

const WAYPOINTS: Waypoint[] = [
  // [x%, y%, kind, label?]
  [8, 12, "cross"],
  [92, 18, "dot"],
  [22, 34, "cross", "23° 14′"],
  [78, 46, "dot"],
  [6, 58, "tick"],
  [88, 64, "cross"],
  [14, 78, "dot"],
  [82, 86, "cross", "90° E"],
  [42, 22, "tick"],
  [58, 72, "dot"],
  [4, 92, "cross"],
  [96, 38, "tick"],
  // a second tier of waypoints lower down (since the layer is 220vh tall)
  [12, 112, "cross", "47° N"],
  [82, 128, "dot"],
  [28, 146, "tick"],
  [76, 158, "cross"],
  [10, 172, "dot"],
  [90, 184, "cross"],
  [44, 196, "tick"],
  [18, 208, "cross", "06° W"],
];

export function CoordOverlay() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 100 220"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {WAYPOINTS.map((w, i) => {
        const [x, y, kind, label] = w;
        if (kind === "cross") {
          return (
            <g key={i} className="stroke-cream/20" strokeWidth="0.08">
              <line x1={x - 0.7} y1={y} x2={x + 0.7} y2={y} />
              <line x1={x} y1={y - 0.7} x2={x} y2={y + 0.7} />
              <circle cx={x} cy={y} r="0.15" className="fill-accent/60" stroke="none" />
              {label && (
                <text
                  x={x + 1.2}
                  y={y + 0.3}
                  className="fill-field-gray/35"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize="0.65"
                  letterSpacing="0.05"
                >
                  {label}
                </text>
              )}
            </g>
          );
        }
        if (kind === "dot") {
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="0.22"
              className="fill-phosphor/30"
              stroke="none"
            />
          );
        }
        return (
          <line
            key={i}
            x1={x - 0.5}
            y1={y}
            x2={x + 0.5}
            y2={y}
            className="stroke-field-gray/25"
            strokeWidth="0.06"
          />
        );
      })}
    </svg>
  );
}
