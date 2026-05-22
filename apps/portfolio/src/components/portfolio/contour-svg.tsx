export function ContourSVG() {
  const summitA: { rx: number; ry: number; rot: number; opacity: number }[] = [];
  for (let i = 0; i < 16; i++) {
    summitA.push({
      rx: 70 + i * 58,
      ry: 50 + i * 42,
      rot: -14 + i * 0.6,
      opacity: 0.65 - i * 0.025,
    });
  }
  const summitB: { rx: number; ry: number; rot: number; opacity: number }[] = [];
  for (let i = 0; i < 14; i++) {
    summitB.push({
      rx: 60 + i * 64,
      ry: 80 + i * 48,
      rot: 24 - i * 0.4,
      opacity: 0.55 - i * 0.025,
    });
  }
  const summitC: { rx: number; ry: number; rot: number; opacity: number }[] = [];
  for (let i = 0; i < 10; i++) {
    summitC.push({
      rx: 40 + i * 44,
      ry: 30 + i * 32,
      rot: 4 + i * 0.8,
      opacity: 0.4 - i * 0.02,
    });
  }

  return (
    <svg
      className="absolute inset-0 w-full h-full animate-breathe will-change-transform motion-reduce:animate-none"
      viewBox="0 0 1600 2400"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g fill="none" strokeWidth="1" className="stroke-accent/10">
        {summitA.map((r, i) => (
          <ellipse
            key={`a${i}`}
            cx="420"
            cy="780"
            rx={r.rx}
            ry={r.ry}
            transform={`rotate(${r.rot} 420 780)`}
            opacity={r.opacity}
          />
        ))}
      </g>
      <g fill="none" strokeWidth="1" className="stroke-phosphor/7">
        {summitB.map((r, i) => (
          <ellipse
            key={`b${i}`}
            cx="1240"
            cy="1780"
            rx={r.rx}
            ry={r.ry}
            transform={`rotate(${r.rot} 1240 1780)`}
            opacity={r.opacity}
          />
        ))}
      </g>
      <g fill="none" strokeWidth="1" className="stroke-accent/8">
        {summitC.map((r, i) => (
          <ellipse
            key={`c${i}`}
            cx="1380"
            cy="380"
            rx={r.rx}
            ry={r.ry}
            transform={`rotate(${r.rot} 1380 380)`}
            opacity={r.opacity}
          />
        ))}
      </g>
      <g className="stroke-field-gray/6" strokeWidth="0.5" strokeDasharray="2 6">
        <line x1="420" y1="780" x2="1240" y2="1780" />
        <line x1="420" y1="780" x2="1380" y2="380" />
        <line x1="1240" y1="1780" x2="1380" y2="380" />
      </g>
    </svg>
  );
}
