/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    unoptimized: true,
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
    DASHSCOPE_API_KEY: process.env.DASHSCOPE_API_KEY,
    REMOVE_BG_API_KEY: process.env.REMOVE_BG_API_KEY,
  },
}

module.exports = nextConfig
