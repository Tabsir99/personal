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
    <div className="relative w-full sm:w-72">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-muted-foreground"
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
        className="w-full h-9 pl-9 pr-3 text-sm text-foreground bg-muted/40 rounded-lg outline-none border border-input focus:border-ring placeholder:text-muted-foreground"
        value={searchTerm}
        onChange={handleChange}
      />
    </div>
  );
};

export default SearchInput;
