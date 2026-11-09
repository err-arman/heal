import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const backendApiUrl = (
  process.env.BACKEND_API_URL ?? 'http://localhost:3000'
).replace(/\/$/, '');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${backendApiUrl}/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
