import { env } from "@/config/env.server";
import { NextRequest } from "next/server";
import { PageData, pageDataSchema } from "@tabsircg/schemas/portfolio";
import {
  readObject,
  S3Bucket,
  deleteObjects,
  uploadObject,
} from "@/config/cloudflareS3";
import { wrapRoute } from "@/lib/appUtils";

const PAGEDATA_PATH = "portfolio/page-data.json";

async function fetchPageData(): Promise<PageData | null> {
  const response = await readObject(S3Bucket.PRIVATE, PAGEDATA_PATH);
  if (!response) return null;
  return JSON.parse(await response.transformToString());
}

export const GET = wrapRoute(async () => fetchPageData());

export const POST = wrapRoute(async (request: NextRequest) => {
  const body = await request.json();
  const pageData = pageDataSchema.parse(body);

  const oldPageData = await fetchPageData();
  if (oldPageData) {
    await deleteRemovedMedia(oldPageData, pageData);
  }

  await uploadObject({
    Bucket: S3Bucket.PRIVATE,
    Key: PAGEDATA_PATH,
    Body: JSON.stringify(pageData),
    ContentType: "application/json",
    CacheControl: "no-store, no-cache, must-revalidate",
    ACL: "private",
  });

  await fetch("https://tabsircg.com/api/revalidate", {
    headers: { Authorization: env.SERVER_TOKEN },
  });
  await fetch("https://tabsircg.com");

  return null;
});

async function deleteRemovedMedia(oldData: PageData, newData: PageData) {
  const oldUrls = extractMediaUrls(oldData);
  const newUrls = extractMediaUrls(newData);

  const removedUrls = oldUrls.filter((url) => !newUrls.includes(url));

  console.info(removedUrls);
  if (removedUrls.length > 0) {
    await deleteObjects(S3Bucket.PUBLIC, removedUrls);
  }

  console.info(`Deleted ${removedUrls.length} unused media files`);
}

function extractMediaUrls(pageData: PageData): string[] {
  const urls: string[] = [];

  if (pageData.profilePicture) urls.push(pageData.profilePicture);

  // Projects
  pageData.projects?.forEach((project) => {
    if (project.image) urls.push(project.image);
  });

  // Credentials
  pageData.credentials?.forEach((credential) => {
    if (credential.image) urls.push(credential.image);
  });

  // Filter out empty strings and only include blob URLs
  return urls.filter((url) => !!url);
}
