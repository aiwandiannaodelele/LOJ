import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Cloudflare Pages 部署适配 */
  ...(process.env.OPENNEXT_CLOUDFLARE ? { output: "standalone" } : {}),
};

export default nextConfig;
