import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

import { AppConfig } from 'src/config/configuration';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService<AppConfig, true>) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const db = this.configService.get('db', { infer: true });

    return {
      type: 'postgres',
      host: db.host,
      port: db.port,
      username: db.username,
      password: db.password,
      database: db.database,
      schema: 'public',
      // synchronize only in dev when explicitly set; use migrations in production
      synchronize: db.synchronize,
      dropSchema: false,
      logging: this.configService.get('nodeEnv', { infer: true }) !== 'production',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
      extra: {
        max: db.maxConnections,
        ssl: db.sslEnabled ? { rejectUnauthorized: db.rejectUnauthorized } : undefined,
      },
    } as TypeOrmModuleOptions;
  }
}
