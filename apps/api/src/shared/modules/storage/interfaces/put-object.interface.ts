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
