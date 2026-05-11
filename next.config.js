/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  output: "export",
  ...(basePath ? { basePath } : {}),
  reactStrictMode: false,
  swcMinify: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: config => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    return config;
  },
};

module.exports = nextConfig;
