import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LessonEntity } from 'src/modules/content/entities/lesson.entity';
import { UserLessonProgressEntity } from 'src/modules/practice/entities/user-lesson-progress.entity';
import { UserSettingsEntity } from 'src/modules/user/entities/user-settings.entity';
import { GamificationModule } from 'src/modules/gamification/gamification.module';
import { ProgressModule } from 'src/modules/progress/progress.module';

import { HomeController } from './home.controller';
import { HomeService } from './home.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserLessonProgressEntity, LessonEntity, UserSettingsEntity]),
    ProgressModule,
    GamificationModule,
  ],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
