"use client";
import { usePathname } from "next/navigation";
import {
  Home,
  Edit,
  Folder,
  Users,
  Settings,
  List,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
// @ts-ignore
import logo from "../../../public/o-min.png";

const DashBoardSidebar = () => {
  const rootDashBoardUrl = "/dashboard";
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const sidebarItems = [
    {
      Icon: Home,
      menuName: "Dashboard",
      menuLink: rootDashBoardUrl,
    },
    {
      Icon: Folder,
      menuName: "Categories",
      menuLink: `${rootDashBoardUrl}/categories`,
    },
    {
      Icon: Edit,
      menuName: "Write Blog",
      menuLink: `${rootDashBoardUrl}/write-blog`,
    },
    {
      Icon: List,
      menuName: "Manage Posts",
      menuLink: `${rootDashBoardUrl}/manage-posts`,
    },
    {
      Icon: Users,
      menuName: "Subscribers",
      menuLink: `${rootDashBoardUrl}/users`,
    },
    {
      Icon: Settings,
      menuName: "Settings",
      menuLink: `${rootDashBoardUrl}/settings`,
    },
  ];
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-[60] shadow-lg h-screen dark bg-zinc-950 border-r border-zinc-800 transition-all duration-300 ease-in-out",
        isExpanded ? "w-52 shadow-[5px_0px_25px_rgba(0,0,0,0.8)]" : "w-16"
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex flex-col h-full py-2">
        <div className="mb-4 flex justify-center h-16 items-center border-b-2 border-zinc-800">
          <Image
            src={logo}
            alt="Logo"
            width={isExpanded ? 72 : 48}
            height={48}
            className="transition-all duration-300"
          />
        </div>
        <ul className="flex flex-col gap-1 px-2">
          {sidebarItems.map((item, index) => {
            const isActive = pathname === item.menuLink;
            return (
              <li key={index}>
                <Link href={item.menuLink}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      " h-12 justify-start gap-3 text-[16px] text-zinc-100 transition-all duration-300 ease-in-out overflow-hidden",
                      isActive
                        ? "bg-blue-600/80 hover:bg-blue-600/80 "
                        : "hover:bg-zinc-800/70",
                      isExpanded ? "w-full" : "w-12 "
                    )}
                  >
                    <item.Icon className=" w-6 h-6" />
                    <span
                      className={`transition-all duration-300 ${isExpanded ? "" : "opacity-30 translate-x-6 scale-75"}`}
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
            onClick={() => console.log("Logout clicked")}
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
