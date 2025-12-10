import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@ffmpeg/ffmpeg": path.join(process.cwd(), "node_modules/@ffmpeg/ffmpeg/dist/esm/index.js"),
      "@ffmpeg/util": path.join(process.cwd(), "node_modules/@ffmpeg/util/dist/esm/index.js"),
    };
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
