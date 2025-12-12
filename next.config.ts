import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    // `images.domains` is deprecated in Next 16; use `remotePatterns` only.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sepolia-blockscout.lisk.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.imgur.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://auth.util.repl.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://sepolia-blockscout.lisk.com https://via.placeholder.com https://i.imgur.com; connect-src 'self' https: wss: https://sepolia.rpc.lisk.com; frame-src 'self' https://auth.util.repl.co; object-src 'none'; base-uri 'self';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
