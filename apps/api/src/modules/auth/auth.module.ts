import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, type JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppConfig } from 'src/config/configuration';
import { UserModule } from 'src/modules/user/user.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailAuthTokenService } from './email-auth-token.service';
import { EmailAuthTokenEntity } from './entities/email-auth-token.entity';
import { SessionEntity } from './entities/session.entity';
import { GoogleStrategy } from './google.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([SessionEntity, EmailAuthTokenEntity]),
    PassportModule,
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
  providers: [AuthService, EmailAuthTokenService, GoogleStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
