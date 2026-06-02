import { NextRequest } from "next/server";
import s3, { Bucket } from "@/config/cloudflareS3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { uploadFileInfoArraySchema } from "@tabsircg/schemas/portfolio";
import { wrapRoute } from "@/lib/appUtils";

export const POST = wrapRoute(async (request: NextRequest) => {
  const body = await request.json();
  const files = uploadFileInfoArraySchema.parse(body);

  const urlPromises = files.map(async ({ type, path }) => {
    const key = `portfolio/${randomUUID()}`;

    const command = new PutObjectCommand({
      Bucket,
      Key: key,
      ContentType: type,
      ContentDisposition: "inline", // play in place, never download
      CacheControl: "public, max-age=31536000, immutable",
    });

    const presignedUrl = await getSignedUrl(s3, command, {
      expiresIn: 3600,
      signableHeaders: new Set([
        "content-type",
        "content-disposition",
        "cache-control",
      ]),
    });

    return { presignedUrl, key, path };
  });

  return Promise.all(urlPromises);
});
