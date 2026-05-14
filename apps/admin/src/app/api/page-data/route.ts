import { env } from "@/config/env.server";
import { NextRequest } from "next/server";
import { PageData, pageDataSchema } from "@tabsircg/schemas/portfolio";
import { S3Bucket, deleteObjects } from "@/config/cloudflareS3";
import { wrapRoute } from "@/lib/appUtils";
import {
  readPortfolioPageData,
  writePortfolioPageData,
} from "@/actions/configActions";

export const GET = wrapRoute(async () => readPortfolioPageData());

export const POST = wrapRoute(async (request: NextRequest) => {
  const body = await request.json();
  const pageData = pageDataSchema.parse(body);

  const oldPageData = await readPortfolioPageData();
  if (oldPageData) {
    await deleteRemovedMedia(oldPageData, pageData);
  }

  await writePortfolioPageData(pageData);

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
