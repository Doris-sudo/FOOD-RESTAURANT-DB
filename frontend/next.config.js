/** @type {import('next').NextConfig} */
const nextConfig = {
  // 'standalone' bundles everything Next.js needs into .next/standalone
  // so Render can run it with:  node .next/standalone/server.js
  output: 'standalone',

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

module.exports = nextConfig;
