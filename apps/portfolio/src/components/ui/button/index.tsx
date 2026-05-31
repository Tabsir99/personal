import "./button.css";
export function Button({ href = "#", label = "Download CV" }) {
  return (
    <a
      className="btn-prog relative overflow-hidden inline-flex px-4 py-2.5 tracking-widest text-cream/80 border-cream/40 transition-colors
      hover:text-ink hover:border-accent font-mono text-xs border
      "
      href={href}
      download
    >
      <span className="z-2"> ↓ {label}</span>
    </a>
  );
}
