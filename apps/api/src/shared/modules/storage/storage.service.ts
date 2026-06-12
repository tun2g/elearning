import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppConfig } from 'src/config/configuration';

export interface PutObjectInput {
  key: string;
  body: Buffer;
  contentType: string;
}

/** Metadata returned after a successful upload (no persistence — that's the caller's job). */
export interface PutObjectResult {
  key: string;
  bucket: string;
  url: string;
  etag: string | null;
  sizeBytes: number;
  contentType: string;
}

/**
 * Shared infrastructure: thin wrapper over S3-compatible object storage.
 * Contains ONLY storage (S3) logic — no database access. Backed by MinIO in dev;
 * swap to Cloudflare R2 / AWS S3 in prod by changing only the `storage` env.
 */
@Injectable()
export class StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;
  private bucketReady = false;

  constructor(private readonly configService: ConfigService<AppConfig, true>) {
    const storage = this.configService.get('storage', { infer: true });
    this.bucket = storage.bucket;
    this.publicBaseUrl = storage.publicUrl.replace(/\/$/, '');
    this.client = new S3Client({
      endpoint: storage.endpoint,
      region: storage.region,
      forcePathStyle: storage.forcePathStyle,
      credentials: {
        accessKeyId: storage.accessKey,
        secretAccessKey: storage.secretKey,
      },
    });
  }

  /** Public URL for an object key. */
  getPublicUrl(key: string): string {
    return `${this.publicBaseUrl}/${key}`;
  }

  /** Uploads an object and returns its storage metadata. */
  async putObject(input: PutObjectInput): Promise<PutObjectResult> {
    await this.ensureBucket();
    const res = await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: input.key,
        Body: input.body,
        ContentType: input.contentType,
      })
    );
    return {
      key: input.key,
      bucket: this.bucket,
      url: this.getPublicUrl(input.key),
      etag: res.ETag ?? null,
      sizeBytes: input.body.length,
      contentType: input.contentType,
    };
  }

  /** Time-limited signed GET URL for private objects. */
  presignedGetUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    return getSignedUrl(this.client, new GetObjectCommand({ Bucket: this.bucket, Key: key }), {
      expiresIn: expiresInSeconds,
    });
  }

  /** Removes an object from the bucket. */
  async deleteObject(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  private async ensureBucket(): Promise<void> {
    if (this.bucketReady) return;
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
    }
    this.bucketReady = true;
  }
}
