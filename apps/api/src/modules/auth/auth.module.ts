import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, type JwtSignOptions } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppConfig } from 'src/config/configuration';
import { UserModule } from 'src/modules/user/user.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionEntity } from './entities/session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SessionEntity]),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => ({
        secret: config.get('jwt', { infer: true }).secret,
        signOptions: {
          expiresIn: config.get('jwt', { infer: true }).expiresIn as JwtSignOptions['expiresIn'],
        },
      }),
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
