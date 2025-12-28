import { env } from "@/config/env.server";
import { NextRequest, NextResponse } from "next/server";
import { PageData } from "@/types/portfolioTypes";
import {
  readObject,
  S3Bucket,
  deleteObjects,
  uploadObject,
} from "@/config/cloudflareS3";

const PAGEDATA_PATH = "portfolio/page-data.json";

async function fetchPageData(): Promise<PageData | null> {
  const response = await readObject(S3Bucket.PRIVATE, PAGEDATA_PATH);
  if (!response) return null;
  return JSON.parse(await response.transformToString());
}

export async function GET() {
  try {
    const pageData = await fetchPageData();

    return NextResponse.json(pageData, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(null, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const pageData = (await request.json()) as PageData;

    // Fetch the old page data
    const oldPageData = await fetchPageData();
    // Find and delete removed media
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
      headers: {
        Authorization: env.SERVER_TOKEN,
      },
    });

    console.log("Revalidated tabsircg.com");

    await fetch("https://tabsircg.com");
    console.log("Created static cache for tabsircg.com");

    return NextResponse.json("OK", { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(null, { status: 500 });
  }
}

async function deleteRemovedMedia(oldData: PageData, newData: PageData) {
  const oldUrls = extractMediaUrls(oldData);
  const newUrls = extractMediaUrls(newData);

  const removedUrls = oldUrls.filter((url) => !newUrls.includes(url));

  console.log(removedUrls);
  if (removedUrls.length > 0) {
    await deleteObjects(S3Bucket.PUBLIC, removedUrls);
  }

  console.log(`Deleted ${removedUrls.length} unused media files`);
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
