import "server-only";
import { S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_AK_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_AK!,
  },
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT!,
  region: "auto",
});

export default s3;
