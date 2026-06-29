/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [process.env.NEXT_PUBLIC_DEV_HOST || 'localhost'],
  turbopack: {},
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend:3000/:path*',
      },
    ];
  },
};

export default nextConfig;