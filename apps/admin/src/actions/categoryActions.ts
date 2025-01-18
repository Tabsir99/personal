"use server";

import { env, fetcher, formatResponse } from "@/utils/utils";

import { revalidatePath } from "next/cache";
import { BlogCategory } from "@/types/blogTypes";
import { Collections } from "@/utils/utils";
import { addCategorydb, deleteCategorydb } from "@/lib/categoryQuery";
import { updateData } from "@/lib/commonQuery";
import { v4 as uuid4 } from "uuid";
import { bucket } from "@/config/firebaseAdminBlog";

export async function deleteCategory(categoryId: string) {
  try {
    const deletePromise = deleteCategorydb(categoryId.toLowerCase());
    const fetchPromise = fetcher({
      url: `${env.BLOGSITE_HOSTNAME}/api/categories`,
      body: JSON.stringify({ categoryId }),
      method: "DELETE",
    });
    await Promise.all([deletePromise, fetchPromise]);
    revalidatePath("/dashboard", "layout");
    return formatResponse(
      "success",
      `'Category Deleted Successfully' ${categoryId}`
    );
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function updateCategory(category: Partial<BlogCategory>) {
  try {
    category.updatedAt = new Date().toISOString();

    await updateData(
      Collections.CATEGORY_METADATA,
      category.categoryId?.toLowerCase(),
      category
    );
    revalidatePath("/dashboard", "layout");
    return formatResponse("success", "Category Updated Successfully");
  } catch (error) {
    return formatResponse(
      "error",
      "There was an error saving the document, please try again"
    );
  }
}

export const uploadImage = async (formData: any) => {
  const imageFile = formData.get("file");
  const category = formData.get("category") || "";
  const isDefault = formData.get("default") || false;
  const imageArrayBuffer = await imageFile.arrayBuffer();

  const imageBuffer = Buffer.from(new Uint8Array(imageArrayBuffer));

  const fileName = isDefault
    ? `${category}/${uuid4()}-default.png`
    : `${category}/${uuid4()}-${imageFile.name}`;

  const fileRef = bucket.file(fileName);
  await fileRef.save(imageBuffer, {
    contentType: imageFile.type,
    public: true,
  });
  const publicUrl = fileRef.publicUrl();

  return formatResponse("success", "Image uploaded successfullly", publicUrl);
};

export async function addNewCategory(category: BlogCategory) {
  const currentTime = new Date().toISOString();
  category.createdAt = currentTime;
  category.updatedAt = currentTime;
  category.categoryId = encodeURIComponent(
    category.categoryName.replace(/\s/g, "-").toLowerCase()
  );

  try {
    const fetchPromise = fetcher({
      url: `${env.BLOGSITE_HOSTNAME}/api/categories`,
      body: JSON.stringify({ categoryId: category.categoryId }),
    });
    const addCategoryPromise = addCategorydb(category);
    await Promise.all([fetchPromise, addCategoryPromise]);
    revalidatePath("/dashboard", "layout");
    return formatResponse("success", "Category Created Successfully!");
  } catch (error) {
    return formatResponse("error", "error occured!");
  }
}
