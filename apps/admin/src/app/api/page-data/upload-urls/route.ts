import { NextRequest } from "next/server";
import s3, { S3Bucket } from "@/config/cloudflareS3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { uploadFileInfoArraySchema } from "@/schemas/portfolioSchemas";
import { wrapRoute } from "@/lib/appUtils";

export const POST = wrapRoute(async (request: NextRequest) => {
  const body = await request.json();
  const files = uploadFileInfoArraySchema.parse(body);

  const urlPromises = files.map(async ({ size, type, path }) => {
    const key = `portfolio/${randomUUID()}`;

    const command = new PutObjectCommand({
      Bucket: S3Bucket.PUBLIC,
      Key: key,
      ContentType: type,
      CacheControl: "public, max-age=31536000, immutable",
      ACL: "public-read",
      ContentLength: size,
    });

    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return { presignedUrl, key, path };
  });

  return Promise.all(urlPromises);
});
