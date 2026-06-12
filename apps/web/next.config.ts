import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@elearning/contracts', '@elearning/core'],
};

export default nextConfig;
