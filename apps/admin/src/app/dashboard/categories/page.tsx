import AddCategory from "@/components/categories/AddCategory";
import AllCategories from "@/components/categories/AllCategories";

export const metadata = {
  title: "Manage Categories",
};

export default async function DashBoardCategories() {
  return (
    <section className=" mx-auto p-6 bg-neutral-900/60 min-h-screen">
      <h1 className="text-3xl font-semibold text-gray-100 mb-4 flex items-center justify-between">
        Categories <AddCategory />
      </h1>

      <section className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-y-6 gap-x-3 mt-6 pt-6 border-t border-zinc-700">
        <AllCategories />
      </section>
    </section>
  );
}
