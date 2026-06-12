import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LessonEntity } from 'src/modules/content/entities/lesson.entity';
import { SentenceEntity } from 'src/modules/content/entities/sentence.entity';
import { EvaluationModule } from 'src/modules/evaluation/evaluation.module';
import { GamificationModule } from 'src/modules/gamification/gamification.module';
import { ProgressModule } from 'src/modules/progress/progress.module';

import { AttemptEntity } from './entities/attempt.entity';
import { UserLessonProgressEntity } from './entities/user-lesson-progress.entity';
import { PracticeController } from './practice.controller';
import { PracticeService } from './practice.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AttemptEntity, UserLessonProgressEntity, SentenceEntity, LessonEntity]),
    ProgressModule,
    GamificationModule,
    EvaluationModule,
  ],
  controllers: [PracticeController],
  providers: [PracticeService],
  exports: [PracticeService],
})
export class PracticeModule {}
