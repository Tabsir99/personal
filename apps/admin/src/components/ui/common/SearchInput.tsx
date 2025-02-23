import { ChangeEvent } from "react";

const SearchInput = ({
  searchTerm,
  handleChange,
  placeholder = "Search posts...",
}: {
  searchTerm: string;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) => {
  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-zinc-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="search"
        placeholder={placeholder}
        className="
          w-full 
          pl-10 
          pr-4 
          py-3 
          text-zinc-200 
          bg-zinc-800/70
          rounded-lg 
          outline-none focus:border-zinc-700 border-2 border-transparent
          transition-all
          duration-300
          ease-in-out
          shadow-md
          placeholder-zinc-500
        "
        value={searchTerm}
        onChange={handleChange}
      />
    </div>
  );
};

export default SearchInput;
