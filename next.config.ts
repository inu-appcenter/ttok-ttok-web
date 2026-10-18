import type { NextConfig } from "next";
import path from "node:path";
import { EXTERNAL_LINKS } from "./src/shared/config/external-links";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.181"],
  async redirects() {
    return [
      { source: "/terms", destination: EXTERNAL_LINKS.terms, permanent: false },
      { source: "/privacy", destination: EXTERNAL_LINKS.privacy, permanent: false },
    ];
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
