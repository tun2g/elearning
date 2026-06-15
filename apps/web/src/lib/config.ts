const API_VERSION_PREFIX = '/api/v1';

const apiOrigin = (process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? 'http://localhost:4000').replace(
  /\/+$/,
  ''
);

const config = {
  apiUrl: `${apiOrigin}${API_VERSION_PREFIX}`,
} as const;

export default config;
