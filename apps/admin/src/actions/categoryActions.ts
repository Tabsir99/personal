"use server";

import { env, fetcher, formatResponse } from "@/utils/utils";

import { revalidatePath } from "next/cache";
import { BlogCategory, CategoryStatus } from "@/types/blogTypes";
import { Collections } from "@/utils/utils";
import { addCategorydb, deleteCategorydb } from "@/lib/categoryQuery";
import { updateData } from "@/lib/commonQuery";
import s3 from "@/config/cloudflareS3";
import { PutObjectCommand } from "@aws-sdk/client-s3";

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
    return formatResponse({
      status: "success",
      message: `'Category Deleted Successfully' ${categoryId}`,
      data: null,
    });
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
    return formatResponse({
      status: "success",
      message: "Category Updated Successfully",
      data: null,
    });
  } catch (error) {
    return formatResponse({
      status: "error",
      message: "There was an error saving the document, please try again",
      data: null,
    });
  }
}

export const uploadImage = async (
  formData: FormData,
  isThumbnail: boolean = false
) => {
  const imageFile = formData.get("file") as File;
  const blogLink = formData.get("blogLink");
  const imageArrayBuffer = await imageFile.arrayBuffer();

  const imageBuffer = Buffer.from(new Uint8Array(imageArrayBuffer));

  const fileName = `${blogLink}/${isThumbnail ? "thumbnail" : imageFile.name}`;

  const putImage = new PutObjectCommand({
    Bucket: "tabsir-s-blog",
    Key: fileName,
    Body: imageBuffer,
    ContentType: imageFile.type,
    ACL: "public-read",
    CacheControl: "public, max-age=31536000, immutable",
  });

  await s3.send(putImage);
  const publicUrl = `https://images.tabsircg.com/${fileName}`;

  return formatResponse<string>({ status: "success", data: publicUrl });
};

export async function addNewCategory({
  categoryName,
  description,
}: {
  categoryName: string;
  description: string;
}) {
  const category: BlogCategory = {
    categoryId: categoryName.trim().toLowerCase().replace(/\s/g, "-"),
    categoryName,
    description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: CategoryStatus.Active,
    totalPosts: 0,
  };
  try {
    const fetchPromise = fetcher({
      url: `${env.BLOGSITE_HOSTNAME}/api/categories`,
      body: JSON.stringify({ categoryId: category.categoryId }),
    });
    const addCategoryPromise = addCategorydb(category);
    await Promise.all([fetchPromise, addCategoryPromise]);
    revalidatePath("/dashboard", "layout");

    return formatResponse<BlogCategory>({ data: category });
  } catch (error) {
    return formatResponse({
      data: null,
      status: "error",
      message: "Failed to create category",
    });
  }
}
