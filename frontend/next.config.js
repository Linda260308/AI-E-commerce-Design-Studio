/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.apiyi.com',
      },
      {
        protocol: 'https',
        hostname: '**.example.com',
      },
    ],
  },
}

module.exports = nextConfig
