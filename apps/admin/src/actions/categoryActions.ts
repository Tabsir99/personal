"use server";

import { env, fetcher, formatResponse } from "@/utils/utils";

import { revalidatePath } from "next/cache";
import { BlogCategory } from "@/types/blogTypes";
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

  return formatResponse("success", publicUrl);
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
