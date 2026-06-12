import { Injectable } from '@nestjs/common';
import type { ImportBatch, ImportResult } from '@elearning/contracts';
import { DataSource } from 'typeorm';

import { applyImportBatch } from './content-import.logic';

@Injectable()
export class ContentImportService {
  constructor(private readonly dataSource: DataSource) {}

  /** Upserts a reviewed batch atomically. */
  import(batch: ImportBatch): Promise<ImportResult> {
    return this.dataSource.transaction((manager) => applyImportBatch(manager, batch));
  }
}
