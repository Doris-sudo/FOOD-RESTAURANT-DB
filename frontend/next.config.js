/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow Unsplash images used in seed data
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

module.exports = nextConfig;
