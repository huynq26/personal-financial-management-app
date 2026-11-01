import type { NextConfig } from "next";

// Pilot's deployed application is static. All real financial data must stay
// on the user's device; never add a financial API route or SSR data collection.
const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
};

export default nextConfig;
