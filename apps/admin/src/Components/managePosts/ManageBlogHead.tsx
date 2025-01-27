import { BlogStatus } from "@/types/blogTypes";
import CustomSelect from "../ui/Components/CustomSelect";
import SearchInput from "../ui/Components/SearchInput";
import { useBlogContext } from "@/context/WriteBlogContext";

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
  const { categories } = useBlogContext();
  return (
    <>
      <div className="flex gap-4 relative z-30">
        <CustomSelect
          onOptionChange={handleCategoryChange}
          options={[
            "Select Category...",
            ...(categories
              ? categories.map((category) => category.categoryId)
              : []),
          ]}
        />
        <CustomSelect
          onOptionChange={handleStatusChange}
          options={["All Status", "active", "inactive", "draft"]}
        />
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
