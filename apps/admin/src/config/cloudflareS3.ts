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
  // Avoid aws-sdk v3's CRC32 default that R2 rejects (batch-delete + presigned PUTs).
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

export const Bucket = "public-data";

export const readObject = async (key: string) => {
  // NoSuchKey is a domain "missing" signal that callers want as null;
  // any other failure (network, auth) should propagate to wrapRoute.
  const response = await s3
    .send(new GetObjectCommand({ Bucket, Key: key }))
    .catch((error: unknown) => {
      if (error instanceof NoSuchKey) return null;
      throw error;
    });
  return response?.Body ?? null;
};

export const deleteObjects = async (keys: string[]) => {
  await s3.send(
    new DeleteObjectsCommand({
      Bucket,
      Delete: { Objects: keys.map((k) => ({ Key: k })), Quiet: true },
    }),
  );
};

export const uploadObject = async (params: PutObjectCommandInput) => {
  await s3.send(new PutObjectCommand(params));
};

export default s3;
