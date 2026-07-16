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
  List,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "premium-ds/button";
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

const DashBoardSidebar = ({
  defaultExpanded = false,
}: {
  defaultExpanded?: boolean;
}) => {
  const rootDashBoardUrl = "/analytics";
  const pathname = usePathname();
  const router = useRouter();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const toggleExpanded = (val: boolean) => {
    setExpanded(val);
    if (typeof window !== "undefined") {
      document.cookie = `sidebar-expanded=${val}; path=/; max-age=31536000; SameSite=Lax`;
    }
  };

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
        setExpanded((prev) => {
          const next = !prev;
          if (typeof window !== "undefined") {
            document.cookie = `sidebar-expanded=${next}; path=/; max-age=31536000; SameSite=Lax`;
          }
          return next;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleSidebarClick = () => {
    if (!expanded) {
      toggleExpanded(true);
    }
  };

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
      onClick={handleSidebarClick}
      className={cn(
        "flex h-screen shrink-0 flex-col overflow-hidden border-r border-border bg-background/95 backdrop-blur-xl transition-[width,box-shadow] duration-200 ease-in",
        expanded
          ? "w-56 shadow-card-rest"
          : "w-18 cursor-pointer hover:bg-foreground/1",
      )}
      aria-label="Primary navigation"
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-border transition-[padding] duration-200 ease-out",
          expanded ? "px-4 justify-between" : "pl-4.5 justify-start",
        )}
      >
        <div className="flex items-center gap-3">
          <Img
            src={`${clientEnv.MEDIA_ORIGIN}/logo.png`}
            alt="Logo"
            width={36}
            height={36}
            className="shrink-0 rounded-md"
          />
          <span
            className={cn(
              "font-semibold tracking-tight text-foreground text-sm transition-opacity duration-200 ease-out whitespace-nowrap",
              expanded ? "opacity-100" : "opacity-0 pointer-events-none",
            )}
          >
            Studio
          </span>
        </div>

        {expanded && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpanded(false);
            }}
            aria-label="Collapse sidebar"
          >
            <List size={16} />
          </Button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="flex flex-col gap-0.5">
          {sidebarItems.map((item) => (
            <li key={item.menuLink}>
              <Link
                href={item.menuLink}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                aria-current={item.isActive ? "page" : undefined}
                title={!expanded ? item.menuName : undefined}
                className={cn(
                  "group relative flex h-10 items-center overflow-hidden rounded-md text-sm font-medium transition-[padding,colors] duration-200 ease-out gap-3",
                  expanded ? "pl-3 pr-3" : "pl-5 pr-3",
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
                <span
                  className={cn(
                    "text-sm transition-opacity duration-200 ease-out whitespace-nowrap",
                    expanded ? "opacity-100" : "opacity-0 pointer-events-none",
                  )}
                >
                  {item.menuName}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex shrink-0 flex-col gap-0.5 border-t border-border p-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleLogout();
          }}
          disabled={isLoggingOut}
          title={!expanded ? "Sign out" : undefined}
          aria-label="Sign out"
          className={cn(
            "flex h-9 items-center overflow-hidden rounded-md text-muted-foreground transition-[padding,colors] duration-200 ease-out hover:bg-destructive/8 hover:text-destructive disabled:pointer-events-none disabled:opacity-50 gap-3",
            expanded ? "pl-3 pr-3" : "pl-5 pr-3",
          )}
        >
          <SignOut className="size-4 shrink-0" />
          <span
            className={cn(
              "text-left text-sm font-medium transition-opacity duration-200 ease-out whitespace-nowrap",
              expanded ? "opacity-100" : "opacity-0 pointer-events-none",
            )}
          >
            Sign out
          </span>
        </button>

        <div
          className={cn(
            "overflow-hidden transition-all duration-200 ease-in",
            expanded
              ? "mt-1 max-h-12 border-t border-border pt-2 pb-1 opacity-100"
              : "pointer-events-none mt-0 max-h-0 border-t-0 py-0 opacity-0",
          )}
        >
          <div className="flex items-center justify-between px-3">
            <span className="font-mono text-xs whitespace-nowrap text-muted-foreground/60">
              Toggle
            </span>
            <Kbd size="sm" className="border-border/60">
              ⌘\
            </Kbd>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DashBoardSidebar;
