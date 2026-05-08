// app/api/upload-url/route.ts
import { NextRequest, NextResponse } from "next/server";
import s3, { S3Bucket } from "@/config/cloudflareS3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { uploadFileInfoArraySchema } from "@/schemas/portfolioSchemas";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = uploadFileInfoArraySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid file list", issues: parsed.error.issues },
        { status: 400 },
      );
    }
    const files = parsed.data;

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

      const presignedUrl = await getSignedUrl(s3, command, {
        expiresIn: 3600,
      });

      return { presignedUrl, key, path };
    });

    const urls = await Promise.all(urlPromises);

    return NextResponse.json(urls);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate upload URLs" },
      { status: 500 }
    );
  }
}
