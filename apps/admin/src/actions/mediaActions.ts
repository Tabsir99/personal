"use server";
import s3, { S3Bucket } from "@/config/cloudflareS3";
import { formatResponse } from "@/lib/appUtils";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

interface FileInfo {
  fileName: string;
  contentType: string;
  contentLength: number;
}
const _getUploadSignedUrl = async (key: string, fileInfo: FileInfo) => {
  const command = new PutObjectCommand({
    Bucket: S3Bucket.PUBLIC,
    Key: key,
    ContentType: fileInfo.contentType,
    ContentLength: fileInfo.contentLength,
    ACL: "public-read",
    CacheControl: "public, max-age=31536000, immutable",
  });

  const singedUrl = await getSignedUrl(s3, command, {
    expiresIn: 60 * 60 * 24 * 30,
  });

  return singedUrl;
};

export const getImageUploadSignedUrl = async (
  fileInfo: FileInfo,
  blogId: string,
  isThumbnail: boolean,
) => {
  const key = isThumbnail
    ? `${blogId}/thumbnail.${fileInfo.contentType.split("/")[1]}`
    : `${blogId}/${fileInfo.fileName}`;

  const signedUrl = await _getUploadSignedUrl(key, fileInfo);

  return formatResponse<{ signedUrl: string; key: string }>({
    status: "success",
    data: { signedUrl, key },
  });
};
