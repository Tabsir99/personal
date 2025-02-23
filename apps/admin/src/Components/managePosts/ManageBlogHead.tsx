import { BlogStatus } from "@/types/blogTypes";
import CustomSelect from "../ui/Components/CustomSelect";
import SearchInput from "../ui/Components/SearchInput";
import { useWriteBlogContext } from "@/context/WriteBlogContext";

export default function ManagePostHead({
  handleCategoryChange,
  searchTerm,
  setSearchTerm,
  handleStatusChange,
}: {
  handleCategoryChange: (categoryId: string) => void;
  searchTerm: string;
  setSearchTerm: any;
  handleStatusChange: (status: BlogStatus) => void;
}) {
  const { categories } = useWriteBlogContext();
  return (
    <>
      <div className="flex gap-4 relative z-30">
        <div className="flex gap-4 w-full">
          <CustomSelect
            onOptionChange={handleCategoryChange}
            defaultActiveOption="All Categories"
            options={[
              "All Categories",
              ...(categories
                ? categories.map((category) => category.categoryId)
                : []),
            ]}
            placeholder="Select Category..."
          />
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
