"use client";
import { usePathname, useRouter } from "next/navigation";
import {
  Edit,
  LogOut,
  LayoutDashboard,
  FileText,
  Briefcase,
  Globe,
  Moon,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Img from "../ui/image";
import { Eyebrow } from "../ui/Eyebrow";
import { Kbd } from "../ui/Kbd";
import { StatusDot } from "../ui/StatusDot";
import { clientEnv } from "@/config/env.client";
import { logOutAction } from "@/actions/authActions";

interface NavItem {
  Icon: LucideIcon;
  menuName: string;
  menuLink: string;
  isActive: boolean;
}

const DashBoardSidebar = () => {
  const rootDashBoardUrl = "/dashboard";
  const pathname = usePathname();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    await logOutAction();
    router.replace("/");
    router.refresh();
  };

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    setIsDark(theme === "dark");
  }, []);

  // Cmd/Ctrl + \ pins/unpins the sidebar — Linear/Stripe pattern.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
        e.preventDefault();
        setIsPinned((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggleTheme = () => {
    const nextIsDark = !isDark;
    setIsDark(nextIsDark);
    document.documentElement.classList.toggle("dark", nextIsDark);
    document.body.classList.toggle("dark", nextIsDark);
    localStorage.setItem("theme", nextIsDark ? "dark" : "light");
  };

  const expanded = isExpanded || isPinned;

  const sidebarItems: NavItem[] = [
    {
      Icon: LayoutDashboard,
      menuName: "Dashboard",
      menuLink: rootDashBoardUrl,
      isActive: pathname === rootDashBoardUrl,
    },
    {
      Icon: Edit,
      menuName: "Write Blog",
      menuLink: `${rootDashBoardUrl}/write-blog`,
      isActive: pathname.includes("/write-blog"),
    },
    {
      Icon: FileText,
      menuName: "Manage Posts",
      menuLink: `${rootDashBoardUrl}/manage-posts`,
      isActive: pathname.includes("/manage-posts"),
    },
    {
      Icon: Briefcase,
      menuName: "Portfolio",
      menuLink: `${rootDashBoardUrl}/portfolio/metadata`,
      isActive: pathname.includes("/portfolio"),
    },
    {
      Icon: Globe,
      menuName: "Blog Site",
      menuLink: `${rootDashBoardUrl}/blog-site`,
      isActive: pathname.includes("/blog-site"),
    },
  ];

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-30 flex h-screen flex-col border-r border-sidebar-border bg-sidebar/95 backdrop-blur-xl transition-[width] duration-200 ease-out",
        expanded ? "w-56 shadow-card-rest" : "w-[72px]",
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      aria-expanded={expanded}
      aria-label="Primary navigation"
    >
      {/* Brand */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-sidebar-border px-4">
        <Img
          src={`${clientEnv.MEDIA_ORIGIN}/logo.png`}
          alt="Logo"
          width={36}
          height={36}
          className="shrink-0 rounded-md"
        />
        <div
          className={cn(
            "flex min-w-0 flex-col gap-0.5 transition-opacity duration-200",
            expanded ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <Eyebrow size="xs" tone="muted" family="mono">
            TABSIRCG · ADMIN
          </Eyebrow>
          <span className="truncate text-[13px] font-medium text-foreground">
            Studio
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="flex flex-col gap-0.5">
          {sidebarItems.map((item) => (
            <li key={item.menuLink}>
              <Link
                href={item.menuLink}
                aria-current={item.isActive ? "page" : undefined}
                title={!expanded ? item.menuName : undefined}
                className={cn(
                  "group relative flex h-10 items-center gap-3 rounded-md text-sm font-medium transition-colors",
                  expanded ? "px-3" : "justify-center px-0",
                  item.isActive
                    ? "bg-primary/[0.06] text-foreground"
                    : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground",
                )}
              >
                {/* Quiet active-state hairline — no glow, no gradient.
                    view-transition-name on the active rail makes it slide
                    between positions on route change instead of fade. */}
                {item.isActive && (
                  <span
                    aria-hidden="true"
                    data-active-rail="true"
                    className="absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary"
                  />
                )}
                <item.Icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0 transition-colors",
                    item.isActive
                      ? "text-primary"
                      : "text-muted-foreground/70 group-hover:text-foreground",
                  )}
                />
                <span
                  className={cn(
                    "min-w-0 flex-1 truncate transition-opacity duration-200",
                    expanded ? "opacity-100" : "pointer-events-none w-0 opacity-0",
                  )}
                >
                  {item.menuName}
                </span>
                {item.isActive && expanded && (
                  <StatusDot tone="primary" size="sm" aria-hidden="true" />
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer cluster */}
      <div className="shrink-0 border-t border-sidebar-border">
        {expanded && (
          <div className="flex items-center justify-between px-3 pt-3 pb-2">
            <Eyebrow size="xs" tone="muted" family="mono">
              ⌘\ to pin
            </Eyebrow>
            {isPinned && (
              <Eyebrow size="xs" tone="primary" family="mono">
                PINNED
              </Eyebrow>
            )}
          </div>
        )}
        <div
          className={cn(
            "flex items-center gap-1 p-2",
            expanded ? "justify-between" : "flex-col",
          )}
        >
          <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? "Light mode" : "Dark mode"}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className={cn(
              "relative inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground",
            )}
          >
            <Sun
              className={cn(
                "absolute h-4 w-4 transition-all duration-200",
                isDark
                  ? "rotate-90 scale-0 opacity-0"
                  : "rotate-0 scale-100 opacity-100",
              )}
            />
            <Moon
              className={cn(
                "absolute h-4 w-4 transition-all duration-200",
                isDark
                  ? "rotate-0 scale-100 opacity-100"
                  : "-rotate-90 scale-0 opacity-0",
              )}
            />
          </button>
          {expanded && (
            <Kbd size="sm" className="border-sidebar-border/60">
              ⇧⌘L
            </Kbd>
          )}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            title="Sign out"
            aria-label="Sign out"
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/[0.08] hover:text-destructive disabled:pointer-events-none disabled:opacity-50",
              expanded && "ml-auto",
            )}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default DashBoardSidebar;
