"use server";
import s3, { Bucket } from "@/config/cloudflareS3";
import { wrap } from "@/lib/appUtils";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

interface FileInfo {
  fileName: string;
  contentType: string;
  contentLength: number;
}
const _getUploadSignedUrl = async (key: string, fileInfo: FileInfo) => {
  const command = new PutObjectCommand({
    Bucket,
    Key: key,
    ContentType: fileInfo.contentType,
    ContentLength: fileInfo.contentLength,
    ACL: "public-read",
    CacheControl: "public, max-age=31536000, immutable",
  });

  return getSignedUrl(s3, command, { expiresIn: 60 * 60 * 24 * 30 });
};

export const getImageUploadSignedUrl = wrap(
  async (fileInfo: FileInfo, blogId: string, isThumbnail: boolean) => {
    const key = isThumbnail
      ? `${blogId}/thumbnail.${fileInfo.contentType.split("/")[1]}`
      : `${blogId}/${fileInfo.fileName}`;

    const signedUrl = await _getUploadSignedUrl(key, fileInfo);

    return { signedUrl, key };
  },
);

// Resume / CV upload. Stored as a public PDF under a UUID key so re-uploads bust
// the immutable cache. Content type is fixed to application/pdf; the original
// filename rides along in pageData for the portfolio's download link.
export const getResumeUploadSignedUrl = wrap(async (contentLength: number) => {
  const key = `portfolio/resume/${randomUUID()}.pdf`;

  const command = new PutObjectCommand({
    Bucket,
    Key: key,
    ContentType: "application/pdf",
    ContentLength: contentLength,
    ACL: "public-read",
    CacheControl: "public, max-age=31536000, immutable",
  });

  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

  return { signedUrl, key };
});
