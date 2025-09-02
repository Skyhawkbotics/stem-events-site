import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // WARNING: Skips ESLint during production build (Vercel won’t fail on lint errors)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
