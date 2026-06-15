import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VocabularyEntity } from 'src/modules/vocabulary/entities/vocabulary.entity';

import { ContentAdminController } from './content-admin.controller';
import { ContentImportService } from './content-import.service';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { CategoryEntity } from './entities/category.entity';
import { LessonEntity } from './entities/lesson.entity';
import { SentenceEntity } from './entities/sentence.entity';
import { TopicEntity } from './entities/topic.entity';
import { TaxonomyController } from './taxonomy.controller';
import { TaxonomyService } from './taxonomy.service';

@Module({
  imports: [TypeOrmModule.forFeature([LessonEntity, SentenceEntity, VocabularyEntity, CategoryEntity, TopicEntity])],
  controllers: [ContentController, ContentAdminController, TaxonomyController],
  providers: [ContentService, ContentImportService, TaxonomyService],
  exports: [ContentService, TaxonomyService],
})
export class ContentModule {}
