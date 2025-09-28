import { BlogStatus } from "@/types/blogTypes";
import SearchInput from "../ui/common/SearchInput";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "../ui/select";

export default function ManagePostHead({
  searchTerm,
  setSearchTerm,
  handleStatusChange,
}: {
  searchTerm: string;
  setSearchTerm: any;
  handleStatusChange: (status: BlogStatus) => void;
}) {
  const options: (BlogStatus | "all")[] = [
    "all",
    BlogStatus.Active,
    BlogStatus.Inactive,
    BlogStatus.Draft,
  ];
  return (
    <div className="flex gap-4 relative z-20">
      <div className="flex gap-4 grow">
        <Select onValueChange={handleStatusChange} defaultValue="all">
          <SelectTrigger className="h-12 px-4 bg-zinc-800/70 border-neutral-700 rounded-md text-white capitalize hover:bg-zinc-700/70 focus:ring-neutral-600 focus:border-neutral-600 transition-all duration-200">
            <SelectValue className="text-neutral-300" />
          </SelectTrigger>
          <SelectContent
            className="bg-zinc-800 border-neutral-700 text-white rounded-md shadow-xl backdrop-blur-md"
            position="popper"
            sideOffset={4}
          >
            <SelectGroup className="capitalize">
              {options.map((option) => (
                <SelectItem
                  key={option}
                  value={option}
                  className="h-11 px-4 py-6 flex items-center justify-between cursor-pointer hover:bg-zinc-700 focus:bg-zinc-700 focus:text-white data-[highlighted]:bg-zinc-700 data-[highlighted]:text-white transition-colors duration-150"
                >
                  <span>{option === "all" ? "All Status" : option}</span>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <SearchInput
        searchTerm={searchTerm}
        handleChange={(e) => {
          setSearchTerm(e.target.value);
        }}
      />
    </div>
  );
}
