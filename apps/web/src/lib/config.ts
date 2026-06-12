/**
 * Centralized app configuration — mirrors vault/dapp's src/config/app-config.ts.
 * All environment variable access goes through this module; never read process.env directly.
 */
const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? 'http://localhost:4000/api/v1',
} as const;

export default config;
