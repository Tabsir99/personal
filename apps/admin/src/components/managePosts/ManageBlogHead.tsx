import { BlogStatus } from "@/types/blogTypes";
import CustomSelect from "../ui/common/CustomSelect";
import SearchInput from "../ui/common/SearchInput";

export default function ManagePostHead({
  searchTerm,
  setSearchTerm,
  handleStatusChange,
}: {
  searchTerm: string;
  setSearchTerm: any;
  handleStatusChange: (status: BlogStatus) => void;
}) {
  return (
    <>
      <div className="flex gap-4 relative z-30">
        <div className="flex gap-4 w-full">
          <CustomSelect
            defaultActiveOption="All Status"
            onOptionChange={handleStatusChange}
            placeholder="Select status..."
            options={["All Status", "active", "inactive", "draft"]}
          />
        </div>
        <SearchInput
          searchTerm={searchTerm}
          handleChange={(e) => {
            setSearchTerm(e.target.value);
          }}
        />
      </div>
    </>
  );
}
