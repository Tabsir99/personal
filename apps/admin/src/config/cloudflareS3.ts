import "server-only";
import {
  DeleteObjectsCommand,
  GetObjectCommand,
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
});

export enum S3Bucket {
  PUBLIC = "public-data",
  PRIVATE = "private-data",
}

export const readObject = async (bucket: S3Bucket, key: string) => {
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    const response = await s3.send(command);
    return response.Body;
  } catch (error) {
    console.error("Failed to read object:", error);
    return null;
  }
};

export const deleteObjects = async (bucket: S3Bucket, keys: string[]) => {
  try {
    const command = new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: { Objects: keys.map((k) => ({ Key: k })), Quiet: true },
    });
    await s3.send(command);
  } catch (error) {
    console.error("Failed to delete object:", error);
  }
};

export const uploadObject = async (params: PutObjectCommandInput) => {
  try {
    const command = new PutObjectCommand(params);
    await s3.send(command);
  } catch (error) {
    console.error(error);
  }
};

export default s3;
