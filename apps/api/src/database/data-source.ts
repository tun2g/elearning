import 'reflect-metadata';

import { DataSource, DataSourceOptions } from 'typeorm';

try {
  process.loadEnvFile('.env');
} catch {
  // no .env file — fall back to process env
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'elearning',
  password: process.env.DB_PASSWORD ?? 'elearning',
  database: process.env.DB_DATABASE ?? 'elearning',
  schema: 'public',
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  dropSchema: false,
  logging: process.env.NODE_ENV !== 'production',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  extra: {
    max: parseInt(process.env.DB_MAX_CONNECTIONS ?? '10', 10),
    ssl:
      process.env.DB_SSL_ENABLED === 'true'
        ? { rejectUnauthorized: process.env.DB_REJECT_UNAUTHORIZED !== 'false' }
        : undefined,
  },
} as DataSourceOptions);
