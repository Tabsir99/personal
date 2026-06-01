import { NextRequest } from "next/server";
import s3, { S3Bucket } from "@/config/cloudflareS3";
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
      Bucket: S3Bucket.PUBLIC,
      Key: key,
      ContentType: type,
      // Always play in place — a video must never be served as a download.
      ContentDisposition: "inline",
      CacheControl: "public, max-age=31536000, immutable",
    });
    // NOTE: every header signed here MUST also be sent by the client PUT in
    // PortfolioStore.extractAndUploadBlobs, or R2 rejects with AccessDenied
    // ("headers present in the request which were not signed"). No ACL — R2
    // serves public via the bucket, not per-object x-amz-acl.

    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return { presignedUrl, key, path };
  });

  return Promise.all(urlPromises);
});
