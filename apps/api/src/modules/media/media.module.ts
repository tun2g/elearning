import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StorageObjectEntity } from './entities/storage-object.entity';
import { MediaService } from './media.service';

@Module({
  imports: [TypeOrmModule.forFeature([StorageObjectEntity])],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
