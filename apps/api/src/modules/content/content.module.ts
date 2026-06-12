import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VocabularyEntity } from 'src/modules/vocabulary/entities/vocabulary.entity';

import { ContentAdminController } from './content-admin.controller';
import { ContentImportService } from './content-import.service';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { LessonEntity } from './entities/lesson.entity';
import { SentenceEntity } from './entities/sentence.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LessonEntity, SentenceEntity, VocabularyEntity])],
  controllers: [ContentController, ContentAdminController],
  providers: [ContentService, ContentImportService],
  exports: [ContentService],
})
export class ContentModule {}
