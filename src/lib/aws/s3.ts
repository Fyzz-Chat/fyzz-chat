import conf from "@/lib/config";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import { ensure } from "../utils";

let client: S3Client | null = null;

export const awsConfigured =
  process.env.AWS_ACCESS_KEY_ID !== undefined &&
  process.env.AWS_SECRET_ACCESS_KEY !== undefined &&
  conf.awsRegion !== "" &&
  conf.awsUploadsBucket !== "" &&
  conf.awsCloudfrontKeyPairId !== "" &&
  conf.awsCloudfrontPrivateKey !== "";

if (awsConfigured) {
  client = new S3Client({
    region: conf.awsRegion,
  });
}

export async function uploadFile(file: File, key: string) {
  ensure(client, "AWS is not configured");

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const command = new PutObjectCommand({
    Bucket: conf.awsUploadsBucket,
    Key: key,
    Body: buffer,
    ContentType: file.type,
  });

  const response = await client.send(command);

  return response;
}

export async function deleteFile(key: string) {
  ensure(client, "AWS is not configured");

  const command = new DeleteObjectCommand({
    Bucket: conf.awsUploadsBucket,
    Key: key,
  });

  const response = await client.send(command);

  return response;
}

export function getFileUrlSigned(key: string) {
  ensure(awsConfigured, "AWS is not configured");

  const cloudfrontDistributionDomain = `https://${conf.awsUploadsBucket}`;
  const url = `${cloudfrontDistributionDomain}/${key}`;
  const privateKey = conf.awsCloudfrontPrivateKey;
  const keyPairId = conf.awsCloudfrontKeyPairId;
  const dateLessThan = new Date(Date.now() + 60 * 60 * 1000);

  const urlSigned = getSignedUrl({ url, keyPairId, dateLessThan, privateKey });

  return urlSigned;
}
