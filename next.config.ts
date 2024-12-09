import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  basePath: '', // Ensure no custom base path is interfering
  trailingSlash: false, // Ensure it matches your intended setup
  output: 'export',
};

export default nextConfig;
