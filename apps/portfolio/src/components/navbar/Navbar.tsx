"use client";
import { useState, useRef, useMemo, useLayoutEffect } from "react";
import Link from "next/link";
import { HoverAnimation } from "./AHanimation";
import { FaEnvelope, FaFolderOpen, FaHouse, FaPerson } from "react-icons/fa6";

const Navbar = () => {
  const navItems: { text: string; icon: React.ElementType; link: string }[] = [
    { text: "Home", icon: FaHouse, link: "/" },
    { text: "About", icon: FaPerson, link: "#about" },
    { text: "Portfolio", icon: FaFolderOpen, link: "#portfolio" },
    { text: "Contact", icon: FaEnvelope, link: "#contact" },
  ];

  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [isHoverable, setIsHoverable] = useState<boolean | null>(null);
  const listItems = useRef<(HTMLLIElement | null)[]>([]);

  useLayoutEffect(() => {
    setIsHoverable(
      window.matchMedia("(hover:hover) and (pointer:fine)").matches
    );
  }, []);

  const navbarItems = useMemo(() => {
    return navItems.map((navItem, index) => (
      <li
        className="flex justify-center items-center"
        key={navItem.link}
        ref={(element) => {
          listItems.current[index] = element;
        }}
      >
        {
          <Link
            className="px-4 py-2 z-10 rounded-lg links text-center flex gap-1 items-center "
            href={navItem.link}
            onPointerEnter={() => {
              setHoverIndex(index);
            }}
          >
            {<navItem.icon />}
            <span className="text-[1rem] linktext">{navItem.text}</span>
          </Link>
        }
      </li>
    ));
  }, []);

  const hoveredLink = useMemo(
    () =>
      hoverIndex !== null && listItems.current[hoverIndex]
        ? listItems.current[hoverIndex]!.getBoundingClientRect()
        : undefined,
    [hoverIndex]
  );

  return (
    <nav>
      <ul
        id="nav-ul"
        className="text-slate-100 flex h-full items-center"
        onMouseLeave={() => {
          setHoverIndex(null);
        }}
      >
        {navbarItems}
      </ul>
      {hoveredLink && isHoverable && (
        <HoverAnimation hoveredLink={hoveredLink} />
      )}
    </nav>
  );
};

export default Navbar;
