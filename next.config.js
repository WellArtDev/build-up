/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['mysql2'],
  },
};

module.exports = nextConfig;
