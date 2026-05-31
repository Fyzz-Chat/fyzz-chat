import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import { getSignedUrl as presignUrl } from "@aws-sdk/s3-request-presigner";
import conf from "@/lib/config";

let client: S3Client | null = null;

if (conf.s3Configured) {
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

export function getSignedUrlForKey(
  key: string,
  expiresInSeconds = 5 * 60
): string | null {
  if (!conf.s3Configured) {
    return null;
  }

  const url = `https://${conf.awsCloudfrontDistributionDomain}/${key}`;
  const privateKey = conf.awsCloudfrontPrivateKey;
  const keyPairId = conf.awsCloudfrontKeyPairId;
  const dateLessThan = new Date(Date.now() + expiresInSeconds * 1000);

  return getSignedUrl({ url, keyPairId, dateLessThan, privateKey });
}

export function getFileUrlSigned(prefix: string, fileUrl: string) {
  if (!conf.s3Configured || fileUrl.startsWith("data:")) {
    return fileUrl;
  }

  return getSignedUrlForKey(`${prefix}/${fileUrl}`, 60 * 60) ?? fileUrl;
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

export async function headObjectSize(key: string): Promise<number | null> {
  if (!client) return null;
  const command = new HeadObjectCommand({
    Bucket: conf.awsUploadsBucket,
    Key: key,
  });
  const response = await client.send(command);
  return response.ContentLength ?? null;
}

export async function getObjectBytes(key: string): Promise<Uint8Array | null> {
  if (!client) return null;
  const command = new GetObjectCommand({
    Bucket: conf.awsUploadsBucket,
    Key: key,
  });
  const response = await client.send(command);
  if (!response.Body) return null;
  return response.Body.transformToByteArray();
}

export async function copyFile(sourceKey: string, destinationKey: string) {
  if (!client) {
    throw new Error("S3 client not configured");
  }

  const command = new CopyObjectCommand({
    Bucket: conf.awsUploadsBucket,
    CopySource: `${conf.awsUploadsBucket}/${sourceKey}`,
    Key: destinationKey,
  });

  const response = await client.send(command);

  return response;
}
