import { CreateBucketCommand, HeadBucketCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

/** S3-compatible storage (MinIO in dev). Config mirrors apps/api defaults. */
const endpoint = process.env.S3_ENDPOINT ?? 'http://localhost:9000';
const region = process.env.S3_REGION ?? 'us-east-1';
const bucket = process.env.S3_BUCKET ?? 'soundwell-audio';
const publicUrl = (process.env.S3_PUBLIC_URL ?? `${endpoint}/${bucket}`).replace(/\/$/, '');

const client = new S3Client({
  endpoint,
  region,
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY ?? 'elearning',
    secretAccessKey: process.env.S3_SECRET_KEY ?? 'elearning-secret',
  },
});

let bucketReady = false;

async function ensureBucket(): Promise<void> {
  if (bucketReady) return;
  try {
    await client.send(new HeadBucketCommand({ Bucket: bucket }));
  } catch {
    await client.send(new CreateBucketCommand({ Bucket: bucket }));
  }
  bucketReady = true;
}

/** Uploads an object and returns its public URL. */
export async function uploadObject(key: string, body: Buffer, contentType: string): Promise<string> {
  await ensureBucket();
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return `${publicUrl}/${key}`;
}
