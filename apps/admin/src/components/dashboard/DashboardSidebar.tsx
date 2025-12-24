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
        "fixed left-0 top-0 z-30 h-screen bg-gradient-to-b from-zinc-950/30 via-zinc-900/40 to-zinc-950/30 backdrop-blur-xl border-r border-zinc-800/50 transition-all duration-300 ease-in-out",
        isExpanded ? "w-56 shadow-[8px_0px_40px_rgba(0,0,0,0.6)]" : "w-[72px]"
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex flex-col h-full py-4 gap-2">
        {/* Logo Section */}
        <div className="flex justify-center h-16 items-center px-4 border-b border-zinc-800/50 pb-4">
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
                          ? "bg-gradient-to-r from-blue-500/20 to-blue-600/10 text-blue-300 shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] backdrop-blur-sm border border-blue-500/20"
                          : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40",
                        isExpanded ? "px-4" : "px-3 justify-center"
                      )}
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      </div>

                      {item.isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                      )}

                      <item.Icon
                        className={cn(
                          "w-5 h-5 transition-all duration-300 flex-shrink-0",
                          item.isActive
                            ? "text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                            : "text-zinc-500 group-hover:text-zinc-300"
                        )}
                      />

                      <span
                        className={cn(
                          "transition-all duration-300 whitespace-nowrap text-sm",
                          isExpanded
                            ? "opacity-100 translate-x-0"
                            : "opacity-0 -translate-x-4 absolute"
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
        <div className="px-3 pt-4 border-t border-zinc-800/50">
          <Button
            variant="ghost"
            className={cn(
              "relative h-12 w-full justify-start gap-4 text-base font-medium text-zinc-400 hover:text-red-300 hover:bg-red-950/30 transition-all duration-300 ease-out overflow-hidden group border border-transparent hover:border-red-900/30",
              isExpanded ? "px-4" : "px-3 justify-center"
            )}
            onClick={() => {}}
          >
            {/* Glass shine effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </div>

            <LogOut className="w-5 h-5 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
            <span
              className={cn(
                "transition-all duration-300 whitespace-nowrap",
                isExpanded
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-4 absolute"
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
