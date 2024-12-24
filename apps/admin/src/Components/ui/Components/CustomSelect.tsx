"use client";

import { useState, useCallback, useEffect } from "react";
import { FaCircleCheck, FaChevronDown } from "react-icons/fa6";

interface CustomSelectProps {
  onOptionChange?: (option: string) => void;
  options: string[];
  className?: string;
  optionsClass?: string;
  defaultActiveOption?: string;
}
const CustomSelect = ({
  className = " w-full",
  options,
  optionsClass = "h-12 px-8 flex items-center justify-between border-t border-gray-900 cursor-pointer hover:bg-neutral-800 transition duration-150",
  onOptionChange,
  defaultActiveOption,
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeOption, setActiveOption] = useState(options[0]);

  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const selectOption = useCallback(
    (option: string) => {
      setActiveOption(option);
      setIsOpen(false);
      if (onOptionChange && option === options[0]) onOptionChange("");
      if (onOptionChange && option !== options[0]) onOptionChange(option);
    },
    [onOptionChange, options]
  );

  useEffect(() => {
    setActiveOption(defaultActiveOption || options[0]);
  }, [defaultActiveOption]);

  return (
    <div className={"relative text-white capitalize z-40 " + className}>
      <button
        type="button"
        className="px-8 h-12 w-full items-center capitalize bg-neutral-800/70 rounded-md flex justify-between"
        onClick={toggleDropdown}
      >
        {activeOption} <FaChevronDown className="w-6 h-6" />
      </button>
      <ul
        className={
          "absolute overflow-hidden shadow-lg shadow-black left-0 bg-neutral-800/70 backdrop-blur-md rounded-xl border-t  border-neutral-800 top-12 w-full " +
          (isOpen
            ? " transition-transform origin-top duration-150"
            : " scale-y-0 ")
        }
      >
        {options.map((option) => (
          <li
            key={option}
            className={optionsClass}
            onClick={() => selectOption(option)}
          >
            {option}
            {option === activeOption && (
              <FaCircleCheck className="w-5 h-5 text-green-500 absolute right-2" />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CustomSelect;
