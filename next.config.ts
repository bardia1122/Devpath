import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Don't advertise the framework.
  poweredByHeader: false,

  images: {
    remotePatterns: [
      {
        // GitHub user avatars (from the OAuth profile).
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },

  // Baseline security headers applied to every response.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
