/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['api.apiyi.com', 'cdn.example.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.apiyi.com',
      },
    ],
  },
  env: {
    APIYI_KEY: process.env.APIYI_KEY,
    JWT_SECRET: process.env.JWT_SECRET,
  },
}

module.exports = nextConfig
