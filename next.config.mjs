/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "agentic-de4a7136.vercel.app"],
    },
  },
};

export default nextConfig;
