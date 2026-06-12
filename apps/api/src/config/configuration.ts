export interface AppConfig {
  nodeEnv: string;
  port: number;
  logLevel: string;
  swaggerEnabled: boolean;
  internalApiKey: string;
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  db: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    synchronize: boolean;
    maxConnections: number;
    sslEnabled: boolean;
    rejectUnauthorized: boolean;
  };
  /** S3-compatible object storage (MinIO in dev; R2/S3 in prod). */
  storage: {
    endpoint: string;
    region: string;
    bucket: string;
    accessKey: string;
    secretKey: string;
    /** Base URL objects are served from (e.g. the MinIO/R2 public URL). */
    publicUrl: string;
    /** MinIO and most non-AWS S3 require path-style addressing. */
    forcePathStyle: boolean;
  };
}

export const configuration = (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.APP_PORT ?? '4000', 10),
  logLevel: process.env.LOG_LEVEL ?? 'debug',
  swaggerEnabled: process.env.SWAGGER_ENABLED !== 'false',
  internalApiKey: process.env.INTERNAL_API_KEY ?? 'dev-internal-key',
  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-jwt-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.REFRESH_EXPIRES_IN ?? '30d',
  },
  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'elearning',
    password: process.env.DB_PASSWORD ?? 'elearning',
    database: process.env.DB_DATABASE ?? 'elearning',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS ?? '10', 10),
    sslEnabled: process.env.DB_SSL_ENABLED === 'true',
    rejectUnauthorized: process.env.DB_REJECT_UNAUTHORIZED !== 'false',
  },
  storage: {
    endpoint: process.env.S3_ENDPOINT ?? 'http://localhost:9000',
    region: process.env.S3_REGION ?? 'us-east-1',
    bucket: process.env.S3_BUCKET ?? 'soundwell-audio',
    accessKey: process.env.S3_ACCESS_KEY ?? 'elearning',
    secretKey: process.env.S3_SECRET_KEY ?? 'elearning-secret',
    publicUrl: process.env.S3_PUBLIC_URL ?? 'http://localhost:9000/soundwell-audio',
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
  },
});
