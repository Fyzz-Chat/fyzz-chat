import conf from "@/lib/config";
import { ensure } from "@/lib/utils";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import { getSignedUrl as presignUrl } from "@aws-sdk/s3-request-presigner";

let client: S3Client | null = null;

if (conf.awsConfigured) {
  client = new S3Client({
    region: conf.awsRegion,
  });
}

export async function deleteFile(key: string) {
  if (!client) {
    return;
  }

  const command = new DeleteObjectCommand({
    Bucket: conf.awsUploadsBucket,
    Key: key,
  });

  const response = await client.send(command);

  return response;
}

export function getFileUrlSigned(prefix: string, fileUrl: string) {
  if (!conf.awsConfigured || fileUrl.startsWith("data:")) {
    return fileUrl;
  }

  const cloudfrontDistributionDomain = `https://${conf.awsUploadsBucket}`;
  const url = `${cloudfrontDistributionDomain}/${prefix}/${fileUrl}`;
  const privateKey = conf.awsCloudfrontPrivateKey?.replace(/\|/g, "\n");
  const keyPairId = conf.awsCloudfrontKeyPairId;
  const dateLessThan = new Date(Date.now() + 60 * 60 * 1000);

  const urlSigned = getSignedUrl({ url, keyPairId, dateLessThan, privateKey });

  return urlSigned;
}

export async function generatePresignedUploadUrl(
  key: string,
  expiresInSeconds = 60 * 10
): Promise<string | null> {
  if (!client) {
    return null;
  }

  const command = new PutObjectCommand({
    Bucket: conf.awsUploadsBucket,
    Key: key,
  });

  const url = await presignUrl(client, command, {
    expiresIn: expiresInSeconds,
  });

  return url;
}
