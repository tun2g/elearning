import type { StorageObjectMetadata } from '../entities/storage-object.entity';

export interface UploadMediaInput {
  key: string;
  body: Buffer;
  contentType: string;
  /** Provenance, e.g. "crawler:voa", "tts", "recording". */
  source?: string;
  /** Media-type-specific specs (dimensions, duration, bitrate, …). */
  metadata?: StorageObjectMetadata;
}
