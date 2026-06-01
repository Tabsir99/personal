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

// Stored media values are full public URLs (`${MEDIA_ORIGIN}/${key}`), but R2
// deletes by object key — the URL path with the leading slash stripped.
function urlToKey(url: string): string | null {
  try {
    return new URL(url).pathname.replace(/^\/+/, "");
  } catch {
    return null;
  }
}

async function deleteRemovedMedia(oldData: PageData, newData: PageData) {
  const oldUrls = extractMediaUrls(oldData);
  const newUrls = new Set(extractMediaUrls(newData));

  const removedKeys = oldUrls
    .filter((url) => !newUrls.has(url))
    .map(urlToKey)
    .filter((key): key is string => key !== null);

  if (removedKeys.length > 0) {
    await deleteObjects(S3Bucket.PUBLIC, removedKeys);
  }

  console.info(`Deleted ${removedKeys.length} unused media files`);
}

function extractMediaUrls(pageData: PageData): string[] {
  const urls: string[] = [];

  if (pageData.profilePicture) urls.push(pageData.profilePicture);
  if (pageData.resume.url) urls.push(pageData.resume.url);

  pageData.projects?.forEach((project) => {
    project.stills?.forEach((still) => {
      if (still.url) urls.push(still.url);
      still.sources?.forEach((s) => {
        if (s.url) urls.push(s.url);
      });
    });
  });

  pageData.credentials?.forEach((credential) => {
    if (credential.image) urls.push(credential.image);
  });

  pageData.testimonials?.forEach((testimonial) => {
    if (testimonial.avatar) urls.push(testimonial.avatar);
    testimonial.video.forEach((s) => {
      if (s.url) urls.push(s.url);
    });
  });

  return urls.filter((url) => !!url);
}
