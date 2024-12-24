"use client";
import { usePathname } from "next/navigation";
import {
  MdHome,
  MdEdit,
  MdFolder,
  MdGroup,
  MdSettings,
  MdExitToApp,
  MdViewList,
  MdSearch,
} from "react-icons/md";

import SideBarItem from "./SidebarItem";

const DashBoardSidebar = () => {
  const rootDashBoardUrl = "/dashboard";
  const pathname = usePathname();

  const sidebarItems = [
    {
      Icon: MdHome, // Updated icon
      menuName: "Dashboard",
      menuLink: rootDashBoardUrl,
    },
    {
      Icon: MdFolder, // Updated icon
      menuName: "Categories",
      menuLink: `${rootDashBoardUrl}/categories`,
    },
    {
      Icon: MdEdit, // Updated icon
      menuName: "Write Post",
      menuLink: `${rootDashBoardUrl}/write-post`,
    },
    {
      Icon: MdViewList, // Updated icon
      menuName: "Manage Posts",
      menuLink: `${rootDashBoardUrl}/manage-posts`,
    },
    {
      Icon: MdGroup, // Updated icon
      menuName: "Subscribers",
      menuLink: `${rootDashBoardUrl}/users`,
    },
    {
      Icon: MdSettings, // Updated icon
      menuName: "Settings",
      menuLink: `${rootDashBoardUrl}/settings`,
    },
  ];

  return (
    <div className="h-screen bg-neutral-950 p-4 text-neutral-300 border-r border-neutral-800 shadow-lg">
      <div className="flex items-center justify-between mb-4 border-b border-neutral-800 pb-3">
        <Logo />
        <MdSearch className="w-7 h-7 cursor-pointer text-neutral-400 hover:text-neutral-300 transition-colors duration-200" />
      </div>

      <nav className="flex-1 gap-2 overflow-y-auto flex flex-col h-full mt-4 pb-10">
        {sidebarItems.map((sidebarItem) => (
          <SideBarItem
            key={sidebarItem.menuLink}
            menuName={sidebarItem.menuName}
            menuLink={sidebarItem.menuLink}
            isPathActive={
              pathname === sidebarItem.menuLink ||
              pathname === `${sidebarItem.menuLink}/write-blog` ||
              pathname === `${sidebarItem.menuLink}/write-blog/preview-blog`
            }
          >
            <sidebarItem.Icon className="h-6 w-6 text-gray-400 group-hover:text-gray-300 mr-3" />{" "}
          </SideBarItem>
        ))}
      </nav>

      <div className="px-4 py-6 border-t border-neutral-800">
        <button
          className="w-full flex items-center justify-center space-x-3 px-4 py-2 
            bg-neutral-800 text-neutral-300 hover:bg-neutral-700 
            rounded-md transition-colors duration-200 group"
        >
          <MdExitToApp className="h-6 w-6 text-neutral-500 group-hover:text-red-500" />{" "}
          {/* Updated icon */}
          <span className="group-hover:text-white">Log Out</span>
        </button>
      </div>
    </div>
  );
};

export default DashBoardSidebar;

import Image from "next/image";
import Link from "next/link";
// @ts-ignore
import logo from "../../../public/o-min.png";

const Logo = () => {
  return (
    <Link href="/">
      <Image
        placeholder="blur"
        priority
        loading="eager"
        draggable="false"
        src={logo}
        alt="Logo"
        className=" w-[64px] max-md:w-[52px] mt-1 h-auto cursor-pointer hover:scale-110 transition-transform duration-300 "
      />
    </Link>
  );
};
