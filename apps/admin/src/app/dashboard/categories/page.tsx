import AddCategory from "@/Components/categories/AddCategory";
import AllCategories from "@/Components/categories/AllCategories";

export const metadata = {
  title: "Manage Categories",
};

export default async function DashBoardCategories() {
  return (
    <section className="max-w-7xl mx-auto p-6 bg-neutral-900/60 min-h-screen">
      <h1 className="text-3xl font-semibold text-gray-100 mb-4">Categories</h1>

      <AddCategory />

      <section className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-y-6 gap-x-3">
        <AllCategories />
      </section>
    </section>
  );
}
