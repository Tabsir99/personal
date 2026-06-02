import "server-only";
import {
  DeleteObjectsCommand,
  GetObjectCommand,
  NoSuchKey,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import { env } from "./env.server";

const s3 = new S3Client({
  credentials: {
    accessKeyId: env.CLOUDFLARE_R2_AK_ID,
    secretAccessKey: env.CLOUDFLARE_R2_AK,
  },
  endpoint: env.CLOUDFLARE_R2_ENDPOINT,
  forcePathStyle: true,
  region: "auto",
  // aws-sdk v3 defaults to adding CRC32 checksums to every request, which R2
  // rejects: batch-delete needs Content-MD5, and presigned PUTs get an
  // empty-body CRC32 baked in that fails (surfaces as a misleading CORS 403).
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

export enum S3Bucket {
  PUBLIC = "public-data",
  PRIVATE = "private-data",
}

export const readObject = async (bucket: S3Bucket, key: string) => {
  // NoSuchKey is a domain "missing" signal that callers want as null;
  // any other failure (network, auth) should propagate to wrapRoute.
  const response = await s3
    .send(new GetObjectCommand({ Bucket: bucket, Key: key }))
    .catch((error: unknown) => {
      if (error instanceof NoSuchKey) return null;
      throw error;
    });
  return response?.Body ?? null;
};

export const deleteObjects = async (bucket: S3Bucket, keys: string[]) => {
  await s3.send(
    new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: { Objects: keys.map((k) => ({ Key: k })), Quiet: true },
    }),
  );
};

export const uploadObject = async (params: PutObjectCommandInput) => {
  await s3.send(new PutObjectCommand(params));
};

export default s3;
