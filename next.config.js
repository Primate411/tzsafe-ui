/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const isIpfsBuild = process.env.TZSAFE_BUILD_TARGET === "ipfs";

if (isIpfsBuild && basePath) {
  throw new Error(
    "IPFS builds must be served from the origin root (no basePath)"
  );
}

const nextConfig = {
  output: "export",
  // For static exports Next uses distDir as the export destination.
  ...(isIpfsBuild ? { distDir: "out-ipfs" } : {}),
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
