/** @type {import('next').NextConfig} */
const backendUrl = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8080');
const quantUrl = process.env.QUANT_INTERNAL_URL || process.env.NEXT_PUBLIC_QUANT_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8100');

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    webpackBuildWorker: false
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  async rewrites() {
    const rewrites = [];
    if (quantUrl) {
      rewrites.push(
        {
          source: '/api/v1/quant/:path*',
          destination: `${quantUrl}/api/v1/quant/:path*`
        },
        {
          source: '/api/v1/wealth/:path*',
          destination: `${quantUrl}/api/v1/wealth/:path*`
        }
      );
    }
    if (backendUrl) {
      rewrites.push({
        source: '/api/:path((?!market/).*)',
        destination: `${backendUrl}/api/:path*`
      });
    }
    return rewrites;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
        ]
      }
    ];
  }
};

export default nextConfig;
