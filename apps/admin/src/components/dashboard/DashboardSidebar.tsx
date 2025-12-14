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
        "fixed left-0 top-0 z-30 shadow-lg h-screen dark bg-zinc-900/50 border-r backdrop-blur-md border-zinc-800 transition-all duration-300 ease-in-out",
        isExpanded ? "w-52 shadow-[5px_0px_25px_rgba(0,0,0,0.8)]" : "w-16"
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex flex-col h-full py-2">
        <div className="mb-4 flex justify-center h-16 items-center border-b-2 border-zinc-800">
          <Img
            src={`${clientEnv.MEDIA_ORIGIN}/logo.png`}
            alt="Logo"
            width={isExpanded ? 72 : 56}
            height={48}
            className="transition-all duration-300"
          />
        </div>
        <ul className="flex flex-col gap-1 px-2">
          {sidebarItems.map((item, index) => {
            return (
              <li key={index}>
                <Link href={item.menuLink}>
                  <Button
                    variant={item.isActive ? "secondary" : "ghost"}
                    className={cn(
                      " h-12 justify-start gap-3 text-[16px] text-zinc-100 transition-all duration-300 ease-in-out overflow-hidden",
                      item.isActive
                        ? "bg-blue-600/80 hover:bg-blue-600/80 "
                        : "hover:bg-zinc-800/70",
                      isExpanded ? "w-full" : "w-12 "
                    )}
                  >
                    <item.Icon className=" w-6 h-6 text-zinc-200" />
                    <span
                      className={`transition-all duration-300 text-zinc-200 ${isExpanded ? "" : "opacity-30 translate-x-6 scale-75"}`}
                    >
                      {item.menuName}
                    </span>
                  </Button>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-auto px-2">
          <Button
            variant="ghost"
            className={cn(
              "h-10 justify-start gap-3 px-3 text-zinc-100 transition-all duration-300 ease-in-out overflow-hidden hover:bg-red-900/30 hover:text-red-200",
              isExpanded ? "w-full" : "w-10"
            )}
            onClick={() => {}}
          >
            <LogOut className="h-5 w-5" />
            <span
              className={`transition-all duration-300 ${isExpanded ? "" : "opacity-30 translate-x-6 scale-75"}`}
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
