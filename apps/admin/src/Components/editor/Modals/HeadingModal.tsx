"use client";

import { useState } from "react";
export default function HeadingModal({ command }) {
  const [isOpen, setIsOpen] = useState(false);
  const levels = [2, 3, 4, 5];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 hover:bg-gray-700 py-1 rounded-md transition duration-200"
      >
        Heading <span className="arrow-icon ml-2">▾</span>
      </button>

      <ul
        className={`absolute z-30 bg-gray-950 overflow-hidden cursor-pointer w-64 top-9 rounded-md ${
          isOpen
            ? "scale-y-100 transition duration-300 origin-top"
            : "scale-y-0"
        }`}
      >
        {levels.map((level) => (
          <li
            key={level}
            className={`py-5 border-b border-gray-800 flex justify-start px-8 transition duration-200 hover:bg-[#18272f] ${
              level === 1
                ? "text-[2.2rem]"
                : level === 2
                ? "text-[1.8rem]"
                : "text-[1.4rem]"
            }`}
            onClick={() => {
              setIsOpen(false);
              command(level)
            }}
          >
            Heading {level}
          </li>
        ))}
      </ul>
    </div>
  );
}
