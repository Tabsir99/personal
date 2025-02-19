"use client";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CustomSelectProps {
  onOptionChange?: (option: string) => void;
  options: string[];
  className?: string;
  placeholder?: string;
  defaultActiveOption: string;
}

const CustomSelect = ({
  className,
  options,
  onOptionChange,
  defaultActiveOption,
  placeholder = "Select an option",
}: CustomSelectProps) => {
  const [activeOption, setActiveOption] = useState<string>(defaultActiveOption);

  useEffect(() => {
    setActiveOption(defaultActiveOption);
  }, [defaultActiveOption]);

  const handleValueChange = (value: string) => {
    setActiveOption(value);
    if (onOptionChange) {
      onOptionChange(value === options[0] ? "" : value);
    }
  };

  return (
    <Select value={activeOption} onValueChange={handleValueChange}>
      <SelectTrigger
        className={cn(
          "h-12 px-4 bg-neutral-800/70 border-neutral-700 rounded-md text-white capitalize hover:bg-neutral-700/70 focus:ring-neutral-600 focus:border-neutral-600 transition-all duration-200",
          className
        )}
      >
        <SelectValue placeholder={placeholder} className="text-neutral-300" />
      </SelectTrigger>
      <SelectContent
        className="bg-neutral-800 border-neutral-700 text-white rounded-md shadow-xl backdrop-blur-md"
        position="popper"
        sideOffset={4}
      >
        <SelectGroup className="capitalize">
          {options.map((option) => (
            <SelectItem
              key={option}
              value={option}
              className="h-11 px-4 py-6 flex items-center justify-between cursor-pointer hover:bg-neutral-700 focus:bg-neutral-700 focus:text-white data-[highlighted]:bg-neutral-700 data-[highlighted]:text-white transition-colors duration-150"
            >
              <span>{option}</span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default CustomSelect;
