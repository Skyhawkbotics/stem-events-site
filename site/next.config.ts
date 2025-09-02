import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // WARNING: Skips ESLint during production build (Vercel won’t fail on lint errors)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ⚠️ Allows production builds to succeed even if there are TS errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
