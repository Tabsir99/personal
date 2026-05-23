import { NextRequest } from "next/server";
import { PageData, pageDataSchema } from "@tabsircg/schemas/portfolio";
import { S3Bucket, deleteObjects } from "@/config/cloudflareS3";
import { wrapRoute } from "@/lib/appUtils";
import {
  readPortfolioPageData,
  writePortfolioPageData,
} from "@/actions/configActions";
import { sendRevalidateRequest } from "@/lib/blogUtils";

export const GET = wrapRoute(async () => readPortfolioPageData());

export const POST = wrapRoute(async (request: NextRequest) => {
  const body = await request.json();
  const pageData = pageDataSchema.parse(body);

  const oldPageData = await readPortfolioPageData();
  if (oldPageData) {
    await deleteRemovedMedia(oldPageData, pageData);
  }

  await writePortfolioPageData(pageData);

  await sendRevalidateRequest({ tag: "page-data" });

  return null;
});

async function deleteRemovedMedia(oldData: PageData, newData: PageData) {
  const oldUrls = extractMediaUrls(oldData);
  const newUrls = new Set(extractMediaUrls(newData));

  const removedUrls = oldUrls.filter((url) => !newUrls.has(url));

  if (removedUrls.length > 0) {
    await deleteObjects(S3Bucket.PUBLIC, removedUrls);
  }

  console.info(`Deleted ${removedUrls.length} unused media files`);
}

function extractMediaUrls(pageData: PageData): string[] {
  const urls: string[] = [];

  if (pageData.profilePicture) urls.push(pageData.profilePicture);

  pageData.projects?.forEach((project) => {
    project.stills?.forEach((still) => {
      if (still.url) urls.push(still.url);
    });
  });

  pageData.credentials?.forEach((credential) => {
    if (credential.image) urls.push(credential.image);
  });

  pageData.testimonials?.forEach((testimonial) => {
    if (testimonial.avatar) urls.push(testimonial.avatar);
    if (testimonial.video) urls.push(testimonial.video);
  });

  return urls.filter((url) => !!url);
}
