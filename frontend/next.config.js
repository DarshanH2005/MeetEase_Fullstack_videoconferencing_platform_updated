/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true, // Temporarily disable ESLint during build
  },
  typescript: {
    ignoreBuildErrors: true, // Temporarily disable TypeScript errors during build
  },
};

module.exports = nextConfig;
