import type { NextConfig } from 'next';

// Static export so `next build` emits a self-contained `out/` tree the in-app
// static preview can serve. The default in-app preview is the live `next dev`
// server (full HMR); the static `out/` build is the secondary "Build" toggle.
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
