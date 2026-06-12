import { Column, Entity, Index } from 'typeorm';

import { AuditableEntity } from 'src/shared/entities/auditable.entity';

/**
 * Variable, media-type-specific specifications. `sizeBytes` lives on its own
 * column (always known, queryable); these are the rest. Open-ended for forward
 * compatibility (codecs, sample rates, EXIF, etc.).
 */
export interface StorageObjectMetadata {
  /** Pixel dimensions (images, video). */
  width?: number;
  height?: number;
  /** Playback length in seconds (audio, video). */
  durationSeconds?: number;
  /** Bits per second (audio, video). */
  bitrate?: number;
  /** Page count (documents). */
  pages?: number;
  [key: string]: unknown;
}

/**
 * A record of one object stored in S3-compatible storage (MinIO in dev; R2/S3 in prod).
 * Lets the app track, serve, and garbage-collect uploaded media without listing the bucket.
 */
@Entity({ name: 'storage_objects' })
export class StorageObjectEntity extends AuditableEntity {
  /** Object key within the bucket (e.g. "voa/greetings.mp3"). */
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 600 })
  key!: string;

  @Column({ type: 'varchar', length: 120 })
  bucket!: string;

  @Column({ name: 'content_type', type: 'varchar', length: 160 })
  contentType!: string;

  @Column({
    name: 'size_bytes',
    type: 'bigint',
    transformer: {
      to: (v: number): number => v,
      from: (v: string | null): number => (v ? parseInt(v, 10) : 0),
    },
  })
  sizeBytes!: number;

  /** Publicly servable URL (or the canonical URL to presign from). */
  @Column({ type: 'text' })
  url!: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  etag!: string | null;

  /** Provenance, e.g. "crawler:voa", "tts", "recording". */
  @Column({ type: 'varchar', length: 120, nullable: true })
  source!: string | null;

  /** Media-type-specific specs: dimensions, duration, bitrate, … */
  @Column({ type: 'jsonb', default: '{}' })
  metadata!: StorageObjectMetadata;
}
