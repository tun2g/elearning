import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';

import { configuration } from './config/configuration';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { AuthModule } from './modules/auth/auth.module';
import { ContentModule } from './modules/content/content.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { HomeModule } from './modules/home/home.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';
import { MediaModule } from './modules/media/media.module';
import { InAppNotificationModule } from './modules/notifications/in-app-notification.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PracticeModule } from './modules/practice/practice.module';
import { ProgressModule } from './modules/progress/progress.module';
import { UserModule } from './modules/user/user.module';
import { VocabularyModule } from './modules/vocabulary/vocabulary.module';
import { AuthGuard } from './shared/guards/auth.guard';
import { AuthMiddleware } from './shared/middlewares/auth.middleware';
import { HttpRequestContextMiddleware } from './shared/modules/http-request-context/http-request-context.middleware';
import { HttpRequestContextModule } from './shared/modules/http-request-context/http-request-context.module';
import { StorageModule } from './shared/modules/storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'debug',
        transport:
          process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty', options: { singleLine: true } } : undefined,
        autoLogging: true,
      },
    }),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    ScheduleModule.forRoot(),

    // Global context module must be imported first
    HttpRequestContextModule,

    // Feature modules
    AuthModule,
    UserModule,
    ContentModule,
    PracticeModule,
    ProgressModule,
    GamificationModule,
    HomeModule,
    VocabularyModule,
    MediaModule,
    LeaderboardModule,
    InAppNotificationModule,
    NotificationsModule,

    // Shared infrastructure
    StorageModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Order matters: the context middleware opens the request-scoped store,
    // then AuthMiddleware resolves the user into it before guards/handlers run.
    consumer.apply(HttpRequestContextMiddleware, AuthMiddleware).forRoutes('{*splat}');
  }
}
