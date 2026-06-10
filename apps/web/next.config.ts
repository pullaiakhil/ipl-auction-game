import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["three", "@ipl-auction/shared"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**",
      },
    ],
  },
  output: "standalone",
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "framer-motion",
      "date-fns",
    ],
  },
  webpack: (config) => {
    config.externals = config.externals || [];
    return config;
  },
};

export default nextConfig;
