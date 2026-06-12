import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GamificationModule } from 'src/modules/gamification/gamification.module';

import { UserVocabProgressEntity } from './entities/user-vocab-progress.entity';
import { VocabularyEntity } from './entities/vocabulary.entity';
import { VocabularyController } from './vocabulary.controller';
import { VocabularyService } from './vocabulary.service';

@Module({
  imports: [TypeOrmModule.forFeature([VocabularyEntity, UserVocabProgressEntity]), GamificationModule],
  controllers: [VocabularyController],
  providers: [VocabularyService],
  exports: [VocabularyService],
})
export class VocabularyModule {}
