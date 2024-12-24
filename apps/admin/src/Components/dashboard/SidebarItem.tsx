"use client";

import Link from "next/link";

interface SideBarItemProps {
  menuName: string;
  menuLink: string;
  children: React.ReactNode;
  isPathActive: boolean;
}
const SideBarItem = ({
  menuName,
  menuLink,
  children,
  isPathActive,
}: SideBarItemProps) => {
  return (
    <Link
      key={menuLink}
      prefetch={false}
      href={menuLink}
      className={
        "flex items-center px-4 py-3 text-sm font-medium text-gray-300 rounded-md hover:text-white group transition ease-in-out duration-200 " +
        (isPathActive
          ? " bg-[var(--highlight-bg-color)]"
          : " hover:bg-gray-700")
      }
    >
      {children}
      {menuName}
    </Link>
  );
};

export default SideBarItem;
