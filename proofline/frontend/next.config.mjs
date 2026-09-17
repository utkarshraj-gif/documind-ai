/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configure rewrites to backend API if needed or connect directly via env
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
