import path from 'node:path';

import type { NextConfig } from 'next';

// ----------------------------------------------------------------------

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  // Anchor module resolution to this seed so a parent lockfile is not picked
  // up as the workspace root (this seed installs deps locally via .npmrc).
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },
};

export default nextConfig;
