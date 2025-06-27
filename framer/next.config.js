/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['assets.vercel.com'],
  },
  async rewrites() {
    return [
      {
        source: '/api/status',
        // In a real deployment, replace this with your actual API URL
        // For local development, you can use a proxy to your local server
        destination: 'http://localhost:3000/api/status',
      },
    ];
  },
};

module.exports = nextConfig;
