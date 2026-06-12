import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { StorageService } from 'src/shared/modules/storage/storage.service';

import { StorageObjectEntity, type StorageObjectMetadata } from './entities/storage-object.entity';

export interface UploadMediaInput {
  key: string;
  body: Buffer;
  contentType: string;
  /** Provenance, e.g. "crawler:voa", "tts", "recording". */
  source?: string;
  /** Media-type-specific specs (dimensions, duration, bitrate, …). */
  metadata?: StorageObjectMetadata;
}

/**
 * Business layer for stored media. Owns the `storage_objects` table (all DB
 * queries live here) and orchestrates uploads: push bytes via the shared
 * StorageService (S3), then persist the record.
 */
@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(StorageObjectEntity)
    private readonly objectRepo: Repository<StorageObjectEntity>,
    private readonly storage: StorageService
  ) {}

  /** Uploads bytes to S3 and records the object. Idempotent on `key`. */
  async upload(input: UploadMediaInput): Promise<StorageObjectEntity> {
    const meta = await this.storage.putObject({
      key: input.key,
      body: input.body,
      contentType: input.contentType,
    });

    const existing = await this.objectRepo.findOne({
      where: { key: meta.key },
    });
    const record = existing ?? this.objectRepo.create({ key: meta.key });
    record.bucket = meta.bucket;
    record.contentType = meta.contentType;
    record.sizeBytes = meta.sizeBytes;
    record.url = meta.url;
    record.etag = meta.etag;
    record.source = input.source ?? null;
    record.metadata = input.metadata ?? {};

    return this.objectRepo.save(record);
  }

  findByKey(key: string): Promise<StorageObjectEntity | null> {
    return this.objectRepo.findOne({ where: { key } });
  }

  /** Removes the object from S3 and soft-deletes its record. */
  async remove(key: string): Promise<void> {
    await this.storage.deleteObject(key);
    await this.objectRepo.softDelete({ key });
  }
}
