import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  // ship the UniMonitor Bash toolkit with the serverless function that runs it
  outputFileTracingIncludes: { "/api/demos/unimonitor": ["./unimonitor/**/*"] },
};

export default nextConfig;
