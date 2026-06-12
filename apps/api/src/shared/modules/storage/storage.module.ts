import { Global, Module } from '@nestjs/common';

import { StorageService } from './storage.service';

/**
 * Shared infrastructure: S3-compatible object storage (S3 logic only, no DB).
 * Global so any business module under `src/modules/` can inject `StorageService`.
 */
@Global()
@Module({
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
