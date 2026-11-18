import type { NextConfig } from "next";

// NEXT_PUBLIC_BASE_PATH is set by the GitHub Pages workflow (/policymatch-hk).
// Empty locally, so `npm run dev` still serves from the root.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",        // static HTML, deployable to GitHub Pages
  trailingSlash: true,     // /results -> /results/index.html
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
};

export default nextConfig;
