"use client";
import { usePathname, useRouter } from "next/navigation";
import {
  PencilSimple,
  SignOut,
  ChartBar as ChartBarIcon,
  FileText,
  Briefcase,
  Globe,
  type Icon,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Img from "./ui/image";
import { Kbd } from "./ui/Kbd";
import { clientEnv } from "@/config/env.client";
import { logOutAction } from "@/actions/authActions";

interface NavItem {
  Icon: Icon;
  menuName: string;
  menuLink: string;
  isActive: boolean;
}

const DashBoardSidebar = () => {
  const rootDashBoardUrl = "/analytics";
  const pathname = usePathname();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    await logOutAction();
    router.replace("/");
    router.refresh();
  };

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

  const expanded = isExpanded || isPinned;

  const sidebarItems: NavItem[] = [
    {
      Icon: ChartBarIcon,
      menuName: "Analytics",
      menuLink: rootDashBoardUrl,
      isActive: pathname === rootDashBoardUrl,
    },
    {
      Icon: PencilSimple,
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
        "fixed top-0 left-0 z-30 flex h-screen flex-col border-r border-border bg-background/95 backdrop-blur-xl transition-[width,box-shadow] duration-200 ease-out",
        expanded ? "w-56 shadow-card-rest" : "w-18",
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      aria-expanded={expanded}
      aria-label="Primary navigation"
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-border transition-[padding,gap] duration-200 ease-out",
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

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="flex flex-col gap-0.5">
          {sidebarItems.map((item) => (
            <li key={item.menuLink}>
              <Link
                href={item.menuLink}
                aria-current={item.isActive ? "page" : undefined}
                title={!expanded ? item.menuName : undefined}
                className={cn(
                  "group relative flex h-10 items-center rounded-md text-sm font-medium transition-[padding,gap,colors] duration-200 ease-out",
                  expanded ? "gap-3 px-3" : "justify-center px-0",
                  item.isActive
                    ? "bg-primary/6 text-foreground"
                    : "text-muted-foreground hover:bg-foreground/4 hover:text-foreground",
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
                    "size-4 shrink-0 transition-colors",
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

      <div className="flex shrink-0 flex-col gap-0.5 border-t border-border p-2">
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          title={!expanded ? "Sign out" : undefined}
          aria-label="Sign out"
          className={cn(
            "flex h-9 items-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/8 hover:text-destructive disabled:pointer-events-none disabled:opacity-50",
            expanded ? "gap-3 px-3" : "justify-center px-0",
          )}
        >
          <SignOut className="size-4 shrink-0" />
          {expanded && (
            <span className="flex-1 text-left text-sm font-medium">
              Sign out
            </span>
          )}
        </button>

        {expanded && (
          <div className="mt-1 flex items-center justify-between border-t border-border px-3 pt-2 pb-1">
            <span className="font-mono text-xs text-muted-foreground/60">
              {isPinned ? "Pinned" : "Hover to expand"}
            </span>
            <Kbd size="sm" className="border-border/60">
              ⌘\
            </Kbd>
          </div>
        )}
      </div>
    </aside>
  );
};

export default DashBoardSidebar;
