"use client";
import { usePathname } from "next/navigation";
import {
  Edit,
  LogOut,
  LayoutDashboard,
  FileText,
  Briefcase,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Img from "../ui/image";
import { clientEnv } from "@/config/env.client";

const DashBoardSidebar = () => {
  const rootDashBoardUrl = "/dashboard";
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

  const sidebarItems = [
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
  ];

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 h-screen border-r border-sidebar-border bg-sidebar/80 backdrop-blur-xl transition-all duration-300 ease-in-out",
        isExpanded ? "w-56 shadow-2xl" : "w-[72px]",
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex flex-col h-full py-4 gap-2">
        {/* Logo Section */}
        <div className="flex justify-center h-16 items-center px-4 border-b border-sidebar-border pb-4">
          <Img
            src={`${clientEnv.MEDIA_ORIGIN}/logo.png`}
            alt="Logo"
            width={72}
            height={72}
            className="transition-all duration-300"
          />
        </div>

        {/* Navigation Items */}
        <nav className="flex-1">
          <ul className="flex flex-col gap-2.5 list-none px-2">
            {sidebarItems.map((item, index) => {
              return (
                <li key={index}>
                  <Link href={item.menuLink}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "relative h-12 w-full justify-start gap-4 text-base font-medium transition-all duration-300 ease-out overflow-hidden group",
                        item.isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground backdrop-blur-sm border border-sidebar-border"
                          : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50",
                        isExpanded ? "px-4" : "px-3 justify-center",
                      )}
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute inset-0 bg-linear-to-r from-transparent via-foreground/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      </div>

                      {item.isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-sidebar-primary shadow-[0_0_8px_hsl(var(--sidebar-primary)/0.35)]" />
                      )}

                      <item.Icon
                        className={cn(
                          "w-5 h-5 transition-all duration-300 shrink-0",
                          item.isActive
                            ? "text-sidebar-primary drop-shadow-[0_0_8px_hsl(var(--sidebar-primary)/0.4)]"
                            : "text-muted-foreground/70 group-hover:text-foreground/80",
                        )}
                      />

                      <span
                        className={cn(
                          "transition-all duration-300 whitespace-nowrap text-sm",
                          isExpanded
                            ? "opacity-100 translate-x-0"
                            : "opacity-0 -translate-x-4 absolute",
                        )}
                      >
                        {item.menuName}
                      </span>
                    </Button>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="px-3 pt-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className={cn(
              "relative h-12 w-full justify-start gap-4 text-base font-medium text-muted-foreground transition-all duration-300 ease-out overflow-hidden group border border-transparent hover:border-destructive/20 hover:text-destructive hover:bg-destructive/10",
              isExpanded ? "px-4" : "px-3 justify-center",
            )}
            onClick={() => {}}
          >
            {/* Glass shine effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-destructive/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </div>

            <LogOut className="w-5 h-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
            <span
              className={cn(
                "transition-all duration-300 whitespace-nowrap",
                isExpanded
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-4 absolute",
              )}
            >
              Logout
            </span>
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default DashBoardSidebar;
