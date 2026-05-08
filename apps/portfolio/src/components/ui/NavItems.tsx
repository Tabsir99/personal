"use client";
import { useRef, useState } from "react";
import {
  Menu,
  X,
  Home,
  FolderOpen,
  Star,
  User,
  Code,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const navItems = [
  { text: "Home", icon: Home, link: "#home", id: "home" },
  {
    text: "Portfolio",
    icon: FolderOpen,
    link: "#portfolio",
    id: "portfolio",
  },
  {
    text: "Testimonials",
    icon: Star,
    link: "#testimonials",
    id: "testimonials",
  },

  { text: "About", icon: User, link: "#about", id: "about" },
  {
    text: "Skills",
    icon: Code,
    link: "#skills",
    id: "skills",
  },
  { text: "Contact", icon: Mail, link: "#contact", id: "contact" },
];

interface NavItemsProps {
  activeSection?: string;
}

export const NavItems = ({ activeSection = "home" }: NavItemsProps) => {
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (window.innerWidth < 768) return;
    const target = e.currentTarget;
    const parent = navRef.current;
    if (parent) {
      const parentRect = parent.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      setIndicatorStyle({
        left: targetRect.left - parentRect.left,
        width: targetRect.width,
        opacity: 1,
      });
    }
  };

  const handleMouseLeave = () => {
    setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div className="relative">
      <button
        className="p-2 text-zinc-400 hover:text-white transition-colors sm:hidden relative z-60"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Full-screen overlay with smooth circle expansion */}
      <div
        className={cn(
          "fixed top-0 right-0 bg-zinc-900 transition-all duration-700 ease-in-out sm:hidden",
          open ? "z-40" : "z-40 pointer-events-none"
        )}
        style={{
          width: "100vw",
          height: "100vh",
          clipPath: open ? "circle(150% at 100% 0%)" : "circle(0% at 100% 0%)",
        }}
      />

      <div
        ref={navRef}
        className={cn(
          "flex items-center space-x-1 max-sm:flex-col max-sm:fixed max-sm:top-10 max-sm:left-0 max-sm:right-0 max-sm:items-center max-sm:justify-center max-sm:gap-4 transition-all duration-500 z-50",
          open
            ? "max-sm:opacity-100 max-sm:visible"
            : "max-sm:opacity-0 max-sm:invisible max-sm:pointer-events-none"
        )}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="absolute h-full bg-zinc-800/50 rounded-lg transition-all duration-300 ease-out pointer-events-none max-sm:hidden"
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
            opacity: indicatorStyle.opacity,
          }}
        />
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <a
              key={item.text}
              href={item.link}
              onMouseEnter={handleMouseEnter}
              onPointerDown={(e) => {
                e.preventDefault();
                window.location.href = item.link;
                setOpen(false);
              }}
              className={cn(
                "nav-link",
                "relative flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 group z-10 opacity-0",
                isActive ? "text-white" : "text-zinc-400 hover:text-white"
              )}
              data-fadein
              style={{
                animationDelay: `${100 + index * 50}ms`,
              }}
            >
              <Icon
                size={18}
                className="transition-transform duration-300 group-hover:scale-110"
              />
              <span className="text-lg sm:text-base">{item.text}</span>
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-linear-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-300" />
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
};
