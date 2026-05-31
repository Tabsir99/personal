import { cn } from "@/lib/utils";
import "./button.css";
export function Button({
  href = "#",
  label = "Download CV",
  className = "",
  ...props
}) {
  return (
    <a
      className={cn(
        "btn-prog relative overflow-hidden inline-flex px-4 py-2.5 tracking-widest text-cream/80 border-cream/60 transition-colors",
        "hover:text-ink hover:border-accent font-mono text-xs border",
        className,
      )}
      href={href}
      download
      {...props}
    >
      <span className="z-2"> ↓ {label}</span>
    </a>
  );
}
