import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Use global 404 so unmatched routes don't run root layout (avoids loading Firebase during build)
    globalNotFound: true,
  },
};

export default nextConfig;
