import type { NextConfig } from "next";

const BACKEND_URL =
  process.env.BACKEND_URL ??
  "http://dilemma-alb-dev-479348409.mx-central-1.elb.amazonaws.com";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${BACKEND_URL}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
