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
import { Kbd } from "../ui/Kbd";
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
      {/* Brand — collapsed: centered logo only. Expanded: logo + label. */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-sidebar-border",
          expanded ? "gap-3 px-4" : "justify-center px-0",
        )}
      >
        <Img
          src={`${clientEnv.MEDIA_ORIGIN}/logo.png`}
          alt="Logo"
          width={36}
          height={36}
          className="shrink-0 rounded-md"
        />
        {expanded && (
          <span className="min-w-0 truncate text-sm font-semibold tracking-tight text-foreground">
            Studio
          </span>
        )}
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
                  "group relative flex h-10 items-center rounded-md text-sm font-medium transition-colors",
                  expanded ? "gap-3 px-3" : "justify-center px-0",
                  item.isActive
                    ? "bg-primary/[0.06] text-foreground"
                    : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground",
                )}
              >
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
                {expanded && (
                  <span className="min-w-0 flex-1 truncate">
                    {item.menuName}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer — stable vertical stack regardless of expand state */}
      <div className="flex shrink-0 flex-col gap-0.5 border-t border-sidebar-border px-2 py-2">
        <button
          type="button"
          onClick={toggleTheme}
          title={!expanded ? (isDark ? "Light mode" : "Dark mode") : undefined}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className={cn(
            "flex h-9 items-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground",
            expanded ? "gap-3 px-3" : "justify-center px-0",
          )}
        >
          <div className="relative h-4 w-4 shrink-0">
            <Sun
              className={cn(
                "absolute inset-0 transition-all duration-200",
                isDark
                  ? "rotate-90 scale-0 opacity-0"
                  : "rotate-0 scale-100 opacity-100",
              )}
            />
            <Moon
              className={cn(
                "absolute inset-0 transition-all duration-200",
                isDark
                  ? "rotate-0 scale-100 opacity-100"
                  : "-rotate-90 scale-0 opacity-0",
              )}
            />
          </div>
          {expanded && (
            <>
              <span className="flex-1 text-left text-sm font-medium">
                {isDark ? "Light mode" : "Dark mode"}
              </span>
              <Kbd size="sm" className="border-sidebar-border/60">
                ⇧⌘L
              </Kbd>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          title={!expanded ? "Sign out" : undefined}
          aria-label="Sign out"
          className={cn(
            "flex h-9 items-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/[0.08] hover:text-destructive disabled:pointer-events-none disabled:opacity-50",
            expanded ? "gap-3 px-3" : "justify-center px-0",
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {expanded && (
            <span className="flex-1 text-left text-sm font-medium">
              Sign out
            </span>
          )}
        </button>

        {expanded && (
          <div className="mt-1 flex items-center justify-between border-t border-sidebar-border px-3 pt-2 pb-1">
            <span className="font-mono text-eyebrow text-muted-foreground/60">
              {isPinned ? "Pinned" : "Hover to expand"}
            </span>
            <Kbd size="sm" className="border-sidebar-border/60">
              ⌘\
            </Kbd>
          </div>
        )}
      </div>
    </aside>
  );
};

export default DashBoardSidebar;
